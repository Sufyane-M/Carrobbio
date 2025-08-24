-- Temporarily disable RLS to test if the issue is with policies or base permissions
-- This is a diagnostic migration to isolate the problem

-- Disable RLS temporarily
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Ensure permissions are set correctly
GRANT INSERT ON contacts TO anon;
GRANT INSERT ON contacts TO public;
GRANT ALL ON contacts TO authenticated;

-- Check if the table is accessible now
SELECT 'RLS disabled, testing permissions' as status;

-- Show current permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'contacts' 
ORDER BY grantee, privilege_type;