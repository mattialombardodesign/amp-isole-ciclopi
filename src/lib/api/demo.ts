// Modalità demo: i dati vivono nel localStorage del browser.
// Le modifiche vengono propagate tra le schede aperte con BroadcastChannel,
// così la dashboard AMP si aggiorna "in tempo reale" anche senza Supabase.

import { getSite } from '../sites'
import { totalDivers } from '../format'
import { addDays, todayISO } from '../utils'
import type { AmpRequest, Api, Booking, Member, NewBooking, Profile, Report, StaffMember } from '../types'

// Cambiando versione la demo riparte da zero (accesso e onboarding compresi)
const KEY = 'amp-ciclopi-demo-v7'
const OLD_KEYS = ['amp-ciclopi-demo-v1', 'amp-ciclopi-demo-v2', 'amp-ciclopi-demo-v3', 'amp-ciclopi-demo-v4', 'amp-ciclopi-demo-v5', 'amp-ciclopi-demo-v6']
// La sessione è per scheda: così si può essere "diving" in una scheda e "AMP" nell'altra
const SESSION_KEY = 'amp-ciclopi-session'

/** La persona salvata: nome e team del diving si leggono dal diving. */
type StoredProfile = Omit<Profile, 'org_name' | 'staff'>
interface Org {
  id: string
  name: string
  staff: StaffMember[]
}

interface DB {
  orgs: Record<string, Org>
  /** per email */
  profiles: Record<string, StoredProfile>
  bookings: Booking[]
  reports: Report[]
  requests: AmpRequest[]
}

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('amp-ciclopi-demo') : null
const listeners = new Set<() => void>()
const authListeners = new Set<() => void>()

channel?.addEventListener('message', () => listeners.forEach((l) => l()))

