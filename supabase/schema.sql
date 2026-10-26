-- =====================================================================
-- AMP Isole Ciclopi · schema del database
-- Da incollare in Supabase → SQL Editor → New query → Run.
-- Si può rieseguire: il blocco qui sotto riparte da zero.
-- ATTENZIONE: rieseguendolo si cancellano uscite, segnalazioni e richieste.
-- =====================================================================

drop table if exists public.requests, public.reports, public.bookings, public.dive_sites, public.profiles, public.organizations cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_amp() cascade;
drop function if exists public.my_org() cascade;
drop function if exists public.is_org_admin() cascade;
drop function if exists public.check_capacity() cascade;
drop function if exists public.stamp_row() cascade;
drop function if exists public.booking_changed() cascade;
drop function if exists public.site_occupancy(date) cascade;

-- ---------- Diving (uno spazio per ogni diving registrato) -----------
-- Il diving si registra negli uffici dell'AMP, che crea qui il suo spazio
-- con il team comunicato; uscite, segnalazioni e richieste sono del diving.
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  staff       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- ---------- Profili (una persona, con le sue credenziali) -------------
-- Ogni persona entra con il suo account e appartiene a un diving come
-- admin (il titolare: gestisce team e accessi) o membro. Vedi in fondo.
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text,
  full_name   text not null default '',
  role        text not null default 'diving' check (role in ('diving', 'amp')),
  org_id      uuid references public.organizations on delete set null,
  org_role    text not null default 'membro' check (org_role in ('admin', 'membro')),
  onboarded   boolean not null default false,
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

-- il diving della persona collegata (null se non è ancora collegata)
create function public.my_org() returns uuid
language sql security definer stable set search_path = public as $$
  select org_id from public.profiles where id = auth.uid();
$$;

-- true se la persona collegata è admin del suo diving
create function public.is_org_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and org_role = 'admin' and org_id is not null);
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
  user_id        uuid references auth.users on delete set null default auth.uid(),
  org_id         uuid references public.organizations on delete cascade,
  org_name       text not null,
  author_name    text not null default '',
  activity_type  text not null check (activity_type in ('visita_guidata', 'sea_watching')),
  -- immersione: un sito con la sua capienza; sea watching (snorkeling = balneazione): un punto libero
  site_id        text references public.dive_sites (id),
  lat            double precision,
  lng            double precision,
  date           date not null,
  time_in        time not null,
  time_out       time not null,
  instructors    text[] not null default '{}',
  guides         text[] not null default '{}',
  guests         text[] not null default '{}',
  participants   int not null default 0 check (participants between 0 and 60),
  buoy           boolean not null,
  exit_mode      text not null check (exit_mode in ('terra', 'diporto')),
  status         text not null default 'inviata' check (status in ('inviata', 'presa_visione', 'annullata')),
  created_at     timestamptz not null default now(),
  check (time_out > time_in),
  check ((activity_type = 'visita_guidata' and site_id is not null)
      or (activity_type = 'sea_watching' and lat is not null and lng is not null))
);

-- Il server rifiuta le uscite che superano la capienza del sito.
-- Le uscite annullate e il sea watching (balneazione, senza sito) non occupano posti;
-- modificando un'uscita non si conta due volte.
create function public.check_capacity() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  cap int;
  used int;
  requested int := cardinality(new.instructors) + cardinality(new.guides) + cardinality(new.guests);
begin
  if new.status = 'annullata' or new.site_id is null then
    return new;
  end if;
  -- la presa visione dell'AMP non cambia i posti: niente da ricontrollare
  if tg_op = 'UPDATE' and old.status <> 'annullata'
     and (new.site_id, new.date, new.instructors, new.guides, new.guests)
         is not distinct from (old.site_id, old.date, old.instructors, old.guides, old.guests) then
    return new;
  end if;
  if requested = 0 then
    raise exception 'Indica almeno un subacqueo.';
  end if;
  -- blocca la riga del sito: due invii contemporanei sullo stesso sito passano uno alla volta
  select capacity into cap from dive_sites where id = new.site_id for update;
  select coalesce(sum(cardinality(instructors) + cardinality(guides) + cardinality(guests)), 0)
    into used from bookings
    where site_id = new.site_id and date = new.date and status <> 'annullata' and id <> new.id;
  if used + requested > cap then
    raise exception 'Posti esauriti: restano % posti su %.', greatest(cap - used, 0), cap;
  end if;
  return new;
end $$;

-- All'inserimento dall'app il server imposta autore, diving, stato e data:
-- il client non può falsificarli. (Dal SQL Editor auth.uid() è null: i dati di esempio restano come sono.)
create function public.stamp_row() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then
    new.user_id := auth.uid();
    new.created_at := now();
    new.org_id := public.my_org();
    new.org_name := coalesce((select name from organizations where id = new.org_id), '');
    new.author_name := coalesce((select full_name from profiles where id = auth.uid()), '');
    if tg_table_name = 'bookings' then new.status := 'inviata'; end if;
    if tg_table_name in ('reports', 'requests') then new.status := 'aperta'; end if;
  end if;
  return new;
