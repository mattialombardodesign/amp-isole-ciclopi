import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, ClipboardCheck, Fish, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { ACTIVITY_LABEL, formatDateLong, formatDateShort, hhmm, totalDivers } from '@/lib/format'
import { useLive } from '@/lib/hooks'
import { SITES, getSite } from '@/lib/sites'
import type { Booking } from '@/lib/types'
import { cn, todayISO } from '@/lib/utils'
import { CapacityGauge } from '@/components/CapacityGauge'
import { DepthProfile, SiteThumb, Stat, StatRow } from '@/components/Tour'
import { ConditionsPill } from '@/components/Weather'
import { Button, EmptyState, List, NavRow, PageHeader, SectionHeading, Status } from '@/components/ui'

export function BookingStatus({ status, className }: { status: Booking['status']; className?: string }) {
  return status === 'presa_visione' ? (
    <Status tone="ok" className={className}>
      Vista dall'AMP
    </Status>
  ) : (
    <Status tone="warn" className={className}>
      In attesa dell'AMP
    </Status>
  )
}

/** "tra 2 ore", "tra 25 min", "in corso", oppure la data. */
function relativeStart(b: Booking) {
  if (b.date !== todayISO()) return formatDateShort(b.date)
  const now = new Date()
  const [h, m] = b.time_in.split(':').map(Number)
  const [eh, em] = b.time_out.split(':').map(Number)
  const start = new Date(now)
  start.setHours(h, m, 0, 0)
  const end = new Date(now)
  end.setHours(eh, em, 0, 0)
  const mins = Math.round((start.getTime() - now.getTime()) / 60000)
  if (now >= start && now <= end) return 'in corso'
  if (mins < 0) return 'oggi'
  if (mins < 60) return `tra ${mins} min`
  const hours = Math.round(mins / 60)
  return `tra ${hours} ${hours === 1 ? 'ora' : 'ore'}`
}

