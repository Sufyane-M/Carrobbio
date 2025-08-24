-- Fix RLS policies for contacts table to allow anonymous inserts
-- This migration resolves the "new row violates row-level security policy" error

-- First, disable RLS temporarily to clean up all existing policies
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow public insert contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated read contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to view all contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to update all contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to delete all contacts" ON contacts;
DROP POLICY IF EXISTS "contacts_insert_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_select_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_update_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_delete_policy" ON contacts;
DROP POLICY IF EXISTS "contacts_insert_anon" ON contacts;
DROP POLICY IF EXISTS "contacts_select_auth" ON contacts;
DROP POLICY IF EXISTS "contacts_update_auth" ON contacts;
DROP POLICY IF EXISTS "contacts_delete_auth" ON contacts;

-- Re-enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create new comprehensive policies
-- Policy 1: Allow anonymous users to insert contacts (for contact form submissions)
CREATE POLICY "contacts_anonymous_insert" ON contacts
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy 2: Allow authenticated users to select all contacts (for admin dashboard)
CREATE POLICY "contacts_authenticated_select" ON contacts
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 3: Allow authenticated users to update contacts (for admin management)
CREATE POLICY "contacts_authenticated_update" ON contacts
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete contacts (for admin management)
CREATE POLICY "contacts_authenticated_delete" ON contacts
    FOR DELETE
    TO authenticated
    USING (true);

-- Grant necessary table permissions
GRANT INSERT ON contacts TO anon;
GRANT SELECT, UPDATE, DELETE ON contacts TO authenticated;

-- Grant sequence permissions for UUID generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify the policies are created correctly
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
WHERE tablename = 'contacts'
ORDER BY policyname;