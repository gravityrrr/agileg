-- =====================================================
-- RLS Policies & Trigger
-- Run this AFTER 01_schema.sql
-- =====================================================

-- Trigger: Auto-create profile on signup
drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_role public.user_role;
begin
  default_role := 'student'::public.user_role;
  
  if new.raw_user_meta_data is not null and new.raw_user_meta_data->>'role' is not null then
    begin
      default_role := (new.raw_user_meta_data->>'role')::public.user_role;
    exception when others then
      default_role := 'student'::public.user_role;
    end;
  end if;

  insert into public.profiles (id, full_name, email, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'System User'), 
    new.email, 
    default_role
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table courses enable row level security;
alter table assessments enable row level security;
alter table questions enable row level security;
alter table question_options enable row level security;
alter table assignments enable row level security;
alter table assessment_attempts enable row level security;
alter table attempt_answers enable row level security;

-- Policies: Allow authenticated users full access (for MVP)
-- In production, lock these down per-role
do $$ 
declare
  tbl text;
begin
  for tbl in select unnest(array[
    'organizations','profiles','courses','assessments',
    'questions','question_options','assignments',
    'assessment_attempts','attempt_answers'
  ]) loop
    execute format('drop policy if exists "auth_all_%s" on %s', tbl, tbl);
    execute format(
      'create policy "auth_all_%s" on %s for all using (auth.role() = ''authenticated'')',
      tbl, tbl
    );
  end loop;
end $$;
