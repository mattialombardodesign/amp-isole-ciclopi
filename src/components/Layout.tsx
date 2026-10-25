import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Landmark, Map as MapIcon, Megaphone, Sailboat } from 'lucide-react'
import { useAuth } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { FullScreenLoader } from './ui'

/** Protegge le pagine: serve il login e, per i diving, l'onboarding completato. */
export function RequireAuth() {
  const { profile, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullScreenLoader />
  if (!profile) return <Navigate to="/login" replace />
  if (!profile.onboarded && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />
  return <Outlet />
}

/** Colonna "telefono": a tutto schermo su mobile, centrata su desktop. */
export function PhoneFrame() {
  return (
    <div className="min-h-dvh bg-[#e6e8ec] md:py-8">
      <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col bg-ground md:min-h-[calc(100dvh-4rem)] md:overflow-hidden md:rounded-[36px] md:shadow-[0_24px_60px_-24px_rgba(11,15,20,.35)] md:ring-1 md:ring-black/5">
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
      <nav className="sticky bottom-0 z-[600] grid grid-cols-4 border-t border-line bg-card/90 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md">
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
