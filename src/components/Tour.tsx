// Elementi della "scheda percorso" in stile Komoot: anteprima di mappa del
// sito, riga di statistiche con icone e profilo di profondità.

import type { ReactNode } from 'react'
import { ArrowDownToLine, Clock, MapPin, Users } from 'lucide-react'
import type { DiveSite } from '@/lib/sites'
import { cn } from '@/lib/utils'

function tileXY(lat: number, lng: number, z: number) {
  const n = 2 ** z
  const x = ((lng + 180) / 360) * n
  const r = (lat * Math.PI) / 180
  const y = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n
  return { x, y }
}

/**
 * Anteprima statica della mappa centrata su un sito: un mosaico 3x3 di tile
 * OpenStreetMap, leggero (nessuna mappa interattiva) e sempre a fuoco sul punto.
 */
export function SiteThumb({
  site,
  zoom = 15,
  className,
  pin = 'dot',
  caption,
  children,
}: {
  site: Pick<DiveSite, 'lat' | 'lng' | 'name'>
  zoom?: number
  className?: string
  pin?: 'dot' | 'label' | 'none'
  /** testo dell'etichetta, se diverso dal nome del sito */
  caption?: string
  children?: ReactNode
}) {
  const { x, y } = tileXY(site.lat, site.lng, zoom)
  const tx = Math.floor(x)
  const ty = Math.floor(y)
  const px = (x - tx) * 256
  const py = (y - ty) * 256
  const tiles = []
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++)
      tiles.push(
        <img
          key={`${dx}:${dy}`}
          alt=""
          className="tile"
          loading="lazy"
          src={`https://tile.openstreetmap.org/${zoom}/${tx + dx}/${ty + dy}.png`}
          style={{ left: (dx + 1) * 256, top: (dy + 1) * 256 }}
        />,
      )
  return (
    <div className={cn('site-thumb relative overflow-hidden bg-line', className)} role="img" aria-label={`Mappa di ${site.name}`}>
      {/* il mosaico è centrato sul punto del sito */}
      <div className="absolute top-1/2 left-1/2 size-[768px]" style={{ transform: `translate(${-(256 + px)}px, ${-(256 + py)}px)` }}>
        {tiles}
      </div>
      {pin !== 'none' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="block size-4 rounded-full bg-ice shadow-[0_0_0_3px_#fff,0_4px_10px_rgba(10,37,64,.35)]" />
          {pin === 'label' && (
            <span className="absolute top-1/2 left-6 -translate-y-1/2 rounded-lg bg-accent px-2.5 py-1 text-sm font-semibold whitespace-nowrap text-white">
              {caption ?? site.name}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

/** Statistica con icona, come nella riga sotto il titolo di un percorso. */
export function Stat({ icon, children }: { icon: 'time' | 'divers' | 'depth' | 'zone'; children: ReactNode }) {
  const Icon = { time: Clock, divers: Users, depth: ArrowDownToLine, zone: MapPin }[icon]
  return (
    <span className="inline-flex items-center gap-1.5 text-[15px] font-medium text-ink-2">
      <Icon className="size-4 text-accent" strokeWidth={2} />
      {children}
    </span>
  )
}

export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap gap-x-4 gap-y-1.5', className)}>{children}</div>
}

function parseDepth(depth: string) {
  const [min, max] = depth.replace(/\s*m$/, '').split(/[–-]/).map(Number)
  return { min: min || 0, max: max || min || 20 }
}

/**
 * Profilo di profondità del sito, l'equivalente del dislivello di Komoot.
 * È illustrativo: scende dalla profondità minima alla massima e risale.
 */
export function DepthProfile({ site, className }: { site: Pick<DiveSite, 'depth' | 'id'>; className?: string }) {
  const { min, max } = parseDepth(site.depth)
  const scale = 42 // profondità mostrata a fondo grafico
  const surface = 3
  const top = surface + 4 + (min / scale) * 52
  const bottom = surface + 4 + (max / scale) * 52
  // piccola variazione per sito, così i profili non sono tutti uguali
  const k = site.id.length % 3
  const d = `M0 ${top} C40 ${top} ${60 + k * 10} ${(top + bottom) / 2} 110 ${bottom - 4} S170 ${bottom} 200 ${bottom - 2} S260 ${top + 6} 300 ${top}`
  const gradientId = `depth-${site.id}`
  return (
    <figure className={className}>
      <svg viewBox="0 0 300 62" preserveAspectRatio="none" className="block h-16 w-full overflow-hidden rounded-lg" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.95" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* l'acqua sopra il fondale, con la linea della superficie */}
        <rect x="0" y="0" width="300" height="62" fill="var(--color-ice-soft)" />
        <line x1="0" y1={surface} x2="300" y2={surface} stroke="var(--color-ice)" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        <path d={`${d} L300 62 L0 62 Z`} fill={`url(#${gradientId})`} />
        <path d={d} fill="none" stroke="var(--color-ice)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption className="mt-1.5 flex justify-between text-xs text-ink-3">
        <span>Profilo di profondità indicativo · da {min} m</span>
        <span>max {max} m</span>
      </figcaption>
    </figure>
  )
}
