import { Link, useNavigate } from 'react-router-dom'
import { Binoculars, MessageSquareMore, ShieldAlert, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { REPORT_LABEL, timeAgo } from '@/lib/format'
import { useLive } from '@/lib/hooks'
import type { ReportCategory } from '@/lib/types'
import { EmptyState, List, NavRow, PageHeader, SectionHeading, Status } from '@/components/ui'

export const REPORT_ICON: Record<ReportCategory, typeof ShieldAlert> = {
  abusivismo: ShieldAlert,
  avvistamento: Binoculars,
  rifiuti: Trash2,
  altro: MessageSquareMore,
}

export const REPORT_HINT: Record<ReportCategory, string> = {
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
            return <NavRow key={c} icon={<Icon />} title={REPORT_LABEL[c]} description={REPORT_HINT[c]} onClick={() => navigate(`/segnala/nuova?categoria=${c}`)} />
          })}
        </List>
      </div>

      {reports && reports.length === 0 && (
        <section className="mt-section px-gutter">
          <EmptyState title="Nessuna segnalazione inviata" text="Quando segnali qualcosa la ritrovi qui, con lo stato aggiornato dall'AMP." />
        </section>
      )}

      {!!reports?.length && (
        <section className="mt-section px-gutter">
          <SectionHeading>Segnalazioni del diving</SectionHeading>
          <List>
            {reports.map((r) => (
              <Link key={r.id} to={`/segnala/${r.id}`} className="flex gap-3 px-4 py-3 transition-colors hover:bg-row-2">
                {(() => {
                  const Icon = REPORT_ICON[r.category]
                  return <Icon className="mt-0.5 size-[22px] shrink-0 text-ink-2" strokeWidth={1.75} />
                })()}
                <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[17px]">{REPORT_LABEL[r.category]}</span>
                  <Status tone="ok">Invio confermato</Status>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[15px] text-ink-3">{r.description}</p>
                <p className="mt-0.5 text-[13px] text-ink-3">{[timeAgo(r.created_at), r.author_name].filter(Boolean).join(' · ')}</p>
                </div>
              </Link>
            ))}
          </List>
        </section>
      )}
    </div>
  )
}
