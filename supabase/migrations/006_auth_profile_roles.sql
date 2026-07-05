-- FEE Kuwait — sign-up profile creation with role & language
--
-- migration 001 created a handle_new_user() trigger that copied only the name.
-- Real sign-up needs the chosen role (school / business / auditor / …),
-- bilingual name and preferred language, which the client passes as user
-- metadata (auth.users.raw_user_meta_data) at signUp().
--
-- Roles were extended to include 'auditor' (002) and 'certification_body' (003),
-- so metadata role values are validated by the users.role check constraint.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role, name_en, name_ar, preferred_language)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'school'),
    new.raw_user_meta_data->>'name_en',
    new.raw_user_meta_data->>'name_ar',
    coalesce(nullif(new.raw_user_meta_data->>'preferred_language', ''), 'en')
  )
  on conflict (id) do update
    set email = excluded.email,
        role = coalesce(nullif(excluded.role, ''), public.users.role),
        name_en = coalesce(excluded.name_en, public.users.name_en),
        name_ar = coalesce(excluded.name_ar, public.users.name_ar);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger already exists from 001 (on_auth_user_created); replacing the
-- function above is enough. Re-create defensively in case 001 was partial.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
