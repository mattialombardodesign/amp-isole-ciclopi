# AMP Isole Ciclopi

Web app mobile-first per l'Area Marina Protetta Isole Ciclopi (Acitrezza, CT).
Nasce da un progetto UX/UI di un master (2023) e viene sviluppata in vibe coding
per l'esame finale del corso "Vibe Coding for Design" (NID, ott 2026).

## Il problema
Per ogni uscita in mare i diving devono mandare una mail con molti dati
(luogo, coordinate, orari, istruttori, guide, ospiti, pallone, modalità di uscita)
all'AMP e alla Guardia Costiera: circa 5 minuti, ogni volta. Gli attori
(Direzione, Guardia Costiera, lavoratori) non hanno uno strumento comune.

## La soluzione
- **App diving** (mobile): flusso guidato in ~30 secondi, con posti disponibili per sito.
- **Centrale operativa AMP** (`/dashboard`, desktop): riceve tutto in tempo reale.

## Stack
- Vite + React 19 + TypeScript, Tailwind CSS v4 (design tokens in `src/index.css`)
- React Router, Leaflet / react-leaflet (mappa OSM), lucide-react (icone)
- Supabase: Postgres, Auth, Realtime, Row Level Security
- Deploy su Vercel (`vercel.json` gestisce le rotte della SPA)
- Meteo-mare: Open-Meteo (gratuito, nessuna chiave)

## Struttura
- `src/lib/types.ts` – tipi e interfaccia `Api` (unico punto di accesso ai dati)
- `src/lib/api/demo.ts` – implementazione demo: localStorage + BroadcastChannel
- `src/lib/api/supabase.ts` – implementazione Supabase
- `src/lib/api/index.ts` – sceglie Supabase se ci sono le env, altrimenti demo
- `src/lib/sites.ts` – siti di immersione (id allineati a `dive_sites` in SQL)
- `src/lib/format.ts` – etichette, date, testo della comunicazione agli enti
- `src/components/ui.tsx` – componenti base (Button, List, ChoiceRow, Status, FlowHeader…)
- `src/components/CapacityGauge.tsx` – indicatore di capienza, firma visiva dell'app
- `src/components/Logo.tsx` – il logo, l'occhio del ciclope che sbatte (animazioni `.eye-*` in `index.css`)
- `src/components/TimePicker.tsx` – ruota degli orari (ore e quarti d'ora) per l'entrata in acqua, sempre indicativa
- `src/components/Weather.tsx` – meteo-mare attuale e previsioni per l'ora di entrata
- `src/pages/` – una pagina per schermata
- `supabase/schema.sql` – tabelle, RLS, trigger capienza, realtime, dati di esempio

## Regole per l'agente
- Testi dell'interfaccia in italiano, tono semplice e cordiale.
- Il design system è descritto in `DESIGN.md`: gusto dell'app Joi (iOS).
  Font di sistema Apple, scala 28 · 20 · 17 · 15 · 13, superfici quasi bianche,
  righe grigie piene (`bg-row`) senza bordi né ombre, pulsante principale nero,
  colore in piccole dosi. Usa i componenti di `ui.tsx` e i token
  (`ink`, `row`, `accent`, `night`, `ok`/`warn`/`bad`…), niente colori
  esadecimali sparsi nelle pagine.
- Blu (`accent`) solo per ciò che è selezionato o attivo, per "i tuoi
  subacquei" e per i link nel testo ("Modifica"). "Indietro", frecce e
  "Chiudi" in grigio scuro. Il pulsante principale resta nero.
- L'AMP non dà riscontri nell'app: lato diving ogni comunicazione inviata è
  solo "Invio confermato" (verde), mai "Ricevuta", "In attesa" o "Vista". "Presa visione" e
  "Segna gestita" restano strumenti interni della centrale.
- Un colore per stato: verde "Invio confermato" e "Vista/Gestita" (solo centrale),
  ambra solo per gli avvisi (mare mosso, sito quasi pieno), rosso per i
  blocchi, grigio per le informazioni.
- Icone lucide in grigio scuro (`ink-2`): 22px/1.75 a sinistra di righe e
  campi, 18px/2 dentro pulsanti e chip, 16px per le frecce. Un'icona per
  concetto: vedi l'elenco in DESIGN.md.
- Se un pulsante è disattivato, `BottomAction hint` spiega cosa manca.
- Spaziature con i token di ruolo: `gutter`, `stack`, `group`, `section`.
- La capienza si mostra sempre con `CapacityGauge` (un segmento per subacqueo).
- La sezione Mappa segue lo stesso stile, ma funzioni, comportamento e
  componenti non vanno cambiati.
- Per il design usa la skill Impeccable (`/impeccable`); contesto in `PRODUCT.md`.
- Ogni accesso ai dati passa da `api` (`src/lib/api`): se aggiungi un metodo,
  implementalo sia in `demo.ts` sia in `supabase.ts`.
- Lo schema dati è delicato: se cambi una tabella aggiorna `schema.sql`,
  `types.ts` e entrambe le implementazioni.
- La capienza dei siti è verificata lato server (trigger `check_capacity`):
  il controllo nel frontend è solo un aiuto per l'utente. Le uscite
  annullate non occupano posti.
- Autore, nome del diving, stato e data delle nuove righe li imposta il
  server (trigger `stamp_row`): il client non li manda.
- Sea watching = snorkeling, cioè balneazione (DM 9/11/2004, art. 3): niente
  sito né capienza, un punto libero sulla mappa (`lat`/`lng`, `site_id` null),
  chi accompagna e il numero di partecipanti (`participants`), senza nomi.
  In zona A si avvisa (solo aree segnalate di Lachea), senza bloccare.
- L'app è solo per i diving, che si registrano negli uffici dell'AMP: niente
  registrazione dall'app. Ogni persona ha credenziali proprie (le crea l'AMP)
  e appartiene a un diving (`organizations`) come `admin` (il titolare) o
  `membro`. Uscite, segnalazioni e richieste sono del diving (`org_id`,
  con `author_name`): le vedono tutti i suoi membri. Il team lo cambia solo
  l'admin (`api.updateTeam`); gli altri aggiungono nomi solo all'uscita.
- Mai committare `.env` né chiavi API. Le chiavi su Vercel vanno nelle
  Environment Variables.
- Prima di consegnare: `npm run build` e `npm run lint` senza errori.

## Comandi
- `npm run dev` – sviluppo su http://localhost:5173
- `npm run build` – build di produzione in `dist/`
- `npm run lint` – oxlint
