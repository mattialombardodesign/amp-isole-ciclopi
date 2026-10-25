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
  },
]

export const AMP_CENTER: [number, number] = [37.5625, 15.1645]

export function getSite(id: string) {
  return SITES.find((s) => s.id === id)
}

// Zone di tutela, disegnate come cerchi concentrici solo a scopo illustrativo.
export const ZONES = [
  { zone: 'C', radius: 3200, color: '#636b78', label: 'Zona C · riserva parziale' },
  { zone: 'B', radius: 1500, color: '#f2a516', label: 'Zona B · riserva generale' },
  { zone: 'A', radius: 550, color: '#b3202d', label: 'Zona A · riserva integrale' },
] as const
