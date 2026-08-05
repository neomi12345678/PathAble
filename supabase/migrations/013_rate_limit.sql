-- Distributed rate limiting for serverless (service_role only).

create table if not exists public.rate_limit_buckets (
  bucket_key text primary key,
  hit_count int not null default 1,
  reset_at timestamptz not null
);

alter table public.rate_limit_buckets enable row level security;

create or replace function public.check_rate_limit(
  p_key text,
  p_limit int,
  p_window_seconds int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_count int;
  v_reset_at timestamptz;
  v_window interval := make_interval(secs => p_window_seconds);
begin
  insert into public.rate_limit_buckets (bucket_key, hit_count, reset_at)
  values (p_key, 1, v_now + v_window)
  on conflict (bucket_key) do update
    set hit_count = case
          when public.rate_limit_buckets.reset_at <= v_now then 1
          else public.rate_limit_buckets.hit_count + 1
        end,
        reset_at = case
          when public.rate_limit_buckets.reset_at <= v_now then v_now + v_window
          else public.rate_limit_buckets.reset_at
        end
  returning hit_count, reset_at into v_count, v_reset_at;

  if v_count > p_limit then
    return jsonb_build_object(
      'ok', false,
      'retry_after_sec', greatest(
        1,
        ceil(extract(epoch from (v_reset_at - v_now)))::int
      )
    );
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.check_rate_limit(text, int, int) to service_role;
