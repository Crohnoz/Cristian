-- Cristian Cyber Academy · Crohnoz Labs
-- Fix delete semantics for the optional labs -> modules composite FK.
-- PostgreSQL supports a column list for ON DELETE SET NULL; only module_id
-- should be nulled. tenant_id is part of the security boundary and remains set.

alter table public.labs
  drop constraint if exists labs_module_same_tenant_fk;

alter table public.labs
  add constraint labs_module_same_tenant_fk
  foreign key (module_id, tenant_id)
  references public.modules(id, tenant_id)
  on delete set null (module_id);

-- Supporting indexes for composite FK checks / tenant-scoped joins.
create index if not exists idx_labs_module_tenant
  on public.labs(module_id, tenant_id)
  where module_id is not null;

create index if not exists idx_assignments_cohort_tenant
  on public.assignments(cohort_id, tenant_id);

create index if not exists idx_assignments_module_tenant
  on public.assignments(module_id, tenant_id)
  where module_id is not null;

create index if not exists idx_assignments_lab_tenant
  on public.assignments(lab_id, tenant_id)
  where lab_id is not null;

create index if not exists idx_attempts_lab_tenant
  on public.attempts(lab_id, tenant_id);
