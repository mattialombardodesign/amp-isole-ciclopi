# Scaletta · presentazione d'esame (6 minuti)

Lunedì 26 ottobre, ore 19:00. Condivisione schermo con due finestre
affiancate: a sinistra il telefono (diving), a destra la centrale operativa
(AMP).

## 0:00 – 0:45 · Il problema

- Progetto del master 2023 per l'AMP Isole Ciclopi.
- Per ogni uscita in mare un diving manda una mail all'AMP e alla Guardia
  Costiera (luogo, coordinate, orari, istruttori, guide, ospiti, pallone,
  modalità di uscita): **circa 5 minuti, ogni volta**.
- Nessuno strumento comune e nessun limite reale di persone per sito.

## 0:45 – 3:15 · Demo dal vivo

1. **Accesso e onboarding** (25 s): si entra con credenziali personali
   (Giovanni, il titolare, è admin del diving; Marco è un collaboratore e
   vede le stesse uscite), date
   dall'AMP (il diving si registra negli uffici). Il logo, l'occhio del
   ciclope, sbatte; cinque schermate animate raccontano l'app (scorri con le
   frecce della tastiera).
2. **Oggi** (15 s): il pannello scuro della prossima uscita e l'indicatore di
   capienza, un segmento per subacqueo (i tuoi in blu).
3. **Nuova attività** (60 s, il cuore):
   - Cosa fai? Immersione (con le bombole) o sea watching (snorkeling).
   - Quando esci? Niente di preselezionato; l'uscita dall'acqua si calcola
     da sola; compaiono le previsioni del mare per quell'ora.
   - Dove ti immergi? La mappa con i siti e i posti liberi.
   - Team già pronto dall'ultima uscita, pallone e accesso, riepilogo.
   - Invia: **30 secondi invece di 5 minuti**.
4. **Tempo reale** (30 s): appena invii, a sinistra compare "Invio
   confermato" e a destra la centrale mostra l'uscita con un avviso, già con
   il testo per gli enti. L'AMP non deve rispondere: al diving basta sapere
   che l'invio è andato a buon fine.
5. **Modifica o annulla** (20 s): annulla l'uscita e la centrale la vede
   grigia, con i posti di nuovo liberi.
6. **Segnala** (15 s): posizione sulla mappa e scorciatoia al 1530 per le
   emergenze.

## 3:15 – 5:30 · Come ho lavorato con l'AI

- **Metodo del corso:** Claude Code come agente; Git e GitHub; Supabase
  (Postgres, login, realtime, sicurezza per riga); Vercel per il deploy.
- **CLAUDE.md:** le regole del progetto (lingua, design system, sicurezza
  delle chiavi) che l'agente rilegge a ogni passo.
- **Il design come conversazione:** sei direzioni provate con anteprime HTML
  prima di toccare il codice (Komoot, Apple Fitness, Nike Run Club…), fino
  al gusto di Joi. Mostra una o due anteprime da `.impeccable/mocks/`.
- **Skill Impeccable:**
  - un revisore indipendente che boccia e fa correggere (pattern
    *reflection*);
  - un rilevatore automatico di errori di design, arrivato a 0;
  - DESIGN.md scritto in automatico.
- **MCP:** Mobbin per vedere le schermate vere delle app di riferimento.
- **Agenti in parallelo:** mentre io rifinivo i flussi, un secondo agente
  controllava il database e trovava problemi reali, poi corretti: accessi
  simultanei che superavano la capienza, campi falsificabili dal telefono,
  registrazione mancante.
- **Ricerca sulle regole vere:** per il sea watching l'agente ha letto il
  decreto istitutivo dell'AMP (DM 9 novembre 2004). Lo snorkeling è
  "balneazione", quindi il flusso è più leggero: punto libero, quanti sono,
  nessuna capienza; in zona A l'app avvisa che si può solo nelle aree
  segnalate di Isola Lachea.
- **Il feedback cambia il prodotto:** la mattina dell'esame ho tolto la
  registrazione dall'app (i diving si registrano negli uffici) e ho
  trasformato l'onboarding in una presentazione animata.
- **Il mio ruolo:** decidere direzione, gusto e priorità; l'AI esegue,
  propone e verifica.

## 5:30 – 6:00 · Chiusura

- Da 5 minuti a 30 secondi, con la capienza dei siti rispettata dal server.
- Prossimi passi: test con 2–3 diving di Acitrezza; notifiche push; foto
  nelle segnalazioni.

## Prima di iniziare

- [ ] Dati di esempio con la data di oggi (vedi la checklist Supabase).
- [ ] Account diving e AMP già creati; le due finestre già aperte e loggate.
- [ ] La centrale aperta a destra, per mostrare l'uscita che arriva dal vivo.
- [ ] Piano B: la modalità demo in locale (`npm run dev` senza `.env`).
