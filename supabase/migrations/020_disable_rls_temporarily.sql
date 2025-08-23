-- Temporarily disable RLS to allow anonymous inserts
-- This is a temporary fix to test the contact form

ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'contacts';