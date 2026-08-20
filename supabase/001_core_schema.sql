-- Cristian Cyber Academy · Crohnoz Labs
-- Production-oriented schema contract. No secrets or environment-specific identifiers.
-- Designed for Supabase/Postgres with auth.uid().

create extension if not exists pgcrypto;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  branding jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner','instructor','learner')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('draft','active','archived')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.cohort_members (
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (cohort_id, user_id)
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  slug text not null,
  title text not null,
  category text not null check (category in ('phishing','web','api','osint','blue-team','secure-coding')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  content jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists public.labs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  slug text not null,
  title text not null,
  lab_type text not null check (lab_type in ('inbox-simulation','defensive-range','quiz')),
  difficulty text not null default 'intro' check (difficulty in ('intro','intermediate','advanced')),
  config jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  unique (tenant_id, slug)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  lab_id uuid references public.labs(id) on delete cascade,
  assigned_by uuid not null references public.profiles(id),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  check ((module_id is not null) <> (lab_id is not null))
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  lab_id uuid not null references public.labs(id) on delete cascade,
  score numeric(5,2) not null check (score between 0 and 100),
  outcome jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.skill_scores (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill text not null check (skill in ('phishing','web','api','osint')),
  score integer not null check (score between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, user_id, skill)
);

create table if not exists public.learning_events (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_slug text not null,
  verification_code text not null unique,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists idx_memberships_user on public.memberships(user_id);
create index if not exists idx_attempts_user_lab on public.attempts(user_id, lab_id);
create index if not exists idx_events_tenant_created on public.learning_events(tenant_id, created_at desc);

create or replace function public.is_tenant_member(target_tenant uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m
    where m.tenant_id = target_tenant and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_tenant_staff(target_tenant uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m
    where m.tenant_id = target_tenant
      and m.user_id = auth.uid()
      and m.role in ('owner','instructor')
  );
$$;

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.cohorts enable row level security;
alter table public.cohort_members enable row level security;
alter table public.modules enable row level security;
alter table public.labs enable row level security;
alter table public.assignments enable row level security;
alter table public.attempts enable row level security;
alter table public.skill_scores enable row level security;
alter table public.learning_events enable row level security;
alter table public.certificates enable row level security;

create policy "profiles self read" on public.profiles for select using (id = auth.uid());
create policy "profiles self update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "tenant members read tenant" on public.tenants for select using (public.is_tenant_member(id));
create policy "members read memberships" on public.memberships for select using (public.is_tenant_member(tenant_id));
create policy "staff manage memberships" on public.memberships for all using (public.is_tenant_staff(tenant_id)) with check (public.is_tenant_staff(tenant_id));

create policy "members read cohorts" on public.cohorts for select using (public.is_tenant_member(tenant_id));
create policy "staff manage cohorts" on public.cohorts for all using (public.is_tenant_staff(tenant_id)) with check (public.is_tenant_staff(tenant_id));
create policy "members read cohort members" on public.cohort_members for select using (
  exists (select 1 from public.cohorts c where c.id = cohort_id and public.is_tenant_member(c.tenant_id))
);
create policy "staff manage cohort members" on public.cohort_members for all using (
  exists (select 1 from public.cohorts c where c.id = cohort_id and public.is_tenant_staff(c.tenant_id))
) with check (
  exists (select 1 from public.cohorts c where c.id = cohort_id and public.is_tenant_staff(c.tenant_id))
);

create policy "members read published modules" on public.modules for select using (
  public.is_tenant_member(tenant_id) and (status = 'published' or public.is_tenant_staff(tenant_id))
);
create policy "staff manage modules" on public.modules for all using (public.is_tenant_staff(tenant_id)) with check (public.is_tenant_staff(tenant_id));
create policy "members read published labs" on public.labs for select using (
  public.is_tenant_member(tenant_id) and (status = 'published' or public.is_tenant_staff(tenant_id))
);
create policy "staff manage labs" on public.labs for all using (public.is_tenant_staff(tenant_id)) with check (public.is_tenant_staff(tenant_id));

create policy "members read assignments" on public.assignments for select using (public.is_tenant_member(tenant_id));
create policy "staff manage assignments" on public.assignments for all using (public.is_tenant_staff(tenant_id)) with check (public.is_tenant_staff(tenant_id));

create policy "learner reads own attempts" on public.attempts for select using (user_id = auth.uid() and public.is_tenant_member(tenant_id));
create policy "learner writes own attempts" on public.attempts for insert with check (user_id = auth.uid() and public.is_tenant_member(tenant_id));
create policy "staff reads tenant attempts" on public.attempts for select using (public.is_tenant_staff(tenant_id));

create policy "learner reads own skills" on public.skill_scores for select using (user_id = auth.uid() and public.is_tenant_member(tenant_id));
create policy "staff reads tenant skills" on public.skill_scores for select using (public.is_tenant_staff(tenant_id));

create policy "learner writes own events" on public.learning_events for insert with check (user_id = auth.uid() and public.is_tenant_member(tenant_id));
create policy "learner reads own events" on public.learning_events for select using (user_id = auth.uid() and public.is_tenant_member(tenant_id));
create policy "staff reads tenant events" on public.learning_events for select using (public.is_tenant_staff(tenant_id));

create policy "learner reads own certificates" on public.certificates for select using (user_id = auth.uid() and public.is_tenant_member(tenant_id));
create policy "staff manages certificates" on public.certificates for all using (public.is_tenant_staff(tenant_id)) with check (public.is_tenant_staff(tenant_id));

-- Intentional omissions:
-- 1. No public anonymous write policies.
-- 2. No storage of real credentials, phishing targets, or arbitrary external hosts.
-- 3. No Cyber Range container orchestration lives in this database schema.
