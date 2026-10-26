import { useEffect, type ReactNode } from 'react'
import L from 'leaflet'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { AMP_CENTER, SITES, ZONES, type DiveSite } from '@/lib/sites'
import { REPORT_LABEL } from '@/lib/format'
import type { Report } from '@/lib/types'
import { cn } from '@/lib/utils'

// Colori dello stile Joi (gli stessi token di src/index.css)
const C = {
  ink: '#111113',
  card: '#ffffff',
  accent: '#0a7aff',
  ok: '#34c759',
  warn: '#ff9f0a',
  bad: '#ff3b30',
  muted: '#6a6a6f',
  free: '#e3e3e6',
}

const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"

function stateColor(free: number, capacity: number) {
  if (free <= 0) return C.bad
  if (free / capacity < 0.3) return C.warn
  return C.ok
}

/**
 * Pin del sito: un punto sulla coordinata esatta (colore = stato dei posti) e,
 * accanto, una pillola con il nome del sito e, sotto, il mini indicatore di
 * capienza; nella versione compatta la pillola mostra solo il nome.
 */
function siteIcon(site: DiveSite, selected: boolean, used: number | undefined, compact: boolean) {
  const free = used === undefined ? undefined : Math.max(site.capacity - used, 0)
  const bg = selected ? C.accent : C.card
  const fg = selected ? '#fff' : C.ink
  const dot = free === undefined ? C.muted : stateColor(free, site.capacity)
  const shift = {
    up: 'translate(-50%,calc(-100% - 10px))',
    down: 'translate(-50%,10px)',
    left: 'translate(calc(-100% - 10px),-50%)',
    right: 'translate(10px,-50%)',
  }[(compact && site.labelCompact) || site.label || 'up']
  const segs =
    used === undefined || compact
      ? ''
      : `<span style="display:flex;gap:1px;margin-top:3px">${Array.from(
          { length: site.capacity },
          (_, i) => `<i style="width:3px;height:4px;border-radius:2px;background:${i < used ? (selected ? '#fff' : C.ink) : selected ? 'rgba(255,255,255,.3)' : C.free}"></i>`,
        ).join('')}</span>`
  // Il titolo è sempre il nome del sito: i posti liberi li dicono il punto colorato e il mini indicatore
  const label = `<span style="font:600 13px ${FONT}">${site.name}</span>`
  const html = `<div style="position:relative">
    <span style="position:absolute;left:-5px;top:-5px;width:10px;height:10px;border-radius:99px;background:${dot};box-shadow:0 0 0 2px #fff"></span>
    <div style="position:absolute;transform:${shift};display:flex;flex-direction:column;align-items:flex-start;padding:6px 10px 7px;border-radius:12px;background:${bg};color:${fg};box-shadow:0 4px 14px -4px rgba(17,17,19,.3);white-space:nowrap">${label}${segs}</div>
  </div>`
  return L.divIcon({ className: 'amp-marker', iconSize: [0, 0], iconAnchor: [0, 0], popupAnchor: [0, -24], html })
}

const reportIcon = (status: Report['status']) =>
  L.divIcon({
    className: 'amp-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
    html: `<div style="width:22px;height:22px;border-radius:8px;transform:rotate(45deg);background:${status === 'aperta' ? C.bad : C.muted};box-shadow:0 0 0 3px #fff,0 4px 10px -2px rgba(17,17,19,.3)"></div>`,
  })

const PIN_ICON = L.divIcon({
  className: 'amp-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  html: `<div style="width:28px;height:28px;border-radius:99px;background:${C.accent};box-shadow:0 0 0 4px #fff,0 0 0 10px #e3efff,0 6px 14px -4px rgba(17,17,19,.35)"></div>`,
})

function FlyTo({ target }: { target?: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 15), { duration: 0.6 })
  }, [map, target?.[0], target?.[1]]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) })
  return null
}

interface Props {
  className?: string
  zoom?: number
  sites?: DiveSite[]
  selectedId?: string
  occupancy?: Record<string, number>
  onSelectSite?: (id: string) => void
  renderSitePopup?: (site: DiveSite) => ReactNode
  showZones?: boolean
  reports?: Report[]
  pin?: { lat: number; lng: number } | null
  onMapClick?: (lat: number, lng: number) => void
  children?: ReactNode
  /** pin compatti: solo il nome del sito, senza il mini indicatore */
  compactPins?: boolean
  /** centro iniziale (di default il centro dell'AMP) */
  center?: [number, number]
}

export function SiteMap({
  className,
  zoom = 14,
  sites = SITES,
  selectedId,
  occupancy,
  onSelectSite,
  renderSitePopup,
  showZones,
  reports,
  pin,
  onMapClick,
  children,
  compactPins = false,
  center = AMP_CENTER,
}: Props) {
  const selected = sites.find((s) => s.id === selectedId)
  // Quando si sceglie un punto (segnalazioni) zone e siti non devono "mangiarsi" il tocco
  const picking = !!onMapClick
  return (
    <MapContainer center={center} zoom={zoom} zoomControl={false} className={cn('z-0 h-full w-full', className)}>
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
      {showZones &&
        ZONES.map((z) => (
          <Circle
            key={z.zone}
            center={AMP_CENTER}
            radius={z.radius}
            interactive={!picking}
            pathOptions={{ color: z.color, weight: 1.5, dashArray: z.dash, fillColor: z.color, fillOpacity: z.zone === 'A' ? 0.08 : 0.04 }}
          >
            {!picking && (
              <Popup>
                <strong>{z.label}</strong>
                <br />
                <span style={{ color: C.muted }}>Perimetro indicativo</span>
              </Popup>
            )}
          </Circle>
        ))}
      {sites.map((s) => (
        <Marker
          key={s.id + (s.id === selectedId ? '-sel' : '') + (occupancy?.[s.id] ?? '')}
          position={[s.lat, s.lng]}
          icon={siteIcon(s, s.id === selectedId, occupancy ? (occupancy[s.id] ?? 0) : undefined, compactPins)}
          eventHandlers={onSelectSite ? { click: () => onSelectSite(s.id) } : undefined}
          interactive={!picking}
          zIndexOffset={s.id === selectedId ? 2000 : 1000}
        >
          {renderSitePopup && <Popup>{renderSitePopup(s)}</Popup>}
        </Marker>
      ))}
      {reports?.map((r) => (
        <Marker key={r.id} position={[r.lat, r.lng]} icon={reportIcon(r.status)} zIndexOffset={-500} interactive={!picking}>
          <Popup>
            <strong>{REPORT_LABEL[r.category]}</strong>
            <br />
            {r.description}
            <br />
            <span style={{ color: C.muted }}>{r.org_name}</span>
          </Popup>
        </Marker>
      ))}
      {pin && <Marker position={[pin.lat, pin.lng]} icon={PIN_ICON} interactive={false} zIndexOffset={3000} />}
      {onMapClick && <ClickHandler onClick={onMapClick} />}
      <FlyTo target={selected ? [selected.lat, selected.lng] : undefined} />
      {children}
    </MapContainer>
  )
}
