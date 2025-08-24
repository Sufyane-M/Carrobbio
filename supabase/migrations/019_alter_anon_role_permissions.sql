-- Grant database-level permissions to anon role
-- This migration will modify the anon role to have the necessary permissions

-- Grant connect permission to anon role
GRANT CONNECT ON DATABASE postgres TO anon;

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon;

-- Grant create permission on public schema (needed for some operations)
GRANT CREATE ON SCHEMA public TO anon;

-- Grant all privileges on contacts table to anon
GRANT ALL PRIVILEGES ON public.contacts TO anon;

-- Also grant to public role as backup
GRANT ALL PRIVILEGES ON public.contacts TO public;

-- Make anon a member of public role (if it helps)
-- GRANT public TO anon;

-- Ensure anon can use all sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon;

-- Verify the role exists and has permissions
SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin, rolreplication
FROM pg_roles 
WHERE rolname = 'anon';

-- Check table permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'contacts'
AND grantee IN ('anon', 'public')
ORDER BY grantee, privilege_type;