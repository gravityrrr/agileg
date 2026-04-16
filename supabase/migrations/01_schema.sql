-- =====================================================
-- SKILL_CORE_OS — Full Database Schema
-- Run this FIRST in Supabase SQL Editor
-- =====================================================

-- Enable UUID
create extension if not exists "uuid-ossp";

-- Enums
do $$ begin
  create type user_role as enum ('student', 'instructor', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type user_status as enum ('active', 'suspended', 'pending');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type assessment_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type attempt_status as enum ('in_progress', 'completed', 'abandoned');
exception when duplicate_object then null;
end $$;

-- ORGANIZATIONS
create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now() not null
);

-- PROFILES
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role user_role not null default 'student',
  status user_status not null default 'active',
  organization_id uuid references organizations(id) on delete set null,
  last_login_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- COURSES
create table if not exists courses (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  instructor_id uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  status assessment_status not null default 'draft',
  created_at timestamptz default now() not null
);

-- ASSESSMENTS
create table if not exists assessments (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  description text,
  duration_minutes integer not null default 60,
  passing_score integer not null default 60,
  status assessment_status not null default 'draft',
  created_at timestamptz default now() not null
);

-- QUESTIONS
create table if not exists questions (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid references assessments(id) on delete cascade not null,
  text text not null,
  points integer not null default 1,
  order_index integer not null default 0,
  created_at timestamptz default now() not null
);

-- QUESTION OPTIONS
create table if not exists question_options (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid references questions(id) on delete cascade not null,
  text text not null,
  is_correct boolean not null default false,
  created_at timestamptz default now() not null
);

-- ASSIGNMENTS
create table if not exists assignments (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid references assessments(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  due_date timestamptz,
  status text not null default 'pending',
  created_at timestamptz default now() not null
);

-- ATTEMPTS
create table if not exists assessment_attempts (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references assignments(id) on delete set null,
  user_id uuid references profiles(id) on delete cascade not null,
  assessment_id uuid references assessments(id) on delete cascade not null,
  status attempt_status not null default 'in_progress',
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  score integer,
  passed boolean
);

-- ANSWERS
create table if not exists attempt_answers (
  id uuid primary key default uuid_generate_v4(),
  attempt_id uuid references assessment_attempts(id) on delete cascade not null,
  question_id uuid references questions(id) on delete cascade not null,
  option_id uuid references question_options(id) on delete cascade not null,
  is_correct boolean,
  points_awarded integer,
  created_at timestamptz default now() not null
);
