-- Fix admin role issue by updating the specific user to admin role
-- This will set the role to admin for the authenticated user and prevent reset

UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE email = 'akaworkoholic@gmail.com';

-- Add a constraint to prevent accidental role resets for this specific admin user
-- This ensures the role stays as admin for this user
CREATE OR REPLACE FUNCTION public.prevent_admin_role_reset()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent role reset for the main admin user
  IF OLD.email = 'akaworkoholic@gmail.com' AND NEW.role != 'admin' THEN
    NEW.role = 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent admin role reset
DROP TRIGGER IF EXISTS prevent_admin_role_reset_trigger ON public.profiles;
CREATE TRIGGER prevent_admin_role_reset_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_role_reset();