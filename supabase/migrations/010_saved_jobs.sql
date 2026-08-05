-- שמירת משרות לעיון מאוחר
create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_slug text not null references public.jobs(slug) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, job_slug)
);

alter table public.saved_jobs enable row level security;

create policy saved_jobs_all on public.saved_jobs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists saved_jobs_user_id_idx
  on public.saved_jobs (user_id);
