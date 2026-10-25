import { useEffect, useState } from 'react'
import { Thermometer, Waves, Wind } from 'lucide-react'
import { AMP_CENTER } from '@/lib/sites'
import { cn } from '@/lib/utils'

interface Conditions {
  air?: number
  wind?: number
  sea?: number
}

let cache: Promise<Conditions> | null = null

/** Condizioni meteo-marine attuali ad Aci Trezza (Open-Meteo, gratuito e senza chiavi). */
function fetchConditions() {
  const [lat, lng] = AMP_CENTER
  cache ??= Promise.allSettled([
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m`).then((r) => r.json()),
    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng + 0.01}&current=sea_surface_temperature`).then((r) => r.json()),
  ]).then(([weather, marine]) => {
    const w = weather.status === 'fulfilled' ? weather.value?.current : undefined
    const m = marine.status === 'fulfilled' ? marine.value?.current : undefined
    return { air: w?.temperature_2m, wind: w?.wind_speed_10m, sea: m?.sea_surface_temperature }
  })
  return cache
}

function useConditions() {
  const [data, setData] = useState<Conditions | null>(null)
  useEffect(() => {
    fetchConditions().then(setData)
  }, [])
  return data
}

function parts(c: Conditions) {
  return [
    c.sea !== undefined && { key: 'sea', icon: Waves, text: `Mare ${Math.round(c.sea)}°` },
    c.air !== undefined && { key: 'air', icon: Thermometer, text: `Aria ${Math.round(c.air)}°` },
    c.wind !== undefined && { key: 'wind', icon: Wind, text: `Vento ${Math.round(c.wind)} km/h` },
  ].filter(Boolean) as { key: string; icon: typeof Waves; text: string }[]
}

/** Riga di testo: "Mare 24° · Aria 17° · Vento 5 km/h". */
export function ConditionsLine({ className }: { className?: string }) {
  const c = useConditions()
  if (!c) return null
  const items = parts(c)
  if (!items.length) return null
  return <span className={className}>{items.map((p) => p.text).join(' · ')}</span>
}

/** Pillole per la mappa e la dashboard. */
export function ConditionsChips({ className, dark }: { className?: string; dark?: boolean }) {
  const c = useConditions()
  if (!c) return null
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {parts(c).map(({ key, icon: Icon, text }) => (
        <span
          key={key}
          className={cn(
            'flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium',
            dark ? 'bg-night-2 text-white' : 'bg-card text-ink ring-1 ring-line-strong',
          )}
        >
          <Icon className={cn('size-4', dark ? 'text-night-3' : 'text-ink-3')} />
          {text}
        </span>
      ))}
    </div>
  )
}

/** Pillola compatta per l'intestazione: "Mare 24° · Vento 5 km/h". */
export function ConditionsPill({ className }: { className?: string }) {
  const c = useConditions()
  if (!c || (c.sea === undefined && c.wind === undefined)) return null
  const text = [c.sea !== undefined && `Mare ${Math.round(c.sea)}°`, c.wind !== undefined && `Vento ${Math.round(c.wind)} km/h`].filter(Boolean).join(' · ')
  return <span className={cn('shrink-0 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-accent', className)}>{text}</span>
}
