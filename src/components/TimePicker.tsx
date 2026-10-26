import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const ITEM = 36 // altezza di una voce della ruota (px)
const VISIBLE = 5 // voci visibili: quella al centro è la scelta

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6) // 06–20: le ore in cui si va in acqua
const MINUTES = [0, 15, 30, 45]

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Selettore dell'orario a ruote, come quello di iOS: ore e quarti d'ora.
 * Finché l'operatore non tocca o scorre, `value` resta null e la ruota
 * mostra solo un suggerimento (`placeholder`) in grigio.
 */
export function TimePicker({
  value,
  placeholder,
  onChange,
  isDisabled,
}: {
  value: string | null
  placeholder: string
  onChange: (t: string) => void
  /** orari non selezionabili (già passati, o che finirebbero troppo tardi): restano visibili ma sbiaditi */
  isDisabled?: (t: string) => boolean
}) {
  const shown = value ?? placeholder
  const [rawHour, m] = shown.split(':').map(Number)
  const h = Math.min(Math.max(rawHour, HOURS[0]), HOURS[HOURS.length - 1])
  const minute = MINUTES.includes(m) ? m : 0

  return (
    <div className="relative flex justify-center gap-1 rounded-2xl bg-row py-2" role="group" aria-label="Orario di entrata">
      <span className="pointer-events-none absolute inset-x-3 top-1/2 h-9 -translate-y-1/2 rounded-xl bg-card" aria-hidden />
      <Wheel
        label="Ora"
        items={HOURS}
        value={h}
        chosen={value !== null}
        format={pad}
        onPick={(hour) => onChange(`${pad(hour)}:${pad(minute)}`)}
        isDisabled={isDisabled && ((hour) => MINUTES.every((min) => isDisabled(`${pad(hour)}:${pad(min)}`)))}
      />
      <span className={cn('relative z-[1] self-center text-[20px] font-semibold', value ? 'text-ink' : 'text-ink-3')}>:</span>
      <Wheel
        label="Minuti"
        items={MINUTES}
        value={minute}
        chosen={value !== null}
        format={pad}
        onPick={(min) => onChange(`${pad(h)}:${pad(min)}`)}
        isDisabled={isDisabled && ((min) => isDisabled(`${pad(h)}:${pad(min)}`))}
      />
    </div>
  )
}

function Wheel({
  label,
  items,
  value,
  chosen,
  format,
  onPick,
  isDisabled,
}: {
  label: string
  items: number[]
  value: number
  chosen: boolean
  format: (n: number) => string
  onPick: (n: number) => void
  isDisabled?: (n: number) => boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const touched = useRef(false) // lo scroll conta solo se l'ha fatto l'operatore
  const settle = useRef<number | undefined>(undefined)
  const index = Math.max(items.indexOf(value), 0)

  // La ruota segue il valore (anche quando cambia da fuori)
  useEffect(() => {
    const el = ref.current
    if (el && Math.round(el.scrollTop / ITEM) !== index) el.scrollTo({ top: index * ITEM, behavior: touched.current ? 'smooth' : 'instant' })
  }, [index])

  function onScroll() {
    if (!touched.current) return
    window.clearTimeout(settle.current)
    settle.current = window.setTimeout(() => {
      const el = ref.current
      if (!el) return
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM)))
      if (items[i] !== value || !chosen) onPick(items[i])
    }, 120)
  }

  function step(delta: number) {
    touched.current = true
    const i = Math.max(0, Math.min(items.length - 1, index + delta))
    onPick(items[i])
  }

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onScroll={onScroll}
      onPointerDown={() => (touched.current = true)}
      onWheel={() => (touched.current = true)}
      onTouchStart={() => (touched.current = true)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') step(1)
        else if (e.key === 'ArrowUp') step(-1)
        else return
        e.preventDefault()
      }}
      className="no-scrollbar relative z-[1] w-16 snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-xl [mask-image:linear-gradient(to_bottom,transparent,black_35%,black_65%,transparent)]"
      style={{ height: ITEM * VISIBLE, paddingBlock: ITEM * Math.floor(VISIBLE / 2) }}
    >
      {items.map((n, i) => {
        const selected = i === index
        return (
          <button
            key={n}
            type="button"
            role="option"
            aria-selected={selected && chosen}
            tabIndex={-1}
            onClick={() => {
              touched.current = true
              onPick(n)
            }}
            className={cn(
              'flex w-full cursor-pointer snap-center items-center justify-center text-[20px] tabular-nums transition-colors',
              selected ? (chosen ? 'font-semibold text-ink' : 'font-semibold text-ink-3') : 'text-ink-3',
              isDisabled?.(n) && 'opacity-30',
            )}
            style={{ height: ITEM }}
          >
            {format(n)}
          </button>
        )
      })}
    </div>
  )
}
