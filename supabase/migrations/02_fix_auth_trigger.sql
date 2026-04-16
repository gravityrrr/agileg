-- Fix for Supabase Auth trigger when user registers
drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_role public.user_role;
begin
  default_role := 'student'::public.user_role;
  
  if new.raw_user_meta_data is not null and new.raw_user_meta_data->>'role' is not null then
    default_role := (new.raw_user_meta_data->>'role')::public.user_role;
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