end $$;

-- Se il diving modifica un'uscita già vista, torna "inviata" e l'AMP la rivede
create function public.booking_changed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_amp() and new.status <> 'annullata'
     and (new.site_id, new.lat, new.lng, new.date, new.time_in, new.time_out, new.instructors, new.guides, new.guests, new.participants, new.buoy, new.exit_mode, new.activity_type)
         is distinct from
         (old.site_id, old.lat, old.lng, old.date, old.time_in, old.time_out, old.instructors, old.guides, old.guests, old.participants, old.buoy, old.exit_mode, old.activity_type) then
    new.status := 'inviata';
  end if;
  return new;
end $$;

-- I trigger "before" partono in ordine alfabetico: prima il timbro (a_), poi la capienza (b_)
create trigger bookings_a_stamp before insert on public.bookings
  for each row execute function public.stamp_row();
create trigger bookings_a_changed before update on public.bookings
  for each row execute function public.booking_changed();
create trigger bookings_b_check_capacity before insert or update on public.bookings
  for each row execute function public.check_capacity();

-- Occupazione per sito (aggregata, senza esporre i dati degli altri diving)
create function public.site_occupancy(p_date date)
returns table (site_id text, used int)
language sql security definer stable set search_path = public as $$
  select site_id, sum(cardinality(instructors) + cardinality(guides) + cardinality(guests))::int
  from bookings where date = p_date and status <> 'annullata' and site_id is not null group by site_id;
$$;

-- ---------- Segnalazioni --------------------------------------------
create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete set null default auth.uid(),
  org_id       uuid references public.organizations on delete cascade,
  org_name     text not null,
  author_name  text not null default '',
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
  user_id         uuid references auth.users on delete set null default auth.uid(),
  org_id          uuid references public.organizations on delete cascade,
  org_name        text not null,
  author_name     text not null default '',
  kind            text not null check (kind in ('appuntamento', 'assistenza', 'accesso')),
  preferred_date  date,
  message         text not null,
  status          text not null default 'aperta' check (status in ('aperta', 'gestita')),
  created_at      timestamptz not null default now()
);

create trigger reports_a_stamp before insert on public.reports
  for each row execute function public.stamp_row();
create trigger requests_a_stamp before insert on public.requests
  for each row execute function public.stamp_row();

-- =====================================================================
-- Sicurezza: Row Level Security
-- Ogni diving vede solo i propri dati, il personale AMP vede tutto.
-- =====================================================================
alter table public.organizations enable row level security;
alter table public.profiles   enable row level security;
alter table public.dive_sites enable row level security;
alter table public.bookings   enable row level security;
alter table public.reports    enable row level security;
alter table public.requests   enable row level security;

