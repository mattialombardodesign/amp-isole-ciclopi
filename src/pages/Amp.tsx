import { useNavigate } from 'react-router-dom'
import { CalendarClock, ClipboardCheck, Headset, LayoutDashboard, LogOut } from 'lucide-react'
import { api } from '@/lib/api'
import { REQUEST_LABEL, timeAgo } from '@/lib/format'
import { useAuth, useLive } from '@/lib/hooks'
import { Button, List, NavRow, PageHeader, SectionHeading, Status } from '@/components/ui'

const ACTIONS = [
  { kind: 'appuntamento', icon: CalendarClock, text: 'Un incontro con biologi e staff dell’AMP' },
  { kind: 'assistenza', icon: Headset, text: 'Un problema in mare o con l’app' },
  { kind: 'rinnovo', icon: ClipboardCheck, text: 'L’autorizzazione annuale della tua attività' },
] as const

export default function Amp() {
  const { profile, refresh } = useAuth()
  const navigate = useNavigate()
  const { data: requests } = useLive(() => api.listMyRequests(), [])

  async function signOut() {
    await api.signOut()
    await refresh()
    navigate('/login')
  }

  return (
    <div className="pb-section">
      <PageHeader title="AMP" subtitle="Lo staff dell'Area Marina Protetta, a portata di mano." />
      <div className="mt-group px-gutter">
        <List>
          {ACTIONS.map(({ kind, icon: Icon, text }) => (
            <NavRow key={kind} icon={<Icon />} title={REQUEST_LABEL[kind]} description={text} onClick={() => navigate(`/amp/richiesta/${kind}`)} />
          ))}
        </List>
      </div>

      {!!requests?.length && (
        <section className="mt-section px-gutter">
          <SectionHeading>Le tue richieste</SectionHeading>
          <List>
            {requests.map((r) => (
              <div key={r.id} className="px-4 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-medium">{REQUEST_LABEL[r.kind]}</span>
                  <Status tone="accent">Inviata</Status>
                </div>
                <p className="mt-1 line-clamp-2 text-[15px] text-ink-2">{r.message}</p>
                <p className="mt-1 text-sm text-ink-3">{timeAgo(r.created_at)}</p>
              </div>
            ))}
          </List>
        </section>
      )}

      <section className="mt-section px-gutter">
        <SectionHeading>Profilo</SectionHeading>
        <List>
          <div className="px-4 py-3.5">
            <p className="text-base font-medium">{profile?.org_name}</p>
            <p className="text-[15px] text-ink-3">{profile?.email}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[15px] text-ink-2">Dati</span>
            {api.mode === 'demo' ? <Status tone="warn">Demo nel browser</Status> : <Status tone="ok">Supabase</Status>}
          </div>
          {profile?.role === 'amp' && <NavRow icon={<LayoutDashboard />} title="Centrale operativa" onClick={() => navigate('/dashboard')} />}
        </List>
        <Button variant="secondary" size="lg" className="mt-4" onClick={signOut}>
          <LogOut className="size-4" /> Esci
        </Button>
      </section>
    </div>
  )
}
