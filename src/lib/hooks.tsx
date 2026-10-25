import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from './api'
import type { Profile } from './types'

interface AuthState {
  profile: Profile | null
  loading: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState>({ profile: null, loading: true, refresh: async () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setProfile(await api.getUser())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    return api.onAuthChange(() => {
      refresh()
    })
  }, [refresh])

  return <AuthContext.Provider value={{ profile, loading, refresh }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

/** Carica dati e li ricarica a ogni modifica (realtime). */
export function useLive<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const run = () =>
      load()
        .then((d) => {
          if (alive) {
            setData(d)
            setError(null)
          }
        })
        .catch((e: Error) => alive && setError(e.message))
    run()
    const unsubscribe = api.subscribe(run)
    return () => {
      alive = false
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error }
}
