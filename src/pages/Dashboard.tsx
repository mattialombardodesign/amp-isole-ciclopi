import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, ChevronDown, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { api } from '@/lib/api'
import { ACTIVITY_LABEL, EXIT_LABEL, REPORT_LABEL, REQUEST_LABEL, communicationText, formatDateLong, formatDateShort, hhmm, timeAgo, totalDivers } from '@/lib/format'
import { useAuth, useLive } from '@/lib/hooks'
import { SITES, getSite } from '@/lib/sites'
import type { AmpRequest, Booking, Report } from '@/lib/types'
import { addDays, cn, todayISO } from '@/lib/utils'
import { CapacityGauge } from '@/components/CapacityGauge'
import { SiteMap } from '@/components/SiteMap'
import { ConditionsChips } from '@/components/Weather'
import { Button, Status } from '@/components/ui'

type Tab = 'uscite' | 'segnalazioni' | 'richieste'
interface Toast {
  id: string
  title: string
  text: string
}

export default function Dashboard() {
  const { profile, refresh } = useAuth()
  const navigate = useNavigate()
  const [date, setDate] = useState(todayISO())
  const [tab, setTab] = useState<Tab>('uscite')
  const [openId, setOpenId] = useState<string | null>(null)
  const [onlyPending, setOnlyPending] = useState(false)
  const [focusSite, setFocusSite] = useState<string | undefined>()

  const { data: bookings } = useLive(() => api.listAllBookings(date), [date])
  const { data: reports } = useLive(() => api.listAllReports(), [])
  const { data: requests } = useLive(() => api.listAllRequests(), [])

  const occupancy = useMemo(() => {
    const out: Record<string, number> = {}
    for (const b of bookings ?? []) out[b.site_id] = (out[b.site_id] ?? 0) + totalDivers(b)
    return out
  }, [bookings])

  // Evidenzia e notifica gli elementi arrivati in tempo reale
  const known = useRef<Set<string> | null>(null)
  const lastDate = useRef(date)
  const [fresh, setFresh] = useState<Set<string>>(new Set())
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    if (!bookings || !reports || !requests) return
    const items: Toast[] = [
      ...bookings.map((b) => ({ id: b.id, title: `Nuova uscita · ${b.org_name}`, text: `${getSite(b.site_id)?.name}, ${hhmm(b.time_in)}–${hhmm(b.time_out)} · ${totalDivers(b)} subacquei` })),
      ...reports.map((r) => ({ id: r.id, title: `Nuova segnalazione · ${r.org_name}`, text: REPORT_LABEL[r.category] })),
      ...requests.map((r) => ({ id: r.id, title: `Nuova richiesta · ${r.org_name}`, text: REQUEST_LABEL[r.kind] })),
    ]
    const silent = known.current === null || lastDate.current !== date
    known.current ??= new Set()
    lastDate.current = date
    const incoming = items.filter((i) => !known.current!.has(i.id))
    incoming.forEach((i) => known.current!.add(i.id))
    if (silent || incoming.length === 0) return
    setFresh(new Set(incoming.map((i) => i.id)))
    setToasts((t) => [...t, ...incoming])
    incoming.forEach((i) => setTimeout(() => setToasts((t) => t.filter((x) => x.id !== i.id)), 6000))
  }, [bookings, reports, requests, date])

  if (profile && profile.role !== 'amp') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-xl font-semibold">Accesso riservato al personale AMP</p>
        <p className="max-w-sm text-ink-2">Accedi con un account AMP per vedere le comunicazioni dei diving.</p>
        <Button onClick={() => navigate('/attivita')}>Torna all'app</Button>
      </div>
    )
  }

  const divers = (bookings ?? []).reduce((n, b) => n + totalDivers(b), 0)
  const pending = (bookings ?? []).filter((b) => b.status === 'inviata').length
  const openReports = (reports ?? []).filter((r) => r.status === 'aperta')
  const today = todayISO()

  async function signOut() {
    await api.signOut()
    await refresh()
    navigate('/login')
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-[1000] border-b border-line bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="size-8 rounded-lg" />
            <span className="text-[15px] font-semibold">Centrale operativa</span>
            <span className="hidden text-[15px] text-ink-3 sm:inline">AMP Isole Ciclopi · Guardia Costiera</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 text-sm font-medium text-ink-2 sm:flex">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-ok" />
              </span>
              In tempo reale
            </span>
            {api.mode === 'demo' && <Status tone="warn">Demo</Status>}
            <span className="hidden text-sm text-ink-3 lg:block">{profile?.email}</span>
            <button onClick={signOut} className="flex size-10 cursor-pointer items-center justify-center rounded-full text-ink-2 hover:bg-ink/5" aria-label="Esci">
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[34px] leading-tight font-bold tracking-[-0.03em]">{formatDateLong(date)}</h1>
              <div className="ml-2 flex gap-1">
                <Button variant="secondary" size="sm" className="w-9 px-0" onClick={() => setDate(addDays(date, -1))} aria-label="Giorno precedente">
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="secondary" size="sm" className="w-9 px-0" onClick={() => setDate(addDays(date, 1))} aria-label="Giorno successivo">
                  <ChevronRight className="size-4" />
                </Button>
                {date !== today && (
                  <Button variant="ghost" size="sm" onClick={() => setDate(today)}>
                    Oggi
                  </Button>
                )}
              </div>
            </div>
          </div>
          <ConditionsChips />
        </div>

        {/* il numero che chiede un'azione guida; gli altri sono contesto */}
        <div className="mt-group flex flex-wrap items-center gap-x-10 gap-y-4 rounded-2xl bg-night px-6 py-5 text-white">
          <div className="flex items-center gap-5">
            <p className={cn('text-[34px] leading-none font-extrabold tracking-[-0.035em]', pending ? 'text-accent-bright' : 'text-night-3')}>{pending}</p>
            <div>
              <p className="text-base font-semibold">{pending === 1 ? 'Uscita da prendere in visione' : 'Uscite da prendere in visione'}</p>
              {pending > 0 ? (
                <button
                  onClick={() => {
                    setTab('uscite')
                    setOnlyPending(true)
                  }}
                  className="mt-1 cursor-pointer text-sm font-semibold text-accent-bright underline underline-offset-4 hover:text-white"
                >
                  Mostra solo queste
                </button>
              ) : (
                <p className="mt-1 text-sm text-night-3">Tutto letto</p>
              )}
            </div>
          </div>
          <dl className="ml-auto flex flex-wrap gap-x-8 gap-y-2">
            <Stat value={bookings?.length ?? 0} label="uscite" />
            <Stat value={divers} label="subacquei in acqua" />
            <Stat value={openReports.length} label={openReports.length === 1 ? 'segnalazione aperta' : 'segnalazioni aperte'} tone={openReports.length ? 'bad' : undefined} />
          </dl>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <div className="h-[460px] overflow-hidden rounded-2xl ring-1 ring-line">
              <SiteMap
                tone="prussia"
                showZones
                occupancy={occupancy}
                selectedId={focusSite}
                onSelectSite={setFocusSite}
                reports={openReports}
                zoom={14}
                renderSitePopup={(s) => {
                  const here = (bookings ?? []).filter((b) => b.site_id === s.id)
                  return (
                    <div className="min-w-52">
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-xs text-ink-3">
                        {occupancy[s.id] ?? 0} su {s.capacity} subacquei · Zona {s.zone}
                      </p>
                      {here.map((b) => (
                        <p key={b.id} className="mt-1 text-xs">
                          <strong>{hhmm(b.time_in)}</strong> {b.org_name} · {totalDivers(b)}
                        </p>
                      ))}
                    </div>
                  )
                }}
              />
            </div>

            <section>
              <h2 className="mb-3 text-lg font-semibold tracking-tight">Capienza siti · {formatDateShort(date)}</h2>
              <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-line">
                <table className="w-full text-left text-[15px]">
                  <thead className="border-b border-line text-sm text-ink-3">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Sito</th>
                      <th className="px-4 py-2.5 font-medium">Zona</th>
                      <th className="w-[40%] px-4 py-2.5 font-medium">Occupazione</th>
                      <th className="px-4 py-2.5 text-right font-medium">Liberi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {SITES.map((s) => {
                      const used = occupancy[s.id] ?? 0
                      const free = Math.max(s.capacity - used, 0)
                      return (
                        <tr key={s.id} onClick={() => setFocusSite(s.id)} className={cn('cursor-pointer transition-colors hover:bg-ground', focusSite === s.id && 'bg-accent-soft')}>
                          <td className="px-4 py-3 font-medium">{s.name}</td>
                          <td className="px-4 py-3 text-ink-2">{s.zone}</td>
                          <td className="px-4 py-3">
                            <CapacityGauge used={used} capacity={s.capacity} />
                          </td>
                          <td className={cn('px-4 py-3 text-right font-semibold', free === 0 ? 'text-bad' : free / s.capacity < 0.3 ? 'text-warn' : 'text-ink')}>
                            {free === 0 ? 'Pieno' : `${free}/${s.capacity}`}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className="flex max-h-[900px] flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-line">
            <div role="tablist" className="flex gap-1 border-b border-line px-2">
              <TabButton active={tab === 'uscite'} onClick={() => setTab('uscite')} count={bookings?.length}>
                Uscite
              </TabButton>
              <TabButton active={tab === 'segnalazioni'} onClick={() => setTab('segnalazioni')} count={openReports.length}>
                Segnalazioni
              </TabButton>
              <TabButton active={tab === 'richieste'} onClick={() => setTab('richieste')} count={requests?.length}>
                Richieste
              </TabButton>
            </div>
            <div className="flex-1 overflow-y-auto">
              {tab === 'uscite' && onlyPending && (
                <div className="flex items-center justify-between border-b border-line bg-accent-soft px-5 py-2.5 text-sm">
                  <span className="font-medium text-accent">Solo uscite da prendere in visione</span>
                  <button onClick={() => setOnlyPending(false)} className="cursor-pointer font-semibold text-accent hover:underline">
                    Mostra tutte
                  </button>
                </div>
              )}
              {tab === 'uscite' &&
                (bookings?.length ? (
                  <div className="divide-y divide-line">
                    {bookings.filter((b) => !onlyPending || b.status === 'inviata').map((b) => (
                      <BookingItem
                        key={b.id}
                        booking={b}
                        fresh={fresh.has(b.id)}
                        open={openId === b.id}
                        onToggle={() => {
                          setOpenId(openId === b.id ? null : b.id)
                          setFocusSite(b.site_id)
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty text="Nessuna uscita comunicata per questa data." />
                ))}
              {tab === 'segnalazioni' &&
                (reports?.length ? (
                  <div className="divide-y divide-line">
                    {reports.map((r) => (
                      <ReportItem key={r.id} report={r} fresh={fresh.has(r.id)} />
                    ))}
                  </div>
                ) : (
                  <Empty text="Le segnalazioni dei diving compariranno qui." />
                ))}
              {tab === 'richieste' &&
                (requests?.length ? (
                  <div className="divide-y divide-line">
                    {requests.map((r) => (
                      <RequestItem key={r.id} request={r} fresh={fresh.has(r.id)} />
                    ))}
                  </div>
                ) : (
                  <Empty text="Appuntamenti, assistenza e rinnovi compariranno qui." />
                ))}
            </div>
          </section>
        </div>
      </main>

      <div className="fixed right-6 bottom-6 z-[2000] flex w-80 flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="flex animate-enter gap-3 rounded-2xl bg-night p-4 text-white shadow-[0_16px_40px_-12px_rgba(11,15,20,.6)]">
            <Bell className="mt-0.5 size-4 shrink-0 text-night-3" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{t.title}</p>
              <p className="truncate text-sm text-night-3">{t.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ value, label, tone }: { value: number; label: string; tone?: 'bad' }) {
  return (
    <div className="flex items-baseline gap-2">
      <dd className={cn('text-xl font-bold tracking-tight', tone === 'bad' && 'text-bad-bright')}>{value}</dd>
      <dt className="text-sm text-night-3">{label}</dt>
    </div>
  )
}

function TabButton({ active, onClick, count, children }: { active: boolean; onClick: () => void; count?: number; children: ReactNode }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        '-mb-px flex h-12 cursor-pointer items-center gap-2 border-b-2 px-3 text-[15px] font-medium transition-colors',
        active ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink',
      )}
    >
      {children}
      {!!count && <span className="rounded-full bg-ground px-1.5 text-xs font-semibold text-ink-2">{count}</span>}
    </button>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="px-5 py-8 text-[15px] text-ink-3">{text}</p>
}

function BookingItem({ booking: b, fresh, open, onToggle }: { booking: Booking; fresh: boolean; open: boolean; onToggle: () => void }) {
  const [saving, setSaving] = useState(false)
  const site = getSite(b.site_id)
  return (
    <div className={cn(fresh && 'animate-flash', open && 'bg-ground/60')}>
      <div className="flex items-center gap-4 px-5 py-4">
        <button onClick={onToggle} className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-left" aria-expanded={open}>
          <div className="w-14 shrink-0">
            <p className="text-[15px] font-semibold">{hhmm(b.time_in)}</p>
            <p className="text-sm text-ink-3">{hhmm(b.time_out)}</p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold">
              {b.org_name}
              {fresh && <span className="ml-2 text-sm font-medium text-accent">nuova</span>}
            </p>
            <p className="truncate text-sm text-ink-2">
              {site?.name} · {totalDivers(b)} subacquei
            </p>
            <p className="truncate text-sm text-ink-3">{ACTIVITY_LABEL[b.activity_type]}</p>
          </div>
        </button>
        {b.status === 'presa_visione' ? (
          <Status tone="ok">Vista</Status>
        ) : (
          <Button
            size="sm"
            loading={saving}
            onClick={async () => {
              setSaving(true)
              await api.setBookingStatus(b.id, 'presa_visione')
              setSaving(false)
            }}
          >
            <Check className="size-4" /> Presa visione
          </Button>
        )}
        <button onClick={onToggle} className="-mr-2 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-3 hover:bg-ink/5" aria-label={open ? 'Chiudi dettagli' : 'Apri dettagli'}>
          <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
        </button>
      </div>
      {open && (
        <div className="animate-enter px-5 pb-5">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Info label="Istruttori" value={b.instructors.join(', ') || '—'} />
            <Info label="Guide" value={b.guides.join(', ') || '—'} />
            <Info label="Ospiti" value={b.guests.join(', ') || '—'} />
            <Info label="Pallone · uscita" value={`${b.buoy ? 'Presente' : 'Assente'} · ${EXIT_LABEL[b.exit_mode]}`} />
          </dl>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-accent">Testo della comunicazione</summary>
            <pre className="mt-2 rounded-xl bg-card p-3 font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink-2 ring-1 ring-line">{communicationText(b)}</pre>
          </details>
          <p className="mt-3 text-xs text-ink-3">Ricevuta {timeAgo(b.created_at)}</p>
        </div>
      )}
    </div>
  )
}

function ReportItem({ report: r, fresh }: { report: Report; fresh: boolean }) {
  return (
    <div className={cn('flex items-start gap-4 px-5 py-4', fresh && 'animate-flash')}>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold">
          {REPORT_LABEL[r.category]}
          {fresh && <span className="ml-2 text-sm font-medium text-accent">nuova</span>}
        </p>
        <p className="mt-0.5 text-[15px] text-ink-2">{r.description}</p>
        <p className="mt-1 text-sm text-ink-3">
          {r.org_name} · {timeAgo(r.created_at)}
        </p>
      </div>
      {r.status === 'aperta' ? (
        <Button variant="secondary" size="sm" onClick={() => api.setReportStatus(r.id, 'gestita')}>
          Segna gestita
        </Button>
      ) : (
        <Status tone="ok">Gestita</Status>
      )}
    </div>
  )
}

function RequestItem({ request: r, fresh }: { request: AmpRequest; fresh: boolean }) {
  return (
    <div className={cn('px-5 py-4', fresh && 'animate-flash')}>
      <p className="text-[15px] font-semibold">
        {REQUEST_LABEL[r.kind]}
        {fresh && <span className="ml-2 text-sm font-medium text-accent">nuova</span>}
      </p>
      <p className="mt-0.5 text-[15px] text-ink-2">{r.message}</p>
      <p className="mt-1 text-sm text-ink-3">
        {r.org_name} · {timeAgo(r.created_at)}
        {r.preferred_date && ` · data preferita ${formatDateShort(r.preferred_date)}`}
      </p>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-3">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
