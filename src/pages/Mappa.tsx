import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useLive } from '@/lib/hooks'
import { SITES, getSite } from '@/lib/sites'
import { cn, todayISO } from '@/lib/utils'
import { CapacityGauge, CapacityLabel } from '@/components/CapacityGauge'
import { SiteMap } from '@/components/SiteMap'
import { ConditionsChips } from '@/components/Weather'
import { Button } from '@/components/ui'

export default function Mappa() {
  const navigate = useNavigate()
  const today = todayISO()
  const [showZones, setShowZones] = useState(true)
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const { data: occupancy } = useLive(() => api.getOccupancy(today), [today])
  const site = selectedId ? getSite(selectedId) : undefined
  const used = site ? (occupancy?.[site.id] ?? 0) : 0

  return (
    <div className="legacy-map relative flex-1">
      <div className="absolute inset-0">
        <SiteMap zoom={14} showZones={showZones} occupancy={occupancy ?? undefined} selectedId={selectedId} onSelectSite={setSelectedId} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start justify-between gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="pointer-events-auto rounded-full bg-card px-4 py-2 text-[17px] font-semibold shadow-[0_4px_12px_-6px_rgba(11,15,20,.4)] ring-1 ring-black/5">Mappa</h1>
        <Toggle active={showZones} onClick={() => setShowZones(!showZones)}>
          Zone di tutela
        </Toggle>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] p-4">
        {site ? (
          <div key={site.id} className="pointer-events-auto animate-enter rounded-3xl bg-card p-5 shadow-[0_12px_32px_-12px_rgba(11,15,20,.45)] ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xl font-semibold tracking-tight">{site.name}</p>
                <p className="text-[15px] text-ink-3">
                  Zona {site.zone} · {site.depth}
                </p>
              </div>
              <button onClick={() => setSelectedId(undefined)} className="h-9 cursor-pointer rounded-lg px-2 text-[15px] font-medium text-ink-3 hover:bg-ink/5">
                Chiudi
              </button>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{site.description}</p>
            <div className="mt-4 mb-2 flex items-baseline justify-between">
              <span className="text-sm text-ink-3">Posti oggi</span>
              <CapacityLabel used={used} capacity={site.capacity} />
            </div>
            <CapacityGauge used={used} capacity={site.capacity} />
            <Button size="lg" className="mt-5 rounded-2xl shadow-none" disabled={used >= site.capacity} onClick={() => navigate(`/attivita/nuova/visita_guidata?site=${site.id}&date=${today}`)}>
              Nuova uscita qui
            </Button>
          </div>
        ) : (
          <>
            <ConditionsChips className="pointer-events-auto" />
            <p className="mt-2 text-xs text-ink-3">
              Tocca un sito per i posti liberi · {SITES.length} siti · perimetri indicativi
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'pointer-events-auto flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-[15px] font-medium shadow-[0_4px_12px_-6px_rgba(11,15,20,.4)] ring-1 ring-black/5 transition-colors',
        active ? 'bg-night text-white' : 'bg-card text-ink',
      )}
    >
      <span className={cn('size-2 rounded-full', active ? 'bg-warn-fill' : 'bg-line-strong')} />
      {children}
    </button>
  )
}
