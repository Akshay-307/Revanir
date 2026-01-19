-- Fix RLS policies to ensure admins can see all members

-- 1. Drop existing policies that might be restrictive
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- 2. Re-create permissive policies for Admins on PROFILES
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  public.is_admin()
);

-- Allow admins to delete profiles (for Deny functionality)
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
USING (
  public.is_admin()
);

-- 3. Re-create permissive policies for Admins on USER_ROLES
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (
  public.is_admin()
);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (
  public.is_admin()
);

-- 4. Ensure is_admin() is robust (optional, but good safety)
-- (Assuming is_admin exists and is SECURITY DEFINER, which it is from previous migrations)
