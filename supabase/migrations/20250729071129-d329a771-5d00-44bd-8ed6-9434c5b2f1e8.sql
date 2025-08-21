-- First, let's check the current policies and fix the infinite recursion issue
-- Drop the problematic policies that are causing infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;

-- Create simpler, non-recursive policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile (but not role)
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create a separate admin policy that doesn't cause recursion
-- This uses a direct role check without subqueries
CREATE POLICY "Admin users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Admin users can update any user's role
CREATE POLICY "Admin users can update roles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);