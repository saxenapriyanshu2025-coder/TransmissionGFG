-- ASSEMBLE '26 backend (Supabase / Postgres)
-- Run this once in the Supabase SQL editor on a fresh project.

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 80),
  email text not null,
  phone text check (phone is null or char_length(phone) between 7 and 20),
  college text not null check (char_length(college) between 2 and 120),
  year_of_study text not null check (year_of_study in ('1st','2nd','3rd','4th','PG','Other')),
  hero_alias text not null check (char_length(hero_alias) between 2 and 32),
  hero_class text not null check (hero_class in ('genius','speedster','strategist','mystic','guardian')),
  realm text not null check (realm in ('neural','sentinel','titan','pulse','rift','multiverse')),
  team_name text check (team_name is null or char_length(team_name) <= 40),
  avatar_url text,
  pass_code text not null unique default ('ASM-' || upper(substr(md5(gen_random_uuid()::text), 1, 6))),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

-- Each signed-in user can only see and edit their own row.
create policy "read own registration" on public.registrations
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "create own registration" on public.registrations
  for insert to authenticated
  with check ((select auth.uid()) = user_id and coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) = false);
create policy "update own registration" on public.registrations
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- On insert: email comes from the Google account, pass code is made by the server.
create or replace function public.force_auth_email() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.email = coalesce((select auth.jwt())->>'email', new.email);
  new.pass_code = 'ASM-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
  new.created_at = now();
  new.updated_at = now();
  return new;
end $$;

create trigger registrations_force_email before insert on public.registrations
  for each row execute function public.force_auth_email();

-- On update: identity fields can never change.
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  new.pass_code = old.pass_code;
  new.user_id = old.user_id;
  new.email = old.email;
  new.created_at = old.created_at;
  return new;
end $$;

create trigger registrations_touch before update on public.registrations
  for each row execute function public.touch_updated_at();

-- Public counters for the live "heroes assembled" number. Returns totals only, no personal data.
create or replace function public.event_stats() returns json
language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'total', (select count(*) from public.registrations),
    'realms', coalesce((select json_object_agg(realm, c) from (select realm, count(*) c from public.registrations group by realm) s), '{}'::json),
    'colleges', (select count(distinct lower(college)) from public.registrations)
  );
$$;

revoke all on function public.event_stats() from public;
grant execute on function public.event_stats() to anon, authenticated;
revoke all on public.registrations from anon;
grant select, insert, update on public.registrations to authenticated;

-- Team registration (added later): team size 1 to 5 and member details
alter table public.registrations
  add column if not exists team_size int check (team_size between 1 and 5),
  add column if not exists members jsonb not null default '[]'::jsonb check (jsonb_typeof(members) = 'array' and jsonb_array_length(members) <= 5);
alter table public.registrations alter column college drop not null;
alter table public.registrations alter column year_of_study drop not null;
alter table public.registrations drop constraint if exists registrations_year_of_study_check;
alter table public.registrations add constraint registrations_year_of_study_check check (year_of_study is null or char_length(year_of_study) <= 20);
