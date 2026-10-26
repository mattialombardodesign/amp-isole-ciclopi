import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, CircleUserRound, MapPin, Plus, Users, Waves, WavesArrowDown } from 'lucide-react'
import { api } from '@/lib/api'
import { ACTIVITY_LABEL, firstName, formatDateLong, formatDateShort, hhmm, peopleShort, placeName, placeZone, totalDivers } from '@/lib/format'
import { useAuth, useLive } from '@/lib/hooks'
import { getSite } from '@/lib/sites'
import type { Booking } from '@/lib/types'
import { cn, todayISO } from '@/lib/utils'
import { CapacityGauge } from '@/components/CapacityGauge'
import { CyclopsEye } from '@/components/Logo'
import { ConditionsLine } from '@/components/Weather'
import { Button, EmptyState, List, PageHeader, Pill, SectionHeading, Status } from '@/components/ui'

export function BookingStatus({ status, className }: { status: Booking['status']; className?: string }) {
  if (status === 'annullata') {
    return (
      <Status tone="neutral" className={className}>
        Annullata
      </Status>
    )
  }
  // L'AMP non dà riscontri nell'app: al diving basta sapere che la comunicazione è arrivata
  return (
    <Status tone="ok" className={className}>
      Invio confermato
    </Status>
  )
}

// Oltre tre uscite in programma l'elenco si chiude in una riga "Altre N"
const VISIBLE_NEXT = 3

/** Saluto secondo l'ora del giorno. */
function greeting() {
  const h = new Date().getHours()
  return h < 13 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera'
}

export default function Attivita() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const today = todayISO()
  const { data: bookings } = useLive(() => api.listMyBookings(), [])
  const { data: occupancy } = useLive(() => api.getOccupancy(today), [today])

  const [showAllPast, setShowAllPast] = useState(false)
  const [showAllNext, setShowAllNext] = useState(false)
  // un'uscita di oggi già terminata non è più "prossima"
  const nowHHMM = new Date().toTimeString().slice(0, 5)
  const isOver = (b: Booking) => b.date < today || (b.date === today && hhmm(b.time_out) < nowHHMM)
  const upcoming = (bookings ?? []).filter((b) => !isOver(b)).sort((a, b) => a.date.localeCompare(b.date) || a.time_in.localeCompare(b.time_in))
  const past = (bookings ?? []).filter(isOver).sort((a, b) => b.date.localeCompare(a.date) || b.time_in.localeCompare(a.time_in))
  // un'uscita annullata resta in elenco ma non è mai la "prossima"
  const next = upcoming.find((b) => b.status !== 'annullata')
  const rest = upcoming.filter((b) => b !== next)

  return (
    <div className="pb-section">
      <PageHeader
        title="Oggi"
        eyebrow={
          <p className="flex min-w-0 items-center gap-2 text-[15px] font-medium text-ink-2">
            <CyclopsEye sclera="fill-ground" look className="w-7 shrink-0" label="" />
            <span className="truncate">
              {greeting()}
              {profile?.full_name && `, ${firstName(profile.full_name)}`}
            </span>
          </p>
        }
        aside={
          <Link
            to="/account"
            aria-label="Account e impostazioni"
            className="-mt-2 -mr-1.5 flex size-10 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-row-2 hover:text-ink"
          >
            <CircleUserRound className="size-7" strokeWidth={1.75} />
          </Link>
        }
        subtitle={
          <>
            {formatDateLong(today)}
            <ConditionsLine className="block" />
          </>
        }
      />

      <div className="mt-group px-gutter">
        {next ? (
          <NextOuting booking={next} used={next.site_id ? (occupancy?.[next.site_id] ?? 0) : 0} />
        ) : (
          bookings && <EmptyState title="Nessuna uscita in programma" text="Comunica la prossima immersione o sea watching: arriva subito ad AMP e Guardia Costiera." />
        )}
        <Button size="lg" className="mt-3" onClick={() => navigate('/attivita/nuova')}>
          <Plus className="size-[18px]" strokeWidth={2} />
          Nuova attività
        </Button>
      </div>

      {rest.length > 0 && (
        <section className="mt-section px-gutter">
          <SectionHeading>In programma</SectionHeading>
          <List>
            {(showAllNext ? rest : rest.slice(0, VISIBLE_NEXT)).map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
            {rest.length > VISIBLE_NEXT && (
              <button
                type="button"
                onClick={() => setShowAllNext(!showAllNext)}
                aria-expanded={showAllNext}
                className="flex min-h-12 w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-row-2"
              >
                <span className="flex-1 text-[15px] text-ink-2">
                  {showAllNext ? 'Mostra meno' : `Altre ${rest.length - VISIBLE_NEXT} in programma · fino al ${formatDateShort(rest[rest.length - 1].date)}`}
                </span>
                <ChevronDown className={cn('size-4 shrink-0 text-ink-3 transition-transform', showAllNext && 'rotate-180')} strokeWidth={2.5} />
              </button>
            )}
          </List>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-section px-gutter">
          <SectionHeading>Uscite passate</SectionHeading>
          <List>
            {(showAllPast ? past : past.slice(0, 5)).map((b) => (
              <BookingRow key={b.id} booking={b} past />
            ))}
          </List>
          {past.length > 5 && !showAllPast && (
            <Button variant="secondary" size="lg" className="mt-3" onClick={() => setShowAllPast(true)}>
              Mostra tutte ({past.length})
            </Button>
          )}
        </section>
      )}
    </div>
  )
}

