-- Faster stale / freshness queries
create index if not exists jobs_active_last_seen_idx
  on public.jobs (last_seen_at)
  where active = true;

create index if not exists jobs_active_source_prefix_idx
  on public.jobs (slug)
  where active = true;
