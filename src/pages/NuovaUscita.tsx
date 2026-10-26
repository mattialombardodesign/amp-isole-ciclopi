import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarDays,
  Check,
  ChevronDown,
  CircleOff,
  Clock,
  Footprints,
  Loader2,
  LocateFixed,
  LifeBuoy,
  MapPin,
  Minus,
  Pencil,
  Plus,
  Ship,
  Timer,
  Users,
  UsersRound,
  Waves,
  WavesArrowDown,
  X,
} from 'lucide-react'
import { api } from '@/lib/api'
import { ACTIVITY_LABEL, EXIT_LABEL, communicationText, formatDateLong, hhmm, placeName, toDMS, totalDivers } from '@/lib/format'
import { useAuth, useLive } from '@/lib/hooks'
import { SITES, getSite, zoneForPoint } from '@/lib/sites'
import type { ActivityType, Booking, ExitMode, NewBooking, StaffMember } from '@/lib/types'
import { addDays, cn, todayISO } from '@/lib/utils'
import { Calendar } from '@/components/Calendar'
import { CapacityGauge, CapacityLabel } from '@/components/CapacityGauge'
import { SiteMap } from '@/components/SiteMap'
import { TimePicker } from '@/components/TimePicker'
import { ForecastRow } from '@/components/Weather'
import { BottomAction, BottomSheet, Button, ChoiceRow, Chip, FlowHeader, FlowTitle, FullScreenLoader, Input, List, SuccessScreen } from '@/components/ui'

// ---------- Orari -------------------------------------------------------

const DURATIONS = [45, 60, 90, 120]
const LAST_MINUTE = 23 * 60 + 45

function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function fromMinutes(min: number) {
  const clamped = Math.max(0, Math.min(min, LAST_MINUTE))
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`
}

function addMinutes(t: string, min: number) {
  return fromMinutes(toMinutes(t) + min)
}

function nowMinutes() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

/** Suggerimento della ruota degli orari: oggi tra un quarto d'ora abbondante, altrimenti le 9. */
function customStart(iso: string | null) {
  if (iso !== todayISO()) return '09:00'
  return fromMinutes(Math.ceil((nowMinutes() + 15) / 15) * 15)
}

function shortDate(iso: string) {
  return new Date(`${iso}T12:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}

function formatDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  return m ? `${h} h ${m}` : `${h} h`
}

// ---------- Bozza (resta se si chiude l'app) ----------------------------

interface Draft {
  step: number
  activity: ActivityType | null
  date: string | null
  timeIn: string | null
  duration: number | null
  siteId: string | null
  point: { lat: number; lng: number } | null
  participants: number
  instructors: string[]
  guides: string[]
  guests: string[]
  buoy: boolean | null
  exitMode: ExitMode | null
}

const DRAFT_KEY = 'amp-draft-v4'

function readDraft(): Draft | null {
  try {
    const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null') as Draft | null
    return d && (!d.date || d.date >= todayISO()) ? d : null
  } catch {
    return null
  }
}

// ---------- Flusso --------------------------------------------------------

/**
 * Gli step, per nome. L'immersione (con le bombole) ha sito con capienza, team con i nomi,
 * pallone e accesso. Il sea watching è snorkeling, cioè balneazione (DM 9/11/2004, art. 3):
 * basta un punto sulla mappa, chi accompagna e quanti sono, accesso e boa in un solo step.
 */
type StepKey = 'activity' | 'when' | 'site' | 'team' | 'safety' | 'point' | 'group' | 'summary'
const ORDER: Record<ActivityType, StepKey[]> = {
  visita_guidata: ['activity', 'when', 'site', 'team', 'safety', 'summary'],
  sea_watching: ['activity', 'when', 'point', 'group', 'summary'],
}

const ACTIVITIES: { id: ActivityType; title: string; description: string; icon: typeof Waves }[] = [
  { id: 'visita_guidata', title: 'Immersione', description: 'Con le bombole: visita subacquea guidata', icon: WavesArrowDown },
  { id: 'sea_watching', title: 'Sea watching', description: 'Snorkeling in superficie, con maschera e boccaglio', icon: Waves },
]

