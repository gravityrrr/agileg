-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enum for User Roles
create type user_role as enum ('student', 'instructor', 'admin');
create type user_status as enum ('active', 'suspended', 'pending');
create type assessment_status as enum ('draft', 'published', 'archived');
create type attempt_status as enum ('in_progress', 'completed', 'abandoned');

-- ORGANIZATIONS
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROFILES (Users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role user_role not null default 'student',
  status user_status not null default 'active',
  organization_id uuid references organizations(id) on delete set null,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COURSES
create table courses (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  instructor_id uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  status assessment_status not null default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ASSESSMENTS
create table assessments (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  description text,
  duration_minutes integer not null default 60,
  passing_score integer not null default 60,
  status assessment_status not null default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QUESTIONS
create table questions (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid references assessments(id) on delete cascade not null,
  text text not null,
  points integer not null default 1,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QUESTION OPTIONS
create table question_options (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid references questions(id) on delete cascade not null,
  text text not null,
  is_correct boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ASSIGNMENTS (Assessments assigned to Students)
create table assignments (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid references assessments(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  due_date timestamp with time zone,
  status text not null default 'pending', -- pending, in_progress, completed, overdue
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ATTEMPTS
create table assessment_attempts (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references assignments(id) on delete set null,
  user_id uuid references profiles(id) on delete cascade not null,
  assessment_id uuid references assessments(id) on delete cascade not null,
  status attempt_status not null default 'in_progress',
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  score integer,
  passed boolean
);

-- ANSWERS
create table attempt_answers (
  id uuid primary key default uuid_generate_v4(),
  attempt_id uuid references assessment_attempts(id) on delete cascade not null,
  question_id uuid references questions(id) on delete cascade not null,
  option_id uuid references question_options(id) on delete cascade not null,
  is_correct boolean,
  points_awarded integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRIGGERS & PROCEDURES

-- Handle new user creation and auto-create profile via trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'Student User'), 
    new.email, 
    coalesce(new.raw_user_meta_data->>'role', 'student')::user_role
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS everywhere
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table courses enable row level security;
alter table assessments enable row level security;
alter table questions enable row level security;
alter table question_options enable row level security;
alter table assignments enable row level security;
alter table assessment_attempts enable row level security;
alter table attempt_answers enable row level security;


-- VERY PERMISSIVE POLICIES FOR INITIAL DEVELOPMENT (To be locked down later)
create policy "Allow all operations for authenticated users on organizations" on organizations for all using (auth.role() = 'authenticated');
create policy "Allow all operations for authenticated users on profiles" on profiles for all using (auth.role() = 'authenticated');
create policy "Allow all operations for authenticated users on courses" on courses for all using (auth.role() = 'authenticated');
create policy "Allow all operations for authenticated users on assessments" on assessments for all using (auth.role() = 'authenticated');
create policy "Allow all operations for authenticated users on questions" on questions for all using (auth.role() = 'authenticated');
create policy "Allow all operations for authenticated users on question_options" on question_options for all using (auth.role() = 'authenticated');
create policy "Allow all operations for authenticated users on assignments" on assignments for all using (auth.role() = 'authenticated');
create policy "Allow all operations for authenticated users on assessment_attempts" on assessment_attempts for all using (auth.role() = 'authenticated');
create policy "Allow all operations for authenticated users on attempt_answers" on attempt_answers for all using (auth.role() = 'authenticated');

-- Mock Initial Data for Admin
insert into public.organizations (name) values ('Acme Corp Future Tech');
