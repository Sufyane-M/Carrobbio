-- Final fix for contacts RLS policies
-- This migration ensures all policies are correctly set up

-- First, disable RLS temporarily to clean up
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public insert contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to view all contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to update all contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to delete all contacts" ON contacts;

-- Re-enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies
-- Allow anonymous users to insert contacts (for contact form)
CREATE POLICY "contacts_insert_anon" ON contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users full access (for admin)
CREATE POLICY "contacts_select_auth" ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "contacts_update_auth" ON contacts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "contacts_delete_auth" ON contacts
  FOR DELETE
  TO authenticated
  USING (true);

-- Grant necessary permissions
GRANT INSERT ON contacts TO anon;
GRANT SELECT, UPDATE, DELETE ON contacts TO authenticated;

-- Grant usage on the sequence for the id column
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;