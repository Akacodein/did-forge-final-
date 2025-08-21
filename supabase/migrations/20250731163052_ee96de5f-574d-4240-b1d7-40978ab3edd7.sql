-- Fix issuer_applications table to have auto-generated UUID for id column
ALTER TABLE public.issuer_applications 
ALTER COLUMN id SET DEFAULT gen_random_uuid();