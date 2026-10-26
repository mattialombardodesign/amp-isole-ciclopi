import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, LocateFixed, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { REPORT_LABEL, toDMS } from '@/lib/format'
import type { Report, ReportCategory } from '@/lib/types'
import { cn } from '@/lib/utils'
import { SiteMap } from '@/components/SiteMap'
import { BottomAction, Button, ChoiceRow, EmergencyCall, FlowHeader, FlowTitle, List, SuccessScreen, Textarea } from '@/components/ui'
import { REPORT_HINT, REPORT_ICON } from './Segnala'

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
  const [sent, setSent] = useState<Report | null>(null)
  const [gpsError, setGpsError] = useState(false)

  const coords = pin && `${toDMS(pin.lat, 'N', 'S')} ${toDMS(pin.lng, 'E', 'W')}`
  const steps = [
    { title: 'Cosa vuoi segnalare?', context: "Arriva subito all'AMP, con la posizione esatta.", hint: category ? null : 'Scegli cosa vuoi segnalare' },
    { title: 'Dove si trova?', context: 'Tocca la mappa nel punto esatto.', hint: pin ? null : 'Tocca la mappa o usa la tua posizione' },
    { title: 'Cosa hai visto?', context: [category && REPORT_LABEL[category], coords].filter(Boolean).join(' · '), hint: description.trim().length >= 5 ? null : 'Scrivi almeno qualche parola' },
  ]
  const hint = steps[step].hint

  // Ogni step parte dall'alto
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  // se il GPS non risponde il punto resta vuoto: meglio nessuna posizione che una sbagliata
  function locate() {
    setPin(null)
    setLocating(true)
    setGpsError(false)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPin({ lat: p.coords.latitude, lng: p.coords.longitude })
        setLocating(false)
      },
      () => {
        setGpsError(true)
        setLocating(false)
      },
      { timeout: 8000 },
    )
  }

  async function submit() {
    if (!category || !pin) return
    setSending(true)
    setError(null)
    try {
      setSent(await api.createReport({ category, description: description.trim(), lat: pin.lat, lng: pin.lng }))
    } catch {
      setError('Invio non riuscito. Controlla la connessione e riprova: i dati restano qui.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <SuccessScreen title="Segnalazione inviata" text="Grazie. Invio confermato: la segnalazione è arrivata all'AMP con la posizione esatta.">
        <Button size="lg" onClick={() => navigate('/segnala', { replace: true })}>
          Fatto
        </Button>
        <Button size="lg" variant="secondary" onClick={() => navigate(`/segnala/${sent.id}`, { replace: true })}>
          Vedi la segnalazione
        </Button>
      </SuccessScreen>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <FlowHeader onBack={() => (step > 0 ? setStep(step - 1) : navigate('/segnala'))} step={step} total={steps.length} />
      <div key={step} className="flex-1 animate-enter px-gutter pt-6 pb-stack">
        <FlowTitle title={steps[step].title} context={steps[step].context} />

        {step === 0 && (
          <List role="radiogroup">
            {CATEGORIES.map((c) => {
              const Icon = REPORT_ICON[c]
              return <ChoiceRow key={c} selected={category === c} onClick={() => setCategory(c)} title={REPORT_LABEL[c]} description={REPORT_HINT[c]} icon={<Icon />} />
            })}
          </List>
        )}

        {step === 1 && (
          <>
            <div className="h-80 overflow-hidden rounded-3xl">
              <SiteMap compactPins zoom={14} pin={pin} onMapClick={(lat, lng) => setPin({ lat, lng })} showZones />
            </div>
            <List className="mt-3">
              <div className="flex min-h-14 items-center gap-3 px-4 py-3">
                <MapPin className={cn('size-[22px] shrink-0', pin ? 'text-accent' : 'text-ink-2')} strokeWidth={1.75} />
                <span className={cn('flex-1 text-[17px] tabular-nums', !pin && 'text-ink-3')}>{coords ?? 'Nessun punto scelto'}</span>
              </div>
              <button type="button" onClick={locate} disabled={locating} className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-row-2 disabled:cursor-wait">
                {locating ? <Loader2 className="size-[22px] shrink-0 animate-spin text-ink-2" /> : <LocateFixed className="size-[22px] shrink-0 text-ink-2" strokeWidth={1.75} />}
                <span className="text-[17px]">{locating ? 'Cerco la tua posizione…' : 'Usa la mia posizione'}</span>
              </button>
            </List>
            {gpsError && <p className="mt-3 text-[15px] text-bad">Posizione non disponibile: tocca la mappa nel punto esatto.</p>}
          </>
        )}

        {step === 2 && (
          <>
            {category === 'abusivismo' && <EmergencyCall title="Sta succedendo adesso?" className="mb-stack" />}
            <Textarea
              autoFocus
              aria-label="Descrizione"
              placeholder="Es. Barca ancorata sulla posidonia a nord dell'Isola Lachea, senza gavitello."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {error && <p className="mt-3 rounded-2xl bg-bad-soft px-4 py-3 text-[15px] text-bad">{error}</p>}
          </>
        )}
      </div>
      <BottomAction hint={hint}>
        {step < steps.length - 1 ? (
          <Button size="lg" disabled={!!hint} onClick={() => setStep(step + 1)}>
            Continua
          </Button>
        ) : (
          <Button size="lg" disabled={!!hint} loading={sending} onClick={submit}>
            Invia segnalazione
          </Button>
        )}
      </BottomAction>
    </div>
  )
}
