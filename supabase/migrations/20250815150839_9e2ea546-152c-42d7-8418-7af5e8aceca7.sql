-- Check if there's an incorrect foreign key constraint and drop it
DROP CONSTRAINT IF EXISTS issuer_applications_id_fkey ON public.issuer_applications;

-- Ensure the user_id column references the correct table/column (should not reference auth.users directly)
-- Since we have profiles table, but based on current usage, it seems user_id should just be UUID without FK
-- Let's check what foreign key constraints exist on issuer_applications table
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='issuer_applications';