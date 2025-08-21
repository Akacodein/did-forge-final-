-- Drop the problematic foreign key constraint on issuer_applications
ALTER TABLE public.issuer_applications 
DROP CONSTRAINT IF EXISTS issuer_applications_id_fkey;