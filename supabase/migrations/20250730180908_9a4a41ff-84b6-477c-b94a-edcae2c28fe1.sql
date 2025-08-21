-- Fix the remaining search_path security warning for the get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Use a direct query without referencing the profiles table in a recursive way
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$$;