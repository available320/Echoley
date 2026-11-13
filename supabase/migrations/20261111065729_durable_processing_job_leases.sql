alter table public.processing_jobs
  add column if not exists lease_expires_at timestamptz,
  add column if not exists last_heartbeat_at timestamptz,
  add column if not exists idempotency_key text;

create index if not exists processing_jobs_claim_idx
  on public.processing_jobs (status, created_at)
  where status in ('queued','running');

create unique index if not exists processing_jobs_idempotency_key_idx
  on public.processing_jobs (owner_id, idempotency_key)
  where idempotency_key is not null;

create or replace function public.claim_next_processing_job()
returns setof public.processing_jobs
language sql
security invoker
set search_path = ''
as $$
  with exhausted as (
    update public.processing_jobs as j
    set status = 'failed',
        error_message = 'Worker lease expired after maximum attempts',
        completed_at = pg_catalog.now(),
        lease_expires_at = null
    where j.status = 'running'
      and j.lease_expires_at < pg_catalog.now()
      and j.attempts >= 3
    returning j.id
  ), candidate as (
    select j.id
    from public.processing_jobs as j
    where (j.status = 'queued' or (j.status = 'running' and j.lease_expires_at < pg_catalog.now()))
      and j.attempts < 3
    order by j.created_at asc
    for update skip locked
    limit 1
  )
  update public.processing_jobs as j
  set status = 'running', attempts = j.attempts + 1,
      started_at = coalesce(j.started_at, pg_catalog.now()),
      last_heartbeat_at = pg_catalog.now(),
      lease_expires_at = pg_catalog.now() + interval '10 minutes',
      error_message = null
  from candidate
  where j.id = candidate.id
  returning j.*;
$$;

revoke all on function public.claim_next_processing_job() from public;
revoke all on function public.claim_next_processing_job() from anon;
revoke all on function public.claim_next_processing_job() from authenticated;
grant execute on function public.claim_next_processing_job() to service_role;
