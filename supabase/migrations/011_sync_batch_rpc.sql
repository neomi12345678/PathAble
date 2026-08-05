-- Bulk job sync helpers — avoid PostgREST URL overflow on large .in() filters

create or replace function public.deactivate_jobs_by_slugs(p_slugs text[])
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  n bigint;
begin
  if p_slugs is null or array_length(p_slugs, 1) is null then
    return 0;
  end if;

  update public.jobs
  set active = false
  where slug = any(p_slugs);

  get diagnostics n = row_count;
  return n;
end;
$$;

create or replace function public.get_job_timestamps_by_slugs(p_slugs text[])
returns table(
  slug text,
  first_seen_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select j.slug, j.first_seen_at, j.created_at
  from public.jobs j
  where j.slug = any(p_slugs);
$$;

create or replace function public.find_active_jobs_by_dedupe_keys(p_keys text[])
returns table(
  slug text,
  dedupe_key text
)
language sql
security definer
set search_path = public
as $$
  select j.slug, j.dedupe_key
  from public.jobs j
  where j.active = true
    and j.dedupe_key = any(p_keys);
$$;

revoke all on function public.deactivate_jobs_by_slugs(text[]) from public;
revoke all on function public.get_job_timestamps_by_slugs(text[]) from public;
revoke all on function public.find_active_jobs_by_dedupe_keys(text[]) from public;

grant execute on function public.deactivate_jobs_by_slugs(text[]) to service_role;
grant execute on function public.get_job_timestamps_by_slugs(text[]) to service_role;
grant execute on function public.find_active_jobs_by_dedupe_keys(text[]) to service_role;
