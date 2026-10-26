# Checklist · Supabase e Vercel (circa 15 minuti)

Da fare con calma, in ordine. Le chiavi non vanno mai incollate in chat né
su GitHub: solo nel file `.env` (in locale) e nelle Environment Variables di
Vercel.

## 1. Supabase (5 minuti)

1. Vai su [supabase.com](https://supabase.com) → **New project** (piano Free,
   regione Europa). Scegli una password del database e conservala.
2. **SQL Editor → New query**: incolla **tutto** `supabase/schema.sql` e premi
   **Run**. Deve finire con "Success. No rows returned".
   - Lo script si può rieseguire: riparte da zero e cancella i dati.
3. **Authentication → Sign In / Providers**: disattiva
   **Allow new users to sign up**. Il diving si registra negli uffici
   dell'AMP: gli account li crea l'AMP, nessuno si iscrive da solo.
4. **Project Settings → API**: copia **Project URL** e la chiave
   **anon / publishable**. Mai la chiave `service_role` o "secret".

## 2. Prova in locale (3 minuti)

1. Nella cartella del progetto copia `.env.example` in `.env` e incolla i due
   valori.
2. Riavvia `npm run dev` e apri http://localhost:5173. In basso al login non
   deve più comparire "Versione dimostrativa".
3. In Supabase, **Authentication → Users → Add user → Create new user**:
   crea un account **per ogni persona** (password di almeno 6 caratteri,
   con **Auto Confirm User** attivo): il titolare del diving, se vuoi un
   collaboratore, e l'account AMP, per esempio `amp@...`.
4. Nel **SQL Editor** collega le persone al diving, come farebbe l'AMP dopo
   la registrazione negli uffici. Il diving "Acitrezza Diving Center", con il
   suo team, lo crea già lo schema:

   ```sql
   update public.profiles
   set full_name = 'Giovanni Pappalardo', org_role = 'admin',
       org_id = (select id from public.organizations where name = 'Acitrezza Diving Center')
   where email = 'email-del-titolare@esempio.it';

   update public.profiles
   set full_name = 'Marco Russo', org_role = 'membro',
       org_id = (select id from public.organizations where name = 'Acitrezza Diving Center')
   where email = 'email-del-collaboratore@esempio.it';

   update public.profiles
   set role = 'amp', full_name = 'Staff AMP', onboarded = true
   where email = 'la-tua-email-amp@esempio.it';
   ```

5. Accedi con l'account del diving: parte l'onboarding di presentazione.
   Poi, in un'altra finestra, accedi con l'account AMP: si apre
   `/dashboard` con le uscite di esempio.

## 3. GitHub e Vercel (5 minuti)

1. Pubblica il repository su GitHub. `.env` è escluso da `.gitignore`;
   controlla comunque che non compaia tra i file.
2. Su [vercel.com](https://vercel.com): **Add New → Project**, importa il
   repository (preset Vite, impostazioni di default).
3. In **Environment Variables** aggiungi `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY` con gli stessi valori del `.env`.
4. **Deploy**. Se le variabili sono state aggiunte dopo il primo deploy,
   fai **Redeploy**: Vite le legge solo durante la build.
5. (Facoltativo) Supabase → **Authentication → URL Configuration → Site URL**:
   metti l'indirizzo di Vercel.

## 4. Prima della presentazione

- **Dati di esempio con la data di oggi:** le uscite di esempio prendono la
  data del momento in cui hai incollato lo schema. Se le hai incollate un
  altro giorno, aggiornale così:

  ```sql
  update public.bookings set date = current_date where user_id is null and site_id <> 'faraglione-grande';
  update public.bookings set date = current_date + 1 where user_id is null and site_id = 'faraglione-grande';
  ```

- **Due finestre affiancate:** a sinistra il telefono (account diving), a
  destra la centrale operativa (account AMP), in due browser o in una finestra
  anonima, così le sessioni non si mescolano.
- **Piano B:** se la rete o Supabase fanno i capricci, togli le variabili dal
  `.env` e riavvia: l'app torna in modalità demo e funziona tutto nel browser
  (in demo si entra con `diving@demo.it`, il titolare, o `marco@demo.it`,
  un collaboratore, e una password qualsiasi).

## Cosa sa fare il database (per rispondere alle domande)

- **Row Level Security:** ogni persona vede solo i dati del suo diving (uscite,
  segnalazioni e richieste sono del diving, con il nome di chi le ha
  inviate); il personale AMP vede tutto. Il team lo cambia solo l'admin;
  ruolo e diving non si possono cambiare dall'app.
- **Trigger `check_capacity`:** il server rifiuta le uscite oltre la capienza
  del sito. Blocca la riga del sito, così due invii nello stesso istante non
  superano il limite; le uscite annullate non contano.
- **Trigger `stamp_row`:** autore, nome del diving, stato e data li mette il
  server, non il telefono.
- **Realtime:** la centrale riceve uscite, segnalazioni e richieste
  all'istante. Il diving vede solo "Invio confermato": l'AMP non dà
  riscontri nell'app.

## Limiti noti

- Un diving non riceve in tempo reale le uscite degli **altri** diving, perché
  la sicurezza glielo vieta. I posti liberi si aggiornano quando riapre la
  schermata; il server blocca comunque chi supera la capienza.
- Se l'AMP non compila il team nella query, il diving lo aggiunge mentre
  crea la prima uscita (passo "Chi va in acqua?").
