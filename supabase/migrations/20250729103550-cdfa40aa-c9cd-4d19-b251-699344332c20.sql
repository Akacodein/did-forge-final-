-- Let's completely clean up the profiles table policies and start fresh
-- First disable RLS temporarily to avoid any conflicts
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can update roles" ON public.profiles;
DROP POLICY IF EXISTS "Allow user or admin to read profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to update any profile" ON public.profiles;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create completely new, simple policies that won't cause recursion
-- Basic user access policies
CREATE POLICY "users_view_own_profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Admin access policies using a different approach
-- First, let's create a simple function to check if current user is admin
DROP FUNCTION IF EXISTS public.is_admin();
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Admin policies using the function
CREATE POLICY "admin_view_all_profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "admin_update_all_profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin());