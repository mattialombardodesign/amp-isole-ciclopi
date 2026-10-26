import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Landmark, Map as MapIcon, Megaphone, Sailboat } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { CyclopsEye } from './Logo'
import { Button, FullScreenLoader } from './ui'

/** Protegge le pagine: serve il login e, per i diving, l'onboarding completato. */
export function RequireAuth() {
  const { profile, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullScreenLoader />
  if (!profile) return <Navigate to="/login" replace />
  if (profile.role === 'diving' && !profile.org_id) return <NotLinked />
  if (!profile.onboarded && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />
  return <Outlet />
}

/** Una persona entrata ma non ancora collegata a un diving: lo spazio lo collega l'AMP. */
function NotLinked() {
  const { refresh } = useAuth()
  return (
    <div className="mx-auto flex min-h-dvh max-w-[420px] flex-col items-center justify-center px-gutter text-center">
      <CyclopsEye sclera="fill-ground" className="w-16" label="" />
      <h1 className="mt-6 text-[28px] leading-tight font-bold tracking-[-0.02em]">Account non ancora collegato</h1>
      <p className="mt-2 text-[17px] leading-snug text-ink-3">Il tuo account non è collegato a nessun diving. Chiedi all'AMP o al titolare del tuo diving di collegarlo.</p>
      <Button
        variant="secondary"
        size="lg"
        className="mt-section"
        onClick={async () => {
          await api.signOut()
          await refresh()
        }}
      >
        Esci
      </Button>
    </div>
  )
}

/** Colonna "telefono": a tutto schermo su mobile, centrata su desktop. */
export function PhoneFrame() {
  return (
    <div className="min-h-dvh bg-row-2 md:py-8">
      <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col bg-ground md:min-h-[calc(100dvh-4rem)] md:overflow-hidden md:rounded-[36px] md:shadow-[0_30px_60px_-30px_rgba(17,17,19,.35)]">
        <Outlet />
      </div>
    </div>
  )
}

const TABS = [
  { to: '/attivita', label: 'Attività', icon: Sailboat },
  { to: '/segnala', label: 'Segnala', icon: Megaphone },
  { to: '/mappa', label: 'Mappa', icon: MapIcon },
  { to: '/amp', label: 'AMP', icon: Landmark },
]

/** Schermate principali con la tab bar in basso. */
export function TabLayout() {
  return (
    <>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <nav className="sticky bottom-0 z-[600] grid grid-cols-4 border-t border-line bg-ground/95 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn('flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors', isActive ? 'text-accent' : 'text-ink-3 hover:text-ink')
            }
          >
            <Icon className="size-6" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
