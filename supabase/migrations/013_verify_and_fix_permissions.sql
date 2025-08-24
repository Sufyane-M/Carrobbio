-- Verify and fix permissions for contacts table
-- This migration will check current permissions and fix them if needed

-- First, let's see what permissions currently exist
SELECT 'Current table permissions:' as info;
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'contacts' 
AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- Check current RLS policies
SELECT 'Current RLS policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'contacts' AND schemaname = 'public'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT 'RLS status:' as info;
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'contacts' AND schemaname = 'public';

-- Now fix the permissions
-- First revoke all existing permissions
REVOKE ALL ON contacts FROM anon;
REVOKE ALL ON contacts FROM authenticated;
REVOKE ALL ON contacts FROM public;

-- Grant INSERT permission to anon role explicitly
GRANT INSERT ON contacts TO anon;

-- Grant full permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON contacts TO authenticated;

-- Also grant to public role as a fallback
GRANT INSERT ON contacts TO public;

-- Verify the permissions were applied
SELECT 'Updated table permissions:' as info;
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'contacts' 
AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee, privilege_type;