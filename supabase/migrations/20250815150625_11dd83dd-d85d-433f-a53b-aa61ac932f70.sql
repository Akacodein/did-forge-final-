-- Make user_id NOT NULL in issuer_applications table
ALTER TABLE public.issuer_applications 
ALTER COLUMN user_id SET NOT NULL;