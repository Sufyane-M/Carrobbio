-- Explicitly grant permissions to anon role using service role privileges
-- This migration will ensure anon role has INSERT permissions on contacts table

-- First, ensure the anon role exists and has basic permissions
GRANT USAGE ON SCHEMA public TO anon;

-- Grant INSERT permission explicitly to anon role
GRANT INSERT ON public.contacts TO anon;

-- Also grant to public role as a fallback
GRANT INSERT ON public.contacts TO public;

-- Ensure authenticated role has full permissions
GRANT ALL PRIVILEGES ON public.contacts TO authenticated;

-- Make sure anon can use sequences if needed (though we use UUIDs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO public;

-- Grant default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT ON TABLES TO public;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO authenticated;

-- Verify the grants were applied
SELECT 
    schemaname,
    tablename,
    grantor,
    grantee,
    privilege_type,
    is_grantable
FROM pg_catalog.pg_tables t
JOIN information_schema.table_privileges tp ON t.tablename = tp.table_name
WHERE t.schemaname = 'public' 
AND t.tablename = 'contacts'
AND tp.grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee, privilege_type;