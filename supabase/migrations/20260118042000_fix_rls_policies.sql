-- Fix RLS policies for profiles and user_roles to allow inserts during registration

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to insert their own role (for first user admin assignment)
CREATE POLICY "Users can insert their own role"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Also allow admins to insert roles (for approving staff)
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.is_admin());