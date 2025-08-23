-- Grant necessary permissions for contacts table
-- This ensures anonymous users can insert contacts and authenticated users have full access

-- Grant INSERT permission to anon role for contact form submissions
GRANT INSERT ON contacts TO anon;

-- Grant full permissions to authenticated role for admin functions
GRANT SELECT, UPDATE, DELETE ON contacts TO authenticated;

-- Grant sequence permissions for UUID generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify permissions are granted
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'contacts' 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;