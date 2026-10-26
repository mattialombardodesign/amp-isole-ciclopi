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
    <div className={cn('no-scrollbar flex flex-nowrap gap-2 overflow-x-auto', className)}>
      {parts(c).map(({ key, icon: Icon, text }) => (
        <span
          key={key}
          className={cn(
            'flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium',
            dark ? 'bg-night-2 text-white' : 'bg-card text-ink shadow-[0_4px_14px_-6px_rgba(17,17,19,.3)]',
          )}
        >
          <Icon className={cn('size-4', dark ? 'text-night-3' : 'text-ink-2')} />
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
  return <span className={cn('shrink-0 text-[15px] whitespace-nowrap text-ink-3', className)}>{text}</span>
}

// ---------- Previsioni per un'uscita -----------------------------------

interface Forecast {
  wind?: number
  wave?: number
  sea?: number
}

const forecasts = new Map<string, Promise<Forecast | null>>()

/** Previsioni orarie (Open-Meteo) per il giorno e l'ora di entrata; null oltre l'orizzonte di previsione. */
function fetchForecast(date: string, time: string) {
  const key = `${date}T${time.slice(0, 2)}`
  if (!forecasts.has(key)) {
    const [lat, lng] = AMP_CENTER
    const range = `&start_date=${date}&end_date=${date}&timezone=Europe%2FRome`
    const hour = Number(time.slice(0, 2))
    forecasts.set(
      key,
      Promise.allSettled([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=wind_speed_10m${range}`).then((r) => r.json()),
        fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng + 0.01}&hourly=wave_height,sea_surface_temperature${range}`).then((r) => r.json()),
      ]).then(([weather, marine]) => {
        const w = weather.status === 'fulfilled' ? weather.value?.hourly : undefined
        const m = marine.status === 'fulfilled' ? marine.value?.hourly : undefined
        const f: Forecast = { wind: w?.wind_speed_10m?.[hour] ?? undefined, wave: m?.wave_height?.[hour] ?? undefined, sea: m?.sea_surface_temperature?.[hour] ?? undefined }
        return f.wind === undefined && f.wave === undefined ? null : f
      }),
    )
  }
  return forecasts.get(key)!
}

/** Soglie indicative oltre le quali conviene valutare di rimandare. */
const ROUGH = { wave: 1.25, wind: 30 }

/** Riga con le previsioni del mare all'ora di entrata; ambra se il mare è mosso. */
export function ForecastRow({ date, time, className }: { date: string; time: string; className?: string }) {
  const [state, setState] = useState<{ key: string; f: Forecast | null } | null>(null)
  const key = `${date}T${time}`
  useEffect(() => {
    let alive = true
    fetchForecast(date, time).then((f) => alive && setState({ key, f }))
    return () => {
      alive = false
    }
  }, [date, time, key])
  const f = state?.key === key ? state.f : null
  if (!f) return null
  const rough = (f.wave ?? 0) >= ROUGH.wave || (f.wind ?? 0) >= ROUGH.wind
  const text = [
    f.wave !== undefined && `onde ${f.wave.toLocaleString('it-IT', { maximumFractionDigits: 1 })} m`,
    f.wind !== undefined && `vento ${Math.round(f.wind)} km/h`,
    f.sea !== undefined && `acqua ${Math.round(f.sea)}°`,
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <div className={cn('flex items-start gap-3 rounded-2xl px-4 py-3', rough ? 'bg-warn-soft' : 'bg-row', className)}>
      <Waves className={cn('mt-0.5 size-[22px] shrink-0', rough ? 'text-warn' : 'text-ink-2')} strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <p className={cn('text-[15px] font-semibold', rough && 'text-warn')}>{rough ? 'Mare mosso previsto: valuta di rimandare' : `Previsioni alle ${time}`}</p>
        <p className={cn('text-[15px]', rough ? 'text-warn' : 'text-ink-3')}>{text}</p>
      </div>
    </div>
  )
}
