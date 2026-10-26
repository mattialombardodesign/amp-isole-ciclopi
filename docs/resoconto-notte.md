# Resoconto della notte (25 → 26 ottobre)

Tutto è nella cartella del progetto e **non è ancora committato**. Build, lint
e il rilevatore di Impeccable sono puliti. Ho provato i flussi principali nel
browser a misura di telefono e, in parallelo, la centrale operativa.

## Funzioni nuove

| Funzione | Dove | Cosa fa |
|---|---|---|
| **Modifica uscita** | Dettaglio uscita → Modifica l'uscita | Riapre il flusso sul riepilogo con tutti i dati; "Invia la modifica" la rimanda all'AMP, che la ritrova "In attesa". La centrale riceve l'avviso "Uscita modificata". |
| **Annulla uscita** | Dettaglio uscita → Annulla l'uscita | Conferma in linea, poi stato "Annullata" (grigio). I posti tornano liberi; la centrale riceve "Uscita annullata" e il testo per gli enti diventa una comunicazione di annullamento. |
| **Ripeti uscita** | Dettaglio uscita → Ripeti questa uscita | Stesso sito e stesso team: chiede solo giorno e orari, poi va al riepilogo. |
| **Avvisi in tempo reale per il diving** | Ovunque nell'app | Quando l'AMP prende visione di un'uscita o gestisce una segnalazione o una richiesta, compare in alto un avviso scuro; toccandolo si apre l'elemento. |
| **Previsioni del mare** | Nuova uscita (orari e riepilogo) | Onde, vento e temperatura dell'acqua all'ora di entrata (Open-Meteo). Se il mare è mosso diventa ambra: "valuta di rimandare". |
| **Dettaglio segnalazione** | Segnala → una segnalazione | Stato, cronologia, mappa centrata sul punto, coordinate. |
| **Richieste gestite** | Centrale → Richieste | "Segna gestita"; il diving vede lo stato aggiornato e riceve l'avviso. |
| **Registrazione** | Accesso → "Registralo" | Serve per Supabase: prima si poteva solo accedere. |

## Flussi rivisti

- **Onboarding in 3 step:** di cosa ti occupi, **chi lavora con te** (nuovo:
  istruttori e guide, che servono davvero con Supabase), ecco cosa puoi fare.
  Ogni step ha il suggerimento su cosa manca.
- **Segnala:**
  - stesso schema di "Nuova uscita" (titolo, contesto, suggerimenti);
  - categorie con descrizione;
  - posizione in due righe chiare, coordinate più "Usa la mia posizione";
  - per la pesca abusiva, la scorciatoia "Sta succedendo adesso? Chiama il 1530";
  - stato vuoto quando non ci sono segnalazioni.
- **Richieste all'AMP:** titolo con riga di contesto; la riga di emergenza è
  ora un componente condiviso.
- **Componenti nuovi riusati ovunque:** `FlowTitle`, `Timeline`,
  `EmergencyCall`, `ForecastRow`, `DivingNotifier`.
- **Centrale operativa:**
  - uscite annullate in grigio, escluse dai conteggi e dalla capienza;
  - "Segna gestita" con lo stesso stile di "Presa visione".

## Backend (pronto per Supabase)

Un agente separato ha controllato schema e codice Supabase. Poi ho corretto
`supabase/schema.sql` e `src/lib/api/supabase.ts`:

- **Capienza:**
  - il trigger blocca la riga del sito, così due invii contemporanei non
    superano il limite;
  - non conta le uscite annullate né, in modifica, l'uscita stessa;
  - la "presa visione" non viene ricontrollata.
- **Dati non falsificabili:** autore, nome del diving, stato e data li
  imposta il server (trigger `stamp_row`).
- **Modifica e annullamento sicuri:**
  - il diving può modificare o annullare solo le proprie uscite, mai segnarle
    come viste;
  - se modifica un'uscita già vista, torna "inviata" (trigger
    `booking_changed`).
- **Richieste:** nuova colonna di stato, gestibile solo dall'AMP.
- **Script e permessi:**
  - lo script si può rieseguire (riparte da zero);
  - permessi di base espliciti;
  - crea i profili per eventuali account già esistenti.
- **Codice Supabase:**
  - messaggi di accesso in italiano;
  - link rotti a un'uscita gestiti senza errori;
  - niente `crypto.randomUUID` dove non funziona (telefono in rete locale).
- **Verifica:** ho fatto leggere lo schema al parser ufficiale di Postgres,
  comprese le funzioni: è valido. Il collegamento vero si prova domani.

## La demo è stata azzerata

Al prossimo avvio la demo riparte da zero: accesso, poi onboarding. Per
rifarlo in qualsiasi momento: **Account (icona in alto a destra nella home) → Ricomincia la demo**.

## Da fare oggi

1. Leggere questo resoconto e provare l'app (`npm run dev`).
2. Seguire `docs/checklist-supabase-vercel.md` (circa 15 minuti).
3. Rivedere `docs/scaletta-presentazione.md` e provarla una volta a voce.
4. Commit e push (quando vuoi, te lo preparo io).

## Aggiornamento del mattino (dopo il tuo feedback)

- **Niente registrazione dall'app:** si accede solo con le credenziali date
  dall'AMP. "Registralo" e `signUp` sono stati tolti; su Supabase gli account
  si creano dal pannello (vedi la checklist).
- **Onboarding nuovo:** niente tipo di attività né team da compilare. Cinque
  schermate animate presentano l'app: benvenuto, uscita in 30 secondi, posti
  liberi, team già pronto, risposta dell'AMP.
- **Logo:** l'occhio del ciclope nel blu del brand. Sbatte, si guarda
  intorno ed è su accesso, onboarding, caricamento, centrale e favicon.
- Le righe "Registrazione" e "Onboarding in 3 step" qui sopra non valgono
  più.
- **L'AMP non dà riscontri:** lato diving ogni comunicazione è solo
  "Invio confermato". Gli "Avvisi in tempo reale per il diving" e gli stati "In
  attesa / Vista / Gestita" sul telefono sono stati tolti; "Presa visione" e
  "Segna gestita" restano nella centrale come strumenti interni.

## Cose che non ho toccato

- Le coordinate di Faraglione Grande, che zoomando sembrano un po' spostate:
  cambiarle vuol dire toccare i dati dei siti, quindi decidi tu.
- La pagina Mappa: solo stile, come da regola.
