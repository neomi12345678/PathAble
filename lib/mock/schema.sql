-- עתיד מתאים – סכמת DB לייחוס (לא מופעלת במצב mock)
-- הרץ ב-Supabase כשתעברי מ-mock לפרודקשן

-- פרופיל משתמש
create table profiles (
  id uuid references auth.users primary key,
  email text,
  first_name text,
  last_name text,
  phone text,
  age int,
  city text,
  sector text check (sector in ('חילוני','דתי','חרדי','מסורתי')),
  disability_type text,
  role text default 'user' check (role in ('user','parent','professional','admin')),
  created_at timestamp default now()
);

-- שאלות אבחון
create table questions (
  id uuid primary key default gen_random_uuid(),
  title text,
  category text,
  weight int default 1,
  active boolean default true
);

-- אבחונים
create table assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  created_at timestamp default now()
);

-- תשובות
create table answers (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id),
  question_id uuid references questions(id),
  answer int
);

-- תוצאות אבחון
create table assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  summary text,
  strengths text[],
  challenges text[],
  recommendations text[],
  created_at timestamp default now()
);

-- מקצועות
create table professions (
  id uuid primary key default gen_random_uuid(),
  name text,
  description text,
  salary_range text,
  education text,
  skills text[],
  work_environment text,
  social_interaction_level text,
  disability_fit text[],
  video_url text,
  active boolean default true
);

-- משרות
create table jobs (
  id uuid primary key default gen_random_uuid(),
  title text,
  company text,
  city text,
  description text,
  salary text,
  apply_url text,
  work_from_home boolean default false,
  accessibility boolean default false,
  scope text,
  active boolean default true,
  created_at timestamp default now()
);

-- מודולי למידה
create table learning_modules (
  id uuid primary key default gen_random_uuid(),
  title text,
  category text,
  content text,
  video_url text,
  order_index int
);

-- מודולי מיומנויות
create table skills_modules (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  difficulty text,
  order_index int
);

-- התקדמות משתמש
create table user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  module_id uuid,
  module_type text,
  progress int default 0,
  completed boolean default false,
  updated_at timestamp default now()
);

-- סשן צ'אט
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  created_at timestamp default now()
);

-- הודעות צ'אט
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id),
  role text check (role in ('user','assistant')),
  message text,
  created_at timestamp default now()
);

-- מקצועות שמורים
create table saved_professions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  profession_id uuid references professions(id),
  created_at timestamp default now()
);

-- הישגים
create table achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  type text,
  earned_at timestamp default now()
);
