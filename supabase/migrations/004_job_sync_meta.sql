-- מעקב אחר סנכרון משרות אוטומטי
create table if not exists public.job_sync_meta (
  id smallint primary key default 1 check (id = 1),
  last_synced_at timestamptz,
  sync_in_progress boolean not null default false,
  sync_started_at timestamptz
);

insert into public.job_sync_meta (id) values (1) on conflict (id) do nothing;

alter table public.job_sync_meta enable row level security;
