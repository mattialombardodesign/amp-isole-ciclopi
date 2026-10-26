# AMP Isole Ciclopi · storia del progetto

Diario di lavoro dell'app sviluppata in vibe coding con Claude Code per
l'esame finale del corso **Vibe Coding for Design** (NID, set–ott 2026),
presentazione di **lunedì 26 ottobre 2026 alle 19:00**. Aggiornato alla notte tra il 25 e il 26 ottobre.

---

## 1. Da dove nasce

- **Progetto di partenza:** app UX/UI progettata durante un master (2023)
  per l'**Area Marina Protetta Isole Ciclopi** (Acitrezza, Catania).
- **Problema:** per ogni uscita in mare i diving devono mandare una mail
  all'AMP e alla Guardia Costiera con luogo e coordinate, data, orari di
  ingresso e uscita, istruttori, guide, ospiti, pallone di segnalazione e
  modalità di uscita. Servono circa **5 minuti** ogni volta, e gli attori
  (Direzione, Guardia Costiera, operatori) non hanno uno strumento comune.
- **Ricerca del master:** 9 interviste 1:1, 48 ore di analisi dei
  processi, 8 app di altre aree marine analizzate. Ne sono usciti tre
  insight: comunicazione con gli enti lenta, nessun sistema ufficiale di
  segnalazione, attori scollegati.
- **Soluzione:** un flusso guidato da **circa 30 secondi** che arriva a tutti
  in tempo reale, con i **posti limitati per sito** a tutela dell'habitat.

## 2. Cosa chiedeva il corso (dalle dispense)

- **Requisiti della presentazione:** 5–7 minuti; mostrare il risultato in
  condivisione schermo e raccontare come si è collaborato con l'AI.
- **Stack "professionale" della lezione 5:** IDE/agente (Claude Code) +
  Git/GitHub + Vercel, con build e deploy automatici a ogni push.
- **Backend della lezione 6:** Supabase (Postgres, Auth). Regola: il file
  `.env` non va mai su GitHub; le chiavi vanno nelle Environment Variables
  di Vercel.
- **Altri concetti usati:**
  - **Prompt RACE e meta-prompting** (lezione 2);
  - **CLAUDE.md** (lezioni 2 e 3);
  - **MCP, tool e skill** (lezioni 7 e 9);
  - **pattern agentici** (lezione 8): planning, reflection, routing, tool use.

## 3. Cosa è stato costruito

