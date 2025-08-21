-- Fix the search_path security warning for the prevent_admin_role_reset function
CREATE OR REPLACE FUNCTION public.prevent_admin_role_reset()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent role reset for the main admin user
  IF OLD.email = 'akaworkoholic@gmail.com' AND NEW.role != 'admin' THEN
    NEW.role = 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';