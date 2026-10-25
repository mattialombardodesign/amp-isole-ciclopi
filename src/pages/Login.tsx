import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Building2, Sailboat } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/hooks'
import { SiteThumb } from '@/components/Tour'
import { Button, Input, Label, List, NavRow } from '@/components/ui'

export default function Login() {
  const { profile, refresh } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (profile) return <Navigate to={profile.role === 'amp' ? '/dashboard' : '/attivita'} replace />

  async function enter(fn: () => Promise<void>) {
    setError(null)
    setLoading(true)
    try {
      await fn()
      await refresh()
      const p = await api.getUser()
      navigate(p?.role === 'amp' ? '/dashboard' : '/attivita', { replace: true })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    enter(() => (mode === 'login' ? api.signIn(email, password) : api.signUp(email, password)))
  }

  return (
    <div className="flex min-h-dvh flex-col pb-section">
      {/* copertina: la mappa dell'Area Marina Protetta */}
      <SiteThumb site={{ lat: 37.5605, lng: 15.1645, name: 'AMP Isole Ciclopi' }} zoom={14} pin="none" className="h-56 shrink-0">
        <div className="absolute top-[max(1.25rem,env(safe-area-inset-top))] left-gutter flex items-center gap-2.5 rounded-full bg-card py-1.5 pr-3.5 pl-1.5 shadow-[0_6px_16px_-6px_rgba(10,37,64,.5)]">
          <img src="/favicon.svg" alt="" className="size-8 rounded-full" />
          <span className="text-[15px] font-semibold">AMP Isole Ciclopi</span>
        </div>
      </SiteThumb>

      <div className="relative -mt-6 flex flex-1 flex-col rounded-t-[28px] bg-ground px-gutter pt-group">
      <h1 className="text-[34px] leading-[1.08] font-extrabold tracking-[-0.035em]">
        Comunica le uscite in mare in 30 secondi.
      </h1>
      <p className="mt-3 text-[17px] leading-relaxed text-ink-2">L'Area Marina Protetta e la Guardia Costiera ricevono tutto in tempo reale.</p>

      {api.mode === 'demo' && (
        <div className="mt-group">
          <p className="mb-2 text-sm text-ink-3">Versione dimostrativa: i dati restano in questo browser.</p>
          <List>
            <NavRow icon={<Sailboat />} title="Entra come diving" description="App per comunicare le uscite" onClick={() => enter(() => api.signIn('diving@demo.it', ''))} />
            <NavRow icon={<Building2 />} title="Entra come AMP" description="Centrale operativa, meglio da computer" onClick={() => enter(() => api.signIn('amp@isoleciclopi.it', ''))} />
          </List>
        </div>
      )}

      <form onSubmit={submit} className="mt-section flex flex-col gap-stack">
        <h2 className="text-lg font-semibold tracking-tight">{mode === 'login' ? 'Accedi con la tua email' : 'Crea un account'}</h2>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required autoComplete="email" placeholder="nome@diving.it" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required={api.mode === 'supabase'}
            minLength={api.mode === 'supabase' ? 6 : undefined}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}
        <Button type="submit" size="lg" loading={loading}>
          {mode === 'login' ? 'Accedi' : 'Registrati'}
        </Button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="h-11 cursor-pointer text-[15px] font-medium text-accent">
          {mode === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
        </button>
      </form>
      </div>
    </div>
  )
}
