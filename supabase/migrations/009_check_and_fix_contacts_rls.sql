-- Check current RLS policies for contacts table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'contacts';

-- Check current permissions for anon and authenticated roles
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'contacts'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous contact submissions" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to read contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to update contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to delete contacts" ON contacts;

-- Create new RLS policy to allow anonymous users to insert contacts
CREATE POLICY "Allow anonymous contact submissions" ON contacts
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create policy for authenticated users to read all contacts
CREATE POLICY "Allow authenticated users to read contacts" ON contacts
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for authenticated users to update contacts
CREATE POLICY "Allow authenticated users to update contacts" ON contacts
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy for authenticated users to delete contacts
CREATE POLICY "Allow authenticated users to delete contacts" ON contacts
    FOR DELETE
    TO authenticated
    USING (true);

-- Ensure proper permissions are granted
GRANT INSERT ON contacts TO anon;
GRANT ALL PRIVILEGES ON contacts TO authenticated;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'contacts'
ORDER BY policyname;