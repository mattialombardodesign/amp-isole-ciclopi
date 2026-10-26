import { useEffect, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronLeft, ChevronRight, Loader2, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CyclopsEye } from './Logo'

// ---------- Button ----------------------------------------------------

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  // il pulsante principale è nero, come in Joi
  primary: 'bg-ink text-white hover:bg-night-2',
  secondary: 'bg-row text-ink hover:bg-row-2',
  ghost: 'text-accent-ink hover:bg-accent-soft',
  danger: 'bg-bad text-white hover:opacity-90',
}

const SIZES = {
  sm: 'h-9 px-3 text-[15px] rounded-xl',
  md: 'h-11 px-4 text-[15px] rounded-xl',
  lg: 'h-14 px-5 text-[17px] rounded-2xl w-full',
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
        'inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition-[background-color,transform,opacity] duration-150 select-none active:scale-[.985] disabled:pointer-events-none disabled:opacity-30',
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

const FIELD = 'w-full rounded-2xl bg-row text-[17px] text-ink outline-none transition-shadow placeholder:text-ink-3 focus:ring-2 focus:ring-accent'

/** Campo pieno; con `icon` mostra un'icona grigio scuro a sinistra (es. la busta per l'email). */
export function Input({ className, icon, ...props }: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  if (!icon) return <input className={cn(FIELD, 'h-14 px-4', className)} {...props} />
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-2 [&>svg]:size-[22px] [&>svg]:stroke-[1.75]">{icon}</span>
      <input className={cn(FIELD, 'h-14 pr-4 pl-[52px]', className)} {...props} />
    </div>
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD, 'min-h-40 resize-none p-4 leading-snug', className)} {...props} />
}

export function Label({ children, htmlFor, className }: { children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('mb-2 block text-[15px] text-ink-3', className)}>
      {children}
    </label>
  )
}

// ---------- Liste ------------------------------------------------------

