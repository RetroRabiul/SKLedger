-- SKLedger database schema
-- Run this in the Supabase SQL editor (Dashboard -> SQL -> New query).
-- Safe to re-run: uses IF NOT EXISTS and DROP POLICY IF EXISTS.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helper: updated_at touch
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles  (one row per auth user: role + plan + usage counters)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  full_name     text,
  avatar_url    text,
  role          text not null default 'user' check (role in ('user', 'admin')),
  plan          text not null default 'free' check (plan in ('free', 'pro', 'business')),
  exports_used  integer not null default 0,
  imports_used  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Owner account is always admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    case when lower(new.email) = 'rabiulcaffe@gmail.com' then 'admin' else 'user' end
  )
  on conflict (id) do nothing;

  insert into public.user_settings (id) values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill any users that signed up before this schema existed.
insert into public.profiles (id, email, role)
select id, email,
       case when lower(email) = 'rabiulcaffe@gmail.com' then 'admin' else 'user' end
from auth.users
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Users may edit their own profile but never escalate role/plan/usage.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.plan := old.plan;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ---------------------------------------------------------------------------
-- user_settings  (theme, language, currency, brand)
-- ---------------------------------------------------------------------------
create table if not exists public.user_settings (
  id          uuid primary key references auth.users (id) on delete cascade,
  theme       text not null default 'purple-dark',
  language    text not null default 'en' check (language in ('en', 'bn')),
  currency    text not null default 'BDT',
  brand_name  text default 'SKLedger',
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  email       text,
  phone       text,
  company     text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists clients_user_id_idx on public.clients (user_id);

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  client_id       uuid references public.clients (id) on delete set null,
  title           text not null,
  description     text,
  category        text default 'Other',
  amount          numeric(14, 2) not null default 0,
  advance_payment numeric(14, 2) not null default 0,
  currency        text not null default 'BDT',
  status          text not null default 'active'
                  check (status in ('active', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  start_date      date,
  due_date        date,
  completed_at    timestamptz,
  services        jsonb not null default '[]'::jsonb,  -- [{ id, name, completed }]
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_client_id_idx on public.projects (client_id);

-- ---------------------------------------------------------------------------
-- project_payments
-- ---------------------------------------------------------------------------
create table if not exists public.project_payments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  project_id    uuid not null references public.projects (id) on delete cascade,
  amount        numeric(14, 2) not null default 0,
  method        text default 'Cash',
  payment_date  date not null default current_date,
  notes         text,
  created_at    timestamptz not null default now()
);
create index if not exists project_payments_user_id_idx on public.project_payments (user_id);
create index if not exists project_payments_project_id_idx on public.project_payments (project_id);

-- ---------------------------------------------------------------------------
-- subscriptions  (upgrade requests + recorded payments / revenue)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  plan           text not null check (plan in ('pro', 'business')),
  amount         numeric(14, 2) not null default 0,
  currency       text not null default 'BDT',
  method         text,
  transaction_id text,
  proof_url      text,
  status         text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note           text,
  reviewed_by    uuid references auth.users (id),
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.user_settings    enable row level security;
alter table public.clients          enable row level security;
alter table public.projects         enable row level security;
alter table public.project_payments enable row level security;
alter table public.subscriptions    enable row level security;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- user_settings (private: owner only, no admin access)
drop policy if exists settings_owner_all on public.user_settings;
create policy settings_owner_all on public.user_settings
  for all using (id = auth.uid()) with check (id = auth.uid());

-- Removed for privacy: admins must NOT read other users' settings.
drop policy if exists settings_admin_read on public.user_settings;

-- clients
drop policy if exists clients_owner_all on public.clients;
create policy clients_owner_all on public.clients
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Owners only: admins cannot read other users' clients.
drop policy if exists clients_admin_read on public.clients;

-- projects
drop policy if exists projects_owner_all on public.projects;
create policy projects_owner_all on public.projects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Owners only: admins cannot read other users' projects.
drop policy if exists projects_admin_read on public.projects;

-- project_payments
drop policy if exists payments_owner_all on public.project_payments;
create policy payments_owner_all on public.project_payments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Owners only: admins cannot read other users' payments.
drop policy if exists payments_admin_read on public.project_payments;

-- subscriptions
drop policy if exists subs_owner_insert on public.subscriptions;
create policy subs_owner_insert on public.subscriptions
  for insert with check (user_id = auth.uid());

drop policy if exists subs_owner_read on public.subscriptions;
create policy subs_owner_read on public.subscriptions
  for select using (user_id = auth.uid());

drop policy if exists subs_admin_all on public.subscriptions;
create policy subs_admin_all on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Admin RPCs (SECURITY DEFINER so only admins can escalate a plan)
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_plan(p_user uuid, p_plan text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  if p_plan not in ('free', 'pro', 'business') then
    raise exception 'invalid plan';
  end if;
  update public.profiles set plan = p_plan, updated_at = now() where id = p_user;
end;
$$;

create or replace function public.review_subscription(p_subscription_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  if p_status not in ('approved', 'rejected') then
    raise exception 'invalid status';
  end if;

  select * into s from public.subscriptions where id = p_subscription_id;
  if not found then
    raise exception 'not found';
  end if;

  update public.subscriptions
    set status = p_status, reviewed_by = auth.uid(), reviewed_at = now()
    where id = p_subscription_id;

  if p_status = 'approved' then
    update public.profiles set plan = s.plan, updated_at = now() where id = s.user_id;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists usersettings_touch on public.user_settings;
create trigger usersettings_touch before update on public.user_settings
  for each row execute function public.set_updated_at();

drop trigger if exists clients_touch on public.clients;
create trigger clients_touch before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Storage: payment proof screenshots
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

drop policy if exists proof_upload on storage.objects;
create policy proof_upload on storage.objects
  for insert to authenticated
  with check (bucket_id = 'payment-proofs');

drop policy if exists proof_read on storage.objects;
create policy proof_read on storage.objects
  for select using (bucket_id = 'payment-proofs');

-- ---------------------------------------------------------------------------
-- Seed owner profile as admin (in case the trigger missed an existing row)
-- ---------------------------------------------------------------------------
update public.profiles set role = 'admin'
where lower(email) = 'rabiulcaffe@gmail.com';
