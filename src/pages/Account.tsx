import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, GraduationCap, LayoutDashboard, LogOut, Mail, Plus, Presentation, RotateCcw, UserPlus, UserRound, X } from 'lucide-react'
import { api } from '@/lib/api'
import { resetDemo } from '@/lib/api/demo'
import { useAuth, useLive } from '@/lib/hooks'
import type { StaffMember } from '@/lib/types'
import { CyclopsEye } from '@/components/Logo'
import { Button, FlowHeader, InfoRow, List, NavRow, SectionHeading, Status } from '@/components/ui'

const ROLES: { role: StaffMember['role']; label: string; icon: ReactNode }[] = [
  { role: 'istruttore', label: 'Istruttori', icon: <GraduationCap /> },
  { role: 'guida', label: 'Guide', icon: <UserRound /> },
]

/**
 * Account: la persona collegata e lo spazio del suo diving. Ognuno entra con le
 * proprie credenziali (le crea l'AMP); il titolare è admin: gestisce il team
 * e chiede all'AMP gli accessi per i collaboratori.
 */
export default function Account() {
  const { profile, refresh } = useAuth()
  const navigate = useNavigate()
  const { data: members } = useLive(() => api.listMembers(), [])
  const isAdmin = profile?.org_role === 'admin'
  const staff = profile?.staff ?? []

  async function signOut() {
    await api.signOut()
    await refresh()
    navigate('/login')
  }

  async function restartDemo() {
    if (!window.confirm('Ricominciare la demo? I dati di prova vengono cancellati e si riparte dall’accesso.')) return
    resetDemo()
    await refresh()
    navigate('/login', { replace: true })
  }

  async function saveTeam(next: StaffMember[]) {
    await api.updateTeam(next)
    await refresh()
  }

  return (
    <div className="flex min-h-dvh flex-col pb-section">
      <FlowHeader onBack={() => navigate('/attivita')} label="Account" />
      <div className="animate-enter px-gutter pt-3">
        <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">{profile?.full_name || 'Il tuo account'}</h1>
        <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[15px] text-ink-3">
          {isAdmin ? <Status tone="accent">Admin</Status> : <Status>Membro</Status>}
          {profile?.org_name}
        </p>

        <section className="mt-section">
          <SectionHeading>Tu</SectionHeading>
          <List>
            <InfoRow icon={<Mail />} label="Email" value={profile?.email ?? ''} />
          </List>
          <p className="mt-3 text-[13px] leading-snug text-ink-3">Le tue credenziali sono personali: le ha create l'AMP per te.</p>
        </section>

        <section className="mt-section">
          <SectionHeading>Chi ha accesso al diving</SectionHeading>
          <List>
            {(members ?? []).map((m) => (
              <div key={m.id} className="flex min-h-14 items-center gap-3 px-4 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-row-2 text-[13px] font-semibold text-ink-2">
                  {initials(m.full_name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[17px]">{m.full_name}</span>
                  <span className="block truncate text-[13px] text-ink-3">
                    {m.email}
                    {m.id === profile?.id && ' · tu'}
                  </span>
                </span>
                {m.org_role === 'admin' && <Status tone="accent">Admin</Status>}
              </div>
            ))}
            {isAdmin && (
              <NavRow
                icon={<UserPlus />}
                title="Chiedi un accesso per un collaboratore"
                description="L'AMP crea le credenziali e le consegna alla persona"
                onClick={() => navigate('/amp/richiesta/accesso')}
              />
            )}
          </List>
          {!isAdmin && <p className="mt-3 text-[13px] leading-snug text-ink-3">Per aggiungere qualcuno chiedi all'admin del diving.</p>}
        </section>

        <section className="mt-section">
          <SectionHeading>Il team</SectionHeading>
          {isAdmin ? (
            <div className="flex flex-col gap-group">
              {ROLES.map(({ role, label }) => (
                <TeamEditor
                  key={role}
                  label={label}
                  names={staff.filter((s) => s.role === role).map((s) => s.name)}
                  onRemove={(name) => saveTeam(staff.filter((s) => !(s.name === name && s.role === role)))}
                  onAdd={(name) => {
                    if (!staff.some((s) => s.name === name)) saveTeam([...staff, { name, role }])
                  }}
                />
              ))}
            </div>
          ) : (
            <>
              <List>
                {ROLES.map(({ role, label, icon }) => (
                  <TeamRow key={role} icon={icon} label={label} names={staff.filter((s) => s.role === role).map((s) => s.name).join(', ') || 'Nessuno'} />
                ))}
              </List>
              <p className="mt-3 text-[13px] leading-snug text-ink-3">Il team del diving lo gestisce l'admin.</p>
            </>
          )}
        </section>

        <section className="mt-section">
          <SectionHeading>App</SectionHeading>
          <List>
            <InfoRow icon={<Database />} label="Dati" value={api.mode === 'demo' ? <Status tone="neutral">Demo nel browser</Status> : <Status tone="ok">Supabase</Status>} />
            <NavRow icon={<Presentation />} title="Rivedi la presentazione" description="Le schermate di benvenuto dell'app" onClick={() => navigate('/onboarding')} />
            {profile?.role === 'amp' && <NavRow icon={<LayoutDashboard />} title="Centrale operativa" onClick={() => navigate('/dashboard')} />}
            {api.mode === 'demo' && <NavRow icon={<RotateCcw />} title="Ricomincia la demo" description="Cancella i dati di prova e riparti dall'accesso" onClick={restartDemo} />}
          </List>
          <Button variant="secondary" size="lg" className="mt-3" onClick={signOut}>
            <LogOut className="size-[18px]" strokeWidth={2} /> Esci
          </Button>
        </section>

        <div className="mt-section flex items-center justify-center gap-2 text-[13px] text-ink-3">
          <CyclopsEye sclera="fill-ground" className="w-5" label="" />
          AMP Isole Ciclopi
        </div>
      </div>
    </div>
  )
}

/** "Giovanni Pappalardo" → "GP" */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

/** Ruolo con i nomi sotto, a tutta larghezza: i team lunghi vanno a capo senza schiacciare l'etichetta. */
function TeamRow({ icon, label, names }: { icon: ReactNode; label: string; names: string }) {
  return (
    <div className="flex min-h-14 items-start gap-3 px-4 py-3">
      <span className="mt-0.5 shrink-0 text-ink-2 [&>svg]:size-[22px] [&>svg]:stroke-[1.75]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[17px]">{label}</p>
        <p className="mt-0.5 text-[15px] leading-snug text-ink-3">{names}</p>
      </div>
    </div>
  )
}

/** Solo per l'admin: le persone di un ruolo come chip con la X e "+ Aggiungi" che diventa un campo. */
function TeamEditor({ label, names, onRemove, onAdd }: { label: string; names: string[]; onRemove: (name: string) => void; onAdd: (name: string) => void }) {
  const [adding, setAdding] = useState(false)
  const [value, setValue] = useState('')

  function commit() {
    const name = value.trim()
    if (name) onAdd(name)
    setValue('')
  }

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold">{label}</h3>
        <span className="text-[13px] text-ink-3">{names.length || 'Nessuno'}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {names.map((name) => (
          <span key={name} className="flex h-8 items-center gap-0.5 rounded-full bg-row-2 pr-1 pl-3 text-[15px] font-medium">
            {name}
            <button
              type="button"
              onClick={() => onRemove(name)}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full text-ink-2 hover:bg-line-strong"
              aria-label={`Togli ${name} dal team`}
            >
              <X className="size-3.5" strokeWidth={2.5} />
            </button>
          </span>
        ))}
        {adding ? (
          <input
            autoFocus
            className="h-8 w-44 rounded-full border-[1.5px] border-accent bg-transparent px-3 text-[15px] outline-none placeholder:text-ink-3 focus-visible:outline-none"
            placeholder="Nome e cognome"
            aria-label={`Aggiungi a ${label.toLowerCase()}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') setAdding(false)
            }}
            onBlur={() => {
              commit()
              setAdding(false)
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex h-8 cursor-pointer items-center gap-1 rounded-full border-[1.5px] border-dashed border-line-strong px-3 text-[15px] text-ink-3 transition-colors hover:border-ink-3 hover:text-ink"
          >
            <Plus className="size-4" strokeWidth={2} />
            Aggiungi
          </button>
        )}
      </div>
    </section>
  )
}