const wait = (ms = 200) => new Promise((r) => setTimeout(r, ms))
const now = () => new Date().toISOString()
// crypto.randomUUID esiste solo su HTTPS e localhost: in rete locale (telefono) serve un'alternativa
const newId = () => (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`)
/** Chi occupa posti in un sito di immersione: niente annullate, niente sea watching (è balneazione). */
const counts = (b: Booking) => b.status !== 'annullata' && b.site_id !== null
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

function seed(): DB {
  const today = todayISO()
  const tomorrow = addDays(today, 1)
  const b = (
    p: Omit<Booking, 'id' | 'user_id' | 'org_id' | 'author_name' | 'created_at' | 'lat' | 'lng' | 'participants'> &
      Partial<Pick<Booking, 'created_at' | 'lat' | 'lng' | 'participants'>>,
  ): Booking => ({
    id: newId(),
    user_id: null,
    org_id: null,
    author_name: '',
    lat: null,
    lng: null,
    participants: 0,
    ...p,
    created_at: p.created_at ?? now(),
  })
  return {
    // il diving della demo, già registrato negli uffici dell'AMP, con il titolare (admin) e un collaboratore
    orgs: { [DEMO_ORG]: { id: DEMO_ORG, name: 'Acitrezza Diving Center', staff: DEFAULT_STAFF } },
    profiles: {
      'diving@demo.it': { id: 'demo-titolare', email: 'diving@demo.it', full_name: 'Giovanni Pappalardo', role: 'diving', org_id: DEMO_ORG, org_role: 'admin', onboarded: false },
      'marco@demo.it': { id: 'demo-marco', email: 'marco@demo.it', full_name: 'Marco Russo', role: 'diving', org_id: DEMO_ORG, org_role: 'membro', onboarded: false },
    },
    bookings: [
      b({
        org_name: 'Ciclopi Sub',
        activity_type: 'visita_guidata',
        site_id: 'panettoni',
        date: today,
        time_in: '09:00',
        time_out: '10:30',
        instructors: ['Salvo Grasso'],
        guides: ['Rita Platania'],
        guests: ['Luca Bianchi', 'Anna Testa', 'Paolo Mirabella', 'Giulia Ferro'],
        buoy: true,
        exit_mode: 'diporto',
        status: 'presa_visione',
        created_at: minutesAgo(180),
      }),
      b({
        org_name: 'Lachea Diving Center',
        activity_type: 'visita_guidata',
        site_id: 'isola-lachea',
        date: today,
        time_in: '10:00',
        time_out: '11:15',
        instructors: ['Nino Cardillo', 'Marta Leotta'],
        guides: [],
        guests: ['Tom Becker', 'Lea Schmidt', 'Hugo Martin', 'Chloé Martin', 'Ivo Pace', 'Sara Neri', 'Dario Vitale'],
        buoy: true,
        exit_mode: 'diporto',
        status: 'inviata',
        created_at: minutesAgo(95),
      }),
      b({
        org_name: 'Blu Trezza Diving',
        activity_type: 'sea_watching',
        site_id: null,
        lat: 37.5547,
        lng: 15.1524,
        participants: 8,
        date: today,
        time_in: '15:00',
        time_out: '16:30',
        instructors: [],
        guides: ['Ciccio Russo'],
        guests: [],
        buoy: true,
        exit_mode: 'terra',
        status: 'inviata',
        created_at: minutesAgo(40),
      }),
      b({
        org_name: 'Ciclopi Sub',
        activity_type: 'visita_guidata',
        site_id: 'faraglione-grande',
        date: tomorrow,
        time_in: '09:30',
        time_out: '11:00',
        instructors: ['Salvo Grasso'],
        guides: [],
        guests: ['Federico Sapienza', 'Laura Zappalà', 'Ugo Barbagallo'],
        buoy: true,
        exit_mode: 'diporto',
        status: 'inviata',
      }),
    ],
    reports: [
      {
        id: newId(),
        user_id: null,
        org_id: null,
        author_name: '',
        org_name: 'Lachea Diving Center',
        category: 'abusivismo',
        description: 'Imbarcazione ancorata su posidonia a nord di Lachea, nessun gavitello.',
        lat: 37.5668,
        lng: 15.1712,
        status: 'aperta',
        created_at: minutesAgo(70),
      },
      {
        id: newId(),
        user_id: null,
        org_id: null,
        author_name: '',
        org_name: 'Ciclopi Sub',
        category: 'avvistamento',
        description: 'Tartaruga Caretta caretta in superficie vicino ai Panettoni.',
        lat: 37.5588,
        lng: 15.1675,
        status: 'gestita',
        created_at: minutesAgo(300),
      },
    ],
    requests: [
      {
        id: newId(),
        user_id: null,
        org_id: null,
        author_name: '',
        org_name: 'Ciclopi Sub',
        kind: 'appuntamento',
        preferred_date: addDays(today, 3),
        message: 'Vorremmo un incontro sulla posidonia per i nostri nuovi istruttori.',
        status: 'aperta',
        created_at: minutesAgo(130),
      },
    ],
  }
}

function load(): DB {
  try {
    OLD_KEYS.forEach((k) => localStorage.removeItem(k))
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch {
    // localStorage non disponibile: si riparte dal seed
  }
  const db = seed()
  save(db, false)
  return db
}

function save(db: DB, notify = true) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    // ignorato: in navigazione privata i dati restano solo in memoria
  }
  if (notify) {
    channel?.postMessage('change')
    listeners.forEach((l) => l())
  }
}

function getSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function setSession(email: string | null) {
  try {
    if (email) sessionStorage.setItem(SESSION_KEY, email)
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // ignorato
  }
  authListeners.forEach((l) => l())
}

function me(db: DB) {
  const session = getSession()
  const p = session ? db.profiles[session] : null
  if (!p) throw new Error('Sessione scaduta, accedi di nuovo.')
  return p
}

/** La persona con nome e team del suo diving. */
function compose(db: DB, p: StoredProfile): Profile {
  const org = p.org_id ? db.orgs[p.org_id] : undefined
  return { ...p, org_name: org?.name ?? (p.role === 'amp' ? 'AMP Isole Ciclopi' : ''), staff: org?.staff ?? [] }
}

/** Diving, nome del diving e autore da timbrare su ogni nuova riga (come `stamp_row` in Supabase). */
function stamp(db: DB, p: StoredProfile) {
  if (!p.org_id) throw new Error('Il tuo account non è collegato a un diving: contatta l’AMP.')
  return { user_id: p.id, org_id: p.org_id, org_name: db.orgs[p.org_id]?.name ?? '', author_name: p.full_name, created_at: now() }
}

/** "marco.russo@…" → "Marco Russo" */
function nameFromEmail(email: string) {
  return email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

/** Cancella tutti i dati della demo e la sessione: si riparte da accesso e onboarding. */
export function resetDemo() {
  try {
    localStorage.removeItem(KEY)
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith('amp-'))
      .forEach((k) => sessionStorage.removeItem(k))
  } catch {
    // ignorato
  }
  channel?.postMessage('change')
  setSession(null)
}

/** Stesso controllo che in Supabase fa il trigger `check_capacity` (esclusa l'uscita che si modifica). */
function checkCapacity(db: DB, input: NewBooking, exceptId?: string) {
  // il sea watching non ha un sito né una capienza
  if (!input.site_id) return
  const site = getSite(input.site_id)
  const used = db.bookings
    .filter((b) => b.id !== exceptId && counts(b) && b.site_id === input.site_id && b.date === input.date)
    .reduce((n, b) => n + totalDivers(b), 0)
  if (site && used + totalDivers(input) > site.capacity) {
    throw new Error(`Posti esauriti: restano ${Math.max(site.capacity - used, 0)} posti su ${site.capacity}.`)
  }
}

const DEMO_ORG = 'org-acitrezza'

const DEFAULT_STAFF: StaffMember[] = [
  { name: 'Marco Russo', role: 'istruttore' },
  { name: 'Elena Costa', role: 'istruttore' },
  { name: 'Davide Musumeci', role: 'istruttore' },
  { name: 'Chiara Leonardi', role: 'guida' },
  { name: 'Andrea Patanè', role: 'guida' },
]

const byNewest = <T extends { created_at: string }>(a: T, b: T) => b.created_at.localeCompare(a.created_at)

export const demoApi: Api = {
  mode: 'demo',

  async getUser() {
    const session = getSession()
    if (!session) return null
    const db = load()
    const p = db.profiles[session]
    return p ? compose(db, p) : null
  },

  onAuthChange(cb) {
    authListeners.add(cb)
    return () => authListeners.delete(cb)
  },

  async signIn(email) {
    await wait()
    const db = load()
    const key = email.trim().toLowerCase()
    if (!db.profiles[key]) {
      // in demo: un'email con "amp" è personale AMP, le altre sono persone del diving della demo
      const isAmp = key.includes('amp')
      db.profiles[key] = {
        id: 'demo-' + key,
        email: key,
        full_name: isAmp ? 'Staff AMP' : nameFromEmail(key),
        role: isAmp ? 'amp' : 'diving',
        org_id: isAmp ? null : DEMO_ORG,
        org_role: 'membro',
        onboarded: isAmp,
      }
      save(db, false)
    }
    setSession(key)
  },

  async signOut() {
    setSession(null)
  },

  async updateProfile(patch) {
    const db = load()
    const p = me(db)
    db.profiles[p.email] = { ...p, ...patch }
    // A fine onboarding la demo aggiunge al diving un'uscita già comunicata per il pomeriggio (una volta sola)
    if (patch.onboarded && !p.onboarded && p.org_id && !db.bookings.some((b) => b.org_id === p.org_id)) {
      db.bookings.push({
        id: newId(),
        ...stamp(db, p),
        activity_type: 'visita_guidata',
        site_id: 'panettoni',
        lat: null,
        lng: null,
        participants: 0,
        date: todayISO(),
        time_in: '15:00',
        time_out: '16:30',
        instructors: [DEFAULT_STAFF[1].name],
        guides: [DEFAULT_STAFF[4].name],
        guests: ['Sofia Russo', 'Matteo Greco'],
        buoy: true,
        exit_mode: 'diporto',
        status: 'inviata',
        created_at: minutesAgo(20),
      })
      db.bookings.push({
        id: newId(),
        ...stamp(db, p),
        activity_type: 'sea_watching',
        site_id: null,
        lat: 37.5549,
        lng: 15.1521,
        participants: 6,
        date: addDays(todayISO(), 1),
        time_in: '10:00',
        time_out: '11:30',
        instructors: [],
        guides: [DEFAULT_STAFF[3].name],
        guests: [],
        buoy: true,
        exit_mode: 'terra',
        status: 'presa_visione',
        created_at: minutesAgo(90),
      })
    }
    save(db, !!patch.onboarded)
    authListeners.forEach((l) => l())
  },

  async updateTeam(staff) {
    const db = load()
    const p = me(db)
    if (!p.org_id || p.org_role !== 'admin') throw new Error('Il team lo cambia solo l’admin del diving.')
    db.orgs[p.org_id] = { ...db.orgs[p.org_id], staff }
    save(db)
    authListeners.forEach((l) => l())
  },

  async listMembers() {
    const db = load()
    const p = me(db)
    const members: Member[] = Object.values(db.profiles)
      .filter((x) => p.org_id && x.org_id === p.org_id)
      .map(({ id, email, full_name, org_role }) => ({ id, email, full_name, org_role }))
    return members.sort((a, b) => (a.org_role === b.org_role ? a.full_name.localeCompare(b.full_name) : a.org_role === 'admin' ? -1 : 1))
  },

  async getOccupancy(date) {
    const out: Record<string, number> = {}
    for (const b of load().bookings) {
      if (b.date === date && counts(b) && b.site_id) out[b.site_id] = (out[b.site_id] ?? 0) + totalDivers(b)
    }
    return out
  },

  async createBooking(input) {
    await wait(500)
    const db = load()
    const p = me(db)
    checkCapacity(db, input)
    const booking: Booking = { ...input, id: newId(), ...stamp(db, p), status: 'inviata' }
    db.bookings.push(booking)
    save(db)
    return booking
  },

  async listMyBookings() {
    const db = load()
    const p = me(db)
    return db.bookings.filter((b) => p.org_id && b.org_id === p.org_id).sort((a, b) => b.date.localeCompare(a.date) || byNewest(a, b))
  },

  async getBooking(id) {
    return load().bookings.find((b) => b.id === id) ?? null
  },

  async listAllBookings(date) {
    return load()
      .bookings.filter((b) => b.date === date)
      .sort((a, b) => a.time_in.localeCompare(b.time_in))
  },

  async setBookingStatus(id, status) {
    const db = load()
    const b = db.bookings.find((x) => x.id === id)
    if (b) b.status = status
    save(db)
  },

  async updateBooking(id, input) {
    await wait(500)
    const db = load()
    const p = me(db)
    const b = db.bookings.find((x) => x.id === id && p.org_id && x.org_id === p.org_id)
    if (!b) throw new Error('Uscita non trovata.')
    checkCapacity(db, input, id)
    Object.assign(b, input, { status: 'inviata' })
    save(db)
    return b
  },

  async cancelBooking(id) {
    await wait(300)
    const db = load()
    const p = me(db)
    const b = db.bookings.find((x) => x.id === id && p.org_id && x.org_id === p.org_id)
    if (b) b.status = 'annullata'
    save(db)
  },

  async createReport(input) {
    await wait(400)
    const db = load()
    const p = me(db)
    const report: Report = { ...input, id: newId(), ...stamp(db, p), status: 'aperta' }
    db.reports.push(report)
    save(db)
    return report
  },

  async listMyReports() {
    const db = load()
    const p = me(db)
    return db.reports.filter((r) => p.org_id && r.org_id === p.org_id).sort(byNewest)
  },

  async listAllReports() {
    return load().reports.sort(byNewest)
  },

  async setReportStatus(id, status) {
    const db = load()
    const r = db.reports.find((x) => x.id === id)
    if (r) r.status = status
    save(db)
  },

  async createRequest(input) {
    await wait(400)
    const db = load()
    const p = me(db)
    const req: AmpRequest = { ...input, id: newId(), ...stamp(db, p), status: 'aperta' }
    db.requests.push(req)
    save(db)
    return req
  },

  async listMyRequests() {
    const db = load()
    const p = me(db)
    return db.requests.filter((r) => p.org_id && r.org_id === p.org_id).sort(byNewest)
  },

  async listAllRequests() {
    return load().requests.sort(byNewest)
  },

  async setRequestStatus(id, status) {
    const db = load()
    const r = db.requests.find((x) => x.id === id)
    if (r) r.status = status
    save(db)
  },

  subscribe(cb) {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
}
