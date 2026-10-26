// Modalità Supabase: database Postgres, login e realtime.
// Le regole di sicurezza (RLS) e il controllo dei posti sono in supabase/schema.sql.

import { createClient } from '@supabase/supabase-js'
import type { AmpRequest, Api, Booking, Member, Profile, Report, StaffMember } from '../types'

// Messaggi di Supabase Auth tradotti per l'interfaccia
const AUTH_ERRORS: Record<string, string> = {
  'Invalid login credentials': 'Email o password non corretti.',
  'Email not confirmed': "Conferma prima l'email, poi accedi.",
}
const authError = (message: string) => new Error(AUTH_ERRORS[message] ?? message)

const UUID = /^[0-9a-f-]{36}$/i
let channels = 0

export function createSupabaseApi(url: string, key: string): Api {
  const supabase = createClient(url, key)

  async function uid() {
    const { data } = await supabase.auth.getSession()
    const id = data.session?.user.id
    if (!id) throw new Error('Sessione scaduta, accedi di nuovo.')
    return id
  }


  function check<T>(res: { data: T | null; error: { message: string } | null }): T {
    if (res.error) throw new Error(res.error.message)
    return res.data as T
  }

  return {
    mode: 'supabase',

    async getUser() {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      if (!user) return null
      // la persona con il suo diving: nome e team arrivano da `organizations`
      const res = await supabase.from('profiles').select('*, organizations(name, staff)').eq('id', user.id).maybeSingle()
      if (!res.data) return null
      const { organizations: org, ...p } = res.data as Omit<Profile, 'org_name' | 'staff'> & { organizations: { name: string; staff: StaffMember[] } | null }
      return { ...p, org_name: org?.name ?? (p.role === 'amp' ? 'AMP Isole Ciclopi' : ''), staff: org?.staff ?? [] }
    },

    onAuthChange(cb) {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        // INITIAL_SESSION viene già gestito dalla prima getUser()
        if (event !== 'INITIAL_SESSION' && event !== 'TOKEN_REFRESHED') cb()
      })
      return () => data.subscription.unsubscribe()
    },

    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw authError(error.message)
    },

    async signOut() {
      await supabase.auth.signOut()
    },

    async updateProfile(patch) {
      check(await supabase.from('profiles').update(patch).eq('id', await uid()))
    },

    async updateTeam(staff) {
      // la regola "solo l'admin" la applica il database (policy "diving: team (admin)")
      const me = check(await supabase.from('profiles').select('org_id').eq('id', await uid()).single()) as { org_id: string | null }
      if (!me.org_id) throw new Error('Il tuo account non è collegato a un diving.')
      const res = check(await supabase.from('organizations').update({ staff }).eq('id', me.org_id).select('id'))
      if (!res.length) throw new Error('Il team lo cambia solo l’admin del diving.')
    },

    async listMembers() {
      // la sicurezza per riga mostra solo le persone dello stesso diving
      const me = check(await supabase.from('profiles').select('org_id').eq('id', await uid()).single()) as { org_id: string | null }
      if (!me.org_id) return []
      const res = await supabase.from('profiles').select('id, email, full_name, org_role').eq('org_id', me.org_id).order('org_role').order('full_name')
      return check(res) as Member[]
    },

    async getOccupancy(date) {
      const rows = check(await supabase.rpc('site_occupancy', { p_date: date })) as { site_id: string; used: number }[]
      return Object.fromEntries(rows.map((r) => [r.site_id, r.used]))
    },

    async createBooking(b) {
      // autore, diving, stato e data li imposta il server (trigger `stamp_row`)
      return check(await supabase.from('bookings').insert(b).select().single()) as Booking
    },

    async listMyBookings() {
      await uid()
      const res = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      return check(res) as Booking[]
    },

    async getBooking(id) {
      if (!UUID.test(id)) return null
      return check(await supabase.from('bookings').select('*').eq('id', id).maybeSingle()) as Booking | null
    },

    async listAllBookings(date) {
      const res = await supabase.from('bookings').select('*').eq('date', date).order('time_in')
      return check(res) as Booking[]
    },

    async setBookingStatus(id, status) {
      check(await supabase.from('bookings').update({ status }).eq('id', id))
    },

    async updateBooking(id, b) {
      // lo stato torna "inviata" lato server (trigger `booking_changed`)
      return check(await supabase.from('bookings').update(b).eq('id', id).select().single()) as Booking
    },

    async cancelBooking(id) {
      check(await supabase.from('bookings').update({ status: 'annullata' }).eq('id', id))
    },

    async createReport(r) {
      // autore, diving, stato e data li imposta il server (trigger `stamp_row`)
      return check(await supabase.from('reports').insert(r).select().single()) as Report
    },

    async listMyReports() {
      await uid()
      const res = await supabase.from('reports').select('*').order('created_at', { ascending: false })
      return check(res) as Report[]
    },

    async listAllReports() {
      return check(await supabase.from('reports').select('*').order('created_at', { ascending: false })) as Report[]
    },

    async setReportStatus(id, status) {
      check(await supabase.from('reports').update({ status }).eq('id', id))
    },

    async createRequest(r) {
      // autore, diving, stato e data li imposta il server (trigger `stamp_row`)
      return check(await supabase.from('requests').insert(r).select().single()) as AmpRequest
    },

    async listMyRequests() {
      await uid()
      const res = await supabase.from('requests').select('*').order('created_at', { ascending: false })
      return check(res) as AmpRequest[]
    },

    async listAllRequests() {
      return check(await supabase.from('requests').select('*').order('created_at', { ascending: false })) as AmpRequest[]
    },

    async setRequestStatus(id, status) {
      check(await supabase.from('requests').update({ status }).eq('id', id))
    },

    subscribe(cb) {
      const channel = supabase
        .channel(`amp-live-${++channels}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, cb)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, cb)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, cb)
        .subscribe()
      return () => {
        supabase.removeChannel(channel)
      }
    },
  }
}
