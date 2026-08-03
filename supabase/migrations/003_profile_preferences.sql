-- Add a preferences column for user settings (email notifications etc.)
alter table public.profiles
  add column if not exists preferences jsonb not null default '{}'::jsonb;
