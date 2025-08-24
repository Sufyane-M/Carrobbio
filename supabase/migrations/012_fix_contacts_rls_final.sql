-- Final fix for RLS policies on contacts table
-- This migration handles UUID primary keys correctly

-- Drop all existing policies dynamically
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'contacts' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON contacts', policy_record.policyname);
    END LOOP;
END $$;

-- Temporarily disable RLS
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous users to insert contact messages
CREATE POLICY "contacts_anon_insert" ON contacts
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create policies for authenticated users to manage contacts
CREATE POLICY "contacts_auth_select" ON contacts
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "contacts_auth_update" ON contacts
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "contacts_auth_delete" ON contacts
    FOR DELETE
    TO authenticated
    USING (true);

-- Revoke all existing permissions first
REVOKE ALL ON contacts FROM anon;
REVOKE ALL ON contacts FROM authenticated;

-- Grant INSERT permission to anon role (for contact form submissions)
GRANT INSERT ON contacts TO anon;

-- Grant full permissions to authenticated role (for admin management)
GRANT SELECT, INSERT, UPDATE, DELETE ON contacts TO authenticated;

-- Verify the configuration
SELECT 'RLS Policies:' as section;
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies 
WHERE tablename = 'contacts' AND schemaname = 'public'
ORDER BY policyname;

SELECT 'Table Permissions:' as section;
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'contacts' 
AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;