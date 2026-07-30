-- PathAble / עתיד מתאים — initial schema
-- Run in Supabase SQL Editor

-- Profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  first_name text,
  last_name text,
  phone text,
  age int,
  city text,
  sector text check (sector in ('חילוני','דתי','חרדי','מסורתי')),
  disability_type text,
  autism_level text check (autism_level in ('גבוה','בינוני','נמוך')),
  role text not null default 'user' check (role in ('user','parent','professional','admin')),
  avatar text,
  onboarding_complete boolean not null default false,
  bio text,
  interests text[] default '{}',
  skills text[] default '{}',
  created_at timestamptz not null default now()
);

-- Catalog: questions
create table if not exists questions (
  slug text primary key,
  title text not null,
  category text not null,
  weight int not null default 1,
  active boolean not null default true
);

-- Catalog: professions
create table if not exists professions (
  slug text primary key,
  name text not null,
  description text not null,
  salary_range text not null,
  education text not null,
  skills text[] not null default '{}',
  work_environment text not null,
  social_interaction_level text not null,
  disability_fit text[] not null default '{}',
  video_url text,
  active boolean not null default true
);

-- Catalog: jobs
create table if not exists jobs (
  slug text primary key,
  title text not null,
  company text not null,
  city text not null,
  description text not null,
  salary text not null,
  apply_url text not null,
  work_from_home boolean not null default false,
  accessibility boolean not null default false,
  scope text not null,
  social_interaction_level text not null default 'בינוני',
  support_features text[] not null default '{}',
  autism_match_reason text not null default '',
  disability_fit text[] not null default '{}',
  profession_id text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Catalog: learning modules
create table if not exists learning_modules (
  slug text primary key,
  title text not null,
  category text not null,
  description text,
  video_url text,
  order_index int not null default 0,
  content_json jsonb
);

-- Catalog: skills modules
create table if not exists skills_modules (
  slug text primary key,
  title text not null,
  description text not null,
  difficulty text not null,
  order_index int not null default 0,
  content_json jsonb
);

-- User progress
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  module_id text not null,
  module_type text not null check (module_type in ('learning','skill')),
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  completed boolean not null default false,
  progress_meta jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, module_id, module_type)
);

-- Assessments
create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  question_slug text not null references questions(slug),
  answer int not null check (answer >= 1 and answer <= 5)
);

create table if not exists assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  summary text not null,
  strengths text[] not null default '{}',
  challenges text[] not null default '{}',
  recommendations text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Chat
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  message text not null,
  created_at timestamptz not null default now()
);

-- Saved professions
create table if not exists saved_professions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  profession_slug text not null references professions(slug),
  created_at timestamptz not null default now(),
  unique (user_id, profession_slug)
);

-- Achievements
create table if not exists achievement_badges (
  slug text primary key,
  title text not null,
  description text not null,
  icon text not null,
  category text not null default 'general'
);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  badge_slug text not null references achievement_badges(slug),
  earned_at timestamptz not null default now(),
  unique (user_id, badge_slug)
);

-- Rights
create table if not exists rights_topics (
  slug text primary key,
  title text not null,
  content text not null,
  order_index int not null default 0
);

create table if not exists rights_faqs (
  slug text primary key,
  question text not null,
  answer text not null,
  order_index int not null default 0
);

create table if not exists rights_organizations (
  slug text primary key,
  name text not null,
  description text not null,
  phone text,
  url text,
  order_index int not null default 0
);

-- Profile auto-create on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table profiles enable row level security;
alter table questions enable row level security;
alter table professions enable row level security;
alter table jobs enable row level security;
alter table learning_modules enable row level security;
alter table skills_modules enable row level security;
alter table user_progress enable row level security;
alter table assessments enable row level security;
alter table answers enable row level security;
alter table assessment_results enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table saved_professions enable row level security;
alter table achievement_badges enable row level security;
alter table achievements enable row level security;
alter table rights_topics enable row level security;
alter table rights_faqs enable row level security;
alter table rights_organizations enable row level security;

-- Profiles
create policy profiles_select_own on profiles for select using (auth.uid() = id);
create policy profiles_update_own on profiles for update using (auth.uid() = id);
create policy profiles_insert_own on profiles for insert with check (auth.uid() = id);

-- Public catalog read
create policy questions_public_read on questions for select using (active = true);
create policy professions_public_read on professions for select using (active = true);
create policy jobs_public_read on jobs for select using (active = true);
create policy learning_modules_public_read on learning_modules for select using (true);
create policy skills_modules_public_read on skills_modules for select using (true);
create policy achievement_badges_public_read on achievement_badges for select using (true);
create policy rights_topics_public_read on rights_topics for select using (true);
create policy rights_faqs_public_read on rights_faqs for select using (true);
create policy rights_orgs_public_read on rights_organizations for select using (true);

-- User-owned data
create policy user_progress_all on user_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy assessments_all on assessments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy assessment_results_all on assessment_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy saved_professions_all on saved_professions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy achievements_all on achievements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy chat_sessions_all on chat_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy chat_messages_select on chat_messages for select using (
  exists (
    select 1 from chat_sessions s
    where s.id = chat_messages.session_id and s.user_id = auth.uid()
  )
);
create policy chat_messages_insert on chat_messages for insert with check (
  exists (
    select 1 from chat_sessions s
    where s.id = chat_messages.session_id and s.user_id = auth.uid()
  )
);

-- Answers via assessment ownership
create policy answers_all on answers for all using (
  exists (
    select 1 from assessments a
    where a.id = answers.assessment_id and a.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from assessments a
    where a.id = answers.assessment_id and a.user_id = auth.uid()
  )
);

-- Admin read all profiles (via security definer — avoids RLS recursion)
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

create policy profiles_admin_read on profiles for select using (public.is_admin());
