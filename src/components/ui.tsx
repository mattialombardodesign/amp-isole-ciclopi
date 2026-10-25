import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------- Button ----------------------------------------------------

type Variant = 'primary' | 'dark' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-white shadow-[0_10px_24px_-14px_rgba(18,58,94,.9)] hover:bg-accent-hover',
  dark: 'bg-night text-white hover:bg-night-2',
  secondary: 'bg-card text-ink ring-1 ring-line-strong ring-inset hover:bg-ground',
  ghost: 'text-ink-2 hover:bg-ink/5 hover:text-ink',
  danger: 'bg-bad text-white hover:opacity-90',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-4 text-[15px] rounded-xl',
  lg: 'h-14 px-6 text-base rounded-full w-full',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof SIZES; loading?: boolean }) {
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition-[background-color,transform,opacity] duration-150 select-none active:scale-[.985] disabled:pointer-events-none disabled:opacity-35',
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

// ---------- Form ------------------------------------------------------

const FIELD =
  'w-full rounded-xl bg-card text-base text-ink ring-1 ring-line-strong ring-inset outline-none transition-shadow placeholder:text-ink-3 focus:ring-2 focus:ring-accent'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD, 'h-12 px-4', className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD, 'min-h-36 resize-none p-4 leading-relaxed', className)} {...props} />
}

export function Label({ children, htmlFor, className }: { children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('mb-2 block text-sm font-medium text-ink-2', className)}>
      {children}
    </label>
  )
}

// ---------- Liste raggruppate -----------------------------------------

/** Contenitore di righe separate da filetti, come le liste di sistema. */
export function List({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('divide-y divide-line overflow-hidden rounded-2xl bg-card shadow-[0_1px_0_var(--color-line),0_10px_24px_-20px_rgba(10,37,64,.45)] ring-1 ring-line', className)} {...props} />
}

/** Riga selezionabile con spunta a destra. */
export function ChoiceRow({
  selected,
  onClick,
  title,
  description,
  icon,
  trailing,
}: {
  selected: boolean
  onClick: () => void
  title: string
  description?: string
  icon?: ReactNode
  trailing?: ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn('flex min-h-15 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors', selected ? 'bg-accent-soft' : 'hover:bg-ground')}
    >
      {icon && <span className={cn('shrink-0 [&>svg]:size-5', selected ? 'text-accent' : 'text-ink-3')}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-sm text-ink-3">{description}</span>}
      </span>
      {trailing}
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full transition-colors',
          selected ? 'bg-accent text-white' : 'ring-1 ring-line-strong ring-inset',
        )}
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  )
}

/** Riga di navigazione con freccia. */
export function NavRow({ onClick, title, description, icon }: { onClick: () => void; title: string; description?: string; icon?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-15 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-ground">
      {icon && <span className="shrink-0 text-ink-2 [&>svg]:size-5">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium">{title}</span>
        {description && <span className="mt-0.5 block text-sm text-ink-3">{description}</span>}
      </span>
      <ChevronRight className="size-4 shrink-0 text-ink-3" />
    </button>
  )
}

// ---------- Stati -----------------------------------------------------

type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'bad'

const TONES: Record<Tone, { pill: string; dot: string }> = {
  neutral: { pill: 'bg-ground text-ink-2', dot: 'bg-ink-3' },
  accent: { pill: 'bg-accent-soft text-accent', dot: 'bg-accent' },
  ok: { pill: 'bg-ok-soft text-ok', dot: 'bg-ok' },
  warn: { pill: 'bg-warn-soft text-warn', dot: 'bg-warn-fill' },
  bad: { pill: 'bg-bad-soft text-bad', dot: 'bg-bad' },
}

export function Status({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap', TONES[tone].pill, className)}>
      <span className={cn('size-1.5 rounded-full', TONES[tone].dot)} />
      {children}
    </span>
  )
}

export function SectionHeading({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-3 flex items-baseline justify-between gap-3', className)}>
      <h2 className="text-xl font-extrabold tracking-[-0.025em]">{children}</h2>
      {action}
    </div>
  )
}

export function EmptyState({ title, text, className }: { title: string; text: string; className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-card px-5 py-6 ring-1 ring-line ring-inset', className)}>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-3">{text}</p>
    </div>
  )
}

export function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader2 className="size-6 animate-spin text-ink-3" />
    </div>
  )
}

// ---------- Navigazione -----------------------------------------------

/** Intestazione delle schede principali: titolo grande e riga di contesto. */
export function PageHeader({ title, subtitle, aside, children }: { title: string; subtitle?: ReactNode; aside?: ReactNode; children?: ReactNode }) {
  return (
    <header className="px-gutter pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[34px] leading-none font-extrabold tracking-[-0.035em]">{title}</h1>
          {subtitle && <div className="mt-2 text-[15px] text-ink-3">{subtitle}</div>}
        </div>
        {aside}
      </div>
      {children}
    </header>
  )
}

/** Intestazione dei flussi a step: indietro, contatore e barra di avanzamento. */
export function FlowHeader({ onBack, step, total, label }: { onBack: () => void; step?: number; total?: number; label?: string }) {
  return (
    <div className="sticky top-0 z-[500] bg-ground/90 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-3 backdrop-blur-md">
      <div className="flex h-11 items-center gap-1">
        <button onClick={onBack} className="flex size-11 cursor-pointer items-center justify-center rounded-full text-ink hover:bg-ink/5" aria-label="Indietro">
          <ChevronLeft className="size-6" />
        </button>
        {label && <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink-2">{label}</span>}
        {total !== undefined && step !== undefined && (
          <span className="pr-2 text-sm font-medium text-ink-3">
            {step + 1} di {total}
          </span>
        )}
      </div>
      {total !== undefined && step !== undefined && (
        <div className="mt-2 flex gap-1 px-2" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors duration-300', i <= step ? 'bg-accent' : 'bg-line-strong')} />
          ))}
        </div>
      )}
    </div>
  )
}

/** Barra fissa in basso per l'azione principale dei flussi. */
export function BottomAction({ children }: { children: ReactNode }) {
  return <div className="sticky bottom-0 z-[500] mt-auto bg-ground/90 px-gutter pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] backdrop-blur-md">{children}</div>
}

/** Schermata di conferma finale. */
export function SuccessScreen({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col px-6">
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-8 flex size-20 animate-check items-center justify-center rounded-full bg-accent text-white">
          <Check className="size-10" strokeWidth={2.5} />
        </div>
        <h1 className="text-[34px] leading-tight font-bold tracking-[-0.03em]">{title}</h1>
        <p className="mt-3 max-w-sm text-[17px] leading-relaxed text-ink-2">{text}</p>
      </div>
      <div className="flex flex-col gap-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</div>
    </div>
  )
}
