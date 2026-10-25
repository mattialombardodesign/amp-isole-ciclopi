import { useState, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertTriangle, Check, Plus, X } from 'lucide-react'
import { api } from '@/lib/api'
import { ACTIVITY_LABEL, EXIT_LABEL, communicationText, formatDateLong, toDMS } from '@/lib/format'
import { useAuth, useLive } from '@/lib/hooks'
import { SITES, getSite } from '@/lib/sites'
import type { ActivityType, Booking, ExitMode, StaffMember } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/Calendar'
import { CapacityGauge, CapacityLabel } from '@/components/CapacityGauge'
import { SiteMap } from '@/components/SiteMap'
import { DepthProfile, SiteThumb, Stat, StatRow } from '@/components/Tour'
import { BottomAction, Button, ChoiceRow, FlowHeader, List, SuccessScreen } from '@/components/ui'

export default function NuovaUscita() {
  const { tipo } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { profile, refresh } = useAuth()
  const activity: ActivityType = tipo === 'sea_watching' ? 'sea_watching' : 'visita_guidata'

  const [step, setStep] = useState(0)
  const [date, setDate] = useState<string | null>(params.get('date'))
  const [siteId, setSiteId] = useState<string | null>(params.get('site'))
  const [timeIn, setTimeIn] = useState('09:30')
  const [timeOut, setTimeOut] = useState('11:00')
  const [instructors, setInstructors] = useState<string[]>([])
  const [guides, setGuides] = useState<string[]>([])
  const [guests, setGuests] = useState<string[]>([])
  const [buoy, setBuoy] = useState<boolean | null>(null)
  const [exitMode, setExitMode] = useState<ExitMode | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<Booking | null>(null)

  const { data: occupancy } = useLive(() => (date ? api.getOccupancy(date) : Promise.resolve({} as Record<string, number>)), [date])
  const site = siteId ? getSite(siteId) : undefined
  const used = site ? (occupancy?.[site.id] ?? 0) : 0
  const available = site ? site.capacity - used : 0
  const total = instructors.length + guides.length + guests.length
  const staffCount = instructors.length + guides.length

  const steps = [
    { title: 'Quando esci?', valid: !!date },
    { title: 'Dove ti immergi?', valid: !!site && available > 0 },
    { title: 'A che ora?', valid: timeOut > timeIn },
    { title: 'Chi va in acqua?', valid: staffCount > 0 && total <= available },
    { title: 'Ultimi due dettagli', valid: buoy !== null && exitMode !== null },
    { title: 'Controlla e invia', valid: true },
  ]
  const last = steps.length - 1

  const draft: Booking = {
    id: 'draft',
    user_id: null,
    org_name: profile?.org_name ?? '',
    activity_type: activity,
    site_id: siteId ?? '',
    date: date ?? '',
    time_in: timeIn,
    time_out: timeOut,
    instructors,
    guides,
    guests,
    buoy: !!buoy,
    exit_mode: exitMode ?? 'terra',
    status: 'inviata',
    created_at: '',
  }

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      setSent(
        await api.createBooking({
          activity_type: activity,
          site_id: draft.site_id,
          date: draft.date,
          time_in: timeIn,
          time_out: timeOut,
          instructors,
          guides,
          guests,
          buoy: draft.buoy,
          exit_mode: draft.exit_mode,
        }),
      )
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function addStaff(member: StaffMember) {
    if (!profile || profile.staff.some((s) => s.name === member.name)) return
    await api.updateProfile({ staff: [...profile.staff, member] })
    await refresh()
  }

  if (sent) {
    return (
      <SuccessScreen title="Comunicazione inviata" text="L'AMP e la Guardia Costiera l'hanno ricevuta. Ti avvisiamo qui quando l'AMP la prende in visione.">
        <Button size="lg" onClick={() => navigate('/attivita', { replace: true })}>
          Torna a Oggi
        </Button>
        <Button size="lg" variant="ghost" onClick={() => navigate(`/attivita/${sent.id}`, { replace: true })}>
          Vedi la comunicazione
        </Button>
      </SuccessScreen>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <FlowHeader onBack={() => (step > 0 ? setStep(step - 1) : navigate('/attivita'))} step={step} total={steps.length} label={ACTIVITY_LABEL[activity]} />

      <div key={step} className="flex-1 animate-enter px-gutter pt-2 pb-stack">
        <h1 className="mb-group text-[28px] leading-tight font-extrabold tracking-[-0.03em]">{steps[step].title}</h1>

        {step === 0 && (
          <>
            <Calendar value={date} onChange={setDate} />
            {date && <p className="mt-4 text-center text-[15px] font-medium">{formatDateLong(date)}</p>}
          </>
        )}

        {step === 1 && (
          <>
            {/* pianificatore: mappa a tutta larghezza e foglio con il sito scelto */}
            <div className="-mx-gutter h-72 overflow-hidden">
              <SiteMap tone="prussia" selectedId={siteId ?? undefined} occupancy={occupancy ?? undefined} onSelectSite={setSiteId} zoom={14} />
            </div>
            <div className="relative z-[400] -mx-gutter -mt-6 rounded-t-[28px] bg-card px-gutter pt-3 pb-2 shadow-[0_-12px_30px_-18px_rgba(10,37,64,.45)]">
              <div className="mx-auto mb-stack h-1.5 w-10 rounded-full bg-line" />
              {site ? (
                <div key={site.id} className="animate-enter">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xl font-bold tracking-[-0.02em]">{site.name}</p>
                      <p className="mt-0.5 text-sm text-ink-3">{site.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={cn('text-[28px] leading-none font-extrabold tracking-tight', available > 0 ? 'text-accent' : 'text-bad')}>{available > 0 ? available : 'Pieno'}</p>
                      {available > 0 && <p className="mt-1 text-xs text-ink-3">liberi su {site.capacity}</p>}
                    </div>
                  </div>
                  <StatRow className="mt-3">
                    <Stat icon="depth">{site.depth}</Stat>
                    <Stat icon="zone">
                      Zona {site.zone} · {toDMS(site.lat, 'N', 'S')}
                    </Stat>
                  </StatRow>
                  <CapacityGauge used={used} capacity={site.capacity} className="mt-stack h-2" />
                  <DepthProfile site={site} className="mt-stack" />
                </div>
              ) : (
                <p className="text-[15px] text-ink-3">Tocca un sito sulla mappa o scegli dall'elenco.</p>
              )}
              <div className="mt-group divide-y divide-line border-t border-line" role="radiogroup" aria-label="Siti">
                {SITES.filter((s) => s.id !== siteId).map((s) => {
                  const u = occupancy?.[s.id] ?? 0
                  const full = u >= s.capacity
                  return (
                    <button
                      key={s.id}
                      role="radio"
                      aria-checked={false}
                      disabled={full}
                      onClick={() => setSiteId(s.id)}
                      className="flex w-full cursor-pointer items-center gap-3 py-3 text-left disabled:cursor-not-allowed"
                    >
                      <SiteThumb site={s} zoom={14} pin="dot" className="size-12 shrink-0 rounded-xl" />
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-base font-semibold', full && 'text-ink-3')}>{s.name}</span>
                        <span className="block text-sm text-ink-3">
                          Zona {s.zone} · {s.depth}
                        </span>
                      </span>
                      <CapacityLabel used={u} capacity={s.capacity} />
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <List>
              <TimeRow label="Ingresso in acqua" value={timeIn} onChange={setTimeIn} />
              <TimeRow label="Uscita dall'acqua" value={timeOut} onChange={setTimeOut} />
            </List>
            {timeOut <= timeIn && <p className="mt-3 text-sm text-bad">L'uscita deve essere dopo l'ingresso.</p>}
          </>
        )}

        {step === 3 && profile && site && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-card p-4 ring-1 ring-line">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <span className="text-base font-medium">{site.name}</span>
                <span className={cn('text-sm font-semibold', total > available ? 'text-bad' : 'text-ink-2')}>
                  {total} di {available} posti liberi
                </span>
              </div>
              <CapacityGauge used={used} adding={total} capacity={site.capacity} />
              {total > available && <p className="mt-3 text-sm text-bad">Non ci sono abbastanza posti: togli qualcuno o cambia sito.</p>}
            </div>
            <PeoplePicker
              label="Istruttori"
              options={profile.staff.filter((s) => s.role === 'istruttore').map((s) => s.name)}
              selected={instructors}
              onChange={setInstructors}
              onAdd={(name) => addStaff({ name, role: 'istruttore' })}
              placeholder="Aggiungi istruttore"
            />
            <PeoplePicker
              label="Guide"
              options={profile.staff.filter((s) => s.role === 'guida').map((s) => s.name)}
              selected={guides}
              onChange={setGuides}
              onAdd={(name) => addStaff({ name, role: 'guida' })}
              placeholder="Aggiungi guida"
            />
            <PeoplePicker label="Ospiti" options={[]} selected={guests} onChange={setGuests} placeholder="Nome e cognome dell'ospite" />
            {staffCount === 0 && <p className="text-sm text-ink-3">Serve almeno un istruttore o una guida.</p>}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-[15px] font-medium text-ink-2">Pallone di segnalazione</p>
              <List role="radiogroup">
                <ChoiceRow selected={buoy === true} onClick={() => setBuoy(true)} title="Sarà presente" />
                <ChoiceRow selected={buoy === false} onClick={() => setBuoy(false)} title="Non sarà presente" />
              </List>
              {buoy === false && (
                <p className="mt-2 flex gap-2 text-sm text-warn">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" /> Nelle zone A e B il pallone è obbligatorio.
                </p>
              )}
            </div>
            <div>
              <p className="mb-2 text-[15px] font-medium text-ink-2">Modalità di uscita</p>
              <List role="radiogroup">
                <ChoiceRow selected={exitMode === 'terra'} onClick={() => setExitMode('terra')} title={EXIT_LABEL.terra} />
                <ChoiceRow selected={exitMode === 'diporto'} onClick={() => setExitMode('diporto')} title="Con unità da diporto" />
              </List>
            </div>
          </div>
        )}

        {step === last && site && date && (
          <>
            <div className="mb-stack overflow-hidden rounded-3xl bg-card ring-1 ring-line">
              <SiteThumb site={site} zoom={16} pin="label" className="h-36" />
              <div className="p-4">
                <p className="text-lg font-bold tracking-[-0.02em]">
                  {ACTIVITY_LABEL[activity]} {site.at}
                </p>
                <StatRow className="mt-2">
                  <Stat icon="time">
                    {timeIn}–{timeOut}
                  </Stat>
                  <Stat icon="divers">{total} sub</Stat>
                  <Stat icon="depth">{site.depth}</Stat>
                </StatRow>
              </div>
            </div>
            <List>
              <SummaryRow label="Data" onEdit={() => setStep(0)}>
                <span>{formatDateLong(date)}</span>
              </SummaryRow>
              <SummaryRow label="Sito" onEdit={() => setStep(1)}>
                {site.name} · Zona {site.zone}
              </SummaryRow>
              <SummaryRow label="Orario" onEdit={() => setStep(2)}>
                {timeIn}–{timeOut}
              </SummaryRow>
              <SummaryRow label={`Subacquei · ${total}`} onEdit={() => setStep(3)}>
                <PeopleLine label="Istruttori" people={instructors} />
                <PeopleLine label="Guide" people={guides} />
                <PeopleLine label="Ospiti" people={guests} />
              </SummaryRow>
              <SummaryRow label="Pallone e uscita" onEdit={() => setStep(4)}>
                {buoy ? 'Pallone presente' : 'Senza pallone'} · {exitMode && EXIT_LABEL[exitMode]}
              </SummaryRow>
            </List>
            <details className="group mt-4 rounded-2xl bg-card ring-1 ring-line">
              <summary className="cursor-pointer list-none px-4 py-3.5 text-[15px] font-medium text-accent">Vedi il testo che riceveranno gli enti</summary>
              <pre className="border-t border-line px-4 py-3 font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink-2">{communicationText(draft)}</pre>
            </details>
            {error && <p className="mt-4 rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}
          </>
        )}
      </div>

      <BottomAction>
        {step < last ? (
          <Button size="lg" disabled={!steps[step].valid} onClick={() => setStep(step + 1)}>
            Continua
          </Button>
        ) : (
          <Button size="lg" loading={submitting} onClick={submit}>
            Invia ad AMP e Guardia Costiera
          </Button>
        )}
      </BottomAction>
    </div>
  )
}

function TimeRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex min-h-16 items-center justify-between gap-4 px-4 py-2">
      <span className="text-base font-medium">{label}</span>
      <input
        type="time"
        step={900}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl bg-ground px-3 text-xl font-semibold tracking-tight outline-none focus:ring-2 focus:ring-accent"
      />
    </label>
  )
}

function PeoplePicker({
  label,
  options,
  selected,
  onChange,
  onAdd,
  placeholder,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  onAdd?: (name: string) => void
  placeholder: string
}) {
  const [value, setValue] = useState('')
  const toggle = (name: string) => onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name])
  const extra = selected.filter((n) => !options.includes(n))
  const chips = [...options, ...extra]

  function add() {
    const name = value.trim()
    if (!name) return
    if (!selected.includes(name)) onChange([...selected, name])
    onAdd?.(name)
    setValue('')
  }

  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-line">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-base font-semibold">{label}</span>
        <span className="text-sm text-ink-3">{selected.length === 0 ? 'Nessuno' : selected.length === 1 ? '1 selezionato' : `${selected.length} selezionati`}</span>
      </div>
      {chips.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {chips.map((name) => {
            const on = selected.includes(name)
            return (
              <button
                key={name}
                aria-pressed={on}
                onClick={() => toggle(name)}
                className={cn(
                  'flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[15px] font-medium transition-colors',
                  on ? 'bg-ink text-white' : 'bg-ground text-ink hover:bg-line',
                )}
              >
                {on && (options.includes(name) ? <Check className="size-4" strokeWidth={2.5} /> : <X className="size-4" />)}
                {name}
              </button>
            )
          })}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="h-11 min-w-0 flex-1 rounded-xl bg-ground px-3.5 text-base outline-none placeholder:text-ink-3 focus:ring-2 focus:ring-accent"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <Button variant="secondary" className="size-11 shrink-0 px-0" onClick={add} disabled={!value.trim()} aria-label={`Aggiungi a ${label.toLowerCase()}`}>
          <Plus className="size-5" />
        </Button>
      </div>
    </div>
  )
}

function SummaryRow({ label, onEdit, children }: { label: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink-3">{label}</p>
        <div className="mt-0.5 text-base font-medium">{children}</div>
      </div>
      <button onClick={onEdit} className="-mr-1 h-9 cursor-pointer rounded-lg px-2 text-[15px] font-medium text-accent hover:bg-accent-soft">
        Modifica
      </button>
    </div>
  )
}

function PeopleLine({ label, people }: { label: string; people: string[] }) {
  if (!people.length) return null
  return (
    <p className="mt-1 text-[15px] font-normal text-ink-2">
      <span className="font-medium text-ink">{label}:</span> {people.join(', ')}
    </p>
  )
}
