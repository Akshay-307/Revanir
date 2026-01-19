-- Make pin_hash optional as we are moving to password auth
ALTER TABLE public.profiles ALTER COLUMN pin_hash DROP NOT NULL;

-- Add email column for convenience (optional, as it's in auth.users, but good for display)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update the handle_new_user function to handle email auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_first_user boolean;
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, name, phone, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    new.raw_user_meta_data->>'phone',
    new.email
  );

  -- Check if this is the first user
  SELECT count(*) = 1 INTO is_first_user FROM public.profiles;

  -- Create role entry
  IF is_first_user THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin');
  END IF;

  RETURN new;
END;
$$;
