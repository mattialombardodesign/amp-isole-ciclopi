import { useNavigate } from 'react-router-dom'
import { CalendarClock, Headset, UserPlus } from 'lucide-react'
import { api } from '@/lib/api'
import { REQUEST_LABEL, timeAgo } from '@/lib/format'
import { useLive } from '@/lib/hooks'
import { List, NavRow, PageHeader, SectionHeading, Status } from '@/components/ui'

const ACTIONS = [
  { kind: 'appuntamento', icon: CalendarClock, text: 'Un incontro con biologi e staff dell’AMP' },
  { kind: 'assistenza', icon: Headset, text: 'Un problema in mare o con l’app' },
] as const

export default function Amp() {
  const navigate = useNavigate()
  const { data: requests } = useLive(() => api.listMyRequests(), [])

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
          <SectionHeading>Richieste del diving</SectionHeading>
          <List>
            {requests.map((r) => (
              <div key={r.id} className="flex gap-3 px-4 py-3">
                {(() => {
                  const Icon = r.kind === 'accesso' ? UserPlus : (ACTIONS.find((a) => a.kind === r.kind)?.icon ?? Headset)
                  return <Icon className="mt-0.5 size-[22px] shrink-0 text-ink-2" strokeWidth={1.75} />
                })()}
                <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[17px]">{REQUEST_LABEL[r.kind]}</span>
                  <Status tone="ok">Invio confermato</Status>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[15px] text-ink-3">{r.message}</p>
                <p className="mt-0.5 text-[13px] text-ink-3">{[timeAgo(r.created_at), r.author_name].filter(Boolean).join(' · ')}</p>
                </div>
              </div>
            ))}
          </List>
        </section>
      )}

    </div>
  )
}
