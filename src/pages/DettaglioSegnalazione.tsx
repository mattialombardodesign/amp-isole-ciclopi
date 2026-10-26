import { useNavigate, useParams } from 'react-router-dom'
import { Clock, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { REPORT_LABEL, timeAgo, toDMS } from '@/lib/format'
import { useLive } from '@/lib/hooks'
import { SiteMap } from '@/components/SiteMap'
import { Button, FlowHeader, FullScreenLoader, InfoRow, List, SectionHeading, Status, Timeline, TimelineStep } from '@/components/ui'

export default function DettaglioSegnalazione() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: report } = useLive(() => api.listMyReports().then((list) => list.find((r) => r.id === id) ?? false), [id])

  if (report === null) return <FullScreenLoader />
  if (report === false) {
    return (
      <div className="flex min-h-dvh flex-col">
        <FlowHeader onBack={() => navigate('/segnala')} />
        <div className="px-gutter pt-6">
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">Segnalazione non trovata</h1>
          <p className="mt-1 text-[15px] text-ink-3">Potrebbe essere stata inviata da un altro account.</p>
          <Button size="lg" className="mt-group" onClick={() => navigate('/segnala')}>
            Torna a Segnala
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col pb-section">
      <FlowHeader onBack={() => navigate('/segnala')} label="Segnalazione" />
      <div className="animate-enter px-gutter pt-3">
        <Status tone="ok">Invio confermato</Status>
        <h1 className="mt-3 text-[28px] leading-tight font-bold tracking-[-0.02em]">{REPORT_LABEL[report.category]}</h1>
        <p className="mt-1 text-[15px] text-ink-3">{report.description}</p>

        <Timeline className="mt-group">
          <TimelineStep done title="Inviata" text={[timeAgo(report.created_at), report.author_name && `da ${report.author_name}`].filter(Boolean).join(' · ')} />
          <TimelineStep done tone="ok" last title="Invio confermato" text="Grazie: la segnalazione è arrivata all'AMP con la posizione esatta." />
        </Timeline>

        <section className="mt-section">
          <SectionHeading>Posizione</SectionHeading>
          <div className="h-56 overflow-hidden rounded-3xl">
            <SiteMap compactPins zoom={14} center={[report.lat, report.lng]} pin={{ lat: report.lat, lng: report.lng }} />
          </div>
          <List className="mt-3">
            <InfoRow icon={<MapPin />} label="Coordinate" value={`${toDMS(report.lat, 'N', 'S')} ${toDMS(report.lng, 'E', 'W')}`} />
            <InfoRow icon={<Clock />} label="Inviata" value={new Date(report.created_at).toLocaleString('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} />
          </List>
        </section>
      </div>
    </div>
  )
}
