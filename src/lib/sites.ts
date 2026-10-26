// Siti di immersione dell'AMP Isole Ciclopi.
// Coordinate e capienze sono indicative, pensate per la demo.
// Gli id devono coincidere con la tabella `dive_sites` in supabase/schema.sql.

export interface DiveSite {
  id: string
  name: string
  lat: number
  lng: number
  capacity: number // subacquei al giorno
  zone: 'A' | 'B' | 'C'
  depth: string
  description: string
  /** il nome con la preposizione, per i titoli: "ai Panettoni" */
  at: string
  /** dove sta la pillola rispetto al punto, per non sovrapporsi ai siti vicini */
  label?: 'up' | 'down' | 'left' | 'right'
  /** come `label`, ma per le mappe piccole con i nomi (se diversa) */
  labelCompact?: 'up' | 'down' | 'left' | 'right'
}

export const SITES: DiveSite[] = [
  {
    id: 'panettoni',
    name: 'Panettoni',
    at: 'ai Panettoni',
    lat: 37.55949,
    lng: 15.166,
    capacity: 20,
    zone: 'B',
    depth: '12–35 m',
    description: 'Grandi massi lavici ricoperti di gorgonie e spugne.',
    label: 'right',
  },
  {
    id: 'faraglione-grande',
    name: 'Faraglione Grande',
    at: 'al Faraglione Grande',
    lat: 37.5588,
    lng: 15.1625,
    capacity: 15,
    zone: 'A',
    depth: '8–40 m',
    description: 'Pareti basaltiche colonnari, cernie e saraghi.',
    label: 'left',
  },
  {
    id: 'isola-lachea',
    name: 'Isola Lachea',
    at: "all'Isola Lachea",
    lat: 37.5617,
    lng: 15.1667,
    capacity: 12,
    zone: 'A',
    depth: '5–25 m',
    description: 'Praterie di posidonia e grotte superficiali.',
    label: 'up',
  },
  {
    id: 'secca-capo-mulini',
    name: 'Secca di Capo Mulini',
    at: 'alla Secca di Capo Mulini',
    lat: 37.5805,
    lng: 15.1806,
    capacity: 20,
    zone: 'C',
    depth: '15–45 m',
    description: 'Secca profonda con passaggi di pesce pelagico.',
    label: 'left',
  },
  {
    id: 'castello-acicastello',
    name: 'Scogliera del Castello',
    at: 'alla Scogliera del Castello',
    lat: 37.5551,
    lng: 15.1518,
    capacity: 25,
    zone: 'C',
    depth: '3–18 m',
    description: 'Fondale facile sotto il castello normanno, ideale per sea watching.',
    label: 'right',
    labelCompact: 'down',
  },
]

export const AMP_CENTER: [number, number] = [37.5625, 15.1645]

export function getSite(id: string | null) {
  return id ? SITES.find((s) => s.id === id) : undefined
}

/** Distanza in metri tra due punti (approssimazione equirettangolare, va bene su pochi km). */
function distance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const x = ((lng2 - lng1) * Math.PI) / 180 * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180)
  const y = ((lat2 - lat1) * Math.PI) / 180
  return Math.sqrt(x * x + y * y) * 6_371_000
}

/** Il sito più vicino entro 700 m, per dare un nome a un punto libero. */
export function nearestSite(lat: number, lng: number) {
  let best: { site: DiveSite; d: number } | undefined
  for (const site of SITES) {
    const d = distance(lat, lng, site.lat, site.lng)
    if (d <= 700 && (!best || d < best.d)) best = { site, d }
  }
  return best?.site
}

// Zone di tutela, disegnate come cerchi concentrici solo a scopo illustrativo.
export const ZONES = [
  { zone: 'C', radius: 3200, color: '#8e8e93', dash: '10 8', label: 'Zona C · riserva parziale' },
  { zone: 'B', radius: 1500, color: '#6a6a6f', dash: '6 6', label: 'Zona B · riserva generale' },
  { zone: 'A', radius: 550, color: '#3c3c43', dash: '3 5', label: 'Zona A · riserva integrale' },
] as const

/**
 * Zona di tutela di un punto, con gli stessi perimetri indicativi disegnati sulla mappa
 * (cerchi intorno all'AMP); null se è fuori. I poligoni ufficiali sono nel DM 9 novembre 2004.
 */
export function zoneAt(lat: number, lng: number): 'A' | 'B' | 'C' | null {
  const d = distance(lat, lng, AMP_CENTER[0], AMP_CENTER[1])
  return [...ZONES].sort((a, b) => a.radius - b.radius).find((z) => d <= z.radius)?.zone ?? null
}

/** Zona per un punto libero: quella del sito vicino (così nome e zona coincidono), altrimenti quella del cerchio. */
export function zoneForPoint(lat: number, lng: number) {
  return nearestSite(lat, lng)?.zone ?? zoneAt(lat, lng)
}
