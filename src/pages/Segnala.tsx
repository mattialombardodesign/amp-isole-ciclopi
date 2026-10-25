import { useNavigate } from 'react-router-dom'
import { Anchor, Fish, MessageSquareMore, Recycle } from 'lucide-react'
import { api } from '@/lib/api'
import { REPORT_LABEL, timeAgo } from '@/lib/format'
import { useLive } from '@/lib/hooks'
import type { ReportCategory } from '@/lib/types'
import { List, NavRow, PageHeader, SectionHeading, Status } from '@/components/ui'

export const REPORT_ICON: Record<ReportCategory, typeof Anchor> = {
  abusivismo: Anchor,
  avvistamento: Fish,
  rifiuti: Recycle,
  altro: MessageSquareMore,
}

const HINT: Record<ReportCategory, string> = {
  abusivismo: 'Pesca illegale, ancoraggi vietati, accessi non autorizzati',
  avvistamento: 'Tartarughe, cetacei, specie rare o invasive',
  rifiuti: 'Reti abbandonate, plastica, chiazze sospette',
  altro: "Qualsiasi altra cosa che l'AMP dovrebbe sapere",
}

export default function Segnala() {
  const navigate = useNavigate()
  const { data: reports } = useLive(() => api.listMyReports(), [])

  return (
    <div className="pb-section">
      <PageHeader title="Segnala" subtitle="Arriva subito all'AMP, con la posizione esatta." />
      <div className="mt-group px-gutter">
        <List>
          {(Object.keys(REPORT_LABEL) as ReportCategory[]).map((c) => {
            const Icon = REPORT_ICON[c]
            return <NavRow key={c} icon={<Icon />} title={REPORT_LABEL[c]} description={HINT[c]} onClick={() => navigate(`/segnala/nuova?categoria=${c}`)} />
          })}
        </List>
      </div>

      {!!reports?.length && (
        <section className="mt-section px-gutter">
          <SectionHeading>Le tue segnalazioni</SectionHeading>
          <List>
            {reports.map((r) => (
              <div key={r.id} className="px-4 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-medium">{REPORT_LABEL[r.category]}</span>
                  {r.status === 'gestita' ? <Status tone="ok">Gestita</Status> : <Status tone="warn">Aperta</Status>}
                </div>
                <p className="mt-1 line-clamp-2 text-[15px] text-ink-2">{r.description}</p>
                <p className="mt-1 text-sm text-ink-3">{timeAgo(r.created_at)}</p>
              </div>
            ))}
          </List>
        </section>
      )}
    </div>
  )
}