/** Pila di righe grigie piene, separate da un piccolo spazio (niente bordi). */
export function List({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-2 [&>*]:rounded-2xl [&>*]:bg-row', className)} {...props} />
}

/** Riga selezionabile con il cerchio a destra. */
export function ChoiceRow({
  selected,
  onClick,
  title,
  description,
  icon,
  trailing,
  role = 'radio',
}: {
  selected: boolean
  onClick: () => void
  title: string
  description?: string
  icon?: ReactNode
  trailing?: ReactNode
  /** 'checkbox' quando se ne possono scegliere più di uno */
  role?: 'radio' | 'checkbox'
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-row-2"
    >
      {icon && <span className={cn('shrink-0 [&>svg]:size-[22px] [&>svg]:stroke-[1.75]', selected ? 'text-accent' : 'text-ink-2')}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[17px]">{title}</span>
        {description && <span className="mt-0.5 block text-[13px] text-ink-3">{description}</span>}
      </span>
      {trailing}
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full transition-colors',
          selected ? 'bg-accent text-white' : 'ring-[1.5px] ring-line-strong ring-inset',
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
    <button type="button" onClick={onClick} className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-row-2">
      {icon && <span className="shrink-0 text-ink-2 [&>svg]:size-[22px] [&>svg]:stroke-[1.75]">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[17px]">{title}</span>
        {description && <span className="mt-0.5 block text-[13px] text-ink-3">{description}</span>}
      </span>
      <ChevronRight className="size-4 shrink-0 text-ink-3" strokeWidth={2.5} />
    </button>
  )
}

/** Riga informativa: icona grigio scuro, etichetta e valore. */
export function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex min-h-14 items-center gap-3 px-4 py-3">
      <span className="shrink-0 text-ink-2 [&>svg]:size-[22px] [&>svg]:stroke-[1.75]">{icon}</span>
      <span className="flex-1 text-[17px]">{label}</span>
      <span className="text-right text-[15px] text-ink-3">{value}</span>
    </div>
  )
}

// ---------- Stati -----------------------------------------------------

type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'bad'

const TONES: Record<Tone, string> = {
  neutral: 'bg-row-2 text-ink-3',
  accent: 'bg-accent-soft text-accent-ink',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
}

/** Piccolo badge di stato, come "Now" o "3 days ago" in Joi. */
export function Status({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold whitespace-nowrap', TONES[tone], className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}

/** Pillola per orari e valori dentro una riga. */
export function Pill({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'accent'; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-8 items-center rounded-[10px] px-2.5 text-[15px] font-medium whitespace-nowrap',
        tone === 'accent' ? 'bg-accent-soft text-accent-ink' : 'bg-row-2 text-ink',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function SectionHeading({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-3 flex items-baseline justify-between gap-3', className)}>
      <h2 className="text-xl font-bold tracking-[-0.02em]">{children}</h2>
      {action}
    </div>
  )
}

export function EmptyState({ title, text, className }: { title: string; text: string; className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-row px-4 py-4', className)}>
      <p className="text-[17px] font-medium">{title}</p>
      <p className="mt-0.5 text-[15px] leading-snug text-ink-3">{text}</p>
    </div>
  )
}

export function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
      <CyclopsEye sclera="fill-ground" className="w-12" label="Caricamento" />
    </div>
  )
}

// ---------- Navigazione -----------------------------------------------

/** Intestazione delle schede principali: titolo e riga di contesto. */
export function PageHeader({
  title,
  eyebrow,
  subtitle,
  aside,
  children,
}: {
  title: string
  /** riga sopra il titolo, per esempio il saluto della home */
  eyebrow?: ReactNode
  subtitle?: ReactNode
  aside?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="px-gutter pt-[max(3.5rem,env(safe-area-inset-top))]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && <div className="mb-1.5">{eyebrow}</div>}
          <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">{title}</h1>
          {subtitle && <div className="mt-1 text-[15px] text-ink-3">{subtitle}</div>}
        </div>
        {aside}
      </div>
      {children}
    </header>
  )
}

/** Intestazione dei flussi a step: "Indietro", contatore e barra di avanzamento. */
export function FlowHeader({ onBack, step, total, label }: { onBack?: () => void; step?: number; total?: number; label?: string }) {
  return (
    <div className="sticky top-0 z-[500] bg-ground/90 px-gutter pt-[max(1rem,env(safe-area-inset-top))] pb-3 backdrop-blur-md">
      <div className="flex h-11 items-center justify-between gap-3">
        {onBack ? (
        <button onClick={onBack} className="-ml-1 flex h-11 cursor-pointer items-center gap-1.5 pr-2 text-[17px] text-ink-2 hover:text-ink" aria-label="Indietro">
          <span className="flex size-[22px] items-center justify-center rounded-full bg-row-2 text-ink-2">
            <ChevronLeft className="size-4" strokeWidth={3} />
          </span>
          Indietro
        </button>
        ) : (
          <span />
        )}
        {label && step === undefined && <span className="truncate text-[15px] text-ink-3">{label}</span>}
        {total !== undefined && step !== undefined && (
          <span className="text-[15px] text-ink-3">
            {step + 1} di {total}
          </span>
        )}
      </div>
      {total !== undefined && step !== undefined && (
        <div className="mt-2 flex gap-1" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={cn('h-[3px] flex-1 rounded-full transition-colors duration-300', i <= step ? 'bg-accent' : 'bg-row-2')} />
          ))}
        </div>
      )}
    </div>
  )
}

/** Titolo di uno step: la domanda in 28 e, sotto, la riga di contesto grigia. */
export function FlowTitle({ title, context }: { title: string; context?: ReactNode }) {
  return (
    <div className="mb-group">
      <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">{title}</h1>
      {context && <p className="mt-1 text-[15px] text-ink-3">{context}</p>}
    </div>
  )
}

/** Cronologia verticale di una comunicazione: inviata → invio confermato (→ annullata). */
export function Timeline({ children, className }: { children: ReactNode; className?: string }) {
  return <ol className={cn('flex flex-col rounded-2xl bg-row p-4', className)}>{children}</ol>
}

