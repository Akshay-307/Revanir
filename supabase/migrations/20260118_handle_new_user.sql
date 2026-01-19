-- Create a function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_first_user boolean;
begin
  -- Insert into profiles
  insert into public.profiles (user_id, name, phone, pin_hash)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'pin_hash' -- Note: we need to pass this in metadata now
  );

  -- Check if this is the first user
  select count(*) = 1 into is_first_user from public.profiles;

  -- Create role entry
  if is_first_user then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin');
  end if;

  return new;
end;
$$;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
