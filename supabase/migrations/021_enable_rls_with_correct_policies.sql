-- Re-enable RLS with correct policies for anonymous contact submissions
-- This provides a secure solution that allows anonymous inserts while maintaining security

-- Enable RLS on contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "allow_anon_insert" ON public.contacts;
DROP POLICY IF EXISTS "allow_public_insert" ON public.contacts;
DROP POLICY IF EXISTS "allow_authenticated_all" ON public.contacts;

-- Create policy to allow anonymous users to insert contact messages
CREATE POLICY "anonymous_contact_insert" ON public.contacts
    FOR INSERT
    TO anon
    WITH CHECK (
        -- Allow insert if all required fields are provided
        name IS NOT NULL AND 
        email IS NOT NULL AND 
        message IS NOT NULL AND
        -- Ensure status is set to 'new' for new contacts
        (status IS NULL OR status = 'new')
    );

-- Create policy to allow public role to insert (backup)
CREATE POLICY "public_contact_insert" ON public.contacts
    FOR INSERT
    TO public
    WITH CHECK (
        name IS NOT NULL AND 
        email IS NOT NULL AND 
        message IS NOT NULL AND
        (status IS NULL OR status = 'new')
    );

-- Create policy for authenticated users to manage all contacts
CREATE POLICY "authenticated_contact_management" ON public.contacts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'contacts';

-- List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'contacts'
ORDER BY policyname;