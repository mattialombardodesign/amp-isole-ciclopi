export type Role = 'diving' | 'amp'
export type OrgKind = 'subacquea' | 'pesca' | 'visite_barca'
export type ActivityType = 'visita_guidata' | 'sea_watching'
export type ExitMode = 'terra' | 'diporto'
export type BookingStatus = 'inviata' | 'presa_visione'
export type ReportCategory = 'abusivismo' | 'avvistamento' | 'rifiuti' | 'altro'
export type ReportStatus = 'aperta' | 'gestita'
export type RequestKind = 'appuntamento' | 'assistenza' | 'rinnovo'

export interface StaffMember {
  name: string
  role: 'istruttore' | 'guida'
}

export interface Profile {
  id: string
  email: string
  role: Role
  org_name: string
  org_kind: OrgKind | null
  onboarded: boolean
  staff: StaffMember[]
}

export interface Booking {
  id: string
  user_id: string | null
  org_name: string
  activity_type: ActivityType
  site_id: string
  date: string // YYYY-MM-DD
  time_in: string // HH:MM
  time_out: string
  instructors: string[]
  guides: string[]
  guests: string[]
  buoy: boolean
  exit_mode: ExitMode
  status: BookingStatus
  created_at: string
}

export type NewBooking = Omit<Booking, 'id' | 'user_id' | 'org_name' | 'status' | 'created_at'>

export interface Report {
  id: string
  user_id: string | null
  org_name: string
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
  org_name: string
  kind: RequestKind
  preferred_date: string | null
  message: string
  created_at: string
}

export type NewRequest = Pick<AmpRequest, 'kind' | 'preferred_date' | 'message'>

/** Livello dati: la stessa interfaccia è implementata in modalità demo (browser) e con Supabase. */
export interface Api {
  mode: 'demo' | 'supabase'
  getUser(): Promise<Profile | null>
  onAuthChange(cb: () => void): () => void
  signIn(email: string, password: string): Promise<void>
  signUp(email: string, password: string): Promise<void>
  signOut(): Promise<void>
  updateProfile(patch: Partial<Pick<Profile, 'org_name' | 'org_kind' | 'onboarded' | 'staff'>>): Promise<void>

  /** Subacquei già prenotati per sito nella data indicata. */
  getOccupancy(date: string): Promise<Record<string, number>>
  createBooking(b: NewBooking): Promise<Booking>
  listMyBookings(): Promise<Booking[]>
  getBooking(id: string): Promise<Booking | null>
  listAllBookings(date: string): Promise<Booking[]>
  setBookingStatus(id: string, status: BookingStatus): Promise<void>

  createReport(r: NewReport): Promise<Report>
  listMyReports(): Promise<Report[]>
  listAllReports(): Promise<Report[]>
  setReportStatus(id: string, status: ReportStatus): Promise<void>

  createRequest(r: NewRequest): Promise<AmpRequest>
  listMyRequests(): Promise<AmpRequest[]>
  listAllRequests(): Promise<AmpRequest[]>

  /** Notifica ogni modifica ai dati (realtime). */
  subscribe(cb: () => void): () => void
}