/** Icona dell'attività: onde con la freccia per l'immersione, onde per il sea watching. */
const ACTIVITY_ICON = { visita_guidata: WavesArrowDown, sea_watching: Waves } as const

/** Pannello scuro della prossima uscita, con la capienza del suo sito (il sea watching non ne ha). */
function NextOuting({ booking: b, used }: { booking: Booking; used: number }) {
  const site = getSite(b.site_id)
  const isToday = b.date === todayISO()
  const mine = Math.min(totalDivers(b), used)
  return (
    <Link to={`/attivita/${b.id}`} className="block rounded-3xl bg-night p-5 text-white transition-transform active:scale-[.99]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] text-night-3">{isToday ? 'Prossima uscita' : `Prossima uscita · ${formatDateShort(b.date)}`}</span>
        <span className="flex h-6 items-center gap-1.5 rounded-full bg-ok-bright/15 px-2.5 text-[13px] font-semibold text-ok-bright">
          <span className="size-1.5 rounded-full bg-current" />
          Invio confermato
        </span>
      </div>
      <p className="mt-3 text-[34px] leading-none font-bold tracking-[-0.03em]">
        {hhmm(b.time_in)}
        <span className="text-night-3">–{hhmm(b.time_out)}</span>
      </p>
      <p className="mt-2.5 flex items-center gap-2 text-[17px] font-semibold">
        <MapPin className="size-[18px] text-night-3" strokeWidth={2} />
        {placeName(b)}
        {placeZone(b) && ` · Zona ${placeZone(b)}`}
      </p>
      <p className="mt-1 flex items-center gap-2 text-[15px] text-night-3">
        <Users className="size-[18px]" strokeWidth={2} />
        {ACTIVITY_LABEL[b.activity_type]} · {peopleShort(b)}
      </p>
      {site && (
        <div className="mt-4 border-t border-dashed border-night-free pt-3.5">
          <div className="mb-2 flex items-center justify-between text-[13px] text-night-3">
            <span>
              Posti al sito {isToday ? 'oggi' : 'quel giorno'} · <span className="text-accent-bright">tuoi {mine}</span>
            </span>
            {used >= site.capacity ? <span className="font-semibold text-bad-bright">Pieno</span> : <span className="font-semibold text-white">{site.capacity - used} liberi su {site.capacity}</span>}
          </div>
          <CapacityGauge used={used} mine={mine} capacity={site.capacity} tone="dark" />
        </div>
      )}
    </Link>
  )
}

export function BookingRow({ booking: b, past }: { booking: Booking; past?: boolean }) {
  const Icon = ACTIVITY_ICON[b.activity_type]
  return (
    <Link to={`/attivita/${b.id}`} className={cn('flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-row-2', b.status === 'annullata' && 'text-ink-3')}>
      <Icon className="size-[22px] shrink-0 text-ink-2" strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[17px]">{placeName(b)}</p>
        <p className="truncate text-[13px] text-ink-3">
          {formatDateShort(b.date)} · {peopleShort(b)}
        </p>
        {!past && b.status === 'annullata' && <BookingStatus status={b.status} className="mt-1.5" />}
      </div>
      <Pill tone={past || b.status === 'annullata' ? 'neutral' : 'accent'}>{hhmm(b.time_in)}</Pill>
    </Link>
  )
}
