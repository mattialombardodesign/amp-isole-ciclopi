// Modalità Supabase: database Postgres, login e realtime.
// Le regole di sicurezza (RLS) e il controllo dei posti sono in supabase/schema.sql.

import { createClient } from '@supabase/supabase-js'
import type { AmpRequest, Api, Booking, Profile, Report } from '../types'

export function createSupabaseApi(url: string, key: string): Api {
  const supabase = createClient(url, key)

  async function uid() {
    const { data } = await supabase.auth.getSession()
    const id = data.session?.user.id
    if (!id) throw new Error('Sessione scaduta, accedi di nuovo.')
    return id
  }

  async function orgName() {
    const { data } = await supabase.from('profiles').select('org_name').eq('id', await uid()).single()
    return (data?.org_name as string | undefined) ?? ''
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
      const res = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      return (res.data as Profile | null) ?? null
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
      if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Email o password non corretti.' : error.message)
    },

    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw new Error(error.message)
      if (!data.session) throw new Error('Controlla la tua email per confermare la registrazione, poi accedi.')
    },

    async signOut() {
      await supabase.auth.signOut()
    },

    async updateProfile(patch) {
      check(await supabase.from('profiles').update(patch).eq('id', await uid()))
    },

    async getOccupancy(date) {
      const rows = check(await supabase.rpc('site_occupancy', { p_date: date })) as { site_id: string; used: number }[]
      return Object.fromEntries(rows.map((r) => [r.site_id, r.used]))
    },

    async createBooking(b) {
      const row = { ...b, user_id: await uid(), org_name: await orgName() }
      return check(await supabase.from('bookings').insert(row).select().single()) as Booking
    },

    async listMyBookings() {
      const res = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', await uid())
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      return check(res) as Booking[]
    },

    async getBooking(id) {
      return check(await supabase.from('bookings').select('*').eq('id', id).maybeSingle()) as Booking | null
    },

    async listAllBookings(date) {
      const res = await supabase.from('bookings').select('*').eq('date', date).order('time_in')
      return check(res) as Booking[]
    },

    async setBookingStatus(id, status) {
      check(await supabase.from('bookings').update({ status }).eq('id', id))
    },

    async createReport(r) {
      const row = { ...r, user_id: await uid(), org_name: await orgName() }
      return check(await supabase.from('reports').insert(row).select().single()) as Report
    },

    async listMyReports() {
      const res = await supabase.from('reports').select('*').eq('user_id', await uid()).order('created_at', { ascending: false })
      return check(res) as Report[]
    },

    async listAllReports() {
      return check(await supabase.from('reports').select('*').order('created_at', { ascending: false })) as Report[]
    },

    async setReportStatus(id, status) {
      check(await supabase.from('reports').update({ status }).eq('id', id))
    },

    async createRequest(r) {
      const row = { ...r, user_id: await uid(), org_name: await orgName() }
      return check(await supabase.from('requests').insert(row).select().single()) as AmpRequest
    },

    async listMyRequests() {
      const res = await supabase.from('requests').select('*').eq('user_id', await uid()).order('created_at', { ascending: false })
      return check(res) as AmpRequest[]
    },

    async listAllRequests() {
      return check(await supabase.from('requests').select('*').order('created_at', { ascending: false })) as AmpRequest[]
    },

    subscribe(cb) {
      const channel = supabase
        .channel('amp-live-' + crypto.randomUUID())
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
