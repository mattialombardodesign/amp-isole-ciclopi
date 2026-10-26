import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/hooks'
import { CyclopsEye } from '@/components/Logo'
import { Button, Input } from '@/components/ui'

/**
 * Accesso con le credenziali personali che l'AMP crea per ogni persona del
 * diving dopo la registrazione negli uffici: dall'app non ci si iscrive.
 */
export default function Login() {
  const { profile, refresh } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (profile) return <Navigate to={profile.role === 'amp' ? '/dashboard' : '/attivita'} replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.signIn(email, password)
      await refresh()
      const p = await api.getUser()
      navigate(p?.role === 'amp' ? '/dashboard' : '/attivita', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-card to-ground px-gutter pt-[max(4.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center text-center">
        <CyclopsEye opening look className="w-20" label="" />
        <p className="mt-5 text-[17px]">AMP Isole Ciclopi</p>
        <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-[-0.02em]">Accedi al tuo diving</h1>
        <p className="mt-2 max-w-xs text-[15px] leading-snug text-ink-3">Comunica le uscite all'AMP e alla Guardia Costiera in 30 secondi.</p>
      </div>

      <form onSubmit={submit} className="mt-10 flex flex-1 flex-col">
        <div className="flex flex-col gap-2.5">
          <Input icon={<Mail />} type="email" required autoComplete="username" placeholder="Email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            icon={<Lock />}
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="rounded-2xl bg-bad-soft px-4 py-3 text-[15px] text-bad">{error}</p>}
          <p className="mt-2 px-2 text-center text-[13px] leading-snug text-ink-3">
            Usa le tue credenziali personali: l'AMP le crea per ogni persona del diving registrato negli uffici.
          </p>
        </div>

        <div className="mt-auto pt-section">
          {api.mode === 'demo' && (
            <p className="mb-3 text-center text-[13px] text-ink-3">
              Versione dimostrativa: <span className="text-ink-2">diving@demo.it</span> (titolare) o <span className="text-ink-2">marco@demo.it</span> (collaboratore), password qualsiasi.
            </p>
          )}
          <Button type="submit" size="lg" loading={loading} disabled={!email || !password}>
            Accedi
          </Button>
        </div>
      </form>
    </div>
  )
}
