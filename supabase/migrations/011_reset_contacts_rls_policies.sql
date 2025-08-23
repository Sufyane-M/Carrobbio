-- Reset and fix RLS policies for contacts table
-- This migration completely resets all policies and permissions

-- First, get all existing policies and drop them
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on contacts table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'contacts' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON contacts', policy_record.policyname);
    END LOOP;
END $$;

-- Temporarily disable RLS to ensure clean state
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create new policies with unique names
CREATE POLICY "contacts_anon_insert_policy" ON contacts
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "contacts_auth_select_policy" ON contacts
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "contacts_auth_update_policy" ON contacts
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "contacts_auth_delete_policy" ON contacts
    FOR DELETE
    TO authenticated
    USING (true);

-- Revoke all existing permissions first
REVOKE ALL ON contacts FROM anon;
REVOKE ALL ON contacts FROM authenticated;
REVOKE ALL ON SEQUENCE contacts_id_seq FROM anon;
REVOKE ALL ON SEQUENCE contacts_id_seq FROM authenticated;

-- Grant specific permissions
GRANT INSERT ON contacts TO anon;
GRANT USAGE, SELECT ON SEQUENCE contacts_id_seq TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON contacts TO authenticated;
GRANT ALL ON SEQUENCE contacts_id_seq TO authenticated;

-- Verify the setup
SELECT 'Policies created:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'contacts' AND schemaname = 'public';

SELECT 'Permissions granted:' as info;
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'contacts' 
AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;