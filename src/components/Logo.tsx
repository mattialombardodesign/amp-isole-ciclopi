import { cn } from '@/lib/utils'

/**
 * Il logo: l'occhio del ciclope. Sbatte ogni tanto e, se `look`, si guarda
 * intorno. Il colore è `currentColor` (di base il blu `accent`); il bianco
 * dell'occhio prende il colore dello sfondo da `sclera` (classe `fill-*`).
 * Con "riduci movimento" resta fermo (vedi `.eye-*` in index.css).
 */
export function CyclopsEye({
  className,
  sclera = 'fill-card',
  opening,
  look,
  label = 'AMP Isole Ciclopi',
}: {
  className?: string
  sclera?: string
  /** parte chiuso e si apre */
  opening?: boolean
  /** la pupilla guarda a destra e a sinistra */
  look?: boolean
  /** vuoto se il logo è solo decorativo */
  label?: string
}) {
  return (
    <svg viewBox="0 0 54 49" className={cn('text-accent', className)} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}>
      <path fill="currentColor" d="M27 0C11.355 0 0 10.303 0 24.5S11.355 49 27 49s27-10.303 27-24.5S42.645 0 27 0Z" />
      <g className={cn('eye-lid', opening && 'eye-opening')}>
        <ellipse className={sclera} cx="27" cy="24.5" rx="20.15" ry="14.26" />
        <g className={look ? 'eye-look' : undefined}>
          <path
            fill="currentColor"
            d="M32.269 24.5c0 4.35-2.358 7.874-5.269 7.874s-5.27-3.524-5.27-7.874 2.36-7.874 5.27-7.874c.657 0 1.284.18 1.864.508l-1.818 7.297 4.358-4.252c.548 1.241.865 2.727.865 4.321Z"
          />
        </g>
      </g>
    </svg>
  )
}
