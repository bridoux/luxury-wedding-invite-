-- ════════════════════════════════════════════════════════════════════════════
--  Luxury Wedding Invitation PWA — initial schema
--  Tables: guests · rsvps · invitation_opens · admin_users · wedding_settings
--
--  Design goals
--   • UUID primary keys everywhere (gen_random_uuid()).
--   • created_at / updated_at timestamps (updated_at auto-maintained by trigger).
--   • Personalized invite links via guests.guest_code.
--   • RSVP tracking linked by guest_code (open RSVPs without a code allowed too).
--   • Row Level Security ON for every table.
--   • PUBLIC (anon) can: submit an RSVP, look up their own invite (via RPC),
--     log an invitation open (via RPC), and read public wedding_settings.
--   • ADMINS (rows in admin_users, matched on auth.uid()) can read/manage data.
--   • The guest list is NEVER exposed wholesale to anon — guests are read only
--     through a SECURITY DEFINER function that returns a few safe columns.
--
--  Safe to run on a fresh project. Mostly idempotent (IF NOT EXISTS / guarded).
-- ════════════════════════════════════════════════════════════════════════════

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Allow forward references inside function bodies (e.g. is_admin() reads
-- admin_users, which is created further down). Validated at runtime instead.
set check_function_bodies = off;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Enum types
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.attendance_status as enum ('attending', 'not_attending', 'maybe');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.invite_status as enum ('sent', 'opened', 'responded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.guest_rsvp_status as enum ('pending', 'attending', 'not_attending', 'maybe');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.admin_role as enum ('owner', 'admin', 'viewer');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Shared helpers
-- ─────────────────────────────────────────────────────────────────────────────

-- Keep updated_at current on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Is the current authenticated user an admin?
-- SECURITY DEFINER so it can read admin_users without tripping that table's RLS
-- (this also avoids infinite policy recursion when used inside admin_users policies).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. guests — one row per invitation / party (drives personalized links)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.guests (
  id              uuid primary key default gen_random_uuid(),
  guest_code      text not null unique
                    check (guest_code ~ '^[a-z0-9][a-z0-9-]{1,48}$'),
  full_name       text not null,
  email           text,
  phone           text,
  max_guests      integer not null default 1 check (max_guests between 1 and 20),
  party_label     text,                       -- e.g. "The Bennett Family"
  greeting        text,                       -- personal line shown on their page
  invite_status   public.invite_status not null default 'sent',
  rsvp_status     public.guest_rsvp_status not null default 'pending',
  opened_at       timestamptz,                -- first time the invite was opened
  notes           text,                       -- private admin notes
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists guests_rsvp_status_idx on public.guests (rsvp_status);

drop trigger if exists trg_guests_updated_at on public.guests;
create trigger trg_guests_updated_at
  before update on public.guests
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. rsvps — one submission per response (guest may have a code, or be open)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.rsvps (
  id                          uuid primary key default gen_random_uuid(),
  guest_id                    uuid references public.guests (id) on delete set null,
  guest_code                  text references public.guests (guest_code) on delete set null,
  full_name                   text not null check (char_length(full_name) between 1 and 120),
  email                       text check (email is null or char_length(email) <= 160),
  phone                       text check (phone is null or char_length(phone) <= 40),
  attendance_status           public.attendance_status not null,
  guest_count                 integer not null default 1 check (guest_count between 0 and 20),
  additional_guest_names      text check (additional_guest_names is null or char_length(additional_guest_names) <= 600),
  -- Plus-one details
  plus_one_name               text check (plus_one_name is null or char_length(plus_one_name) <= 120),
  plus_one_attending          boolean not null default false,
  plus_one_meal_preference    text,
  plus_one_dietary_restrictions text,
  -- Meal / dietary / logistics
  meal_preference             text,
  dietary_restrictions        text check (dietary_restrictions is null or char_length(dietary_restrictions) <= 600),
  accommodation_needed        boolean not null default false,
  accommodation_notes         text check (accommodation_notes is null or char_length(accommodation_notes) <= 600),
  message                     text check (message is null or char_length(message) <= 2000),
  consent_updates             boolean not null default false,
  source                      text not null default 'web',
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists rsvps_guest_code_idx on public.rsvps (guest_code);
create index if not exists rsvps_guest_id_idx   on public.rsvps (guest_id);
create index if not exists rsvps_created_at_idx  on public.rsvps (created_at desc);

drop trigger if exists trg_rsvps_updated_at on public.rsvps;
create trigger trg_rsvps_updated_at
  before update on public.rsvps
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. invitation_opens — append-only log of invite views
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.invitation_opens (
  id           uuid primary key default gen_random_uuid(),
  guest_id     uuid references public.guests (id) on delete set null,
  guest_code   text references public.guests (guest_code) on delete set null,
  opened_at    timestamptz not null default now(),
  user_agent   text check (user_agent is null or char_length(user_agent) <= 500),
  referrer     text check (referrer is null or char_length(referrer) <= 500),
  created_at   timestamptz not null default now()
);

create index if not exists invitation_opens_guest_code_idx on public.invitation_opens (guest_code);
create index if not exists invitation_opens_opened_at_idx   on public.invitation_opens (opened_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. admin_users — links Supabase Auth users to an admin role
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.admin_users (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users (id) on delete cascade,
  email       text,
  role        public.admin_role not null default 'admin',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. wedding_settings — public, editable key/value config (UUID PK + unique key)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.wedding_settings (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value       jsonb not null default '{}'::jsonb,
  is_public   boolean not null default true,   -- public rows readable by anon
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_wedding_settings_updated_at on public.wedding_settings;
create trigger trg_wedding_settings_updated_at
  before update on public.wedding_settings
  for each row execute function public.set_updated_at();

-- ═════════════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═════════════════════════════════════════════════════════════════════════════
alter table public.guests            enable row level security;
alter table public.rsvps             enable row level security;
alter table public.invitation_opens  enable row level security;
alter table public.admin_users       enable row level security;
alter table public.wedding_settings  enable row level security;

-- ── guests ───────────────────────────────────────────────────────────────────
-- No direct anon access (the list is PII). Public lookups go through the
-- get_guest_by_code() RPC below. Admins get full read/write.
drop policy if exists "admins read guests"   on public.guests;
drop policy if exists "admins insert guests" on public.guests;
drop policy if exists "admins update guests" on public.guests;
drop policy if exists "admins delete guests" on public.guests;

create policy "admins read guests"   on public.guests for select to authenticated using (public.is_admin());
create policy "admins insert guests" on public.guests for insert to authenticated with check (public.is_admin());
create policy "admins update guests" on public.guests for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete guests" on public.guests for delete to authenticated using (public.is_admin());

-- ── rsvps ────────────────────────────────────────────────────────────────────
-- PUBLIC may INSERT a response (guest-facing form). They may NOT read, update,
-- or delete responses. Admins can read/update/delete.
drop policy if exists "public submit rsvp" on public.rsvps;
drop policy if exists "admins read rsvps"  on public.rsvps;
drop policy if exists "admins update rsvps" on public.rsvps;
drop policy if exists "admins delete rsvps" on public.rsvps;

-- WITH CHECK hardens the public insert: name required, sane counts, no spoofing
-- of server-managed columns is possible because anon is only granted the columns
-- listed in the GRANT below.
create policy "public submit rsvp" on public.rsvps
  for insert to anon, authenticated
  with check (
    char_length(coalesce(full_name, '')) between 1 and 120
    and guest_count between 0 and 20
    and source = 'web'
  );

create policy "admins read rsvps"   on public.rsvps for select to authenticated using (public.is_admin());
create policy "admins update rsvps" on public.rsvps for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete rsvps" on public.rsvps for delete to authenticated using (public.is_admin());

-- ── invitation_opens ─────────────────────────────────────────────────────────
-- Public open-logging happens through the record_invitation_open() RPC.
-- Only admins can read the log directly.
drop policy if exists "admins read invitation_opens" on public.invitation_opens;
create policy "admins read invitation_opens" on public.invitation_opens
  for select to authenticated using (public.is_admin());

-- ── admin_users ──────────────────────────────────────────────────────────────
-- A signed-in user may read THEIR OWN row (to discover they're an admin).
-- Admins may read all and manage. (Bootstrap the first admin with the service
-- role / SQL editor — see notes at the bottom.)
drop policy if exists "read own admin row"   on public.admin_users;
drop policy if exists "admins read admins"    on public.admin_users;
drop policy if exists "admins manage admins"  on public.admin_users;

create policy "read own admin row"  on public.admin_users for select to authenticated using (user_id = auth.uid());
create policy "admins read admins"   on public.admin_users for select to authenticated using (public.is_admin());
create policy "admins manage admins" on public.admin_users for all    to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── wedding_settings ─────────────────────────────────────────────────────────
-- Anyone may read PUBLIC settings rows; admins manage everything.
drop policy if exists "public read settings"  on public.wedding_settings;
drop policy if exists "admins read settings"  on public.wedding_settings;
drop policy if exists "admins manage settings" on public.wedding_settings;

create policy "public read settings"  on public.wedding_settings for select to anon, authenticated using (is_public = true);
create policy "admins read settings"  on public.wedding_settings for select to authenticated using (public.is_admin());
create policy "admins manage settings" on public.wedding_settings for all   to authenticated using (public.is_admin()) with check (public.is_admin());

-- ═════════════════════════════════════════════════════════════════════════════
--  TABLE-LEVEL PRIVILEGES  (RLS gates rows; GRANT gates which columns/ops exist)
-- ═════════════════════════════════════════════════════════════════════════════

-- guests: never reachable directly by anon.
revoke all on public.guests from anon;
grant select, insert, update, delete on public.guests to authenticated;

-- rsvps: anon may INSERT only the guest-supplied columns. Reads/updates: admins.
revoke all on public.rsvps from anon;
grant insert (
  guest_code, full_name, email, phone, attendance_status, guest_count,
  additional_guest_names, plus_one_name, plus_one_attending,
  plus_one_meal_preference, plus_one_dietary_restrictions, meal_preference,
  dietary_restrictions, accommodation_needed, accommodation_notes,
  message, consent_updates, source
) on public.rsvps to anon, authenticated;
grant select, update, delete on public.rsvps to authenticated;

-- invitation_opens: no direct anon access (logged via RPC).
revoke all on public.invitation_opens from anon;
grant select on public.invitation_opens to authenticated;

-- admin_users: authenticated only (RLS narrows further).
revoke all on public.admin_users from anon;
grant select, insert, update, delete on public.admin_users to authenticated;

-- wedding_settings: anon read (RLS limits to public rows); admins write.
grant select on public.wedding_settings to anon;
grant select, insert, update, delete on public.wedding_settings to authenticated;

-- ═════════════════════════════════════════════════════════════════════════════
--  PUBLIC-SAFE RPCs  (SECURITY DEFINER: run with owner privileges, bypassing RLS,
--  but only expose exactly what guests need)
-- ═════════════════════════════════════════════════════════════════════════════

-- Look up a single invite by code. Returns only guest-safe columns (no email,
-- phone, or private notes). Used by /invite/[guestCode].
create or replace function public.get_guest_by_code(p_code text)
returns table (
  guest_code   text,
  full_name    text,
  party_label  text,
  greeting     text,
  max_guests   integer,
  rsvp_status  public.guest_rsvp_status
)
language sql
stable
security definer
set search_path = public
as $$
  select g.guest_code, g.full_name, g.party_label, g.greeting, g.max_guests, g.rsvp_status
  from public.guests g
  where g.guest_code = lower(trim(p_code))
  limit 1;
$$;

revoke all on function public.get_guest_by_code(text) from public;
grant execute on function public.get_guest_by_code(text) to anon, authenticated;

-- Record an invitation open and stamp the guest's first-open metadata.
create or replace function public.record_invitation_open(
  p_guest_code text,
  p_user_agent text default null,
  p_referrer   text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest public.guests%rowtype;
begin
  select * into v_guest from public.guests where guest_code = lower(trim(p_guest_code));

  insert into public.invitation_opens (guest_id, guest_code, user_agent, referrer)
  values (v_guest.id, v_guest.guest_code, left(p_user_agent, 500), left(p_referrer, 500));

  -- Promote status on first open (never downgrade a guest who already responded).
  if v_guest.id is not null then
    update public.guests
      set opened_at = coalesce(opened_at, now()),
          invite_status = case when invite_status = 'sent' then 'opened' else invite_status end
      where id = v_guest.id;
  end if;
end;
$$;

revoke all on function public.record_invitation_open(text, text, text) from public;
grant execute on function public.record_invitation_open(text, text, text) to anon, authenticated;

-- Keep guests.rsvp_status / invite_status in sync when an RSVP arrives.
create or replace function public.sync_guest_on_rsvp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.guest_code is not null then
    update public.guests
      set rsvp_status = new.attendance_status::text::public.guest_rsvp_status,
          invite_status = 'responded'
      where guest_code = new.guest_code;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_rsvps_sync_guest on public.rsvps;
create trigger trg_rsvps_sync_guest
  after insert on public.rsvps
  for each row execute function public.sync_guest_on_rsvp();

-- ═════════════════════════════════════════════════════════════════════════════
--  SEED DATA
-- ═════════════════════════════════════════════════════════════════════════════

-- Public wedding settings (mirror lib/config.ts; the app can later read these).
-- Keys mirror the admin "Wedding Details" editor sections (see lib/settingsService.ts).
insert into public.wedding_settings (key, value, is_public) values
  ('couple', '{"partnerOne":"Ruth","partnerTwo":"Eric"}'::jsonb, true),
  ('date',   '{"display":"August 18, 2026","dayOfWeek":"Tuesday","shortDisplay":"18.08.2026","iso":"2026-08-18T15:00:00"}'::jsonb, true),
  ('rsvp',   '{"deadlineDisplay":"July 18, 2026"}'::jsonb, true)
on conflict (key) do nothing;

-- Example guests (safe to delete). guest_code must be lowercase/url-safe.
insert into public.guests (guest_code, full_name, party_label, greeting, max_guests) values
  ('amara',        'Amara Okafor',       'Amara Okafor',       'Your friendship means the world to us.',        2),
  ('the-bennetts', 'The Bennett Family', 'The Bennett Family', 'We can''t wait to celebrate with the family.',  4),
  ('james',        'James Carter',       'James Carter',        null,                                            1)
on conflict (guest_code) do nothing;
