-- =====================================================================
-- AMP Isole Ciclopi · schema del database
-- Da incollare in Supabase → SQL Editor → New query → Run.
-- =====================================================================

-- ---------- Profili (uno per ogni utente registrato) -----------------
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text,
  role        text not null default 'diving' check (role in ('diving', 'amp')),
  org_name    text not null default '',
  org_kind    text check (org_kind in ('subacquea', 'pesca', 'visite_barca')),
  onboarded   boolean not null default false,
  staff       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- Crea il profilo in automatico alla registrazione
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- true se l'utente collegato è personale AMP
create function public.is_amp() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'amp');
$$;

-- ---------- Siti di immersione --------------------------------------
create table public.dive_sites (
  id        text primary key,
  name      text not null,
  capacity  int  not null
);

insert into public.dive_sites (id, name, capacity) values
  ('panettoni',            'Panettoni',              20),
  ('faraglione-grande',    'Faraglione Grande',      15),
  ('isola-lachea',         'Isola Lachea',           12),
  ('secca-capo-mulini',    'Secca di Capo Mulini',   20),
  ('castello-acicastello', 'Scogliera del Castello', 25);

-- ---------- Uscite comunicate dai diving ----------------------------
create table public.bookings (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users on delete cascade default auth.uid(),
  org_name       text not null,
  activity_type  text not null check (activity_type in ('visita_guidata', 'sea_watching')),
  site_id        text not null references public.dive_sites (id),
  date           date not null,
  time_in        time not null,
  time_out       time not null,
  instructors    text[] not null default '{}',
  guides         text[] not null default '{}',
  guests         text[] not null default '{}',
  buoy           boolean not null,
  exit_mode      text not null check (exit_mode in ('terra', 'diporto')),
  status         text not null default 'inviata' check (status in ('inviata', 'presa_visione')),
  created_at     timestamptz not null default now(),
  check (time_out > time_in)
);

-- Il server rifiuta le prenotazioni che superano la capienza del sito
create function public.check_capacity() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  cap int;
  used int;
  requested int := cardinality(new.instructors) + cardinality(new.guides) + cardinality(new.guests);
begin
  if requested = 0 then
    raise exception 'Indica almeno un subacqueo.';
  end if;
  select capacity into cap from dive_sites where id = new.site_id;
  select coalesce(sum(cardinality(instructors) + cardinality(guides) + cardinality(guests)), 0)
    into used from bookings where site_id = new.site_id and date = new.date;
  if used + requested > cap then
    raise exception 'Posti esauriti: restano % posti su %.', greatest(cap - used, 0), cap;
  end if;
  return new;
end $$;

create trigger bookings_check_capacity
  before insert on public.bookings
  for each row execute function public.check_capacity();

-- Occupazione per sito (aggregata, senza esporre i dati degli altri diving)
create function public.site_occupancy(p_date date)
returns table (site_id text, used int)
language sql security definer stable set search_path = public as $$
  select site_id, sum(cardinality(instructors) + cardinality(guides) + cardinality(guests))::int
  from bookings where date = p_date group by site_id;
$$;

-- ---------- Segnalazioni --------------------------------------------
create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade default auth.uid(),
  org_name     text not null,
  category     text not null check (category in ('abusivismo', 'avvistamento', 'rifiuti', 'altro')),
  description  text not null,
  lat          double precision not null,
  lng          double precision not null,
  status       text not null default 'aperta' check (status in ('aperta', 'gestita')),
  created_at   timestamptz not null default now()
);

-- ---------- Richieste all'AMP ---------------------------------------
create table public.requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users on delete cascade default auth.uid(),
  org_name        text not null,
  kind            text not null check (kind in ('appuntamento', 'assistenza', 'rinnovo')),
  preferred_date  date,
  message         text not null,
  created_at      timestamptz not null default now()
);

-- =====================================================================
-- Sicurezza: Row Level Security
-- Ogni diving vede solo i propri dati, il personale AMP vede tutto.
-- =====================================================================
alter table public.profiles   enable row level security;
alter table public.dive_sites enable row level security;
alter table public.bookings   enable row level security;
alter table public.reports    enable row level security;
alter table public.requests   enable row level security;

