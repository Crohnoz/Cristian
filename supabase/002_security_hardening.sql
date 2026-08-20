-- Cristian Cyber Academy · Crohnoz Labs
-- Security hardening migration.
-- Apply after 001_core_schema.sql.
-- Goals:
--   * prevent instructor -> owner privilege escalation
--   * remove client-authoritative scoring
--   * reduce learner visibility to least privilege
--   * enforce tenant coherence across foreign-key relationships
--   * harden SECURITY DEFINER helper functions

-- ---------------------------------------------------------------------------
-- 1. Harden helper functions and split staff from owner capabilities.
-- ---------------------------------------------------------------------------

create or replace function public.is_tenant_member(target_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.tenant_id = target_tenant
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_tenant_staff(target_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.tenant_id = target_tenant
      and m.user_id = auth.uid()
      and m.role in ('owner', 'instructor')
  );
$$;

create or replace function public.is_tenant_owner(target_tenant uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.tenant_id = target_tenant
      and m.user_id = auth.uid()
      and m.role = 'owner'
  );
$$;

revoke all on function public.is_tenant_member(uuid) from public;
revoke all on function public.is_tenant_staff(uuid) from public;
revoke all on function public.is_tenant_owner(uuid) from public;
grant execute on function public.is_tenant_member(uuid) to authenticated;
grant execute on function public.is_tenant_staff(uuid) to authenticated;
grant execute on function public.is_tenant_owner(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Structural tenant-coherence constraints.
--    IDs referenced alongside tenant_id must resolve inside the same tenant.
-- ---------------------------------------------------------------------------

do $$ begin
  alter table public.cohorts add constraint cohorts_id_tenant_unique unique (id, tenant_id);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.modules add constraint modules_id_tenant_unique unique (id, tenant_id);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.labs add constraint labs_id_tenant_unique unique (id, tenant_id);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.labs
    add constraint labs_module_same_tenant_fk
    foreign key (module_id, tenant_id)
    references public.modules(id, tenant_id)
    on delete set null;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.assignments
    add constraint assignments_cohort_same_tenant_fk
    foreign key (cohort_id, tenant_id)
    references public.cohorts(id, tenant_id)
    on delete cascade;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.assignments
    add constraint assignments_module_same_tenant_fk
    foreign key (module_id, tenant_id)
    references public.modules(id, tenant_id)
    on delete cascade;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.assignments
    add constraint assignments_lab_same_tenant_fk
    foreign key (lab_id, tenant_id)
    references public.labs(id, tenant_id)
    on delete cascade;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.attempts
    add constraint attempts_lab_same_tenant_fk
    foreign key (lab_id, tenant_id)
    references public.labs(id, tenant_id)
    on delete cascade;
exception when duplicate_object then null; end $$;

-- Keep learning event payloads bounded and object-shaped.
do $$ begin
  alter table public.learning_events
    add constraint learning_events_payload_object
    check (jsonb_typeof(payload) = 'object');
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.learning_events
    add constraint learning_events_payload_bounded
    check (pg_column_size(payload) <= 4096);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.learning_events
    add constraint learning_events_type_allowlist
    check (event_type in (
      'view_opened',
      'phishing_correct',
      'phishing_retry',
      'range_completed',
      'range_retry',
      'certificate_unlocked',
      'achievement_unlocked',
      'mentor_topic',
      'assignment_created',
      'evidence_exported'
    ));
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 3. Membership visibility and privilege management.
-- ---------------------------------------------------------------------------

drop policy if exists "members read memberships" on public.memberships;
drop policy if exists "staff manage memberships" on public.memberships;

create policy "member reads own membership"
on public.memberships
for select
using (user_id = auth.uid());

create policy "staff reads tenant memberships"
on public.memberships
for select
using (public.is_tenant_staff(tenant_id));

create policy "owner inserts tenant memberships"
on public.memberships
for insert
with check (public.is_tenant_owner(tenant_id));

create policy "owner updates tenant memberships"
on public.memberships
for update
using (public.is_tenant_owner(tenant_id))
with check (public.is_tenant_owner(tenant_id));

create policy "owner deletes tenant memberships"
on public.memberships
for delete
using (
  public.is_tenant_owner(tenant_id)
  and user_id <> auth.uid()
);

-- ---------------------------------------------------------------------------
-- 4. Profile visibility: self by default; tenant staff can resolve learners.
-- ---------------------------------------------------------------------------

drop policy if exists "staff reads member profiles" on public.profiles;
create policy "staff reads member profiles"
on public.profiles
for select
using (
  exists (
    select 1
    from public.memberships target_membership
    join public.memberships actor_membership
      on actor_membership.tenant_id = target_membership.tenant_id
    where target_membership.user_id = profiles.id
      and actor_membership.user_id = auth.uid()
      and actor_membership.role in ('owner', 'instructor')
  )
);

-- ---------------------------------------------------------------------------
-- 5. Cohort membership: learners see only their own enrollment.
--    Staff can manage only users who already belong to the same tenant.
-- ---------------------------------------------------------------------------

drop policy if exists "members read cohort members" on public.cohort_members;
drop policy if exists "staff manage cohort members" on public.cohort_members;

create policy "learner reads own cohort memberships"
on public.cohort_members
for select
using (user_id = auth.uid());

create policy "staff reads tenant cohort memberships"
on public.cohort_members
for select
using (
  exists (
    select 1
    from public.cohorts c
    where c.id = cohort_id
      and public.is_tenant_staff(c.tenant_id)
  )
);

create policy "staff inserts valid cohort memberships"
on public.cohort_members
for insert
with check (
  exists (
    select 1
    from public.cohorts c
    join public.memberships m
      on m.tenant_id = c.tenant_id
     and m.user_id = cohort_members.user_id
    where c.id = cohort_id
      and public.is_tenant_staff(c.tenant_id)
  )
);

create policy "staff deletes tenant cohort memberships"
on public.cohort_members
for delete
using (
  exists (
    select 1
    from public.cohorts c
    where c.id = cohort_id
      and public.is_tenant_staff(c.tenant_id)
  )
);

-- ---------------------------------------------------------------------------
-- 6. Assignments: learners see only assignments for cohorts they belong to.
-- ---------------------------------------------------------------------------

drop policy if exists "members read assignments" on public.assignments;
drop policy if exists "staff manage assignments" on public.assignments;

create policy "learner reads own cohort assignments"
on public.assignments
for select
using (
  exists (
    select 1
    from public.cohort_members cm
    where cm.cohort_id = assignments.cohort_id
      and cm.user_id = auth.uid()
  )
);

create policy "staff reads tenant assignments"
on public.assignments
for select
using (public.is_tenant_staff(tenant_id));

create policy "staff inserts tenant assignments"
on public.assignments
for insert
with check (
  public.is_tenant_staff(tenant_id)
  and assigned_by = auth.uid()
);

create policy "staff updates tenant assignments"
on public.assignments
for update
using (public.is_tenant_staff(tenant_id))
with check (public.is_tenant_staff(tenant_id));

create policy "staff deletes tenant assignments"
on public.assignments
for delete
using (public.is_tenant_staff(tenant_id));

-- ---------------------------------------------------------------------------
-- 7. Attempts and scoring: the browser is never authoritative.
--    No authenticated direct INSERT/UPDATE policy is provided.
--    A trusted server/Edge Function should validate a submission and write score.
-- ---------------------------------------------------------------------------

drop policy if exists "learner writes own attempts" on public.attempts;

-- Read policies from migration 001 remain:
--   learner reads own attempts
--   staff reads tenant attempts

-- ---------------------------------------------------------------------------
-- 8. Learning events: allow only own low-risk events; never arbitrary user IDs.
-- ---------------------------------------------------------------------------

drop policy if exists "learner writes own events" on public.learning_events;
create policy "learner writes own allowed events"
on public.learning_events
for insert
with check (
  user_id = auth.uid()
  and public.is_tenant_member(tenant_id)
);

-- ---------------------------------------------------------------------------
-- 9. Certificates: staff may issue only to users who belong to the tenant.
-- ---------------------------------------------------------------------------

drop policy if exists "staff manages certificates" on public.certificates;

create policy "staff reads tenant certificates"
on public.certificates
for select
using (public.is_tenant_staff(tenant_id));

create policy "staff inserts member certificates"
on public.certificates
for insert
with check (
  public.is_tenant_staff(tenant_id)
  and exists (
    select 1
    from public.memberships m
    where m.tenant_id = certificates.tenant_id
      and m.user_id = certificates.user_id
  )
);

create policy "staff updates tenant certificates"
on public.certificates
for update
using (public.is_tenant_staff(tenant_id))
with check (
  public.is_tenant_staff(tenant_id)
  and exists (
    select 1
    from public.memberships m
    where m.tenant_id = certificates.tenant_id
      and m.user_id = certificates.user_id
  )
);

-- Do not hard-delete certificates through the client. Revoke by setting revoked_at.

-- ---------------------------------------------------------------------------
-- 10. Explicit grants: authenticated users operate only through RLS.
--     Service-role/server-side workflows remain responsible for authoritative
--     scoring and other privileged operations.
-- ---------------------------------------------------------------------------

revoke insert, update, delete on public.attempts from authenticated;
grant select on public.attempts to authenticated;

-- Note: Supabase API grants for the other tables should be reviewed in staging
-- after migrations are applied. RLS is not a substitute for least-privilege
-- table grants, and advisors must be run before production.
