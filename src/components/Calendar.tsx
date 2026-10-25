import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, toISODate, todayISO } from '@/lib/utils'

const WEEKDAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

export function Calendar({ value, onChange }: { value: string | null; onChange: (iso: string) => void }) {
  const today = todayISO()
  const initial = new Date((value ?? today) + 'T00:00:00')
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1))

  // Griglia che parte dal lunedì
  const offset = (month.getDay() + 6) % 7
  const start = new Date(month)
  start.setDate(1 - offset)
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
  const canGoBack = month > new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-line">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          disabled={!canGoBack}
          className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-ink hover:bg-ink/5 disabled:opacity-30"
          aria-label="Mese precedente"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="font-semibold capitalize">{month.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}</span>
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-ink hover:bg-ink/5"
          aria-label="Mese successivo"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="py-1 text-xs font-medium text-ink-3">
            {d}
          </span>
        ))}
        {days.map((d) => {
          const iso = toISODate(d)
          const outside = d.getMonth() !== month.getMonth()
          const past = iso < today
          const selected = iso === value
          return (
            <button
              key={iso}
              disabled={past}
              onClick={() => onChange(iso)}
              className={cn(
                'mx-auto flex size-11 cursor-pointer items-center justify-center rounded-full text-[15px] font-medium transition-colors',
                outside && 'text-ink-3/50',
                past && 'cursor-default text-ink-3/35',
                !past && !selected && 'hover:bg-ink/5',
                iso === today && !selected && 'font-semibold text-accent',
                selected && 'bg-accent font-semibold text-white',
              )}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
