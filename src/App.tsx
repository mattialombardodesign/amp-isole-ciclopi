import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/lib/hooks'
import { PhoneFrame, RequireAuth, TabLayout } from '@/components/Layout'
import Account from '@/pages/Account'
import Amp from '@/pages/Amp'
import Attivita from '@/pages/Attivita'
import Dashboard from '@/pages/Dashboard'
import DettaglioSegnalazione from '@/pages/DettaglioSegnalazione'
import DettaglioUscita from '@/pages/DettaglioUscita'
import Login from '@/pages/Login'
import Mappa from '@/pages/Mappa'
import NuovaSegnalazione from '@/pages/NuovaSegnalazione'
import NuovaUscita from '@/pages/NuovaUscita'
import Onboarding from '@/pages/Onboarding'
import RichiestaAmp from '@/pages/RichiestaAmp'
import Segnala from '@/pages/Segnala'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PhoneFrame />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<RequireAuth />}>
            {/* Centrale operativa AMP (desktop) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* App mobile per i diving */}
            <Route element={<PhoneFrame />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<TabLayout />}>
                <Route path="/attivita" element={<Attivita />} />
                <Route path="/segnala" element={<Segnala />} />
                <Route path="/mappa" element={<Mappa />} />
                <Route path="/amp" element={<Amp />} />
              </Route>
              <Route path="/account" element={<Account />} />
              <Route path="/attivita/nuova" element={<NuovaUscita />} />
              <Route path="/attivita/nuova/:tipo" element={<NuovaUscita />} />
              <Route path="/attivita/:id" element={<DettaglioUscita />} />
              <Route path="/segnala/nuova" element={<NuovaSegnalazione />} />
              <Route path="/segnala/:id" element={<DettaglioSegnalazione />} />
              <Route path="/amp/richiesta/:kind" element={<RichiestaAmp />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/attivita" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