export default function Attivita() {
  const navigate = useNavigate()
  const today = todayISO()
  const { data: bookings } = useLive(() => api.listMyBookings(), [])
  const { data: occupancy } = useLive(() => api.getOccupancy(today), [today])

  const upcoming = (bookings ?? []).filter((b) => b.date >= today).sort((a, b) => a.date.localeCompare(b.date) || a.time_in.localeCompare(b.time_in))
  const past = (bookings ?? []).filter((b) => b.date < today)
  const next = upcoming[0]
  const rest = upcoming.slice(1)
  const openSites = SITES.map((s) => ({ site: s, free: s.capacity - (occupancy?.[s.id] ?? 0) })).sort((a, b) => b.free - a.free)

  return (
    <div className="pb-section">
      <PageHeader title="Oggi" subtitle={formatDateLong(today)} aside={<ConditionsPill />} />

      <div className="mt-group px-gutter">
        {next ? (
          <TourCard booking={next} used={occupancy?.[next.site_id] ?? 0} />
        ) : (
          bookings && <EmptyState title="Nessuna uscita in programma" text="Pianifica la prossima uscita: l'AMP e la Guardia Costiera la ricevono subito." />
        )}
        <Button size="lg" className="mt-stack" onClick={() => navigate('/attivita/nuova/visita_guidata')}>
          <Plus className="size-5 text-ice" strokeWidth={2.5} />
          Pianifica un'uscita
        </Button>
      </div>

      {rest.length > 0 && (
        <section className="mt-section px-gutter">
          <SectionHeading>In programma</SectionHeading>
          <List>
            {rest.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </List>
        </section>
      )}

      <section className="mt-section">
        <SectionHeading
          className="px-gutter"
          action={
            <Link to="/mappa" className="text-[15px] font-semibold text-accent">
              Mappa
            </Link>
          }
        >
          Siti con posti oggi
        </SectionHeading>
        <div className="flex snap-x snap-mandatory scroll-px-gutter gap-3 overflow-x-auto no-scrollbar px-gutter pb-2">
          {openSites.map(({ site, free }) => (
            <button
              key={site.id}
              disabled={free <= 0}
              onClick={() => navigate(`/attivita/nuova/visita_guidata?site=${site.id}&date=${today}`)}
              className="w-56 shrink-0 cursor-pointer snap-start overflow-hidden rounded-2xl bg-card text-left shadow-[0_1px_0_var(--color-line),0_10px_24px_-20px_rgba(10,37,64,.45)] ring-1 ring-line transition-transform active:scale-[.98] disabled:cursor-not-allowed"
            >
              <SiteThumb site={site} className="h-28" />
              <div className="p-3.5">
                <p className="truncate text-base font-bold tracking-tight">{site.name}</p>
                <p className={cn('mt-0.5 text-sm', free <= 0 ? 'font-semibold text-bad' : 'text-ink-3')}>
                  {free <= 0 ? 'Pieno oggi' : `${free} liberi`} · {site.depth}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-section px-gutter">
        <SectionHeading>Altre attività</SectionHeading>
        <List>
          <NavRow icon={<Fish />} title="Sea watching guidato" description="Comunica una sessione di snorkeling" onClick={() => navigate('/attivita/nuova/sea_watching')} />
          <NavRow icon={<ClipboardCheck />} title="Rinnovo autorizzazione annuale" description="Per continuare a operare nell'AMP" onClick={() => navigate('/amp/richiesta/rinnovo')} />
        </List>
      </section>

      {past.length > 0 && (
        <section className="mt-section px-gutter">
          <SectionHeading>Uscite passate</SectionHeading>
          <List>
            {past.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </List>
        </section>
      )}
    </div>
  )
}

/** La prossima uscita come scheda percorso: mappa, titolo, statistiche, profilo e capienza. */
function TourCard({ booking: b, used }: { booking: Booking; used: number }) {
  const site = getSite(b.site_id)
  if (!site) return null
  const mine = Math.min(totalDivers(b), used)
  const free = Math.max(site.capacity - used, 0)
  return (
    <Link
      to={`/attivita/${b.id}`}
      className="block overflow-hidden rounded-3xl bg-card shadow-[0_1px_0_var(--color-line),0_16px_36px_-24px_rgba(10,37,64,.55)] ring-1 ring-line transition-transform active:scale-[.99]"
    >
      <SiteThumb site={site} zoom={16} pin="label" caption={`${site.name} · Zona ${site.zone}`} className="h-40">
        <BookingStatus status={b.status} className="absolute top-3 left-3 shadow-sm" />
        <span className="absolute top-3 right-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white first-letter:uppercase">{relativeStart(b)}</span>
      </SiteThumb>
      <div className="p-4 pb-5">
        <h2 className="text-xl leading-snug font-bold tracking-[-0.02em]">
          {ACTIVITY_LABEL[b.activity_type]} {site.at}
        </h2>
        <StatRow className="mt-3">
          <Stat icon="time">
            {hhmm(b.time_in)}–{hhmm(b.time_out)}
          </Stat>
          <Stat icon="divers">{totalDivers(b)} sub</Stat>
          <Stat icon="depth">{site.depth}</Stat>
        </StatRow>
        <DepthProfile site={site} className="mt-stack" />
        <div className="mt-4 flex items-baseline justify-between text-sm">
          <span className="text-ink-3">
            Posti al sito · <span className="font-semibold text-ice-ink">tuoi {mine}</span>
          </span>
          <span className={cn('font-semibold', free === 0 ? 'text-bad' : 'text-ink')}>{free === 0 ? 'Pieno' : `${free} liberi su ${site.capacity}`}</span>
        </div>
        <CapacityGauge used={used} mine={mine} capacity={site.capacity} className="mt-2 h-2" />
      </div>
    </Link>
  )
}

export function BookingRow({ booking: b }: { booking: Booking }) {
  const site = getSite(b.site_id)
  return (
    <Link to={`/attivita/${b.id}`} className="flex items-center gap-3.5 p-3 transition-colors hover:bg-ground">
      {site && <SiteThumb site={site} zoom={14} className="size-[72px] shrink-0 rounded-xl" />}
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold">{site?.name}</p>
        <p className="text-sm text-ink-3">
          {formatDateShort(b.date)} · {hhmm(b.time_in)}–{hhmm(b.time_out)} · {totalDivers(b)} sub
        </p>
        <BookingStatus status={b.status} className="mt-1.5" />
      </div>
      <ChevronRight className="size-4 shrink-0 text-ink-3" />
    </Link>
  )
}
