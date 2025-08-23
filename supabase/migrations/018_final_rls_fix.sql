-- Final RLS fix: Enable RLS with proper policies for anonymous inserts

-- First, ensure RLS is enabled
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow anonymous contact submissions" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated users to view contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated users to update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated users to delete contacts" ON public.contacts;
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.contacts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.contacts;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.contacts;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.contacts;

-- Create new policies that allow anonymous inserts
CREATE POLICY "allow_anon_insert" ON public.contacts
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "allow_public_insert" ON public.contacts
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "allow_authenticated_all" ON public.contacts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Ensure permissions are granted
GRANT INSERT ON public.contacts TO anon;
GRANT INSERT ON public.contacts TO public;
GRANT ALL PRIVILEGES ON public.contacts TO authenticated;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify RLS is enabled and policies exist
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'contacts';

-- List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'contacts';