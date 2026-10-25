import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Fish, Map as MapIcon, Megaphone, Sailboat, Ship, UserRound, Waves } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/hooks'
import type { OrgKind } from '@/lib/types'
import { BottomAction, Button, ChoiceRow, FlowHeader, Input, Label, List } from '@/components/ui'

const KINDS: { id: OrgKind; title: string; description: string; icon: typeof Waves }[] = [
  { id: 'subacquea', title: 'Subacquea', description: 'Diving center, istruttori, guide', icon: Waves },
  { id: 'pesca', title: 'Pesca', description: 'Pesca professionale o sportiva', icon: Fish },
  { id: 'visite_barca', title: 'Visite guidate in barca', description: 'Escursioni e trasporto turistico', icon: Ship },
]

const FEATURES = [
  { icon: Sailboat, title: 'Attività', text: "Comunichi un'uscita in 30 secondi e vedi quando l'AMP l'ha letta." },
  { icon: Megaphone, title: 'Segnala', text: 'Abusivismi, avvistamenti, rifiuti: con la posizione esatta.' },
  { icon: MapIcon, title: 'Mappa', text: 'Siti, zone di tutela, posti liberi e condizioni del mare.' },
  { icon: UserRound, title: 'AMP', text: 'Appuntamenti con gli esperti, assistenza e rinnovi.' },
]

export default function Onboarding() {
  const { profile, refresh } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [kind, setKind] = useState<OrgKind | null>(profile?.org_kind ?? null)
  const [name, setName] = useState(profile?.org_name ?? '')
  const [saving, setSaving] = useState(false)

  async function finish() {
    setSaving(true)
    await api.updateProfile({ org_kind: kind, org_name: name.trim(), onboarded: true })
    await refresh()
    navigate('/attivita', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <FlowHeader onBack={() => (step > 0 ? setStep(step - 1) : undefined)} step={step} total={2} label="Benvenuto" />

      {step === 0 && (
        <>
          <div key="s0" className="flex-1 animate-enter px-gutter pt-3">
            <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.03em]">Di cosa ti occupi?</h1>
            <p className="mt-2 text-[15px] text-ink-3">Serve per mostrarti le attività giuste.</p>
            <List className="mt-6" role="radiogroup">
              {KINDS.map(({ id, title, description, icon: Icon }) => (
                <ChoiceRow key={id} selected={kind === id} onClick={() => setKind(id)} title={title} description={description} icon={<Icon />} />
              ))}
            </List>
            <div className="mt-8">
              <Label htmlFor="org">Nome della tua attività</Label>
              <Input id="org" placeholder="Es. Centro Immersioni Acitrezza" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <BottomAction>
            <Button size="lg" disabled={!kind || name.trim().length < 2} onClick={() => setStep(1)}>
              Continua
            </Button>
          </BottomAction>
        </>
      )}

      {step === 1 && (
        <>
          <div key="s1" className="flex-1 animate-enter px-gutter pt-3">
            <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.03em]">Ecco cosa puoi fare</h1>
            <p className="mt-2 text-[15px] text-ink-3">{name.trim()} è pronto. Quattro sezioni, tutte a un tocco.</p>
            <ul className="mt-8 flex flex-col gap-6">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <Icon className="mt-0.5 size-6 shrink-0 text-accent" strokeWidth={1.75} />
                  <div>
                    <p className="text-base font-semibold">{title}</p>
                    <p className="mt-0.5 text-[15px] leading-relaxed text-ink-2">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <BottomAction>
            <Button size="lg" loading={saving} onClick={finish}>
              Inizia
            </Button>
          </BottomAction>
        </>
      )}
    </div>
  )
}
