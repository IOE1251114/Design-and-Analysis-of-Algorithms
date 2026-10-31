-- VATRIX database schema for Supabase (PostgreSQL).
-- Run this whole file once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- It is safe to run again: every statement checks whether its object already exists.
--
-- Security model (matches the app today): there are no passwords — a student is identified by the
-- name they type. The website uses the public "publishable" (anon) key, so these policies decide what
-- any visitor may do: read everything, add students/attempts/assignments, update activity totals,
-- and delete only demo students. Nobody can edit or delete real attempts through the website.
-- See the README section "Database (Supabase)" for how to tighten this with Supabase Auth.

-- ---------- Tables ----------

create table if not exists public.students (
  id          text primary key check (id ~ '^[a-z0-9-]{1,80}$'),
  name        text not null check (char_length(name) between 1 and 80),
  demo        boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.attempts (
  id             bigint generated always as identity primary key,
  student_id     text not null references public.students (id) on delete cascade,
  problem_id     text not null check (char_length(problem_id) <= 40),
  topic          text not null check (char_length(topic) <= 40),
  correct        boolean not null,
  given          text not null default '' check (char_length(given) <= 200),
  misconception  text check (char_length(misconception) <= 200),
  hint           boolean not null default false,
  at             timestamptz not null default now()
);
create index if not exists attempts_student_at on public.attempts (student_id, at);

create table if not exists public.activity (
  student_id  text not null references public.students (id) on delete cascade,
  topic       text not null check (char_length(topic) <= 40),
  seconds     integer not null default 0 check (seconds >= 0),
  steps       integer not null default 0 check (steps >= 0),
  updated_at  timestamptz not null default now(),
  primary key (student_id, topic)
);

create table if not exists public.assignments (
  id           text primary key check (char_length(id) <= 40),
  title        text not null check (char_length(title) between 1 and 200),
  problem_ids  text[] not null,
  auto         boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ---------- Row Level Security ----------

alter table public.students    enable row level security;
alter table public.attempts    enable row level security;
alter table public.activity    enable row level security;
alter table public.assignments enable row level security;

drop policy if exists "read students"         on public.students;
drop policy if exists "add students"          on public.students;
drop policy if exists "remove demo students"  on public.students;
create policy "read students"        on public.students for select to anon, authenticated using (true);
create policy "add students"         on public.students for insert to anon, authenticated with check (true);
create policy "remove demo students" on public.students for delete to anon, authenticated using (demo);

drop policy if exists "read attempts" on public.attempts;
drop policy if exists "add attempts"  on public.attempts;
create policy "read attempts" on public.attempts for select to anon, authenticated using (true);
create policy "add attempts"  on public.attempts for insert to anon, authenticated with check (true);

drop policy if exists "read activity"   on public.activity;
drop policy if exists "add activity"    on public.activity;
drop policy if exists "update activity" on public.activity;
create policy "read activity"   on public.activity for select to anon, authenticated using (true);
create policy "add activity"    on public.activity for insert to anon, authenticated with check (true);
create policy "update activity" on public.activity for update to anon, authenticated using (true) with check (true);

drop policy if exists "read assignments" on public.assignments;
drop policy if exists "add assignments"  on public.assignments;
create policy "read assignments" on public.assignments for select to anon, authenticated using (true);
create policy "add assignments"  on public.assignments for insert to anon, authenticated with check (true);

-- ---------- Realtime ----------
-- Lets an open Teacher dashboard update by itself when a student answers a question.

do $$
declare t text;
begin
  foreach t in array array['students', 'attempts', 'activity', 'assignments'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
