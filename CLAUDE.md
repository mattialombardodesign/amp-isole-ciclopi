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
- `src/pages/` – una pagina per schermata
- `supabase/schema.sql` – tabelle, RLS, trigger capienza, realtime, dati di esempio

## Regole per l'agente
- Testi dell'interfaccia in italiano, tono semplice e cordiale.
- Il design system è descritto in `DESIGN.md`: struttura ispirata a Komoot
  (ogni uscita è una "scheda percorso" con mappa del sito, statistiche con
  icone e profilo di profondità, vedi `src/components/Tour.tsx`), palette
  "Blu di Prussia e ghiaccio". Usa i componenti di `ui.tsx` e i token
  (`accent`, `ice`, `ink`, `night`, `ok`/`warn`/`bad`…), niente colori
  esadecimali sparsi nelle pagine.
- Blu di Prussia (`accent`) per struttura e azioni, ghiaccio (`ice`) per ciò
  che è dell'operatore; verde/ambra/rosso solo per gli stati.
- Spaziature con i token di ruolo: `gutter`, `stack`, `group`, `section`.
- La capienza si mostra sempre con `CapacityGauge` (un segmento per subacqueo).
- La sezione Mappa (`src/pages/Mappa.tsx`) è congelata: resta con i colori
  precedenti tramite `.legacy-map` e `SiteMap tone="legacy"`. Non cambiarla.
- Per il design usa la skill Impeccable (`/impeccable`); contesto in `PRODUCT.md`.
- Ogni accesso ai dati passa da `api` (`src/lib/api`): se aggiungi un metodo,
  implementalo sia in `demo.ts` sia in `supabase.ts`.
- Lo schema dati è delicato: se cambi una tabella aggiorna `schema.sql`,
  `types.ts` e entrambe le implementazioni.
- La capienza dei siti è verificata lato server (trigger `check_capacity`):
  il controllo nel frontend è solo un aiuto per l'utente.
- Mai committare `.env` né chiavi API. Le chiavi su Vercel vanno nelle
  Environment Variables.
- Prima di consegnare: `npm run build` e `npm run lint` senza errori.

## Comandi
- `npm run dev` – sviluppo su http://localhost:5173
- `npm run build` – build di produzione in `dist/`
- `npm run lint` – oxlint
