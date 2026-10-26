import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers } from 'lucide-react'
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
    <div className="relative flex-1">
      <div className="absolute inset-0">
        <SiteMap zoom={14} showZones={showZones} occupancy={occupancy ?? undefined} selectedId={selectedId} onSelectSite={setSelectedId} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start justify-between gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="pointer-events-auto flex h-8 items-center rounded-full bg-card px-3.5 text-[15px] font-semibold shadow-[0_4px_14px_-6px_rgba(17,17,19,.3)]">Mappa</h1>
        <Toggle active={showZones} onClick={() => setShowZones(!showZones)}>
          Zone di tutela
        </Toggle>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] p-4">
        {site ? (
          <div key={site.id} className="pointer-events-auto animate-enter rounded-[28px] bg-card p-5 shadow-[0_12px_36px_-12px_rgba(17,17,19,.35)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xl font-bold tracking-[-0.02em]">{site.name}</p>
                <p className="text-[15px] text-ink-3">
                  Zona {site.zone} · {site.depth}
                </p>
              </div>
              <button onClick={() => setSelectedId(undefined)} className="h-9 cursor-pointer rounded-lg px-2 text-[15px] text-ink-2 hover:bg-row-2">
                Chiudi
              </button>
            </div>
            <p className="mt-2 text-[15px] leading-snug text-ink-2">{site.description}</p>
            <div className="mt-group mb-2.5 flex items-baseline justify-between">
              <span className="text-[15px] text-ink-3">Posti oggi</span>
              <CapacityLabel used={used} capacity={site.capacity} />
            </div>
            <CapacityGauge used={used} capacity={site.capacity} />
            <Button size="lg" className="mt-group" disabled={used >= site.capacity} onClick={() => navigate(`/attivita/nuova?site=${site.id}&date=${today}`)}>
              Nuova attività qui
            </Button>
          </div>
        ) : (
          <>
            <ConditionsChips className="pointer-events-auto" />
            <p className="mt-2 text-[13px] text-ink-3">
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
        'pointer-events-auto flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold shadow-[0_4px_14px_-6px_rgba(17,17,19,.3)] transition-colors',
        active ? 'bg-accent text-white' : 'bg-card text-ink',
      )}
    >
      <Layers className="size-4" strokeWidth={2} />
      {children}
    </button>
  )
}
