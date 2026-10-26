import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, CheckCircle2, Clock, GraduationCap, MapPin, Plus, Sailboat, Timer, UserRound, UsersRound } from 'lucide-react'
import { api } from '@/lib/api'
import { firstName } from '@/lib/format'
import { useAuth } from '@/lib/hooks'
import { getSite } from '@/lib/sites'
import type { StaffMember } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CapacityGauge, CapacityLabel } from '@/components/CapacityGauge'
import { CyclopsEye } from '@/components/Logo'
import { BottomAction, Button, Pill, Status } from '@/components/ui'

/**
 * Onboarding: il diving è già registrato negli uffici dell'AMP (nome e team
 * arrivano da lì), quindi qui non si compila niente. Cinque schermate
 * raccontano cosa si può fare, ognuna con un'animazione fatta con i
 * componenti veri dell'app. Si scorre con il dito, con le frecce o "Continua".
 */
export default function Onboarding() {
  const { profile, refresh } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const swipe = useRef<number | null>(null)

  const name = firstName(profile?.full_name ?? '')
  const org = profile?.org_name ?? ''
  const staff = profile?.staff ?? []

  const slides: { title: string; text: string; art: ReactNode }[] = [
    {
      title: name ? `Ciao, ${name}` : 'Ciao!',
      text: org
        ? `Sei nello spazio di ${org}, già registrato all'Area Marina Protetta Isole Ciclopi. Ti mostriamo cosa puoi fare da qui.`
        : "Il tuo diving è già registrato all'Area Marina Protetta Isole Ciclopi. Ti mostriamo cosa puoi fare da qui.",
      art: <WelcomeArt />,
    },
    {
      title: "Un'uscita in 30 secondi",
      text: "Quando, dove e con chi: pochi tocchi e l'uscita arriva all'AMP e alla Guardia Costiera insieme. Niente più mail.",
      art: <OutingArt />,
    },
    {
      title: 'Posti liberi in tempo reale',
      text: 'Ogni sito ha un limite di subacquei. Prima di partire vedi quanti posti restano; i tuoi sono in blu.',
      art: <CapacityArt />,
    },
    {
      title: 'Il tuo team è già qui',
      text: staff.length
        ? "Istruttori e guide che hai comunicato all'AMP sono già caricati. Se arriva qualcuno di nuovo, lo aggiungi mentre crei l'uscita."
        : "Aggiungi istruttori e guide mentre crei la prima uscita: da lì in poi li ritrovi sempre pronti.",
      art: <TeamArt staff={staff} />,
    },
    {
      title: 'Invio confermato, subito',
      text: "Appena invii, l'app ti conferma che la comunicazione è arrivata ad AMP e Guardia Costiera. E da qui segnali abusi, consulti la mappa e chiedi un appuntamento.",
      art: <ReceiptArt />,
    },
  ]
  const last = slides.length - 1

  function go(next: number) {
    setStep(Math.max(0, Math.min(last, next)))
  }

  async function finish() {
    setSaving(true)
    await api.updateProfile({ onboarded: true })
    await refresh()
    navigate('/attivita', { replace: true })
  }

  // Frecce della tastiera: comode quando si presenta da computer
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') setStep((s) => Math.min(last, s + 1))
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(0, s - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [last])

  return (
    <div
      className="flex min-h-dvh touch-pan-y flex-col select-none"
      onPointerDown={(e) => (swipe.current = e.clientX)}
      onPointerUp={(e) => {
        if (swipe.current === null) return
        const dx = e.clientX - swipe.current
        swipe.current = null
        if (Math.abs(dx) > 50) go(step + (dx < 0 ? 1 : -1))
      }}
    >
      <header className="flex h-14 shrink-0 items-center justify-end px-gutter pt-[env(safe-area-inset-top)]">
        {step < last && (
          <button type="button" onClick={finish} className="-mr-2 h-11 cursor-pointer rounded-xl px-2 text-[17px] text-ink-2 hover:text-ink">
            Salta
          </button>
        )}
      </header>

      <div key={step} className="flex flex-1 flex-col">
        <div className="flex min-h-[300px] flex-1 items-center justify-center px-gutter">{slides[step].art}</div>
        <div className="mx-auto max-w-[340px] animate-enter px-gutter pt-group text-center">
          <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em] text-balance">{slides[step].title}</h1>
          <p className="mt-2 text-[17px] leading-snug text-pretty text-ink-3">{slides[step].text}</p>
        </div>
      </div>

      <BottomAction>
        <div className="mb-5 flex justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => go(i)}
              aria-label={`Schermata ${i + 1} di ${slides.length}`}
              aria-current={i === step ? 'step' : undefined}
              className="flex h-6 cursor-pointer items-center"
            >
              <span className={cn('block h-2 rounded-full transition-all duration-300 ease-(--ease-out-expo)', i === step ? 'w-5 bg-accent' : 'w-2 bg-line-strong')} />
            </button>
          ))}
        </div>
        {step < last ? (
          <Button size="lg" onClick={() => go(step + 1)}>
            Continua
          </Button>
        ) : (
          <Button size="lg" loading={saving} onClick={finish}>
            Inizia
          </Button>
        )}
      </BottomAction>
    </div>
  )
}

