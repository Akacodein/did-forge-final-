-- Try to drop the problematic foreign key constraint if it exists
ALTER TABLE public.issuer_applications 
DROP CONSTRAINT IF EXISTS issuer_applications_id_fkey;