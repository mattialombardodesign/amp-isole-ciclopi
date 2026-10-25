import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronLeft, Copy } from 'lucide-react'
import { api } from '@/lib/api'
import { ACTIVITY_LABEL, EXIT_LABEL, communicationText, formatDateLong, hhmm, timeAgo, totalDivers } from '@/lib/format'
import { useLive } from '@/lib/hooks'
import { getSite } from '@/lib/sites'
import { cn } from '@/lib/utils'
import { DepthProfile, SiteThumb, Stat, StatRow } from '@/components/Tour'
import { Button, FlowHeader, FullScreenLoader, List, SectionHeading } from '@/components/ui'
import { BookingStatus } from './Attivita'

export default function DettaglioUscita() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: booking } = useLive(() => api.getBooking(id).then((b) => b ?? false), [id])
  const [copied, setCopied] = useState(false)

  if (booking === null) return <FullScreenLoader />
  const site = booking ? getSite(booking.site_id) : undefined
  if (booking === false || !site) {
    return (
      <div className="flex min-h-dvh flex-col">
        <FlowHeader onBack={() => navigate('/attivita')} />
        <p className="px-gutter text-ink-3">Uscita non trovata.</p>
      </div>
    )
  }
  const seen = booking.status === 'presa_visione'
  const text = communicationText(booking)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const people = [
    ['Istruttori', booking.instructors.join(', ') || '—'],
    ['Guide', booking.guides.join(', ') || '—'],
    ['Ospiti', booking.guests.join(', ') || '—'],
    ['Pallone', booking.buoy ? 'Presente' : 'Assente'],
    ['Uscita', EXIT_LABEL[booking.exit_mode]],
  ]

  return (
    <div className="flex min-h-dvh flex-col pb-section">
      {/* mappa del sito a tutta larghezza, come la copertina di un percorso */}
      <SiteThumb site={site} zoom={16} pin="label" caption={`${site.name} · Zona ${site.zone}`} className="h-64 shrink-0">
        <button
          onClick={() => navigate('/attivita')}
          className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 flex size-11 cursor-pointer items-center justify-center rounded-full bg-card text-ink shadow-[0_6px_16px_-6px_rgba(10,37,64,.5)]"
          aria-label="Indietro"
        >
          <ChevronLeft className="size-6" />
        </button>
      </SiteThumb>

      <div className="relative -mt-6 animate-enter rounded-t-[28px] bg-ground px-gutter pt-group">
        <BookingStatus status={booking.status} />
        <h1 className="mt-3 text-[28px] leading-tight font-extrabold tracking-[-0.03em]">
          {ACTIVITY_LABEL[booking.activity_type]} {site.at}
        </h1>
        <p className="mt-1 text-[15px] text-ink-3">{formatDateLong(booking.date)}</p>
        <StatRow className="mt-stack">
          <Stat icon="time">
            {hhmm(booking.time_in)}–{hhmm(booking.time_out)}
          </Stat>
          <Stat icon="divers">{totalDivers(booking)} sub</Stat>
          <Stat icon="depth">{site.depth}</Stat>
        </StatRow>
        <DepthProfile site={site} className="mt-group" />

        <section className="mt-section">
          <SectionHeading>Stato</SectionHeading>
          <ol className="flex flex-col">
            <Step done title="Inviata ad AMP e Guardia Costiera" text={timeAgo(booking.created_at)} />
            <Step done={seen} last title={seen ? "Presa visione dall'AMP" : "In attesa che l'AMP la legga"} text={seen ? 'Puoi procedere con l’immersione.' : 'Lo stato si aggiorna da solo.'} />
          </ol>
        </section>

        <section className="mt-section">
          <SectionHeading>Chi va in acqua</SectionHeading>
          <List>
            {people.map(([k, v]) => (
              <div key={k} className="flex gap-4 px-4 py-3">
                <span className="w-24 shrink-0 text-[15px] text-ink-3">{k}</span>
                <span className="text-[15px] font-medium">{v}</span>
              </div>
            ))}
          </List>
        </section>

        <section className="mt-section">
          <SectionHeading
            action={
              <Button variant="ghost" size="sm" onClick={copy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? 'Copiato' : 'Copia'}
              </Button>
            }
          >
            Testo inviato agli enti
          </SectionHeading>
          <pre className="rounded-2xl bg-card p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink-2 ring-1 ring-line">{text}</pre>
        </section>
      </div>
    </div>
  )
}

function Step({ done, last, title, text }: { done: boolean; last?: boolean; title: string; text: string }) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!last && <span className={cn('absolute top-7 bottom-0 left-[13px] w-0.5', done ? 'bg-accent' : 'bg-line')} />}
      <span className={cn('relative flex size-7 shrink-0 items-center justify-center rounded-full', done ? 'bg-accent text-white' : 'bg-card ring-2 ring-line-strong ring-inset')}>
        {done && <Check className="size-4" strokeWidth={2.5} />}
      </span>
      <div className="pt-0.5">
        <p className={cn('text-base font-medium', !done && 'text-ink-2')}>{title}</p>
        <p className="text-sm text-ink-3">{text}</p>
      </div>
    </li>
  )
}