/** Un passo della cronologia: nero se fatto, verde se è l'esito positivo, rosso se annullato. */
export function TimelineStep({ done, tone, last, title, text }: { done: boolean; tone?: 'ok' | 'bad'; last?: boolean; title: string; text?: string }) {
  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!last && <span className={cn('absolute top-7 bottom-0 left-[11px] w-0.5', done ? 'bg-ink' : 'bg-line-strong')} />}
      <span
        className={cn(
          'relative flex size-6 shrink-0 items-center justify-center rounded-full',
          !done ? 'ring-[1.5px] ring-line-strong ring-inset' : tone === 'ok' ? 'bg-ok text-white' : tone === 'bad' ? 'bg-bad text-white' : 'bg-ink text-white',
        )}
      >
        {done && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <div>
        <p className={cn('text-[17px]', !done && 'text-ink-3')}>{title}</p>
        {text && <p className="text-[13px] text-ink-3">{text}</p>}
      </div>
    </li>
  )
}

/** Riga rossa per chiamare subito la Guardia Costiera (1530). */
export function EmergencyCall({ title = 'Emergenza in mare?', className }: { title?: string; className?: string }) {
  return (
    <a href="tel:1530" className={cn('flex min-h-14 items-center gap-3 rounded-2xl bg-bad-soft px-4 py-3 text-bad', className)}>
      <Phone className="size-[22px] shrink-0" strokeWidth={1.75} />
      <span className="flex-1">
        <span className="block text-[17px] font-semibold">{title}</span>
        <span className="block text-[15px]">Chiama subito il 1530, Guardia Costiera</span>
      </span>
      <ChevronRight className="size-4 shrink-0" strokeWidth={2.5} />
    </a>
  )
}

/** Barra fissa in basso per l'azione principale dei flussi. */
export function BottomAction({ children, hint }: { children: ReactNode; hint?: string | null }) {
  return (
    <div className="sticky bottom-0 z-[500] mt-auto bg-gradient-to-t from-ground via-ground to-ground/0 px-gutter pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
      {hint && (
        <p className="mb-3 text-center text-[15px] text-ink-3" aria-live="polite">
          {hint}
        </p>
      )}
      {children}
    </div>
  )
}

/** Chip a pillola: blu quando scelto, grigio pieno altrimenti (niente bordi). */
export function Chip({
  selected,
  onClick,
  disabled,
  children,
  role = 'radio',
  className,
}: {
  selected: boolean
  onClick: () => void
  disabled?: boolean
  children: ReactNode
  role?: 'radio' | 'checkbox'
  className?: string
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-8 cursor-pointer items-center gap-1 rounded-full px-3 text-[15px] font-medium tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-30 [&>svg]:size-4 [&>svg]:stroke-2',
        selected ? 'bg-accent text-white' : 'bg-row-2 text-ink hover:bg-line-strong',
        className,
      )}
    >
      {children}
    </button>
  )
}

/**
 * Foglio che sale dal basso, come su iOS: titolo, "Fatto" e il contenuto che
 * scorre. Si chiude con "Fatto", toccando fuori o con Esc.
 */
export function BottomSheet({ open, title, subtitle, onClose, children }: { open: boolean; title: string; subtitle?: ReactNode; onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null)
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  })

  // Pagina sotto ferma, focus sul foglio, Esc per chiudere
  useEffect(() => {
    if (!open) return
    const before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close.current()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = before
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[1500] flex items-end justify-center">
      <div className="absolute inset-0 animate-fade bg-ink/30" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative flex max-h-[85dvh] w-full max-w-[420px] animate-sheet flex-col rounded-t-[28px] bg-ground outline-none"
      >
        <span className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-line-strong" aria-hidden />
        <div className="flex shrink-0 items-start justify-between gap-3 px-gutter pt-3 pb-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-[-0.02em]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[15px] text-ink-3">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="-mr-2 h-9 shrink-0 cursor-pointer rounded-lg px-2 text-[17px] font-semibold text-accent-ink hover:bg-accent-soft">
            Fatto
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-gutter pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

/** Schermata di conferma finale, centrata come le schermate di benvenuto di Joi. */
export function SuccessScreen({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col px-gutter">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 flex size-16 animate-check items-center justify-center rounded-[18px] bg-ink text-white">
          <Check className="size-8" strokeWidth={2.5} />
        </div>
        <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">{title}</h1>
        <p className="mt-2 max-w-xs text-[17px] leading-snug text-ink-3">{text}</p>
      </div>
      <div className="flex flex-col gap-2 pb-[max(2rem,env(safe-area-inset-bottom))]">{children}</div>
    </div>
  )
}
