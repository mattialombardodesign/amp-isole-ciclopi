import { useEffect, type ReactNode } from 'react'
import L from 'leaflet'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { AMP_CENTER, SITES, ZONES, type DiveSite } from '@/lib/sites'
import { REPORT_LABEL } from '@/lib/format'
import type { Report } from '@/lib/types'
import { cn } from '@/lib/utils'

const LEGACY = {
  ink: '#0b0f14',
  card: '#ffffff',
  accent: '#0a5cff',
  ok: '#0e6e3f',
  warn: '#f2a516',
  bad: '#b3202d',
  muted: '#636b78',
}

// Colori della palette Prussia e ghiaccio, per le mappe fuori dalla sezione Mappa
const PRUSSIA = { ...LEGACY, ink: '#0d1a2a', accent: '#123a5e', muted: '#5d6b7e' }

let C = LEGACY

function stateColor(free: number, capacity: number) {
  if (free <= 0) return C.bad
  if (free / capacity < 0.3) return C.warn
  return C.ok
}

/**
 * Pin del sito: un punto sulla coordinata esatta e, accanto, una pillola con
 * i posti liberi e il mini indicatore di capienza (un segmento per subacqueo).
 */
function siteIcon(site: DiveSite, selected: boolean, used?: number) {
  const ring = C === PRUSSIA ? '0 0 0 3px #7fb2e5,' : ''
  const free = used === undefined ? undefined : Math.max(site.capacity - used, 0)
  const bg = selected ? C.accent : C.card
  const fg = selected ? '#fff' : C.ink
  const dot = free === undefined ? C.accent : stateColor(free, site.capacity)
  const shift = {
    up: 'translate(-50%,calc(-100% - 10px))',
    down: 'translate(-50%,10px)',
    left: 'translate(calc(-100% - 10px),-50%)',
    right: 'translate(10px,-50%)',
  }[site.label ?? 'up']
  const segs =
    used === undefined || C === PRUSSIA
      ? ''
      : `<span style="display:flex;gap:1px;margin-top:3px">${Array.from(
          { length: site.capacity },
          (_, i) => `<i style="width:3px;height:4px;border-radius:2px;background:${i < used ? (selected ? '#fff' : C.ink) : selected ? 'rgba(255,255,255,.35)' : '#d0d5dc'}"></i>`,
        ).join('')}</span>`
  const label =
    free === undefined
      ? `<span style="font:600 13px Geist,sans-serif">${site.name}</span>`
      : `<span style="font:600 13px Geist,sans-serif;font-feature-settings:'tnum'">${free === 0 ? 'Pieno' : `${free} liberi`}</span>`
  const html = `<div style="position:relative">
    <span style="position:absolute;left:-5px;top:-5px;width:10px;height:10px;border-radius:99px;background:${dot};box-shadow:0 0 0 2px #fff"></span>
    <div style="position:absolute;transform:${shift};display:flex;flex-direction:column;align-items:flex-start;padding:5px 9px 6px;border-radius:12px;background:${bg};color:${fg};box-shadow:${selected ? ring : ''}0 4px 12px -4px rgba(11,15,20,.35),0 0 0 1px rgba(11,15,20,.08);white-space:nowrap">${label}${segs}</div>
  </div>`
  return L.divIcon({ className: 'amp-marker', iconSize: [0, 0], iconAnchor: [0, 0], popupAnchor: [0, -24], html })
}

const reportIcon = (status: Report['status']) =>
  L.divIcon({
    className: 'amp-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
    html: `<div style="width:22px;height:22px;border-radius:8px;transform:rotate(45deg);background:${status === 'aperta' ? C.bad : C.muted};box-shadow:0 0 0 3px #fff,0 4px 10px -2px rgba(11,15,20,.35)"></div>`,
  })

const pinIcon = () =>
  L.divIcon({
  className: 'amp-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  html: `<div style="width:28px;height:28px;border-radius:99px;background:${C.accent};box-shadow:0 0 0 4px #fff,0 0 0 10px ${C === PRUSSIA ? '#e3effa' : '#e7eeff'},0 6px 14px -4px rgba(11,15,20,.4)"></div>`,
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
  /** 'legacy' per la sezione Mappa, 'prussia' per flusso e dashboard */
  tone?: 'legacy' | 'prussia'
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
  tone = 'legacy',
}: Props) {
  C = tone === 'prussia' ? PRUSSIA : LEGACY
  const selected = sites.find((s) => s.id === selectedId)
  return (
    <MapContainer center={AMP_CENTER} zoom={zoom} zoomControl={false} className={cn('z-0 h-full w-full', tone === 'prussia' && 'map-prussia', className)}>
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
      {showZones &&
        ZONES.map((z) => (
          <Circle key={z.zone} center={AMP_CENTER} radius={z.radius} pathOptions={{ color: z.color, weight: 1.25, dashArray: '5 6', fillColor: z.color, fillOpacity: 0.05 }}>
            <Popup>
              <strong>{z.label}</strong>
              <br />
              <span style={{ color: C.muted }}>Perimetro indicativo</span>
            </Popup>
          </Circle>
        ))}
      {sites.map((s) => (
        <Marker
          key={s.id + (s.id === selectedId ? '-sel' : '') + (occupancy?.[s.id] ?? '')}
          position={[s.lat, s.lng]}
          icon={siteIcon(s, s.id === selectedId, occupancy ? (occupancy[s.id] ?? 0) : undefined)}
          eventHandlers={onSelectSite ? { click: () => onSelectSite(s.id) } : undefined}
          zIndexOffset={s.id === selectedId ? 2000 : 1000}
        >
          {renderSitePopup && <Popup>{renderSitePopup(s)}</Popup>}
        </Marker>
      ))}
      {reports?.map((r) => (
        <Marker key={r.id} position={[r.lat, r.lng]} icon={reportIcon(r.status)} zIndexOffset={-500}>
          <Popup>
            <strong>{REPORT_LABEL[r.category]}</strong>
            <br />
            {r.description}
            <br />
            <span style={{ color: C.muted }}>{r.org_name}</span>
          </Popup>
        </Marker>
      ))}
      {pin && <Marker position={[pin.lat, pin.lng]} icon={pinIcon()} />}
      {onMapClick && <ClickHandler onClick={onMapClick} />}
      <FlyTo target={selected ? [selected.lat, selected.lng] : undefined} />
      {children}
    </MapContainer>
  )
}
