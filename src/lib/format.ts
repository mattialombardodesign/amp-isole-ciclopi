import { getSite, nearestSite, zoneForPoint } from './sites'
import type { ActivityType, Booking, ExitMode, ReportCategory, RequestKind } from './types'

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  visita_guidata: 'Visita subacquea guidata',
  sea_watching: 'Sea watching guidato',
}

export const EXIT_LABEL: Record<ExitMode, string> = {
  terra: 'Da terra',
  diporto: 'In barca (unità da diporto)',
}

export const REPORT_LABEL: Record<ReportCategory, string> = {
  abusivismo: 'Pesca o ancoraggio abusivo',
  avvistamento: 'Avvistamento specie',
  rifiuti: 'Rifiuti o inquinamento',
  altro: 'Altro',
}

export const REQUEST_LABEL: Record<RequestKind, string> = {
  appuntamento: 'Appuntamento con un esperto',
  assistenza: 'Richiesta di assistenza',
  accesso: 'Accesso per un collaboratore',
}

/** "Domenica 25 ottobre": maiuscola solo all'inizio, come si scrive in italiano. */
export function formatDateLong(iso: string) {
  const s = new Date(iso + 'T00:00:00').toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatDateShort(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}

export function formatDateNumeric(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('it-IT')
}

export function hhmm(t: string) {
  return t.slice(0, 5)
}

export function timeAgo(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'adesso'
  if (s < 3600) return `${Math.floor(s / 60)} min fa`
  if (s < 86400) return `${Math.floor(s / 3600)} h fa`
  return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}

/** Persone in acqua: staff più ospiti con il nome (immersione) o partecipanti contati (sea watching). */
export function totalDivers(b: Pick<Booking, 'instructors' | 'guides' | 'guests' | 'participants'>) {
  return b.instructors.length + b.guides.length + b.guests.length + (b.participants ?? 0)
}

/** "4 sub" per le immersioni, "9 persone" per il sea watching. */
export function peopleShort(b: Pick<Booking, 'activity_type' | 'instructors' | 'guides' | 'guests' | 'participants'>) {
  const n = totalDivers(b)
  return b.activity_type === 'sea_watching' ? `${n} ${n === 1 ? 'persona' : 'persone'}` : `${n} sub`
}

/** Nome del luogo: il sito di immersione, oppure il punto libero del sea watching ("Vicino a Isola Lachea"). */
export function placeName(b: Pick<Booking, 'site_id' | 'lat' | 'lng'>) {
  const site = getSite(b.site_id)
  if (site) return site.name
  if (b.lat == null || b.lng == null) return 'Punto non indicato'
  const near = nearestSite(b.lat, b.lng)
  return near ? `Vicino a ${near.name}` : 'Punto sulla mappa'
}

/** Zona di tutela del luogo: quella del sito o, per un punto libero, quella del decreto. */
export function placeZone(b: Pick<Booking, 'site_id' | 'lat' | 'lng'>) {
  const site = getSite(b.site_id)
  if (site) return site.zone
  return b.lat == null || b.lng == null ? null : zoneForPoint(b.lat, b.lng)
}

/** 37.55949 → 37°33'34.2"N */
export function toDMS(value: number, pos: string, neg: string) {
  const abs = Math.abs(value)
  const d = Math.floor(abs)
  const mFloat = (abs - d) * 60
  const m = Math.floor(mFloat)
  const s = ((mFloat - m) * 60).toFixed(1)
  return `${d}°${String(m).padStart(2, '0')}'${s}"${value >= 0 ? pos : neg}`
}

/** Ricostruisce la mail che prima i diving scrivevano a mano per ogni uscita. */
export function communicationText(b: Booking) {
  const site = getSite(b.site_id)
  const activity = ACTIVITY_LABEL[b.activity_type].toLowerCase()
  const lat = site?.lat ?? b.lat
  const lng = site?.lng ?? b.lng
  const coords = lat != null && lng != null ? ` – Lat: ${toDMS(lat, 'N', 'S')} – Lon: ${toDMS(lng, 'E', 'W')}` : ''
  const zone = placeZone(b)
  const list = (xs: string[]) => (xs.length ? xs.join(', ') : '—')
  const cancelled = b.status === 'annullata'
  const seaWatching = b.activity_type === 'sea_watching'
  // Sea watching = snorkeling, cioè balneazione: bastano accompagnatori e numero di partecipanti
  const people = seaWatching
    ? [`Accompagnatori: ${list([...b.instructors, ...b.guides])}`, `Partecipanti: ${b.participants + b.guests.length}`, `Boa segnasub: ${b.buoy ? 'Presente' : 'Assente'}`]
    : [
        `Numero totale di subacquei: ${totalDivers(b)}`,
        `Istruttori: ${list(b.instructors)}`,
        `Guide: ${list(b.guides)}`,
        `Ospiti: ${list(b.guests)}`,
        `Pallone di segnalazione: ${b.buoy ? 'Presente' : 'Assente'}`,
      ]
  return [
    `Oggetto: ${b.org_name} – ${cancelled ? 'Annullamento' : 'Comunicazione'} ${activity} del ${formatDateNumeric(b.date)}`,
    '',
    'Buongiorno,',
    cancelled
      ? `si comunica l'annullamento ${seaWatching ? 'del' : 'della'} ${activity} del ${formatDateNumeric(b.date)} da parte di ${b.org_name}, già ${seaWatching ? 'comunicato' : 'comunicata'} con i dati seguenti:`
      : `di seguito le informazioni relative ${seaWatching ? 'al' : 'alla'} ${activity} del ${formatDateNumeric(b.date)} da parte di ${b.org_name}:`,
    '',
    `Luogo: ${placeName(b)}${zone ? ` (zona ${zone})` : ''}${coords}`,
    `Data: ${formatDateNumeric(b.date)}`,
    `Orario di ingresso (indicativo): ${hhmm(b.time_in)}`,
    `Orario di uscita (indicativo): ${hhmm(b.time_out)}`,
    ...people,
    `Modalità di uscita: ${EXIT_LABEL[b.exit_mode]}`,
    '',
    'Grazie,',
    b.org_name,
  ].join('\n')
}

/** "Giovanni Pappalardo" → "Giovanni" */
export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? ''
}
