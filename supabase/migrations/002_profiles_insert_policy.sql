-- Fix infinite recursion: profiles_admin_read must not query profiles directly in RLS.
-- Run in Supabase SQL Editor after 001_initial.sql

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists profiles_admin_read on profiles;
create policy profiles_admin_read on profiles
  for select using (public.is_admin());

drop policy if exists profiles_insert_own on profiles;
create policy profiles_insert_own on profiles
  for insert with check (auth.uid() = id);
