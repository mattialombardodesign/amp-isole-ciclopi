export type Role = 'diving' | 'amp'
export type ActivityType = 'visita_guidata' | 'sea_watching'
export type ExitMode = 'terra' | 'diporto'
export type BookingStatus = 'inviata' | 'presa_visione' | 'annullata'
export type ReportCategory = 'abusivismo' | 'avvistamento' | 'rifiuti' | 'altro'
export type ReportStatus = 'aperta' | 'gestita'
export type RequestKind = 'appuntamento' | 'assistenza' | 'accesso'
/** Ruolo della persona nel suo diving: l'admin (il titolare) gestisce team e accessi. */
export type OrgRole = 'admin' | 'membro'
export type RequestStatus = 'aperta' | 'gestita'

export interface StaffMember {
  name: string
  role: 'istruttore' | 'guida'
}

/** La persona collegata, con il diving a cui appartiene (nome e team arrivano dal diving). */
export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
  org_id: string | null
  org_role: OrgRole
  org_name: string
  staff: StaffMember[]
  onboarded: boolean
}

/** Una persona con accesso allo spazio del diving. */
export interface Member {
  id: string
  email: string
  full_name: string
  org_role: OrgRole
}

export interface Booking {
  id: string
  user_id: string | null
  org_id: string | null
  org_name: string
  /** chi l'ha inviata, tra le persone del diving */
  author_name: string
  activity_type: ActivityType
  /** sito di immersione; null per il sea watching, che usa un punto libero (lat/lng) */
  site_id: string | null
  lat: number | null
  lng: number | null
  date: string // YYYY-MM-DD
  time_in: string // HH:MM
  time_out: string
  instructors: string[]
  guides: string[]
  guests: string[]
  /** sea watching: quanti partecipanti, senza nomi (lo snorkeling è balneazione) */
  participants: number
  buoy: boolean
  exit_mode: ExitMode
  status: BookingStatus
  created_at: string
}

export type NewBooking = Omit<Booking, 'id' | 'user_id' | 'org_id' | 'org_name' | 'author_name' | 'status' | 'created_at'>

export interface Report {
  id: string
  user_id: string | null
  org_id: string | null
  org_name: string
  author_name: string
  category: ReportCategory
  description: string
  lat: number
  lng: number
  status: ReportStatus
  created_at: string
}

export type NewReport = Pick<Report, 'category' | 'description' | 'lat' | 'lng'>

export interface AmpRequest {
  id: string
  user_id: string | null
  org_id: string | null
  org_name: string
  author_name: string
  kind: RequestKind
  preferred_date: string | null
  message: string
  status: RequestStatus
  created_at: string
}

export type NewRequest = Pick<AmpRequest, 'kind' | 'preferred_date' | 'message'>

/** Livello dati: la stessa interfaccia è implementata in modalità demo (browser) e con Supabase. */
export interface Api {
  mode: 'demo' | 'supabase'
  getUser(): Promise<Profile | null>
  onAuthChange(cb: () => void): () => void
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
  updateProfile(patch: Partial<Pick<Profile, 'onboarded'>>): Promise<void>
  /** Il team (istruttori e guide) del diving: lo cambia solo l'admin. */
  updateTeam(staff: StaffMember[]): Promise<void>
  /** Le persone con accesso allo spazio del diving. */
  listMembers(): Promise<Member[]>

  /** Subacquei già prenotati per sito nella data indicata. */
  getOccupancy(date: string): Promise<Record<string, number>>
  createBooking(b: NewBooking): Promise<Booking>
  listMyBookings(): Promise<Booking[]>
  getBooking(id: string): Promise<Booking | null>
  listAllBookings(date: string): Promise<Booking[]>
  setBookingStatus(id: string, status: BookingStatus): Promise<void>
  /** Il diving modifica un'uscita già inviata: torna "inviata" e l'AMP la rivede. */
  updateBooking(id: string, b: NewBooking): Promise<Booking>
  /** Il diving annulla un'uscita: i posti tornano liberi. */
  cancelBooking(id: string): Promise<void>

  createReport(r: NewReport): Promise<Report>
  listMyReports(): Promise<Report[]>
  listAllReports(): Promise<Report[]>
  setReportStatus(id: string, status: ReportStatus): Promise<void>

  createRequest(r: NewRequest): Promise<AmpRequest>
  listMyRequests(): Promise<AmpRequest[]>
  listAllRequests(): Promise<AmpRequest[]>
  setRequestStatus(id: string, status: RequestStatus): Promise<void>

  /** Notifica ogni modifica ai dati (realtime). */
  subscribe(cb: () => void): () => void
}