export default function NuovaUscita() {
  const { tipo } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { profile, refresh } = useAuth()
  const presetDate = params.get('date')
  const presetSite = params.get('site')
  // ?modifica=id cambia un'uscita già inviata; ?ripeti=id ne riparte con sito e team
  const editId = params.get('modifica')
  const repeatId = params.get('ripeti')
  const sourceId = editId ?? repeatId
  const [draft] = useState(() => (presetSite || sourceId ? null : readDraft()))
  const [source, setSource] = useState<Booking | null>(null)
  const [loadingSource, setLoadingSource] = useState(!!sourceId)

  const [step, setStep] = useState<number>(draft?.step ?? 0)
  // Immersione o sea watching: si sceglie nel primo step (o arriva da un link /attivita/nuova/:tipo)
  const [activity, setActivity] = useState<ActivityType | null>(draft?.activity ?? (tipo === 'visita_guidata' || tipo === 'sea_watching' ? tipo : null))
  const order = ORDER[activity ?? 'visita_guidata']
  const current = order[Math.min(step, order.length - 1)]
  const seaWatching = activity === 'sea_watching'
  // Giorno, entrata e durata partono vuoti: li sceglie sempre l'operatore
  const [date, setDate] = useState<string | null>(draft ? draft.date : presetDate)
  const [showCalendar, setShowCalendar] = useState(false)
  const [timeIn, setTimeIn] = useState<string | null>(draft?.timeIn ?? null)
  const [duration, setDuration] = useState<number | null>(draft?.duration ?? null)
  const [siteId, setSiteId] = useState<string | null>(draft?.siteId ?? presetSite)
  // sea watching: punto libero e numero di partecipanti
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(draft?.point ?? null)
  const [participants, setParticipants] = useState(draft?.participants ?? 0)
  const [instructors, setInstructors] = useState<string[]>(draft?.instructors ?? [])
  const [guides, setGuides] = useState<string[]>(draft?.guides ?? [])
  const [guests, setGuests] = useState<string[]>(draft?.guests ?? [])
  const [buoy, setBuoy] = useState<boolean | null>(draft?.buoy ?? null)
  const [exitMode, setExitMode] = useState<ExitMode | null>(draft?.exitMode ?? null)
  const [prefilled, setPrefilled] = useState(false)
  const [returnToSummary, setReturnToSummary] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<{ text: string; site?: boolean } | null>(null)
  const [sent, setSent] = useState<Booking | null>(null)

  const { data: occupancy } = useLive(() => api.getOccupancy(date ?? todayISO()), [date])
  const site = siteId ? getSite(siteId) : undefined
  // in modifica i posti dell'uscita stessa non contano: si stanno solo spostando
  const occupied = (siteId: string) => {
    const own = editId && source && source.status !== 'annullata' && source.site_id === siteId && source.date === date ? totalDivers(source) : 0
    return Math.max((occupancy?.[siteId] ?? 0) - own, 0)
  }
  const used = site ? occupied(site.id) : 0
  const available = site ? site.capacity - used : 0
  const total = instructors.length + guides.length + (seaWatching ? participants : guests.length)
  const staffCount = instructors.length + guides.length
  const timeOut = timeIn && duration ? addMinutes(timeIn, duration) : null
  const startPassed = date === todayISO() && timeIn !== null && toMinutes(timeIn) < nowMinutes()
  const buoyRequired = site?.zone === 'A' || site?.zone === 'B'

  // Ogni step parte dall'alto
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  // Modifica o ripeti: i dati arrivano dall'uscita di partenza
  useEffect(() => {
    if (!sourceId) return
    api.getBooking(sourceId).then((b) => {
      if (b) {
        setSource(b)
        setActivity(b.activity_type)
        setSiteId(b.site_id)
        setPoint(b.lat != null && b.lng != null ? { lat: b.lat, lng: b.lng } : null)
        setParticipants(b.participants)
        setInstructors(b.instructors)
        setGuides(b.guides)
        setGuests(b.guests)
        setBuoy(b.buoy)
        setExitMode(b.exit_mode)
        // ripeti: attività, sito e team ci sono già, dopo il giorno e l'orario si va dritti al riepilogo
        setStep(ORDER[b.activity_type].indexOf('when'))
        setReturnToSummary(true)
        if (editId) {
          setDate(b.date)
          setTimeIn(hhmm(b.time_in))
          setDuration(toMinutes(hhmm(b.time_out)) - toMinutes(hhmm(b.time_in)))
          setStep(ORDER[b.activity_type].length - 1)
        }
      }
      setLoadingSource(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Valori dell'ultima uscita: team, pallone e accesso (solo se non c'è una bozza)
  useEffect(() => {
    if (draft || sourceId) return
    api.listMyBookings().then((list) => {
      const last = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
      if (!last) return
      setInstructors((v) => (v.length ? v : last.instructors))
      setGuides((v) => (v.length ? v : last.guides))
      setBuoy((v) => v ?? last.buoy)
      setExitMode((v) => v ?? last.exit_mode)
      setPrefilled(true)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Salva la bozza a ogni modifica
  useEffect(() => {
    if (sent || sourceId) return
    const d: Draft = { step, activity, date, timeIn, duration, siteId, point, participants, instructors, guides, guests, buoy, exitMode }
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d))
    } catch {
      // ignorato: la bozza è solo una comodità
    }
  }, [sourceId, sent, step, activity, date, timeIn, duration, siteId, point, participants, instructors, guides, guests, buoy, exitMode])

  function pickDay(iso: string) {
    setShowCalendar(false)
    setDate(iso)
  }

  const pointZone = point ? zoneForPoint(point.lat, point.lng) : null
  const accompanying = [...instructors, ...guides]

  const STEPS: Record<StepKey, { title: string; hint: string | null }> = {
    activity: { title: 'Cosa fai?', hint: activity ? null : 'Scegli immersione o sea watching' },
    when: {
      title: 'Quando esci?',
      hint: !date
        ? 'Scegli il giorno'
        : !timeIn
          ? "Scegli l'orario di entrata"
          : startPassed
            ? 'Scegli un orario non ancora passato'
            : !duration
              ? 'Scegli quanto restate in acqua'
              : null,
    },
    site: {
      title: 'Dove ti immergi?',
      hint: !site ? 'Scegli un sito per continuare' : available <= 0 ? 'Il sito è al completo: scegline un altro' : null,
    },
    team: {
      title: 'Chi va in acqua?',
      hint: staffCount === 0 ? 'Aggiungi almeno un istruttore o una guida' : total > available ? 'Siete più dei posti liberi: togli qualcuno o cambia sito' : null,
    },
    safety: {
      title: 'Pallone e accesso al sito',
      hint:
        buoy === null || exitMode === null
          ? 'Scegli pallone e accesso al sito'
          : buoyRequired && buoy === false
            ? `In zona ${site?.zone} il pallone è obbligatorio`
            : null,
    },
    point: { title: 'Dove fai sea watching?', hint: point ? null : 'Tocca la mappa o usa la tua posizione' },
    group: {
      title: 'Il gruppo',
      hint:
        accompanying.length === 0
          ? 'Aggiungi chi accompagna il gruppo'
          : participants < 1
            ? 'Indica quanti partecipanti'
            : exitMode === null
              ? 'Scegli come arrivate'
              : buoy === null
                ? 'Indica se portate la boa segnasub'
                : null,
    },
    summary: { title: 'Controlla e invia', hint: null },
  }
  const steps = order.map((k) => STEPS[k])
  const last = steps.length - 1
  const placeLabel = seaWatching ? point && placeName({ site_id: null, ...point }) : site?.name
  const context =
    current === 'activity'
      ? 'Comunichi tutto ad AMP e Guardia Costiera in un colpo solo.'
      : current === 'when'
        ? editId
          ? 'Modifica uscita'
          : repeatId && source
            ? `Ripeti · ${placeName(source)}`
            : activity && ACTIVITY_LABEL[activity]
        : [placeLabel, date && formatDateLong(date), timeIn && timeOut && `${timeIn} → ${timeOut}`].filter(Boolean).join(' · ')

  function edit(target: StepKey) {
    setReturnToSummary(true)
    setStep(order.indexOf(target))
  }

  /** I dati da inviare, o null se manca qualcosa: immersione con il sito, sea watching con il punto. */
  function payload(): NewBooking | null {
    if (!activity || !date || !timeIn || !timeOut) return null
    if (seaWatching ? !point : !site) return null
    return {
      activity_type: activity,
      site_id: seaWatching ? null : (site?.id ?? null),
      lat: seaWatching ? (point?.lat ?? null) : null,
      lng: seaWatching ? (point?.lng ?? null) : null,
      date,
      time_in: timeIn,
      time_out: timeOut,
      instructors,
      guides,
      guests: seaWatching ? [] : guests,
      participants: seaWatching ? participants : 0,
      buoy: !!buoy,
      exit_mode: exitMode ?? 'terra',
    }
  }

  async function submit() {
    const data = payload()
    if (!data) return
    setSubmitting(true)
    setError(null)
    try {
      const booking = editId ? await api.updateBooking(editId, data) : await api.createBooking(data)
      if (!sourceId) sessionStorage.removeItem(DRAFT_KEY)
      setSent(booking)
    } catch (e) {
      const left = (e as Error).message.match(/restano (\d+)/)?.[1]
      setError(
        left !== undefined
          ? { text: `Il sito si è riempito mentre compilavi: restano ${left} posti. Togli qualcuno o cambia sito.`, site: true }
          : { text: 'Invio non riuscito. Controlla la connessione e riprova: i dati restano qui.' },
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Un nome nuovo entra nel team del diving solo se lo aggiunge l'admin; per gli altri vale per questa uscita
  const isAdmin = profile?.org_role === 'admin'
  const teamNote = isAdmin ? 'I nomi nuovi entrano anche nel team del diving.' : "I nomi nuovi valgono solo per questa uscita: il team del diving lo gestisce l'admin."
  async function addStaff(member: StaffMember) {
    if (!profile || !isAdmin || profile.staff.some((s) => s.name === member.name)) return
    await api.updateTeam([...profile.staff, member])
    await refresh()
  }

  if (sent) {
    return (
      <SuccessScreen
        title={editId ? 'Modifica inviata' : 'Comunicazione inviata'}
        text={
          editId
            ? "Invio confermato: l'uscita aggiornata è arrivata ad AMP e Guardia Costiera. Non serve altro."
            : "Invio confermato: la comunicazione è arrivata ad AMP e Guardia Costiera. Non serve altro, buona immersione!"
        }
      >
        <Button size="lg" onClick={() => navigate('/attivita', { replace: true })}>
          Fatto
        </Button>
        <Button size="lg" variant="secondary" onClick={() => navigate(`/attivita/${sent.id}`, { replace: true })}>
          Vedi la comunicazione
        </Button>
      </SuccessScreen>
    )
  }

  if (loadingSource) return <FullScreenLoader />

  const hint = steps[step].hint
  const prefillNote = prefilled && <p className="-mb-3 text-[13px] text-ink-3">Come l'ultima uscita: controlla e cambia se serve.</p>

  return (
    <div className="flex min-h-dvh flex-col">
      <FlowHeader onBack={() => (step > 0 ? setStep(step - 1) : navigate(sourceId ? `/attivita/${sourceId}` : '/attivita'))} step={step} total={steps.length} />

      <div key={step} className="flex-1 animate-enter px-gutter pt-6 pb-stack">
        <FlowTitle title={steps[step].title} context={context} />

        <div>
          {current === 'activity' && (
            <List role="radiogroup" aria-label="Attività">
              {ACTIVITIES.map(({ id, title, description, icon: Icon }) => (
                <ChoiceRow key={id} selected={activity === id} onClick={() => setActivity(id)} title={title} description={description} icon={<Icon />} />
              ))}
            </List>
          )}

          {current === 'when' && (
            <TimeStep
              date={date}
              onDate={pickDay}
              showCalendar={showCalendar}
              onShowCalendar={() => setShowCalendar(true)}
              timeIn={timeIn}
              onTimeIn={setTimeIn}
              duration={duration}
              onDuration={setDuration}
              timeOut={timeOut}
              startPassed={startPassed}
            />
          )}

          {current === 'site' && (
            <>
              <div className="h-80 overflow-hidden rounded-3xl">
                <SiteMap compactPins selectedId={siteId ?? undefined} occupancy={occupancy ?? undefined} onSelectSite={setSiteId} zoom={13} />
              </div>
              <List className="mt-3 gap-1.5" role="radiogroup" aria-label="Siti">
                {SITES.map((s) => {
                  const u = occupied(s.id)
                  const full = u >= s.capacity
                  const selected = s.id === siteId
                  return (
                    <button
                      key={s.id}
                      role="radio"
                      aria-checked={selected}
                      disabled={full}
                      onClick={() => setSiteId(s.id)}
                      className="flex w-full cursor-pointer items-center gap-3 py-2.5 pr-3 pl-4 text-left transition-colors hover:bg-row-2 disabled:cursor-not-allowed"
                    >
                      <span className={cn('min-w-0 flex-1 truncate text-[15px] font-medium', full && 'text-ink-3')}>{s.name}</span>
                      <span className="shrink-0 text-[13px] text-ink-3">
                        Zona {s.zone} · <CapacityLabel used={u} capacity={s.capacity} short className="text-[13px]" />
                      </span>
                      <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full', selected ? 'bg-accent text-white' : 'ring-[1.5px] ring-line-strong ring-inset')}>
                        {selected && <Check className="size-3" strokeWidth={3} />}
                      </span>
                    </button>
                  )
                })}
              </List>
            </>
          )}

          {current === 'team' && profile && site && (
            <div className="flex flex-col gap-group">
              {prefillNote}
              <div>
                <div className="mb-2 flex items-baseline justify-between gap-3 text-[15px]">
                  <span className="text-ink-3">{site.name}</span>
                  <span className={cn('font-semibold', total > available ? 'text-bad' : 'text-ink')}>
                    Usi {total} dei {available} posti liberi
                  </span>
                </div>
                <CapacityGauge used={used} adding={total} capacity={site.capacity} />
              </div>
              <div className="flex flex-col gap-group">
                <TeamPicker
                  label="Istruttori"
                  options={profile.staff.filter((s) => s.role === 'istruttore').map((s) => s.name)}
                  selected={instructors}
                  onChange={setInstructors}
                  onAdd={(name) => addStaff({ name, role: 'istruttore' })}
                  addLabel="Aggiungi un istruttore"
                  addNote={teamNote}
                />
                <TeamPicker
                  label="Guide"
                  options={profile.staff.filter((s) => s.role === 'guida').map((s) => s.name)}
                  selected={guides}
                  onChange={setGuides}
                  onAdd={(name) => addStaff({ name, role: 'guida' })}
                  addLabel="Aggiungi una guida"
                  addNote={teamNote}
                />
                <PeoplePicker label="Ospiti" options={[]} selected={guests} onChange={setGuests} addLabel="Aggiungi ospite" />
              </div>
            </div>
          )}

          {current === 'safety' && (
            <div className="flex flex-col gap-group">
              {prefillNote}
              <Field label="Pallone di segnalazione" value={buoyRequired ? `Obbligatorio in zona ${site?.zone}` : ''}>
                <List role="radiogroup">
                  <ChoiceRow icon={<LifeBuoy />} selected={buoy === true} onClick={() => setBuoy(true)} title="Sarà presente" />
                  <ChoiceRow icon={<CircleOff />} selected={buoy === false} onClick={() => setBuoy(false)} title="Non sarà presente" />
                </List>
                {buoyRequired && buoy === false && <p className="mt-3 text-[15px] text-bad">In zona {site?.zone} il pallone è obbligatorio.</p>}
              </Field>
              <Field label="Come arrivi al sito?" value="">
                <List role="radiogroup">
                  <ChoiceRow icon={<Footprints />} selected={exitMode === 'terra'} onClick={() => setExitMode('terra')} title={EXIT_LABEL.terra} />
                  <ChoiceRow icon={<Ship />} selected={exitMode === 'diporto'} onClick={() => setExitMode('diporto')} title={EXIT_LABEL.diporto} />
                </List>
              </Field>
            </div>
          )}

          {current === 'point' && (
            <PointStep point={point} onPoint={setPoint} zone={pointZone} />
          )}

          {current === 'group' && profile && (
            <div className="flex flex-col gap-group">
              {prefillNote}
              <TeamPicker
                label="Chi accompagna"
                options={profile.staff.map((s) => s.name)}
                selected={accompanying}
                onChange={(names) => {
                  const isInstructor = (n: string) => profile.staff.some((s) => s.name === n && s.role === 'istruttore')
                  setInstructors(names.filter(isInstructor))
                  setGuides(names.filter((n) => !isInstructor(n)))
                }}
                onAdd={(name) => addStaff({ name, role: 'guida' })}
                addLabel="Aggiungi un accompagnatore"
                addNote={teamNote}
              />
              <Field small label="Partecipanti" value="">
                <div className="flex items-center justify-between rounded-2xl bg-row py-2 pr-2 pl-4">
                  <span className="text-[15px] text-ink-3">Basta il numero, senza nomi</span>
                  <CountStepper value={participants} min={0} max={40} onChange={setParticipants} />
                </div>
              </Field>
              <Field small label="Come arrivate?" value="">
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Accesso">
                  <Chip className="w-full justify-center" selected={exitMode === 'terra'} onClick={() => setExitMode('terra')}>
                    <Footprints /> Da riva
                  </Chip>
                  <Chip className="w-full justify-center" selected={exitMode === 'diporto'} onClick={() => setExitMode('diporto')}>
                    <Ship /> In barca
                  </Chip>
                </div>
              </Field>
              <Field small label="Boa segnasub" value="">
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Boa segnasub">
                  <Chip className="w-full justify-center" selected={buoy === true} onClick={() => setBuoy(true)}>
                    <LifeBuoy /> Con la boa
                  </Chip>
                  <Chip className="w-full justify-center" selected={buoy === false} onClick={() => setBuoy(false)}>
                    <CircleOff /> Senza
                  </Chip>
                </div>
              </Field>
            </div>
          )}

          {current === 'summary' && activity && date && timeIn && timeOut && duration && payload() && (
            <>
              <List>
                <SummaryRow icon={seaWatching ? <Waves /> : <WavesArrowDown />} label="Attività" onEdit={() => edit('activity')}>
                  {ACTIVITY_LABEL[activity]}
                </SummaryRow>
                <SummaryRow icon={<CalendarDays />} label="Data" onEdit={() => edit('when')}>
                  {formatDateLong(date)}
                </SummaryRow>
                <SummaryRow icon={<Clock />} label="Orario indicativo" onEdit={() => edit('when')}>
                  circa {timeIn} → {timeOut} · {formatDuration(duration)}
                </SummaryRow>
                {seaWatching ? (
                  <>
                    <SummaryRow icon={<MapPin />} label="Punto" onEdit={() => edit('point')}>
                      {placeLabel}
                      {pointZone && ` · Zona ${pointZone}`}
                    </SummaryRow>
                    <SummaryRow icon={<UsersRound />} label={`Gruppo · ${participants} partecipanti`} onEdit={() => edit('group')}>
                      Con {accompanying.join(', ')}
                    </SummaryRow>
                    <SummaryRow icon={exitMode === 'diporto' ? <Ship /> : <Footprints />} label="Accesso e boa" onEdit={() => edit('group')}>
                      {exitMode === 'diporto' ? 'In barca' : 'Da riva'} · {buoy ? 'con la boa segnasub' : 'senza boa'}
                    </SummaryRow>
                  </>
                ) : (
                  site && (
                    <>
                      <SummaryRow icon={<MapPin />} label="Sito" onEdit={() => edit('site')}>
                        {site.name} · Zona {site.zone}
                      </SummaryRow>
                      <SummaryRow icon={<Users />} label={`Subacquei · ${total}`} onEdit={() => edit('team')}>
                        {[...instructors, ...guides, ...guests].join(', ')}
                      </SummaryRow>
                      <SummaryRow icon={<LifeBuoy />} label="Pallone e accesso" onEdit={() => edit('safety')}>
                        {buoy ? 'Pallone presente' : 'Senza pallone'} · {exitMode && EXIT_LABEL[exitMode]}
                      </SummaryRow>
                    </>
                  )
                )}
              </List>
              <ForecastRow date={date} time={timeIn} className="mt-3" />
              <CommunicationPreview
                text={communicationText({
                  ...payload()!,
                  id: 'draft',
                  user_id: null,
                  org_id: profile?.org_id ?? null,
                  org_name: profile?.org_name ?? '',
                  author_name: profile?.full_name ?? '',
                  status: 'inviata',
                  created_at: '',
                })}
              />
              {error && (
                <div className="mt-3 rounded-2xl bg-bad-soft px-4 py-3 text-[15px] text-bad">
                  <p>{error.text}</p>
                  {error.site && (
                    <button onClick={() => edit('site')} className="mt-1.5 cursor-pointer font-semibold underline underline-offset-4">
                      Cambia sito
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomAction hint={hint}>
        {step < last ? (
          <Button size="lg" disabled={!!hint} onClick={() => setStep(returnToSummary ? last : step + 1)}>
            {returnToSummary ? (repeatId ? 'Vai al riepilogo' : 'Torna al riepilogo') : 'Continua'}
          </Button>
        ) : (
          <Button size="lg" loading={submitting} onClick={submit}>
            {editId ? 'Invia la modifica' : 'Invia ad AMP e Guardia Costiera'}
          </Button>
        )}
      </BottomAction>
    </div>
  )
}

/**
 * Sea watching: il punto si tocca sulla mappa (o arriva dal GPS), come nelle segnalazioni.
 * Sotto, la zona in cui cade: in zona A lo snorkeling è ammesso solo nelle aree segnalate
 * di Isola Lachea (DM 9/11/2004, art. 8), quindi lo diciamo senza bloccare.
 */
function PointStep({ point, onPoint, zone }: { point: { lat: number; lng: number } | null; onPoint: (p: { lat: number; lng: number } | null) => void; zone: 'A' | 'B' | 'C' | null }) {
  const [locating, setLocating] = useState(false)
  const [gpsError, setGpsError] = useState(false)

  // se il GPS non risponde il punto resta vuoto: meglio nessuna posizione che una sbagliata
  function locate() {
    onPoint(null)
    setLocating(true)
    setGpsError(false)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        onPoint({ lat: p.coords.latitude, lng: p.coords.longitude })
        setLocating(false)
      },
      () => {
        setGpsError(true)
        setLocating(false)
      },
      { timeout: 8000 },
    )
  }

  return (
    <>
      <div className="h-80 overflow-hidden rounded-3xl">
        <SiteMap compactPins zoom={14} pin={point} onMapClick={(lat, lng) => onPoint({ lat, lng })} showZones />
      </div>
      {point &&
        (zone === 'A' ? (
          <p className="mt-3 rounded-2xl bg-warn-soft px-4 py-3 text-[15px] leading-snug text-warn">
            Zona A: lo snorkeling è consentito solo nelle aree segnalate di Isola Lachea (lato ovest e Punta Cornera), entro 30 m dalla scogliera.
          </p>
        ) : (
          <p className="mt-3 text-[13px] leading-snug text-ink-3">
            {zone ? `Zona ${zone} · snorkeling consentito, senza posti da prenotare.` : "Fuori dall'AMP: la comunicazione non è obbligatoria, ma puoi inviarla lo stesso."}
          </p>
        ))}
      <List className="mt-3">
        <div className="flex min-h-14 items-center gap-3 px-4 py-3">
          <MapPin className={cn('size-[22px] shrink-0', point ? 'text-accent' : 'text-ink-2')} strokeWidth={1.75} />
          {point ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[17px]">{placeName({ site_id: null, ...point })}</span>
              <span className="block text-[13px] text-ink-3 tabular-nums">
                {toDMS(point.lat, 'N', 'S')} {toDMS(point.lng, 'E', 'W')}
              </span>
            </span>
          ) : (
            <span className="flex-1 text-[17px] text-ink-3">Nessun punto scelto</span>
          )}
        </div>
        <button type="button" onClick={locate} disabled={locating} className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-row-2 disabled:cursor-wait">
          {locating ? <Loader2 className="size-[22px] shrink-0 animate-spin text-ink-2" /> : <LocateFixed className="size-[22px] shrink-0 text-ink-2" strokeWidth={1.75} />}
          <span className="text-[17px]">{locating ? 'Cerco la tua posizione…' : 'Usa la mia posizione'}</span>
        </button>
      </List>
      {gpsError && <p className="mt-3 text-[15px] text-bad">Posizione non disponibile: tocca la mappa nel punto esatto.</p>}
    </>
  )
}

/** Contatore − N + per i partecipanti del sea watching. */
function CountStepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (n: number) => void }) {
  const btn = 'flex size-9 cursor-pointer items-center justify-center rounded-full bg-row-2 text-ink transition active:scale-95 disabled:opacity-30'
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Un partecipante in meno">
        <Minus className="size-4" strokeWidth={2} />
      </button>
      <span className="w-10 text-center text-[17px] font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Un partecipante in più">
        <Plus className="size-4" strokeWidth={2} />
      </button>
    </div>
  )
}

/** Una sezione della schermata orari: icona, etichetta, valore scelto a destra, poi le opzioni. */
function Field({ icon, label, value, small, children }: { icon?: ReactNode; label: string; value: ReactNode; small?: boolean; children: ReactNode }) {
  return (
    <section>
      <div className={cn('flex items-center gap-2.5', small ? 'mb-2' : 'mb-3')}>
        {icon && <span className="text-ink-2 [&>svg]:size-[22px] [&>svg]:stroke-[1.75]">{icon}</span>}
        <span className={cn('flex-1 font-semibold', small ? 'text-[15px]' : 'text-[17px]')}>{label}</span>
        <span className="text-[15px] text-ink-3">{value ?? 'Da scegliere'}</span>
      </div>
      {children}
    </section>
  )
}

/**
 * Giorno, entrata e durata con lo stesso schema (etichetta, valore a destra,
 * poi la scelta), niente di preselezionato; l'entrata si sceglie con la ruota
 * ed è indicativa, l'uscita si calcola da sola.
 */
function TimeStep({
  date,
  onDate,
  showCalendar,
  onShowCalendar,
  timeIn,
  onTimeIn,
  duration,
  onDuration,
  timeOut,
  startPassed,
}: {
  date: string | null
  onDate: (iso: string) => void
  showCalendar: boolean
  onShowCalendar: () => void
  timeIn: string | null
  onTimeIn: (t: string) => void
  duration: number | null
  onDuration: (d: number) => void
  timeOut: string | null
  startPassed: boolean
}) {
  const today = todayISO()
  const tomorrow = addDays(today, 1)
  const otherDay = date !== null && date !== today && date !== tomorrow
  const min = date === today ? Math.ceil(nowMinutes() / 15) * 15 : 0
  const fits = (start: number, d: number | null) => start + (d ?? 0) <= LAST_MINUTE
  const chip = 'w-full justify-center px-2'

  return (
    <div className="flex flex-col gap-group">
      <Field icon={<CalendarDays />} label="Giorno" value={date && formatDateLong(date)}>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Giorno">
          <Chip className={chip} selected={date === today && !showCalendar} onClick={() => onDate(today)}>
            Oggi
          </Chip>
          <Chip className={chip} selected={date === tomorrow && !showCalendar} onClick={() => onDate(tomorrow)}>
            Domani
          </Chip>
          <Chip className={chip} selected={showCalendar || otherDay} onClick={onShowCalendar}>
            {otherDay ? shortDate(date) : 'Altro giorno'}
          </Chip>
        </div>
        {showCalendar && (
          <div className="mt-3">
            <Calendar value={date} onChange={onDate} />
          </div>
        )}
      </Field>

      <Field icon={<ArrowDownToLine />} label="Entrata in acqua" value={timeIn && `circa ${timeIn}`}>
        <TimePicker
          value={timeIn}
          placeholder={customStart(date)}
          onChange={onTimeIn}
          isDisabled={(t) => toMinutes(t) < min || !fits(toMinutes(t), duration)}
        />
        <p className="mt-3 text-[13px] leading-snug text-ink-3">Basta un orario indicativo: in mare non è mai preciso al minuto.</p>
        {startPassed && <p className="mt-3 text-[15px] text-bad">Questo orario è già passato: scegline uno più tardi.</p>}
      </Field>

      <Field icon={<Timer />} label="Tempo in acqua" value={duration && formatDuration(duration)}>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Tempo in acqua">
          {DURATIONS.map((d) => (
            <Chip key={d} className={chip} selected={d === duration} onClick={() => onDuration(d)} disabled={timeIn !== null && !fits(toMinutes(timeIn), d)}>
              {formatDuration(d)}
            </Chip>
          ))}
        </div>
      </Field>

      <div className="flex min-h-14 items-center gap-2.5 rounded-2xl bg-row px-4 py-3">
        <ArrowUpFromLine className="size-[22px] shrink-0 text-ink-2" strokeWidth={1.75} />
        <span className="flex-1 text-[17px] font-semibold">Uscita dall'acqua</span>
        {timeOut ? <span className="text-[17px] font-semibold tabular-nums">circa {timeOut}</span> : <span className="text-[15px] text-ink-3">Si calcola da sola</span>}
      </div>

      {date && timeIn && !startPassed && <ForecastRow date={date} time={timeIn} className="-mt-3" />}
    </div>
  )
}

/** Chip tratteggiata "+ Aggiungi": l'unica pillola con il bordo. */
const ADD_CHIP =
  'flex h-8 cursor-pointer items-center justify-center gap-1 rounded-full border-[1.5px] border-dashed border-line-strong px-3 text-[15px] text-ink-3 transition-colors hover:border-ink-3 hover:text-ink'

/**
 * Istruttori o guide: nello step solo chi va in acqua (chip blu, si toccano
 * per toglierle); la chip "+ Aggiungi" apre il foglio con tutti i nomi
 * salvati e il campo per aggiungerne uno nuovo.
 */
function TeamPicker({
  label,
  options,
  selected,
  onChange,
  onAdd,
  addLabel,
  addNote,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  onAdd: (name: string) => void
  addLabel: string
  /** spiega se il nome nuovo entra nel team o vale solo per l'uscita */
  addNote?: string
}) {
  const [open, setOpen] = useState(false)
  const names = [...options, ...selected.filter((n) => !options.includes(n))]
  const toggle = (name: string) => onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name])

  function add(name: string) {
    if (!selected.includes(name)) onChange([...selected, name])
    onAdd(name)
  }

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold">{label}</h2>
        {selected.length > 0 && <span className="text-[13px] text-ink-3">{selected.length}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {selected.map((name) => (
          <Chip key={name} role="checkbox" selected onClick={() => toggle(name)}>
            {name}
            <X />
          </Chip>
        ))}
        <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={addLabel} className={ADD_CHIP}>
          <Plus className="size-4" strokeWidth={2} />
          Aggiungi
        </button>
      </div>

      <BottomSheet
        open={open}
        title={label}
        subtitle={selected.length ? `${selected.length} su ${names.length} in acqua` : 'Tocca chi va in acqua'}
        onClose={() => setOpen(false)}
      >
        {names.length > 0 && (
          <List>
            {names.map((name) => (
              <ChoiceRow key={name} role="checkbox" selected={selected.includes(name)} onClick={() => toggle(name)} title={name} />
            ))}
          </List>
        )}
        <AddRow label={addLabel} onAdd={add} className={names.length ? 'mt-3' : undefined} />
        {addNote && <p className="mt-3 text-[13px] leading-snug text-ink-3">{addNote}</p>}
      </BottomSheet>
    </section>
  )
}

/** Riga "+ Aggiungi…" del foglio: si apre in un campo; Invio aggiunge e resta aperta per il prossimo nome. */
function AddRow({ label, onAdd, className }: { label: string; onAdd: (name: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')

  function commit() {
    const name = value.trim()
    if (name) onAdd(name)
    setValue('')
  }

  if (editing) {
    return (
      <div className={cn('flex gap-2', className)}>
        <Input
          autoFocus
          icon={<Plus />}
          placeholder="Nome e cognome"
          aria-label={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              e.stopPropagation()
              setEditing(false)
            }
          }}
        />
        <Button size="md" className="h-auto shrink-0" disabled={!value.trim()} onClick={commit}>
          Aggiungi
        </Button>
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn('flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-line-strong px-4 py-3 text-left text-[17px] text-ink-2 transition-colors hover:bg-row', className)}
    >
      <Plus className="size-[22px] shrink-0" strokeWidth={1.75} />
      {label}
    </button>
  )
}

/**
 * Ospiti: nomi sempre nuovi, quindi chip con la X e, in fondo, "+ Aggiungi" che si
 * apre in un campo per aggiungerne.
 */
function PeoplePicker({
  label,
  options,
  selected,
  onChange,
  onAdd,
  addLabel,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  onAdd?: (name: string) => void
  addLabel: string
}) {
  const toggle = (name: string) => onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name])
  const extra = selected.filter((n) => !options.includes(n))
  const names = [...options, ...extra]

  function add(name: string) {
    if (!selected.includes(name)) onChange([...selected, name])
    onAdd?.(name)
  }

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold">{label}</h2>
        {selected.length > 0 && <span className="text-[13px] text-ink-3">{selected.length}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {names.map((name) => (
          <Chip key={name} role="checkbox" selected={selected.includes(name)} onClick={() => toggle(name)}>
            {name}
            {selected.includes(name) && !options.includes(name) && <X />}
          </Chip>
        ))}
        <AddChip label={addLabel} onAdd={add} />
      </div>
    </section>
  )
}

/** "+ Aggiungi" che diventa un campo: Invio aggiunge e resta aperto per il prossimo nome. */
function AddChip({ label, onAdd }: { label: string; onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  function commit() {
    const name = value.trim()
    if (name) onAdd(name)
    setValue('')
  }

  if (open) {
    return (
      <input
        autoFocus
        className="h-8 w-44 rounded-full border-[1.5px] border-accent bg-transparent px-3 text-[15px] outline-none placeholder:text-ink-3 focus-visible:outline-none"
        placeholder="Nome e cognome"
        aria-label={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setOpen(false)
        }}
        onBlur={() => {
          commit()
          setOpen(false)
        }}
      />
    )
  }
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={label}
      className={ADD_CHIP}
    >
      <Plus className="size-4" strokeWidth={2} />
      Aggiungi
    </button>
  )
}

/** Riga del riepilogo: etichetta e "Modifica" sulla stessa linea, il valore sotto a tutta larghezza. */
function SummaryRow({ icon, label, onEdit, children }: { icon: ReactNode; label: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 shrink-0 text-ink-2 [&>svg]:size-[22px] [&>svg]:stroke-[1.75]">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-ink-3">{label}</p>
          <button onClick={onEdit} className="-my-1.5 -mr-2 flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 text-[15px] text-accent-ink hover:bg-accent-soft">
            <Pencil className="size-4" strokeWidth={2} />
            Modifica
          </button>
        </div>
        <div className="mt-0.5 text-[17px]">{children}</div>
      </div>
    </div>
  )
}

/**
 * Anteprima del testo che arriva ad AMP e Guardia Costiera: ben visibile nel
 * riepilogo, le prime righe aperte e "Leggi tutto" per il resto.
 */
function CommunicationPreview({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <section className="mt-section">
      <h2 className="text-xl font-bold tracking-[-0.02em]">Il testo per gli enti</h2>
      <p className="mt-1 text-[15px] text-ink-3">È il testo che arriva ad AMP e Guardia Costiera, al posto della mail.</p>
      <div className="mt-3 rounded-2xl bg-row p-4">
        <p className="text-[13px] text-ink-3">A: AMP Isole Ciclopi · Guardia Costiera</p>
        <div className={cn('relative mt-3 overflow-hidden', !open && 'max-h-36')}>
          <pre className="font-sans text-[15px] leading-snug whitespace-pre-wrap text-ink-2">{text}</pre>
          {!open && <span className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-row to-row/0" aria-hidden />}
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="-ml-2 mt-2 flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2 text-[15px] font-semibold text-accent-ink hover:bg-accent-soft"
        >
          {open ? 'Mostra meno' : 'Leggi tutto il testo'}
          <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} strokeWidth={2.5} />
        </button>
      </div>
    </section>
  )
}