// ---------- Animazioni --------------------------------------------------

const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Fase dell'animazione: 0, poi 1, 2… ai tempi indicati in ms. Con "riduci movimento" parte già dalla fine. */
function usePhase(times: number[]) {
  const [phase, setPhase] = useState(() => (reducedMotion() ? times.length : 0))
  useEffect(() => {
    if (reducedMotion()) return
    const ids = times.map((t, i) => setTimeout(() => setPhase(i + 1), t))
    return () => ids.forEach(clearTimeout)
  }, [times])
  return phase
}

/** Conta da 0 a `to` in `ms` millisecondi. */
function useCount(to: number, ms: number) {
  const [n, setN] = useState(() => (reducedMotion() ? to : 0))
  useEffect(() => {
    if (reducedMotion()) return
    const start = performance.now()
    let frame = 0
    const tick = (t: number) => {
      const k = Math.min((t - start) / ms, 1)
      setN(Math.round(to * k))
      if (k < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [to, ms])
  return n
}

/** Compare con `animate-rise` quando la fase arriva; prima occupa già il suo spazio. */
const reveal = (shown: boolean) => (shown ? 'animate-rise' : 'opacity-0')

const ART = 'w-full max-w-[320px]'

/** L'occhio del ciclope si apre, sbatte e si guarda intorno, tra onde che si allargano. */
function WelcomeArt() {
  return (
    <div className="relative flex size-64 items-center justify-center">
      {[0, 1.2, 2.4].map((delay) => (
        <span key={delay} className="absolute inset-0 animate-ripple rounded-full border-[1.5px] border-accent/30" style={{ animationDelay: `${delay}s` }} />
      ))}
      <CyclopsEye opening look sclera="fill-ground" className="relative w-32" label="" />
    </div>
  )
}

const OUTING_TIMES = [300, 900, 1500, 2150]

/** Il riepilogo si compila riga per riga mentre il cronometro arriva a 30 secondi. */
function OutingArt() {
  const phase = usePhase(OUTING_TIMES)
  const seconds = useCount(30, 2100)
  const rows = [
    { icon: Clock, label: 'Oggi', value: <Pill tone="accent">10:00 – 11:30</Pill> },
    { icon: MapPin, label: 'Panettoni', value: <span className="text-[15px] text-ink-3">11 liberi</span> },
    { icon: UsersRound, label: 'Team e ospiti', value: <span className="text-[15px] text-ink-3">3 + 6</span> },
  ]
  return (
    <div className={ART}>
      <div className="mb-3 flex justify-end">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-row px-3 text-[15px] font-semibold">
          <Timer className="size-[18px] text-ink-2" strokeWidth={2} />
          0:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map(({ icon: Icon, label, value }, i) => (
          <div key={label} className={cn('flex h-14 items-center gap-3 rounded-2xl bg-row px-4', reveal(phase > i))}>
            <Icon className="size-[22px] shrink-0 text-ink-2" strokeWidth={1.75} />
            <span className="flex-1 text-[17px]">{label}</span>
            {value}
          </div>
        ))}
      </div>
      <div className={cn('mt-4 flex h-14 items-center justify-center gap-2 rounded-2xl bg-ink text-[17px] font-semibold text-white', phase > 3 ? 'animate-check' : 'opacity-0')}>
        <Check className="size-[18px]" strokeWidth={2.5} />
        Inviata
      </div>
    </div>
  )
}

const CAPACITY_TIMES = [350, 700, 1050, 2600]

/** Gli indicatori dei siti si riempiono; poi un altro diving prenota e uno cambia sotto gli occhi. */
function CapacityArt() {
  const phase = usePhase(CAPACITY_TIMES)
  const rows = [
    { id: 'panettoni', used: 14, mine: 6 },
    { id: 'faraglione-grande', used: phase > 3 ? 10 : 6, mine: 0 },
    { id: 'isola-lachea', used: 12, mine: 0 },
  ].flatMap((r) => {
    const site = getSite(r.id)
    return site ? [{ ...r, site }] : []
  })
  return (
    <div className={cn(ART, 'flex flex-col gap-2')}>
      {rows.map(({ site, used, mine }, i) => {
        const shown = phase > i
        return (
          <div key={site.id} className="rounded-2xl bg-row px-4 py-3.5">
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <span className="text-[17px] font-semibold">{site.name}</span>
              <CapacityLabel used={shown ? used : 0} capacity={site.capacity} short className={cn('transition-opacity duration-300', !shown && 'opacity-0')} />
            </div>
            <CapacityGauge used={shown ? used : 0} mine={shown ? mine : 0} capacity={site.capacity} />
          </div>
        )
      })}
    </div>
  )
}

/** Le persone del team compaiono una alla volta, poi il "+" invita ad aggiungerne. */
function TeamArt({ staff }: { staff: StaffMember[] }) {
  const groups = [
    { icon: GraduationCap, label: 'Istruttori', people: staff.filter((s) => s.role === 'istruttore') },
    { icon: UserRound, label: 'Guide', people: staff.filter((s) => s.role === 'guida') },
  ]
  let order = 0
  const delay = () => ({ animationDelay: `${200 + order++ * 130}ms` })
  return (
    <div className={cn(ART, 'flex flex-col gap-group')}>
      {groups.map(({ icon: Icon, label, people }) => (
        <section key={label}>
          <div className="mb-3 flex items-center gap-2.5">
            <Icon className="size-[22px] text-ink-2" strokeWidth={1.75} />
            <span className="flex-1 text-[17px] font-semibold">{label}</span>
            <span className="text-[15px] text-ink-3">{people.length || 'Nessuno'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {people.map((p) => (
              <span key={p.name} className="flex h-8 animate-rise items-center rounded-full bg-row-2 px-3 text-[15px] font-medium" style={delay()}>
                {p.name}
              </span>
            ))}
          </div>
        </section>
      ))}
      <span className="animate-rise self-start" style={delay()}>
        <span className="flex h-8 animate-nudge items-center gap-1 rounded-full border-[1.5px] border-dashed border-line-strong px-3 text-[15px] text-ink-3 [animation-delay:1.6s]">
          <Plus className="size-4" strokeWidth={2} />
          Aggiungi
        </span>
      </span>
    </div>
  )
}

const RECEIPT_TIMES = [900, 1000]

/** L'uscita parte, arriva la conferma "Invio confermato" e lo stato diventa verde. */
function ReceiptArt() {
  const phase = usePhase(RECEIPT_TIMES)
  return (
    <div className={cn(ART, 'flex flex-col gap-3')}>
      <div className={cn('flex items-center gap-3 rounded-2xl bg-night py-3 pr-4 pl-4 text-white shadow-[0_12px_30px_-12px_rgba(17,17,19,.6)]', phase > 0 ? 'animate-drop' : 'opacity-0')}>
        <CheckCircle2 className="size-[22px] shrink-0 text-ok-bright" strokeWidth={1.75} />
        <span className="min-w-0">
          <span className="block text-[15px] font-semibold">Invio confermato</span>
          <span className="block truncate text-[13px] text-night-3">AMP e Guardia Costiera · Panettoni, oggi</span>
        </span>
      </div>
      <div className="rounded-2xl bg-row p-4">
        <div className="flex items-center gap-3">
          <Sailboat className="size-[22px] shrink-0 text-ink-2" strokeWidth={1.75} />
          <span className="flex-1">
            <span className="block text-[17px] font-semibold">Panettoni</span>
            <span className="block text-[15px] text-ink-3">Oggi · 10:00 – 11:30</span>
          </span>
        </div>
        <div className="mt-3 pl-[34px]">
          {phase > 1 ? (
            <Status tone="ok" className="animate-check">
              Invio confermato
            </Status>
          ) : (
            <Status tone="neutral">Invio in corso</Status>
          )}
        </div>
      </div>
    </div>
  )
}
