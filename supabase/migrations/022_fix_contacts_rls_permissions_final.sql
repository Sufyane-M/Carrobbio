-- Fix RLS permissions for contacts table - Final solution
-- This migration ensures anonymous users can insert contact messages

-- First, disable RLS temporarily to clean up
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'contacts'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.contacts', policy_record.policyname);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create a simple policy for anonymous users to insert contacts
CREATE POLICY "contacts_anonymous_insert_policy" ON public.contacts
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create a policy for public role as backup
CREATE POLICY "contacts_public_insert_policy" ON public.contacts
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Create policies for authenticated users (admin access)
CREATE POLICY "contacts_authenticated_all_policy" ON public.contacts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant explicit permissions to roles
GRANT INSERT ON public.contacts TO anon;
GRANT INSERT ON public.contacts TO public;
GRANT ALL PRIVILEGES ON public.contacts TO authenticated;

-- Ensure the anon role has the necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO public;

-- Verify the setup
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'contacts';

-- List all policies for verification
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
WHERE schemaname = 'public' AND tablename = 'contacts'
ORDER BY policyname;

-- Check permissions
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'contacts' 
    AND grantee IN ('anon', 'public', 'authenticated')
ORDER BY grantee, privilege_type;