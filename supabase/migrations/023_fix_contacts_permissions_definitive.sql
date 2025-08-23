-- Definitive fix for contacts table RLS permissions
-- This migration ensures anonymous users can insert contact messages

-- First, check if the table exists and has RLS enabled
DO $$
BEGIN
    -- Disable RLS temporarily to clean up
    ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies to start fresh
    DROP POLICY IF EXISTS "contacts_anonymous_insert_policy" ON public.contacts;
    DROP POLICY IF EXISTS "contacts_public_insert_policy" ON public.contacts;
    DROP POLICY IF EXISTS "contacts_authenticated_all_policy" ON public.contacts;
    DROP POLICY IF EXISTS "contacts_anon_insert_policy" ON public.contacts;
    DROP POLICY IF EXISTS "contacts_auth_select_policy" ON public.contacts;
    DROP POLICY IF EXISTS "contacts_auth_update_policy" ON public.contacts;
    DROP POLICY IF EXISTS "contacts_auth_delete_policy" ON public.contacts;
    DROP POLICY IF EXISTS "contacts_insert_policy" ON public.contacts;
    DROP POLICY IF EXISTS "contacts_select_policy" ON public.contacts;
    DROP POLICY IF EXISTS "contacts_update_policy" ON public.contacts;
    DROP POLICY IF EXISTS "contacts_delete_policy" ON public.contacts;
    
    -- Re-enable RLS
    ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
    
    -- Create simple and effective policies
    -- Allow anonymous users to insert contacts
    CREATE POLICY "allow_anon_insert_contacts" ON public.contacts
        FOR INSERT
        TO anon
        WITH CHECK (true);
    
    -- Allow public role to insert contacts (fallback)
    CREATE POLICY "allow_public_insert_contacts" ON public.contacts
        FOR INSERT
        TO public
        WITH CHECK (true);
    
    -- Allow authenticated users full access (for admin)
    CREATE POLICY "allow_authenticated_all_contacts" ON public.contacts
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    
    -- Grant explicit permissions
    GRANT INSERT ON public.contacts TO anon;
    GRANT SELECT ON public.contacts TO anon;
    GRANT INSERT ON public.contacts TO public;
    GRANT SELECT ON public.contacts TO public;
    GRANT ALL PRIVILEGES ON public.contacts TO authenticated;
    
    -- Ensure schema permissions
    GRANT USAGE ON SCHEMA public TO anon;
    GRANT USAGE ON SCHEMA public TO public;
    GRANT USAGE ON SCHEMA public TO authenticated;
    
    -- Grant sequence permissions for id generation
    GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
    GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO public;
    GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    
    RAISE NOTICE 'Contacts table RLS policies have been reset and configured successfully';
END $$;

-- Verify the setup
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'contacts';
    
    RAISE NOTICE 'Total policies on contacts table: %', policy_count;
END $$;