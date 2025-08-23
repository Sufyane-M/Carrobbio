-- Fix RLS policies for contacts table
-- Drop existing policies
DROP POLICY IF EXISTS "Allow public insert contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to view all contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to update all contacts" ON contacts;

-- Create new policies that work with the updated table structure
-- Allow anonymous users to insert contacts (for contact form)
CREATE POLICY "Allow public insert contacts" ON contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to view all contacts (for admin)
CREATE POLICY "Allow authenticated users to view all contacts" ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update all contacts (for admin)
CREATE POLICY "Allow authenticated users to update all contacts" ON contacts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete contacts (for admin)
CREATE POLICY "Allow authenticated users to delete all contacts" ON contacts
  FOR DELETE
  TO authenticated
  USING (true);

-- Grant necessary permissions to roles
GRANT INSERT ON contacts TO anon;
GRANT SELECT, UPDATE, DELETE ON contacts TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;