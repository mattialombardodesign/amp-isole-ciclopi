import { getSite } from './sites'
import type { ActivityType, Booking, ExitMode, ReportCategory, RequestKind } from './types'

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  visita_guidata: 'Visita subacquea guidata',
  sea_watching: 'Sea watching guidato',
}

export const EXIT_LABEL: Record<ExitMode, string> = {
  terra: 'Da terra',
  diporto: 'Per mezzo di unità da diporto',
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
  rinnovo: 'Rinnovo autorizzazione annuale',
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

export function totalDivers(b: Pick<Booking, 'instructors' | 'guides' | 'guests'>) {
  return b.instructors.length + b.guides.length + b.guests.length
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
  const coords = site ? ` – Lat: ${toDMS(site.lat, 'N', 'S')} – Lon: ${toDMS(site.lng, 'E', 'W')}` : ''
  const list = (xs: string[]) => (xs.length ? xs.join(', ') : '—')
  return [
    `Oggetto: ${b.org_name} – Comunicazione ${activity} del ${formatDateNumeric(b.date)}`,
    '',
    'Buongiorno,',
    `di seguito le informazioni relative alla ${activity} del ${formatDateNumeric(b.date)} da parte di ${b.org_name}:`,
    '',
    `Luogo: ${site?.name ?? b.site_id}${coords}`,
    `Data: ${formatDateNumeric(b.date)}`,
    `Orario di ingresso: ${hhmm(b.time_in)}`,
    `Orario di uscita: ${hhmm(b.time_out)}`,
    `Numero totale di subacquei: ${totalDivers(b)}`,
    `Istruttori: ${list(b.instructors)}`,
    `Guide: ${list(b.guides)}`,
    `Ospiti: ${list(b.guests)}`,
    `Pallone di segnalazione: ${b.buoy ? 'Presente' : 'Assente'}`,
    `Modalità di uscita: ${EXIT_LABEL[b.exit_mode]}`,
    '',
    'Grazie,',
    b.org_name,
  ].join('\n')
}
