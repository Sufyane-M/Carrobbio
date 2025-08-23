-- Fix RLS policies for contacts table to allow anonymous inserts
-- This migration ensures anonymous users can submit contact forms

-- Temporarily disable RLS to modify policies
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on contacts table
DROP POLICY IF EXISTS "contacts_anonymous_insert" ON contacts;
DROP POLICY IF EXISTS "contacts_authenticated_select" ON contacts;
DROP POLICY IF EXISTS "contacts_authenticated_update" ON contacts;
DROP POLICY IF EXISTS "contacts_authenticated_delete" ON contacts;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON contacts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON contacts;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON contacts;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON contacts;

-- Re-enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous users to insert contact messages
CREATE POLICY "Allow anonymous contact submissions" ON contacts
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create policies for authenticated users (admin) to manage contacts
CREATE POLICY "Allow authenticated users to view contacts" ON contacts
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to update contacts" ON contacts
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete contacts" ON contacts
    FOR DELETE
    TO authenticated
    USING (true);

-- Grant necessary permissions to anon role for inserting
GRANT INSERT ON contacts TO anon;
GRANT USAGE ON SEQUENCE contacts_id_seq TO anon;

-- Grant full permissions to authenticated role
GRANT ALL PRIVILEGES ON contacts TO authenticated;
GRANT ALL PRIVILEGES ON SEQUENCE contacts_id_seq TO authenticated;

-- Verify the policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'contacts';

-- Check current permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'contacts' 
AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;