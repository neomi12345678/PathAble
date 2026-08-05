-- קטגוריית תחום למשרות (sync + סינון בלוח)
alter table public.jobs
  add column if not exists category text not null default 'other';

create index if not exists jobs_category_active_idx
  on public.jobs (category)
  where active = true;

-- קטגוריה למקצועות בקטלוג
alter table public.professions
  add column if not exists category text not null default 'other';

create index if not exists professions_category_active_idx
  on public.professions (category)
  where active = true;
