-- Marathon cheer site: tables, row-level security and storage buckets.
-- Run once in the Supabase SQL editor (safe to re-run). Then run seed.sql and edit the `runner` row.
-- No accounts: the browser uses the publishable/anon key. You moderate by deleting rows or photos in the
-- dashboard (the dashboard bypasses RLS).

create extension if not exists pgcrypto;

-- Runner settings: exactly one row. Everything personal lives here, not in the code. ---------------------
create table if not exists public.runner (
  id boolean primary key default true check (id), -- singleton
  name text not null default 'Alex' check (char_length(btrim(name)) between 1 and 24),
  pronouns text not null default 'they' check (pronouns in ('she', 'he', 'they')),
  bib text check (bib is null or char_length(bib) <= 10),
  splits_url text,                       -- optional; defaults to the NYRR results page for `bib`
  start_time timestamptz not null default '2026-11-01 09:10:00-05', -- the gun for your wave (DST: -05 on race day)
  wave text default '1',
  start_color text default 'Orange' check (start_color is null or start_color in ('Orange', 'Blue', 'Green')),
  corral text,
  pace_goal_s int not null default 504 check (pace_goal_s between 240 and 1200), -- seconds per mile
  pace_fast_s int not null default 500 check (pace_fast_s between 240 and 1200),
  pace_slow_s int not null default 533 check (pace_slow_s between 240 and 1200),
  board_from text not null default '3:30' check (board_from ~ '^\d:[0-5]\d$'), -- guess board range, h:mm
  board_to text not null default '4:30' check (board_to ~ '^\d:[0-5]\d$'),
  donate_url text,
  cause text,                            -- e.g. 'Team for Kids', shown as "Donate to …"
  finish_time text check (finish_time is null or finish_time ~ '^\d:[0-5]\d:[0-5]\d$'), -- set after the race
  hair_color text not null default '#FFD84A' check (hair_color ~ '^#[0-9A-Fa-f]{6}$'),
  skin_color text not null default '#F9D3B4' check (skin_color ~ '^#[0-9A-Fa-f]{6}$'),
  updated_at timestamptz not null default now()
);

-- Sign puns for "Make a sign". {name}/{NAME} become the runner's name; a newline in `top` splits the line.
create table if not exists public.signs (
  id uuid primary key default gen_random_uuid(),
  top text not null check (char_length(top) <= 80),
  bottom text not null check (char_length(bottom) <= 40),
  sort int not null default 0
);

-- Posters on the home-page wall: past races or training runs. Photos go in the `wall` bucket.
create table if not exists public.past_runs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 40),   -- 'BROOKLYN HALF' or 'SEP 20'
  subtitle text check (subtitle is null or char_length(subtitle) <= 40), -- '2024 · 1:52:10'
  line text check (line is null or char_length(line) <= 80),
  photo_path text,                                         -- path inside the `wall` bucket
  sort int not null default 0
);

-- Race start, read from the runner row. The guess lock below depends on it.
create or replace function public.race_start() returns timestamptz
  language sql stable security definer set search_path = '' as $$
  select coalesce((select start_time from public.runner where id), timestamptz '2026-11-01 09:10:00-05')
$$;

-- Spot claims ------------------------------------------------------------------------------------------
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 40),
  spot_id text not null check (spot_id in (
    'bay-ridge','atlantic','fort-greene','williamsburg','greenpoint','lic',
    'first-60s','first-90s','bronx','fifth-110s','museum-mile','park-east','cps')),
  wearing text check (wearing is null or char_length(wearing) <= 60),
  created_at timestamptz not null default now()
);

-- Finish-time pool -------------------------------------------------------------------------------------
create table if not exists public.guesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 40),
  finish_s int not null check (finish_s between 9000 and 21600),
  created_at timestamptz not null default now()
);

-- Sightings --------------------------------------------------------------------------------------------
create table if not exists public.sightings (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 40),
  mile numeric(4,1) not null check (mile between 0 and 26.2),
  photo_path text check (photo_path is null or char_length(photo_path) <= 200),
  -- When the runner was actually seen; posts often go up minutes later. The map anchors on this.
  seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- seen_at may be up to 30 minutes before posting, never in the future.
create or replace function public.clamp_seen_at() returns trigger
  language plpgsql set search_path = '' as $$
begin
  new.seen_at := greatest(least(coalesce(new.seen_at, now()), now()), now() - interval '30 minutes');
  return new;
end $$;

drop trigger if exists sightings_seen on public.sightings;
create trigger sightings_seen before insert on public.sightings
  for each row execute function public.clamp_seen_at();

-- Clients can't backdate or forward-date rows.
create or replace function public.stamp_created_at() returns trigger
  language plpgsql set search_path = '' as $$ begin new.created_at := now(); return new; end $$;

drop trigger if exists claims_stamp on public.claims;
create trigger claims_stamp before insert on public.claims
  for each row execute function public.stamp_created_at();
drop trigger if exists guesses_stamp on public.guesses;
create trigger guesses_stamp before insert on public.guesses
  for each row execute function public.stamp_created_at();
drop trigger if exists sightings_stamp on public.sightings;
create trigger sightings_stamp before insert on public.sightings
  for each row execute function public.stamp_created_at();

-- Row-level security -----------------------------------------------------------------------------------
alter table public.runner enable row level security;
alter table public.signs enable row level security;
alter table public.past_runs enable row level security;
alter table public.claims enable row level security;
alter table public.guesses enable row level security;
alter table public.sightings enable row level security;

-- Settings tables: read-only from the site. Edit them in the dashboard.
revoke insert, update, delete, truncate on public.runner, public.signs, public.past_runs from anon, authenticated;
grant select on public.runner, public.signs, public.past_runs to anon, authenticated;

drop policy if exists "runner read" on public.runner;
create policy "runner read" on public.runner for select to anon, authenticated using (true);
drop policy if exists "signs read" on public.signs;
create policy "signs read" on public.signs for select to anon, authenticated using (true);
drop policy if exists "past runs read" on public.past_runs;
create policy "past runs read" on public.past_runs for select to anon, authenticated using (true);

-- Friend-submitted tables: select + insert only; no update/delete.
revoke update, delete, truncate on public.claims, public.guesses, public.sightings from anon, authenticated;
grant select, insert on public.claims, public.guesses, public.sightings to anon, authenticated;

drop policy if exists "claims read" on public.claims;
create policy "claims read" on public.claims for select to anon, authenticated using (true);
drop policy if exists "claims insert" on public.claims;
create policy "claims insert" on public.claims for insert to anon, authenticated with check (true);

drop policy if exists "guesses read" on public.guesses;
create policy "guesses read" on public.guesses for select to anon, authenticated using (true);
-- The lock: no guesses once the gun goes, enforced here, not just in the UI.
drop policy if exists "guesses insert before start" on public.guesses;
create policy "guesses insert before start" on public.guesses for insert to anon, authenticated
  with check (now() < public.race_start());

drop policy if exists "sightings read" on public.sightings;
create policy "sightings read" on public.sightings for select to anon, authenticated using (true);
drop policy if exists "sightings insert" on public.sightings;
create policy "sightings insert" on public.sightings for insert to anon, authenticated with check (true);

-- Storage ----------------------------------------------------------------------------------------------
-- `sightings`: friends' race-day photos. Public read, anon upload, images only, 5 MB max.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sightings', 'sightings', true, 5242880, array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "sightings photos upload" on storage.objects;
create policy "sightings photos upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'sightings');

-- `wall`: your poster photos. Public read; upload them in the dashboard (no anon upload).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wall', 'wall', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
