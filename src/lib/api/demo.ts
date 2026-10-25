// Modalità demo: i dati vivono nel localStorage del browser.
// Le modifiche vengono propagate tra le schede aperte con BroadcastChannel,
// così la dashboard AMP si aggiorna "in tempo reale" anche senza Supabase.

import { getSite } from '../sites'
import { totalDivers } from '../format'
import { addDays, todayISO } from '../utils'
import type { AmpRequest, Api, Booking, Profile, Report } from '../types'

const KEY = 'amp-ciclopi-demo-v1'
// La sessione è per scheda: così si può essere "diving" in una scheda e "AMP" nell'altra
const SESSION_KEY = 'amp-ciclopi-session'

interface DB {
  profiles: Record<string, Profile>
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
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

function seed(): DB {
  const today = todayISO()
  const tomorrow = addDays(today, 1)
  const b = (p: Omit<Booking, 'id' | 'user_id' | 'created_at'> & { created_at?: string }): Booking => ({
    id: crypto.randomUUID(),
    user_id: null,
    created_at: p.created_at ?? now(),
    ...p,
  })
  return {
    profiles: {},
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
        site_id: 'castello-acicastello',
        date: today,
        time_in: '15:00',
        time_out: '16:30',
        instructors: [],
        guides: ['Ciccio Russo'],
        guests: ['Marco Aiello', 'Elisa Fichera', 'Bianca Rapisarda'],
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
        id: crypto.randomUUID(),
        user_id: null,
        org_name: 'Lachea Diving Center',
        category: 'abusivismo',
        description: 'Imbarcazione ancorata su posidonia a nord di Lachea, nessun gavitello.',
        lat: 37.5668,
        lng: 15.1712,
        status: 'aperta',
        created_at: minutesAgo(70),
      },
      {
        id: crypto.randomUUID(),
        user_id: null,
        org_name: 'Ciclopi Sub',
        category: 'avvistamento',
        description: 'Tartaruga Caretta caretta in superficie vicino ai Panettoni.',
        lat: 37.5588,
        lng: 15.1675,
        status: 'gestita',
        created_at: minutesAgo(300),
      },
    ],
    requests: [],
  }
}

function load(): DB {
  try {
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

const DEFAULT_STAFF: Profile['staff'] = [
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
    return session ? (load().profiles[session] ?? null) : null
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
      const isAmp = key.includes('amp')
      db.profiles[key] = {
        id: 'demo-' + key,
        email: key,
        role: isAmp ? 'amp' : 'diving',
        org_name: isAmp ? 'AMP Isole Ciclopi' : '',
        org_kind: null,
        onboarded: isAmp,
        staff: isAmp ? [] : DEFAULT_STAFF,
      }
      save(db, false)
    }
    setSession(key)
  },

  async signUp(email, password) {
    return demoApi.signIn(email, password)
  },

  async signOut() {
    setSession(null)
  },

  async updateProfile(patch) {
    const db = load()
    const p = me(db)
    db.profiles[p.email] = { ...p, ...patch }
    // A fine onboarding la demo aggiunge un'uscita già comunicata per il pomeriggio
    if (patch.onboarded && !p.onboarded && p.role === 'diving' && !db.bookings.some((b) => b.user_id === p.id)) {
      db.bookings.push({
        id: crypto.randomUUID(),
        user_id: p.id,
        org_name: patch.org_name || p.org_name,
        activity_type: 'visita_guidata',
        site_id: 'panettoni',
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
        id: crypto.randomUUID(),
        user_id: p.id,
        org_name: patch.org_name || p.org_name,
        activity_type: 'sea_watching',
        site_id: 'castello-acicastello',
        date: addDays(todayISO(), 1),
        time_in: '10:00',
        time_out: '11:30',
        instructors: [],
        guides: [DEFAULT_STAFF[3].name],
        guests: ['Elisa Fichera', 'Marco Aiello', 'Bianca Rapisarda'],
        buoy: true,
        exit_mode: 'terra',
        status: 'presa_visione',
        created_at: minutesAgo(90),
      })
    }
    save(db, !!patch.onboarded)
    authListeners.forEach((l) => l())
  },

  async getOccupancy(date) {
    const out: Record<string, number> = {}
    for (const b of load().bookings) {
      if (b.date === date) out[b.site_id] = (out[b.site_id] ?? 0) + totalDivers(b)
    }
    return out
  },

  async createBooking(input) {
    await wait(500)
    const db = load()
    const p = me(db)
    // Stesso controllo che in Supabase fa il trigger `check_capacity`
    const site = getSite(input.site_id)
    const used = db.bookings
      .filter((b) => b.site_id === input.site_id && b.date === input.date)
      .reduce((n, b) => n + totalDivers(b), 0)
    const requested = totalDivers(input)
    if (site && used + requested > site.capacity) {
      throw new Error(`Posti esauriti: restano ${Math.max(site.capacity - used, 0)} posti su ${site.capacity}.`)
    }
    const booking: Booking = {
      ...input,
      id: crypto.randomUUID(),
      user_id: p.id,
      org_name: p.org_name,
      status: 'inviata',
      created_at: now(),
    }
    db.bookings.push(booking)
    save(db)
    return booking
  },

  async listMyBookings() {
    const db = load()
    const p = me(db)
    return db.bookings.filter((b) => b.user_id === p.id).sort((a, b) => b.date.localeCompare(a.date) || byNewest(a, b))
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

  async createReport(input) {
    await wait(400)
    const db = load()
    const p = me(db)
    const report: Report = {
      ...input,
      id: crypto.randomUUID(),
      user_id: p.id,
      org_name: p.org_name,
      status: 'aperta',
      created_at: now(),
    }
    db.reports.push(report)
    save(db)
    return report
  },

  async listMyReports() {
    const db = load()
    const p = me(db)
    return db.reports.filter((r) => r.user_id === p.id).sort(byNewest)
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
    const req: AmpRequest = { ...input, id: crypto.randomUUID(), user_id: p.id, org_name: p.org_name, created_at: now() }
    db.requests.push(req)
    save(db)
    return req
  },

  async listMyRequests() {
    const db = load()
    const p = me(db)
    return db.requests.filter((r) => r.user_id === p.id).sort(byNewest)
  },

  async listAllRequests() {
    return load().requests.sort(byNewest)
  },

  subscribe(cb) {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
}
