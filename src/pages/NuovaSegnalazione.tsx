import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LocateFixed } from 'lucide-react'
import { api } from '@/lib/api'
import { REPORT_LABEL, toDMS } from '@/lib/format'
import { AMP_CENTER } from '@/lib/sites'
import type { ReportCategory } from '@/lib/types'
import { SiteMap } from '@/components/SiteMap'
import { BottomAction, Button, ChoiceRow, FlowHeader, List, SuccessScreen, Textarea } from '@/components/ui'
import { REPORT_ICON } from './Segnala'

const TITLES = ['Cosa vuoi segnalare?', 'Dove?', 'Cosa hai visto?']
const CATEGORIES = Object.keys(REPORT_LABEL) as ReportCategory[]

export default function NuovaSegnalazione() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preset = params.get('categoria') as ReportCategory | null
  const [category, setCategory] = useState<ReportCategory | null>(preset && CATEGORIES.includes(preset) ? preset : null)
  const [step, setStep] = useState(category ? 1 : 0)
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null)
  const [description, setDescription] = useState('')
  const [locating, setLocating] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const valid = [!!category, !!pin, description.trim().length >= 5][step]

  function locate() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPin({ lat: p.coords.latitude, lng: p.coords.longitude })
        setLocating(false)
      },
      () => {
        setPin({ lat: AMP_CENTER[0], lng: AMP_CENTER[1] })
        setLocating(false)
      },
      { timeout: 5000 },
    )
  }

  async function submit() {
    if (!category || !pin) return
    setSending(true)
    setError(null)
    try {
      await api.createReport({ category, description: description.trim(), lat: pin.lat, lng: pin.lng })
      setSent(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <SuccessScreen title="Segnalazione inviata" text="Grazie. Lo staff dell'AMP l'ha ricevuta con la posizione esatta e la vedrai qui quando sarà gestita.">
        <Button size="lg" onClick={() => navigate('/segnala', { replace: true })}>
          Fatto
        </Button>
      </SuccessScreen>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <FlowHeader onBack={() => (step > 0 ? setStep(step - 1) : navigate('/segnala'))} step={step} total={3} label={category ? REPORT_LABEL[category] : 'Nuova segnalazione'} />
      <div key={step} className="flex-1 animate-enter px-gutter pt-2 pb-stack">
        <h1 className="mb-group text-[28px] leading-tight font-extrabold tracking-[-0.03em]">{TITLES[step]}</h1>

        {step === 0 && (
          <List role="radiogroup">
            {CATEGORIES.map((c) => {
              const Icon = REPORT_ICON[c]
              return <ChoiceRow key={c} selected={category === c} onClick={() => setCategory(c)} title={REPORT_LABEL[c]} icon={<Icon />} />
            })}
          </List>
        )}

        {step === 1 && (
          <>
            <p className="-mt-3 mb-4 text-[15px] text-ink-3">Tocca la mappa nel punto esatto.</p>
            <div className="h-80 overflow-hidden rounded-2xl ring-1 ring-line">
              <SiteMap tone="prussia" zoom={14} pin={pin} onMapClick={(lat, lng) => setPin({ lat, lng })} showZones />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="font-mono text-sm text-ink-3">{pin ? `${toDMS(pin.lat, 'N', 'S')} ${toDMS(pin.lng, 'E', 'W')}` : 'Nessun punto'}</p>
              <Button variant="secondary" size="sm" loading={locating} onClick={locate}>
                <LocateFixed className="size-4" /> Usa la mia posizione
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Textarea
              autoFocus
              aria-label="Descrizione"
              placeholder="Es. Barca ancorata sulla posidonia a nord dell'Isola Lachea, senza gavitello."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {error && <p className="mt-4 rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}
          </>
        )}
      </div>
      <BottomAction>
        {step < 2 ? (
          <Button size="lg" disabled={!valid} onClick={() => setStep(step + 1)}>
            Continua
          </Button>
        ) : (
          <Button size="lg" disabled={!valid} loading={sending} onClick={submit}>
            Invia segnalazione
          </Button>
        )}
      </BottomAction>
    </div>
  )
}
