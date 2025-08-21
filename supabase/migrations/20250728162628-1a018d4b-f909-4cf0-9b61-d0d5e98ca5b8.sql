
-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'holder';

-- Create issuer_applications table to store issuer requests
CREATE TABLE IF NOT EXISTS issuer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_name TEXT NOT NULL,
  official_email TEXT NOT NULL,
  website_url TEXT,
  dns_verification BOOLEAN DEFAULT false,
  email_verification BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on issuer_applications
ALTER TABLE issuer_applications ENABLE ROW LEVEL SECURITY;

-- Policy for users to create their own applications
CREATE POLICY "Users can create their own applications"
ON issuer_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for users to view their own applications
CREATE POLICY "Users can view their own applications"
ON issuer_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for admins to view all applications
CREATE POLICY "Admins can view all applications"
ON issuer_applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy for admins to update applications
CREATE POLICY "Admins can update applications"
ON issuer_applications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy for admins to manage user roles in profiles
CREATE POLICY "Admins can update user roles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() 
    AND p2.role = 'admin'
  )
);

-- Policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() 
    AND p2.role = 'admin'
  )
);

-- Create an admin user (you can update this with your actual admin email)
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  auth.uid(),
  'admin@example.com',
  'System Admin',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE role = 'admin'
);
