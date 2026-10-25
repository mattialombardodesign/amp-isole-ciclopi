import { demoApi } from './demo'
import { createSupabaseApi } from './supabase'
import type { Api } from '../types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Se le chiavi Supabase sono configurate si usa il database vero, altrimenti la demo nel browser. */
export const api: Api = url && key ? createSupabaseApi(url, key) : demoApi
