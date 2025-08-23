-- Fix RLS policies for menu management
-- The current policies use auth.role() which doesn't work with custom authentication
-- We need to allow operations for the anon role when accessing from admin interface

-- Drop existing policies
DROP POLICY IF EXISTS "Admin gestione completa categorie" ON categorie;
DROP POLICY IF EXISTS "Admin gestione completa piatti" ON piatti;
DROP POLICY IF EXISTS "Admin gestione relazioni" ON piatti_categorie;

-- Create new policies that allow admin operations
-- Since we're using custom auth, we'll allow all operations for now
-- and rely on application-level security

-- Categorie policies
CREATE POLICY "Categorie leggibili da tutti" ON categorie
    FOR SELECT USING (true);

CREATE POLICY "Categorie modificabili" ON categorie
    FOR ALL USING (true);

-- Piatti policies  
CREATE POLICY "Piatti leggibili da tutti" ON piatti
    FOR SELECT USING (true);

CREATE POLICY "Piatti modificabili" ON piatti
    FOR ALL USING (true);

-- Piatti_categorie policies
CREATE POLICY "Relazioni leggibili da tutti" ON piatti_categorie
    FOR SELECT USING (true);

CREATE POLICY "Relazioni modificabili" ON piatti_categorie
    FOR ALL USING (true);

-- Grant necessary permissions to anon role
GRANT ALL PRIVILEGES ON categorie TO anon;
GRANT ALL PRIVILEGES ON piatti TO anon;
GRANT ALL PRIVILEGES ON piatti_categorie TO anon;

-- Grant usage on sequences if they exist
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;