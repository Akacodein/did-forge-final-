-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Drop ALL existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can update roles" ON public.profiles;
DROP POLICY IF EXISTS "Allow user or admin to read profile" ON public.profiles;

-- Create a security definer function to check admin role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  -- Use a direct query without referencing the profiles table in a recursive way
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create simple, non-recursive policies
CREATE POLICY "Allow users to view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Allow users to insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- For admin access, we'll use a different approach to avoid recursion
-- Create a simple policy that allows reading if user is admin
CREATE POLICY "Allow admin to view all profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Allow admin to update any profile"
ON public.profiles FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);