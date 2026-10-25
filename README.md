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
Per vedere il tempo reale apri due schede: in una "Entra come diving", nell'altra
"Entra come AMP".

## Collegare Supabase

1. Crea un progetto su [supabase.com](https://supabase.com) (piano Free).
2. **SQL Editor → New query**: incolla tutto `supabase/schema.sql` e premi **Run**.
3. **Authentication → Sign In / Providers → Email**: disattiva *Confirm email*
   (per la demo evita la conferma via mail).
4. **Project Settings → API**: copia *Project URL* e *anon / publishable key*.
5. Copia `.env.example` in `.env` e incolla i due valori.
6. Riavvia `npm run dev`, registra due account (uno per il diving, uno per l'AMP)
   e rendi "AMP" il secondo dal SQL Editor:

   ```sql
   update public.profiles
   set role = 'amp', org_name = 'AMP Isole Ciclopi', onboarded = true
   where email = 'la-tua-email-amp@esempio.it';
   ```

## Deploy su Vercel

1. Pubblica il repository su GitHub (il file `.env` è escluso da `.gitignore`).
2. Su Vercel: **Add New → Project**, importa il repository (preset Vite).
3. In **Environment Variables** aggiungi `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. **Deploy**. A ogni push su `main` Vercel rifà build e deploy da solo.
