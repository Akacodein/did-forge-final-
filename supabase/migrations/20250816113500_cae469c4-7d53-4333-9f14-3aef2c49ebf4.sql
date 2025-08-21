-- Add foreign key constraint between issuer_applications and profiles
ALTER TABLE public.issuer_applications 
ADD CONSTRAINT issuer_applications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;