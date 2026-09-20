-- What changed: Staging schema for when the MVP moves from local JSON to Supabase.
-- Why: Brief asks for PostgreSQL / Supabase + role-based auth.
-- Related: backend/src/store.js
-- NOTE: Local demo uses JSON until SUPABASE_URL is set.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  role text not null check (role in ('user', 'director')) default 'user',
  created_at timestamptz default now()
);

create table if not exists public.researchers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  academic_position text,
  primary_research_areas text[],
  specific_interests text[],
  keywords text[],
  current_projects text[],
  past_projects text[],
  google_scholar_url text,
  publication_count int,
  opportunity_types text[],
  preferred_duration text,
  availability_status text,
  willingness_to_lead boolean default false,
  technical_skills text[],
  additional_skills text,
  cv_url text,
  website text,
  linkedin_url text,
  bio text
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  need_text text not null,
  language text not null default 'en',
  result jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.collaboration_requests (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  user_id uuid references public.profiles(id) on delete cascade,
  match_id uuid references public.matches(id),
  need_text text not null,
  selection_type text not null,
  researcher_ids uuid[] not null,
  user_note text,
  status text not null check (status in ('pending', 'approved', 'rejected', 'changes_requested')) default 'pending',
  director_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.researchers enable row level security;
alter table public.matches enable row level security;
alter table public.collaboration_requests enable row level security;
