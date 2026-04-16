-- =====================================================
-- FIX: Auth trigger for user signup
-- Run this in Supabase SQL Editor to fix the
-- "DATABASE ERROR SAVING NEW USER" issue
-- =====================================================

-- Drop the old broken trigger
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Recreate with proper search_path and error handling
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_role public.user_role;
begin
  -- Default to student
  default_role := 'student'::public.user_role;
  
  -- Try to read role from signup metadata
  if new.raw_user_meta_data is not null 
     and new.raw_user_meta_data->>'role' is not null 
     and new.raw_user_meta_data->>'role' != '' then
    begin
      default_role := (new.raw_user_meta_data->>'role')::public.user_role;
    exception when others then
      -- If cast fails, fall back to student
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
