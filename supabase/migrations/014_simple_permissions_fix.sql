-- Simple fix for contacts table permissions
-- Grant explicit permissions to anon and authenticated roles

-- Revoke all existing permissions first
REVOKE ALL ON contacts FROM anon;
REVOKE ALL ON contacts FROM authenticated;
REVOKE ALL ON contacts FROM public;

-- Grant INSERT permission to anon role (for contact form)
GRANT INSERT ON contacts TO anon;

-- Grant full permissions to authenticated role (for admin)
GRANT SELECT, INSERT, UPDATE, DELETE ON contacts TO authenticated;

-- Also grant INSERT to public role as additional fallback
GRANT INSERT ON contacts TO public;

-- Verify permissions were granted
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'contacts' 
AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee, privilege_type;