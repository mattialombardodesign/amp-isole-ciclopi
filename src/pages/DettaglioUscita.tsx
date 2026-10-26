import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarX, Check, Clock, Copy, Footprints, GraduationCap, LifeBuoy, Pencil, Repeat, Ship, UserRound, Users, UsersRound } from 'lucide-react'
import { api } from '@/lib/api'
import { ACTIVITY_LABEL, EXIT_LABEL, communicationText, formatDateLong, hhmm, placeName, placeZone, timeAgo, totalDivers } from '@/lib/format'
import { useLive } from '@/lib/hooks'
import { todayISO } from '@/lib/utils'
import { SiteMap } from '@/components/SiteMap'
import { Button, FlowHeader, FullScreenLoader, InfoRow, List, NavRow, SectionHeading, Timeline, TimelineStep } from '@/components/ui'
import { BookingStatus } from './Attivita'

export default function DettaglioUscita() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: booking } = useLive(() => api.getBooking(id).then((b) => b ?? false), [id])
  const [copied, setCopied] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  if (booking === null) return <FullScreenLoader />
  if (booking === false) {
    return (
      <div className="flex min-h-dvh flex-col">
        <FlowHeader onBack={() => navigate('/attivita')} />
        <div className="px-gutter pt-6">
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">Uscita non trovata</h1>
          <p className="mt-1 text-[15px] text-ink-3">Potrebbe essere stata comunicata da un altro dispositivo.</p>
          <Button size="lg" className="mt-group" onClick={() => navigate('/attivita')}>
            Torna ad Attività
          </Button>
        </div>
      </div>
    )
  }
  const seaWatching = booking.activity_type === 'sea_watching'
  const zone = placeZone(booking)
  const cancelled = booking.status === 'annullata'
  const today = todayISO()
  const over = booking.date < today || (booking.date === today && hhmm(booking.time_in) <= new Date().toTimeString().slice(0, 5))
  const text = communicationText(booking)
  const flow = `/attivita/nuova/${booking.activity_type}`

  async function cancel() {
    setCancelling(true)
    await api.cancelBooking(id)
    setCancelling(false)
    setConfirmCancel(false)
  }

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const access: [ReactNode, string, string] = [booking.exit_mode === 'terra' ? <Footprints key="a" /> : <Ship key="a" />, 'Accesso', EXIT_LABEL[booking.exit_mode]]
  // Sea watching = snorkeling: accompagnatori e numero di partecipanti, senza nomi
  const facts: [ReactNode, string, string][] = seaWatching
    ? [
        [<Clock key="t" />, 'Orario indicativo', `${hhmm(booking.time_in)} → ${hhmm(booking.time_out)}`],
        [<UserRound key="g" />, 'Accompagnatori', [...booking.instructors, ...booking.guides].join(', ') || '—'],
        [<UsersRound key="p" />, 'Partecipanti', `${booking.participants + booking.guests.length}`],
        [<LifeBuoy key="b" />, 'Boa segnasub', booking.buoy ? 'Presente' : 'Assente'],
        access,
      ]
    : [
        [<Clock key="t" />, 'Orario indicativo', `${hhmm(booking.time_in)} → ${hhmm(booking.time_out)}`],
        [<Users key="n" />, 'Subacquei', `${totalDivers(booking)}`],
        [<GraduationCap key="i" />, 'Istruttori', booking.instructors.join(', ') || '—'],
        [<UserRound key="g" />, 'Guide', booking.guides.join(', ') || '—'],
        [<UsersRound key="o" />, 'Ospiti', booking.guests.join(', ') || '—'],
        [<LifeBuoy key="b" />, 'Pallone', booking.buoy ? 'Presente' : 'Assente'],
        access,
      ]

  return (
    <div className="flex min-h-dvh flex-col pb-section">
      <FlowHeader onBack={() => navigate('/attivita')} label={ACTIVITY_LABEL[booking.activity_type]} />
      <div className="animate-enter px-gutter pt-3">
        <BookingStatus status={booking.status} />
        <h1 className="mt-3 text-[28px] leading-tight font-bold tracking-[-0.02em]">
          {placeName(booking)}
          {zone && ` · Zona ${zone}`}
        </h1>
        <p className="mt-1 text-[15px] text-ink-3">
          {formatDateLong(booking.date)} · {ACTIVITY_LABEL[booking.activity_type]}
        </p>

        <Timeline className="mt-group">
          <TimelineStep done title="Inviata" text={[timeAgo(booking.created_at), booking.author_name && `da ${booking.author_name}`].filter(Boolean).join(' · ')} />
          <TimelineStep
            done
            tone="ok"
            last={!cancelled}
            title="Invio confermato"
            text={cancelled ? undefined : 'Arrivata ad AMP e Guardia Costiera. Non serve altro.'}
          />
          {cancelled && <TimelineStep done tone="bad" last title="Annullata" text="L'annullamento è arrivato ad AMP e Guardia Costiera; i posti tornano liberi." />}
        </Timeline>

        <List className="mt-3">
          {!over && !cancelled && (
            <NavRow icon={<Pencil />} title="Modifica l'uscita" description="La versione aggiornata parte ad AMP e Guardia Costiera" onClick={() => navigate(`${flow}?modifica=${booking.id}`)} />
          )}
          <NavRow icon={<Repeat />} title="Ripeti questa uscita" description={seaWatching ? "Stesso punto e gruppo, scegli solo quando" : "Stesso sito e team, scegli solo quando"} onClick={() => navigate(`${flow}?ripeti=${booking.id}`)} />
          {!over && !cancelled && !confirmCancel && (
            <button type="button" onClick={() => setConfirmCancel(true)} className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-bad transition-colors hover:bg-row-2">
              <CalendarX className="size-[22px] shrink-0" strokeWidth={1.75} />
              <span className="text-[17px]">Annulla l'uscita</span>
            </button>
          )}
          {confirmCancel && (
            <div className="px-4 py-4">
              <p className="text-[17px] font-semibold">Vuoi annullare l'uscita?</p>
              <p className="mt-0.5 text-[15px] text-ink-3">L'AMP e la Guardia Costiera vengono avvisate e i posti tornano liberi.</p>
              <div className="mt-3 flex gap-2">
                <Button variant="danger" className="flex-1" loading={cancelling} onClick={cancel}>
                  Sì, annulla
                </Button>
                <Button variant="secondary" className="flex-1 bg-row-2" onClick={() => setConfirmCancel(false)}>
                  No, tienila
                </Button>
              </div>
            </div>
          )}
        </List>

        {seaWatching && booking.lat != null && booking.lng != null && (
          <section className="mt-section">
            <SectionHeading>Punto</SectionHeading>
            <div className="h-56 overflow-hidden rounded-3xl">
              <SiteMap compactPins zoom={15} center={[booking.lat, booking.lng]} pin={{ lat: booking.lat, lng: booking.lng }} />
            </div>
          </section>
        )}

        <section className="mt-section">
          <SectionHeading>Dettagli</SectionHeading>
          <List>
            {facts.map(([icon, k, v]) => (
              <InfoRow key={k} icon={icon} label={k} value={v} />
            ))}
          </List>
        </section>

        <section className="mt-section">
          <SectionHeading
            action={
              <Button variant="ghost" size="sm" onClick={copy}>
                {copied ? <Check className="size-[18px]" strokeWidth={2} /> : <Copy className="size-[18px]" strokeWidth={2} />}
                {copied ? 'Copiato' : 'Copia'}
              </Button>
            }
          >
            Testo inviato agli enti
          </SectionHeading>
          <pre className="rounded-2xl bg-row p-4 font-sans text-[15px] leading-snug whitespace-pre-wrap text-ink-2">{text}</pre>
        </section>
      </div>
    </div>
  )
}