create policy "profili: lettura"     on public.profiles for select using (id = auth.uid() or public.is_amp());
create policy "profili: modifica"    on public.profiles for update using (id = auth.uid());
-- il ruolo non è modificabile dall'app
revoke update on public.profiles from authenticated, anon;
grant update (org_name, org_kind, onboarded, staff) on public.profiles to authenticated;

create policy "siti: lettura"        on public.dive_sites for select to authenticated using (true);

create policy "uscite: lettura"      on public.bookings for select using (user_id = auth.uid() or public.is_amp());
create policy "uscite: inserimento"  on public.bookings for insert with check (user_id = auth.uid());
create policy "uscite: presa visione AMP" on public.bookings for update using (public.is_amp());
revoke update on public.bookings from authenticated, anon;
grant update (status) on public.bookings to authenticated;

create policy "segnalazioni: lettura"     on public.reports for select using (user_id = auth.uid() or public.is_amp());
create policy "segnalazioni: inserimento" on public.reports for insert with check (user_id = auth.uid());
create policy "segnalazioni: gestione AMP" on public.reports for update using (public.is_amp());
revoke update on public.reports from authenticated, anon;
grant update (status) on public.reports to authenticated;

create policy "richieste: lettura"     on public.requests for select using (user_id = auth.uid() or public.is_amp());
create policy "richieste: inserimento" on public.requests for insert with check (user_id = auth.uid());

-- =====================================================================
-- Realtime: la dashboard AMP riceve le nuove comunicazioni all'istante
-- =====================================================================
alter publication supabase_realtime add table public.bookings, public.reports, public.requests;

-- =====================================================================
-- Dati di esempio: uscite di altri diving, per riempire la dashboard
-- =====================================================================
insert into public.bookings
  (user_id, org_name, activity_type, site_id, date, time_in, time_out, instructors, guides, guests, buoy, exit_mode, status)
values
  (null, 'Ciclopi Sub', 'visita_guidata', 'panettoni', current_date, '09:00', '10:30',
   array['Salvo Grasso'], array['Rita Platania'], array['Luca Bianchi', 'Anna Testa', 'Paolo Mirabella', 'Giulia Ferro'], true, 'diporto', 'presa_visione'),
  (null, 'Lachea Diving Center', 'visita_guidata', 'isola-lachea', current_date, '10:00', '11:15',
   array['Nino Cardillo', 'Marta Leotta'], '{}', array['Tom Becker', 'Lea Schmidt', 'Hugo Martin', 'Chloé Martin', 'Ivo Pace', 'Sara Neri', 'Dario Vitale'], true, 'diporto', 'inviata'),
  (null, 'Blu Trezza Diving', 'sea_watching', 'castello-acicastello', current_date, '15:00', '16:30',
   '{}', array['Ciccio Russo'], array['Marco Aiello', 'Elisa Fichera', 'Bianca Rapisarda'], true, 'terra', 'inviata'),
  (null, 'Ciclopi Sub', 'visita_guidata', 'faraglione-grande', current_date + 1, '09:30', '11:00',
   array['Salvo Grasso'], '{}', array['Federico Sapienza', 'Laura Zappalà', 'Ugo Barbagallo'], true, 'diporto', 'inviata');

insert into public.reports (user_id, org_name, category, description, lat, lng, status) values
  (null, 'Lachea Diving Center', 'abusivismo', 'Imbarcazione ancorata su posidonia a nord di Lachea, nessun gavitello.', 37.5668, 15.1712, 'aperta'),
  (null, 'Ciclopi Sub', 'avvistamento', 'Tartaruga Caretta caretta in superficie vicino ai Panettoni.', 37.5588, 15.1675, 'gestita');

-- =====================================================================
-- Per rendere un account "personale AMP" (accesso alla dashboard):
--   update public.profiles
--   set role = 'amp', org_name = 'AMP Isole Ciclopi', onboarded = true
--   where email = 'la-tua-email-amp@esempio.it';
-- =====================================================================