-- il diving: lo vedono i suoi membri (e l'AMP); il team lo cambia solo l'admin
create policy "diving: lettura"      on public.organizations for select using (id = public.my_org() or public.is_amp());
create policy "diving: team (admin)" on public.organizations for update
  using (id = public.my_org() and public.is_org_admin())
  with check (id = public.my_org());
revoke update on public.organizations from authenticated, anon;
grant update (staff) on public.organizations to authenticated;

-- una persona vede sé stessa e le altre persone del suo diving
create policy "profili: lettura"     on public.profiles for select
  using (id = auth.uid() or public.is_amp() or (org_id is not null and org_id = public.my_org()));
create policy "profili: modifica"    on public.profiles for update using (id = auth.uid());
-- ruolo, diving e nome li decide l'AMP: dall'app si cambia solo l'onboarding
revoke update on public.profiles from authenticated, anon;
grant update (onboarded) on public.profiles to authenticated;

create policy "siti: lettura"        on public.dive_sites for select to authenticated using (true);

-- uscite, segnalazioni e richieste sono del diving: le vedono tutti i suoi membri
create policy "uscite: lettura"      on public.bookings for select using (org_id = public.my_org() or public.is_amp());
create policy "uscite: inserimento"  on public.bookings for insert with check (user_id = auth.uid() and org_id = public.my_org());
create policy "uscite: presa visione AMP" on public.bookings for update using (public.is_amp());
-- chi è nel diving può modificare o annullare le uscite del diving, ma non segnarle come viste
create policy "uscite: modifica del diving" on public.bookings for update
  using (org_id = public.my_org())
  with check (org_id = public.my_org() and status in ('inviata', 'annullata'));
revoke update on public.bookings from authenticated, anon;
grant update (status, activity_type, site_id, lat, lng, date, time_in, time_out, instructors, guides, guests, participants, buoy, exit_mode)
  on public.bookings to authenticated;

create policy "segnalazioni: lettura"     on public.reports for select using (org_id = public.my_org() or public.is_amp());
create policy "segnalazioni: inserimento" on public.reports for insert with check (user_id = auth.uid() and org_id = public.my_org());
create policy "segnalazioni: gestione AMP" on public.reports for update using (public.is_amp());
revoke update on public.reports from authenticated, anon;
grant update (status) on public.reports to authenticated;

create policy "richieste: lettura"     on public.requests for select using (org_id = public.my_org() or public.is_amp());
create policy "richieste: inserimento" on public.requests for insert with check (user_id = auth.uid() and org_id = public.my_org());
create policy "richieste: gestione AMP" on public.requests for update using (public.is_amp());
revoke update on public.requests from authenticated, anon;
grant update (status) on public.requests to authenticated;

-- Permessi di base (servono se il progetto non espone in automatico le nuove tabelle)
grant usage on schema public to authenticated;
grant select, insert on public.bookings, public.reports, public.requests to authenticated;
grant select on public.profiles, public.organizations, public.dive_sites to authenticated;
grant execute on function public.site_occupancy(date) to authenticated;
revoke execute on function public.site_occupancy(date) from anon, public;

-- =====================================================================
-- Realtime: la dashboard AMP riceve le nuove comunicazioni all'istante
-- =====================================================================
alter publication supabase_realtime add table public.bookings, public.reports, public.requests;

-- =====================================================================
-- Il diving della demo, già registrato negli uffici (le persone si collegano in fondo)
-- =====================================================================
insert into public.organizations (name, staff) values
  ('Acitrezza Diving Center', '[{"name": "Marco Russo", "role": "istruttore"}, {"name": "Elena Costa", "role": "istruttore"},
    {"name": "Davide Musumeci", "role": "istruttore"}, {"name": "Chiara Leonardi", "role": "guida"},
    {"name": "Andrea Patanè", "role": "guida"}]');

-- =====================================================================
-- Dati di esempio: uscite di altri diving, per riempire la dashboard
-- =====================================================================
insert into public.bookings
  (user_id, org_name, activity_type, site_id, lat, lng, date, time_in, time_out, instructors, guides, guests, participants, buoy, exit_mode, status)
values
  (null, 'Ciclopi Sub', 'visita_guidata', 'panettoni', null, null, current_date, '09:00', '10:30',
   array['Salvo Grasso'], array['Rita Platania'], array['Luca Bianchi', 'Anna Testa', 'Paolo Mirabella', 'Giulia Ferro'], 0, true, 'diporto', 'presa_visione'),
  (null, 'Lachea Diving Center', 'visita_guidata', 'isola-lachea', null, null, current_date, '10:00', '11:15',
   array['Nino Cardillo', 'Marta Leotta'], '{}', array['Tom Becker', 'Lea Schmidt', 'Hugo Martin', 'Chloé Martin', 'Ivo Pace', 'Sara Neri', 'Dario Vitale'], 0, true, 'diporto', 'inviata'),
  (null, 'Blu Trezza Diving', 'sea_watching', null, 37.5547, 15.1524, current_date, '15:00', '16:30',
   '{}', array['Ciccio Russo'], '{}', 8, true, 'terra', 'inviata'),
  (null, 'Ciclopi Sub', 'visita_guidata', 'faraglione-grande', null, null, current_date + 1, '09:30', '11:00',
   array['Salvo Grasso'], '{}', array['Federico Sapienza', 'Laura Zappalà', 'Ugo Barbagallo'], 0, true, 'diporto', 'inviata');

insert into public.reports (user_id, org_name, category, description, lat, lng, status) values
  (null, 'Lachea Diving Center', 'abusivismo', 'Imbarcazione ancorata su posidonia a nord di Lachea, nessun gavitello.', 37.5668, 15.1712, 'aperta'),
  (null, 'Ciclopi Sub', 'avvistamento', 'Tartaruga Caretta caretta in superficie vicino ai Panettoni.', 37.5588, 15.1675, 'gestita');

insert into public.requests (user_id, org_name, kind, preferred_date, message, status) values
  (null, 'Ciclopi Sub', 'appuntamento', current_date + 3, 'Vorremmo un incontro sulla posidonia per i nostri nuovi istruttori.', 'aperta');

-- Profili per gli account creati prima di questo script (se ce ne sono)
insert into public.profiles (id, email) select id, email from auth.users on conflict do nothing;

-- =====================================================================
-- Persone di un diving registrato negli uffici dell'AMP:
-- 1. (solo per un diving nuovo) crea il suo spazio con il team:
--   insert into public.organizations (name, staff)
--   values ('Nome del diving', '[{"name": "Marco Russo", "role": "istruttore"}]');
-- 2. Authentication → Users → Add user → Create new user, una per persona
--    (email e password da consegnare, "Auto Confirm User" attivo).
-- 3. Collega la persona al diving: il titolare è admin, gli altri membri.
--   update public.profiles
--   set full_name = 'Giovanni Pappalardo', org_role = 'admin',
--       org_id = (select id from public.organizations where name = 'Acitrezza Diving Center')
--   where email = 'email-del-titolare@esempio.it';
--
-- Per rendere un account "personale AMP" (accesso alla dashboard):
--   update public.profiles
--   set role = 'amp', full_name = 'Staff AMP', onboarded = true
--   where email = 'la-tua-email-amp@esempio.it';
-- =====================================================================
