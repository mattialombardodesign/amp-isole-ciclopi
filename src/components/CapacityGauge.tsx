import { cn } from '@/lib/utils'

/**
 * Indicatore di capienza: un segmento per subacqueo.
 * È lo stesso componente nel flusso, sulla mappa e nella dashboard AMP,
 * così diving e AMP leggono la stessa immagine.
 */
export function CapacityGauge({
  used,
  capacity,
  adding = 0,
  mine = 0,
  tone = 'light',
  className,
}: {
  used: number
  capacity: number
  /** subacquei che l'operatore sta aggiungendo in questo momento */
  adding?: number
  /** quanti dei posti già occupati sono dell'operatore (mostrati in blu) */
  mine?: number
  tone?: 'light' | 'dark'
  className?: string
}) {
  const over = used + adding > capacity
  return (
    <div
      className={cn('flex h-2 gap-[2px]', className)}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={capacity}
      aria-valuenow={Math.min(used + adding, capacity)}
      aria-label={`${Math.max(capacity - used, 0)} posti liberi su ${capacity}`}
    >
      {Array.from({ length: capacity }, (_, i) => {
        const state = i < used - mine ? 'used' : i < used ? 'mine' : i < used + adding ? 'adding' : 'free'
        return (
          <span
            key={i}
            style={{ transitionDelay: `${i * 14}ms` }}
            className={cn(
              'flex-1 rounded-[2px] transition-colors duration-500 ease-(--ease-out-expo)',
              state === 'free' && (tone === 'dark' ? 'bg-night-free' : 'cap-free'),
              state === 'used' && (tone === 'dark' ? 'bg-white' : 'bg-ink'),
              (state === 'mine' || state === 'adding') && (over ? 'bg-bad' : 'bg-accent'),
            )}
          />
        )
      })}
    </div>
  )
}

/** "8 liberi su 20", colorato quando il sito è quasi pieno o pieno. */
export function CapacityLabel({ used, capacity, short, className }: { used: number; capacity: number; short?: boolean; className?: string }) {
  const free = Math.max(capacity - used, 0)
  return (
    <span className={cn('text-[15px]', free === 0 ? 'font-semibold text-bad' : free / capacity < 0.3 ? 'font-semibold text-warn' : 'text-ink-3', className)}>
      {free === 0 ? 'Pieno' : short ? `${free} liberi` : `${free} liberi su ${capacity}`}
    </span>
  )
}
