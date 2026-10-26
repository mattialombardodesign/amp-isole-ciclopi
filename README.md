# AMP Isole Ciclopi

App per comunicare le uscite in mare all'Area Marina Protetta Isole Ciclopi
e alla Guardia Costiera in 30 secondi invece di 5 minuti, con una centrale
operativa che riceve tutto in tempo reale.

- **App diving** (mobile): `/attivita`, `/segnala`, `/mappa`, `/amp`
- **Centrale operativa AMP** (desktop): `/dashboard`

## Avvio in locale

```bash
npm install
npm run dev
```

Senza configurazione l'app parte in **modalità demo**: i dati restano nel browser.
Si accede come titolare del diving (admin) con `diving@demo.it`, o come
collaboratore con `marco@demo.it`, e una password qualsiasi
(alla prima volta si vede l'onboarding di presentazione).
Per ripartire da zero: **Account (icona in alto a destra nella home) → Ricomincia la demo**.
La centrale operativa AMP resta raggiungibile su `/dashboard` accedendo con
`amp@isoleciclopi.it`.

## Collegare Supabase

1. Crea un progetto su [supabase.com](https://supabase.com) (piano Free).
2. **SQL Editor → New query**: incolla tutto `supabase/schema.sql` e premi **Run**.
3. **Authentication → Sign In / Providers**: disattiva *Allow new users to sign up*.
   Il diving si registra negli uffici dell'AMP: gli account li crea l'AMP.
4. **Project Settings → API**: copia *Project URL* e *anon / publishable key*.
5. Copia `.env.example` in `.env` e incolla i due valori.
6. **Authentication → Users → Add user** (con *Auto Confirm User*): crea un
   account per il diving e uno per l'AMP. Nome del diving e team si
   impostano con la query in fondo a `schema.sql`; rendi "AMP" il secondo:

   ```sql
   update public.profiles
   set role = 'amp', org_name = 'AMP Isole Ciclopi', onboarded = true
   where email = 'la-tua-email-amp@esempio.it';
   ```

La guida passo passo per il giorno della demo è in `docs/checklist-supabase-vercel.md`.

## Deploy su Vercel

1. Pubblica il repository su GitHub (il file `.env` è escluso da `.gitignore`).
2. Su Vercel: **Add New → Project**, importa il repository (preset Vite).
3. In **Environment Variables** aggiungi `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. **Deploy**. A ogni push su `main` Vercel rifà build e deploy da solo.