### Stack
- React 19 + Vite + TypeScript, Tailwind CSS v4 (token di design in `src/index.css`).
- React Router, Leaflet / OpenStreetMap per le mappe, icone lucide.
- **Livello dati con due modalità** (`src/lib/api`):
  - **Demo:** i dati restano nel browser (localStorage) e le schede aperte
    si sincronizzano in tempo reale (BroadcastChannel). Funziona senza
    alcun account.
  - **Supabase:** si attiva da sola quando nel `.env` ci sono
    `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- `supabase/schema.sql` è pronto da incollare nel SQL Editor. Contiene:
  - tabelle (profili, siti, uscite, segnalazioni, richieste);
  - **Row Level Security** (ogni diving vede solo i propri dati, l'AMP vede tutto);
  - un **trigger lato server** che rifiuta le prenotazioni oltre la capienza del sito;
  - funzione di occupazione aggregata, realtime e dati di esempio.
- Meteo e temperatura del mare reali da Open-Meteo (gratuito, senza chiavi).
- `vercel.json` per le rotte della single page app.

### Funzioni
- **Accesso:** solo per i membri del diving, con email e password. In demo:
  `diving@demo.it` e una password qualsiasi; un'email mai usata crea un
  diving nuovo e fa partire l'onboarding.
- **Onboarding:** "Di cosa ti occupi?", il nome dell'attività e le quattro sezioni dell'app.
- **Oggi:**
  - pannello scuro della prossima uscita, con lo stato di lettura da parte
    dell'AMP e l'**indicatore di capienza** (un segmento per subacqueo, i
    tuoi in blu);
  - pulsante "Nuova uscita", uscite in programma e passate, altre attività.
- **Nuova uscita in 5 step:**
  1. Quando esci?
  2. Dove ti immergi? (mappa e posti per sito)
  3. Chi va in acqua?
  4. Pallone e accesso al sito
  5. Controlla e invia

  Inoltre:
  - valori predefiniti presi dall'ultima uscita e bozza salvata se si chiude l'app;
  - pallone obbligatorio nelle zone A e B;
  - "Modifica" che torna al riepilogo;
  - errori comprensibili, come "il sito si è riempito mentre compilavi".
- **Dettaglio uscita:** cronologia (inviata, presa visione), dati con icone,
  il **testo della comunicazione agli enti generato automaticamente** (è la
  vecchia mail) e il pulsante "Copia".
- **Segnala:** abusivismo, avvistamenti, rifiuti, altro, con la posizione
  sulla mappa (GPS o tocco) e una descrizione. Se il GPS non risponde la
  posizione resta vuota, invece di finire in un punto sbagliato.
- **Mappa:** siti con posti liberi, zone di tutela, meteo-mare. Il pannello
  del sito ha il pulsante "Nuova uscita qui".
- **AMP:**
  - appuntamento con un esperto, assistenza (con il link al 1530 della
    Guardia Costiera), rinnovo dell'autorizzazione;
  - profilo ed "Esci".
- **Centrale operativa AMP** (`/dashboard`, desktop, raggiungibile con
  `amp@isoleciclopi.it`):
  - uscite del giorno in tempo reale, con notifica e evidenziazione quando ne arriva una nuova;
  - "Presa visione", segnalazioni e richieste;
  - mappa e tabella della capienza dei siti.

## 4. Il percorso di design (iterazioni)

| # | Direzione | Esito |
|---|---|---|
| 1 | Prima versione ispirata alle schermate del master (blu acceso, gradienti, illustrazioni) | Funzionante, ma "senza personalità" |
| 2 | **Impeccable**: standard di categoria (riferimenti Strava/Garmin, Revolut/Linear), font Geist | Pulita, ma piatta |
| 3 | Anteprime: "Ionio al tramonto", Apple Fitness, Komoot + Ionio, tre blu eleganti | Scartate o rifinite |
| 4 | Struttura Komoot + palette Blu di Prussia e ghiaccio | Applicata, poi scartata ("non mi piace per niente") |
| 5 | Anteprima Nike Run Club scura | Scartata |
| 6 | **Joi (iOS) come riferimento di gusto**, applicato alla versione 2 | **Scelta attuale** |

**Stile attuale (Joi):**
- **Tipografia:** font di sistema Apple (SF Pro), scala 28 · 20 · 17 · 15 · 13.
- **Superfici:** fondo quasi bianco, righe grigie piene senza bordi né ombre.
- **Colori:**
  - pulsante principale nero;
  - blu solo per ciò che è selezionato o attivo, per "i tuoi subacquei" e per i link nel testo;
  - un colore per stato (ambra in attesa, verde visto/gestito, rosso blocco).
- **Icone:** lucide in grigio scuro, con dimensioni standard e un'icona per concetto.
- La **Mappa** segue lo stile, ma funzioni, comportamento e componenti non vanno cambiati.

**Ultime rifiniture (26 ottobre):**
- "Quando esci?": nessun valore preselezionato; giorno, entrata e tempo in
  acqua con lo stesso schema (etichetta, valore scelto, chip su griglia),
  "Altro" per l'orario preciso, uscita calcolata da sola.
- "Dove ti immergi?": mappa più grande con i nomi dei siti; righe compatte
  su una linea.
- Demo azzerata (si riparte da accesso e onboarding) e voce "Ricomincia la
  demo" nel profilo AMP.

**Notte prima dell'esame:** modifica, annullamento e ripetizione delle
uscite, avvisi in tempo reale per il diving, previsioni del mare, dettaglio
delle segnalazioni, onboarding con il team, registrazione e un backend
controllato da un agente separato. Dettagli in `docs/resoconto-notte.md`.

**Mattina dell'esame (feedback):** il diving si registra negli uffici
dell'AMP, quindi dall'app si accede soltanto con le credenziali ricevute
(niente "Registralo"). Spariscono anche le domande sul tipo di attività
(l'app è solo per i diving) e sul team (arriva dalla registrazione). Al loro
posto c'è un onboarding di presentazione in 5 schermate animate. Nuovo
logo: l'occhio del ciclope, nel blu del brand, che sbatte e si guarda
intorno.
Secondo giro di feedback: nomi dei siti come titoli dei pin sulla mappa,
orario di entrata con una ruota (sempre "circa", perché in mare non è mai
preciso), chip più piccole (32 px), spaziature uniformate su 12 · 24 ·
32 px, "Modifica" con la matita e il testo per gli enti ben visibile nel
riepilogo.
Terzo giro: l'AMP non dà mai riscontri, quindi lato diving niente più "In
attesa" o "Vista dall'AMP" né avvisi di presa visione. Ogni comunicazione
inviata mostra solo "Invio confermato" (non "Ricevuta", che farebbe pensare
a una lettura da parte dell'AMP); "Presa visione" resta uno strumento
interno della centrale.
Account: nella home c'è solo un'icona in alto a destra che apre la pagina
Account (diving, team, impostazioni, "Rivedi la presentazione", "Esci");
la scheda AMP resta dedicata alle richieste.
Ultimi ritocchi: tolto il rinnovo dell'autorizzazione (anche dal
database); il pulsante principale diventa "Nuova attività" e il flusso
parte da "Cosa fai?": immersione (con le bombole) o sea watching
(snorkeling). "In programma" mostra al massimo 3 uscite, poi "Altre N".
Sea watching ripensato con le regole vere: il decreto istitutivo dell'AMP
(DM 9 novembre 2004) definisce lo snorkeling "balneazione", consentita in
zona B e C e in zona A solo nelle aree segnalate di Isola Lachea. Quindi
niente capienza né nomi: un punto libero sulla mappa, chi accompagna,
quanti partecipanti, accesso e boa in un solo step (5 step invece di 6).
Il database ha ora `lat`, `lng` e `participants` sulle uscite.
Persone e spazio del diving: ognuno entra con credenziali personali e
appartiene al diving come admin (il titolare) o membro. Uscite, segnalazioni
e richieste sono del diving, con il nome di chi le ha inviate; l'admin
gestisce il team e chiede all'AMP gli accessi per i collaboratori. Nuove
tabella `organizations` e regole di sicurezza per diving.

## 5. Come abbiamo usato l'AI (per il racconto all'esame)

- **Lettura delle dispense** (9 PDF) per allineare stack e metodo al corso.
- **Claude Code** come agente: progettazione, codice, test nel browser
  integrato, build e lint a ogni passo.
- **CLAUDE.md** con le regole del progetto: lingua, design system,
  sicurezza delle chiavi, livello dati unico.
- **Skill Impeccable** (`npx impeccable install`):
  - `PRODUCT.md` (contesto di prodotto) e la scelta della direzione con il "dado";
  - un **contratto di direzione**;
  - un **revisore indipendente**: un agente separato che giudica gli
    screenshot e restituisce un verdetto fix/ship;
  - un **documentatore** che scrive `DESIGN.md`;
  - un **rilevatore automatico** di anti-pattern (arrivato a 0 avvisi);
  - una **critica UX** con punteggio euristico (24/40 → tutte le correzioni applicate).
- **Connettore Mobbin (MCP)** per guardare le schermate reali di Nike Run
  Club e Joi, invece di andare a memoria.
- **Pattern agentici in pratica:**
  - planning (piano a step visibile);
  - reflection (revisore che boccia e fa correggere);
  - parallelization (revisore e documentatore insieme);
  - tool use (browser, Mobbin, Open-Meteo).
- **Anteprime HTML** per decidere la direzione prima di toccare il codice.

## 6. File importanti

| File | Cosa contiene |
|---|---|
| `README.md` | Avvio, collegamento Supabase, deploy su Vercel |
| `CLAUDE.md` | Regole per l'agente |
| `PRODUCT.md` | Contesto di prodotto (utenti, scopo, vincoli) |
| `DESIGN.md` | Design system attuale (token, componenti, regole su colori e icone) |
| `supabase/schema.sql` | Database, sicurezza, trigger capienza, realtime |
| `.impeccable/mocks/` | Le anteprime HTML delle direzioni provate |
| `src/` | Codice dell'app |

## 7. Stato e prossimi passi

- **Git:**
  - commit `fe86808` = punto di ripristino con la versione Komoot/Prussia;
  - la versione Joi e i miglioramenti UX successivi non sono ancora committati.
- **Da fare per la demo online:**
  1. Creare il progetto Supabase, incollare `supabase/schema.sql`,
     disattivare le registrazioni pubbliche, creare gli account dal
     pannello (un diving e uno AMP) e completarli con le query in fondo
     allo schema.
  2. Mettere URL e chiave in `.env` (in locale) e nelle Environment Variables di Vercel.
  3. Pubblicare su GitHub e importare il repository su Vercel.
- **Avvio in locale:** `npm run dev`, poi http://localhost:5173. Node.js è
  installato in `~/.local/node` ed è già nel PATH del Terminale.
