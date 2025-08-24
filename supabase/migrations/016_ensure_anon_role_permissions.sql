-- Ensure anon role exists and has proper permissions
-- This migration will create the anon role if it doesn't exist and grant permissions

-- Create anon role if it doesn't exist (this might fail if it already exists, which is fine)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
END $$;

-- Create authenticated role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
    END IF;
END $$;

-- Grant usage on schema public to both roles
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on contacts table
GRANT INSERT ON public.contacts TO anon;
GRANT ALL PRIVILEGES ON public.contacts TO authenticated;

-- Also grant to the service_role if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        GRANT ALL PRIVILEGES ON public.contacts TO service_role;
    END IF;
END $$;

-- Verify the roles exist
SELECT rolname, rolcanlogin, rolsuper 
FROM pg_roles 
WHERE rolname IN ('anon', 'authenticated', 'service_role')
ORDER BY rolname;

-- Verify permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'contacts' 
ORDER BY grantee, privilege_type;