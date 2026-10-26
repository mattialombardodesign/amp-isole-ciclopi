import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { REQUEST_LABEL, formatDateLong } from '@/lib/format'
import type { RequestKind } from '@/lib/types'
import { Calendar } from '@/components/Calendar'
import { BottomAction, Button, EmergencyCall, FlowHeader, FlowTitle, Label, SuccessScreen, Textarea } from '@/components/ui'

const PLACEHOLDERS: Record<RequestKind, string> = {
  appuntamento: 'Es. Vorremmo un incontro sulla posidonia per i nostri istruttori.',
  assistenza: 'Dove ti trovi e cosa sta succedendo?',
  accesso: 'Nome e cognome, email e ruolo (istruttore, guida o segreteria) della persona.',
}

const CONTEXT: Record<RequestKind, string> = {
  appuntamento: 'Biologi e staff dell’AMP ti propongono un giorno.',
  assistenza: 'Lo staff dell’AMP ti ricontatta al più presto.',
  accesso: 'L’AMP crea le credenziali e le consegna alla persona: entrerà nello spazio del tuo diving.',
}

export default function RichiestaAmp() {
  const { kind: param } = useParams()
  const navigate = useNavigate()
  const kind: RequestKind = param === 'assistenza' || param === 'accesso' ? param : 'appuntamento'
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
    } catch {
      setError('Invio non riuscito. Controlla la connessione e riprova: il messaggio resta qui.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <SuccessScreen title="Richiesta inviata" text="Invio confermato: la richiesta è arrivata allo staff dell'AMP.">
        <Button size="lg" onClick={() => navigate('/amp', { replace: true })}>
          Fatto
        </Button>
      </SuccessScreen>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <FlowHeader onBack={() => navigate(-1)} label="AMP" />
      <div className="flex-1 animate-enter px-gutter pt-6 pb-stack">
        <FlowTitle title={REQUEST_LABEL[kind]} context={CONTEXT[kind]} />
        {kind === 'assistenza' && <EmergencyCall className="mb-group" />}
        {kind === 'appuntamento' && (
          <div className="mb-group">
            <Label>
              Data preferita · {date ? formatDateLong(date) : 'facoltativa'}
            </Label>
            {/* toccando di nuovo il giorno scelto lo si toglie */}
            <Calendar value={date || null} onChange={(iso) => setDate(iso === date ? '' : iso)} />
          </div>
        )}
        <Label htmlFor="msg">Messaggio</Label>
        <Textarea id="msg" placeholder={PLACEHOLDERS[kind]} value={message} onChange={(e) => setMessage(e.target.value)} />
        {error && <p className="mt-3 rounded-2xl bg-bad-soft px-4 py-3 text-[15px] text-bad">{error}</p>}
      </div>
      <BottomAction hint={message.trim().length < 5 ? 'Scrivi almeno qualche parola' : null}>
        <Button size="lg" disabled={message.trim().length < 5} loading={sending} onClick={submit}>
          Invia richiesta
        </Button>
      </BottomAction>
    </div>
  )
}
