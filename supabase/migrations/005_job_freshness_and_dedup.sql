-- Job freshness timestamps + deduplication + sync health
alter table public.jobs
  add column if not exists source text not null default 'unknown',
  add column if not exists dedupe_key text,
  add column if not exists first_seen_at timestamptz not null default now(),
  add column if not exists last_seen_at timestamptz not null default now(),
  add column if not exists last_verified_at timestamptz not null default now();

create index if not exists jobs_dedupe_key_active_idx
  on public.jobs (dedupe_key)
  where active = true and dedupe_key is not null;

-- Extend sync meta
alter table public.job_sync_meta
  add column if not exists consecutive_failures int not null default 0,
  add column if not exists last_new_jobs_at timestamptz,
  add column if not exists last_alert_at timestamptz,
  add column if not exists next_retry_at timestamptz,
  add column if not exists source_health jsonb not null default '{}'::jsonb,
  add column if not exists sync_interval_hours int not null default 1;

-- Atomic lock: only one sync at a time
create or replace function public.acquire_job_sync_lock(stuck_minutes int default 25)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  got_lock boolean := false;
begin
  update public.job_sync_meta
  set
    sync_in_progress = true,
    sync_started_at = now()
  where id = 1
    and (
      sync_in_progress = false
      or sync_started_at is null
      or sync_started_at < now() - make_interval(mins => stuck_minutes)
    )
  returning true into got_lock;

  return coalesce(got_lock, false);
end;
$$;

revoke all on function public.acquire_job_sync_lock(int) from public;
