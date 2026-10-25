import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { REQUEST_LABEL } from '@/lib/format'
import type { RequestKind } from '@/lib/types'
import { todayISO } from '@/lib/utils'
import { BottomAction, Button, FlowHeader, Input, Label, SuccessScreen, Textarea } from '@/components/ui'

const PLACEHOLDERS: Record<RequestKind, string> = {
  appuntamento: 'Es. Vorremmo un incontro sulla posidonia per i nostri istruttori.',
  assistenza: 'Dove ti trovi e cosa sta succedendo?',
  rinnovo: 'Es. Rinnovo 2027 per visite guidate: 3 istruttori e 2 guide.',
}

export default function RichiestaAmp() {
  const { kind: param } = useParams()
  const navigate = useNavigate()
  const kind: RequestKind = param === 'assistenza' || param === 'rinnovo' ? param : 'appuntamento'
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function submit() {
    setSending(true)
    setError(null)
    try {
      await api.createRequest({ kind, message: message.trim(), preferred_date: date || null })
      setSent(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <SuccessScreen title="Richiesta inviata" text="Lo staff dell'AMP ti risponderà al più presto.">
        <Button size="lg" onClick={() => navigate('/amp', { replace: true })}>
          Fatto
        </Button>
      </SuccessScreen>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <FlowHeader onBack={() => navigate(-1)} label="AMP" />
      <div className="flex-1 animate-enter px-gutter pt-2 pb-stack">
        <h1 className="mb-group text-[28px] leading-tight font-extrabold tracking-[-0.03em]">{REQUEST_LABEL[kind]}</h1>
        {kind !== 'assistenza' && (
          <div className="mb-5">
            <Label htmlFor="date">{kind === 'rinnovo' ? 'Valida dal' : 'Data preferita'}</Label>
            <Input id="date" type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        )}
        <Label htmlFor="msg">Messaggio</Label>
        <Textarea id="msg" placeholder={PLACEHOLDERS[kind]} value={message} onChange={(e) => setMessage(e.target.value)} />
        {error && <p className="mt-4 rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}
      </div>
      <BottomAction>
        <Button size="lg" disabled={message.trim().length < 5} loading={sending} onClick={submit}>
          Invia richiesta
        </Button>
      </BottomAction>
    </div>
  )
}
