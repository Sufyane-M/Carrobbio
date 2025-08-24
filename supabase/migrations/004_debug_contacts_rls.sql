-- Debug migration per verificare e risolvere il problema RLS sulla tabella contacts

-- 1. Verifica le policy RLS attuali
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'contacts';

-- 2. Verifica i permessi sui ruoli
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'contacts' 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 3. Rimuovi tutte le policy esistenti per ricrearle
DROP POLICY IF EXISTS "Allow public insert contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to view contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to update contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to delete contacts" ON contacts;

-- 4. Ricrea le policy RLS con maggiore permissività
-- Policy per inserimento pubblico (utenti anonimi)
CREATE POLICY "contacts_insert_policy" ON contacts
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy per visualizzazione da parte di utenti autenticati
CREATE POLICY "contacts_select_policy" ON contacts
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy per aggiornamento da parte di utenti autenticati
CREATE POLICY "contacts_update_policy" ON contacts
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy per eliminazione da parte di utenti autenticati
CREATE POLICY "contacts_delete_policy" ON contacts
    FOR DELETE
    TO authenticated
    USING (true);

-- 5. Assicurati che i permessi siano corretti
GRANT INSERT ON contacts TO anon;
GRANT SELECT, UPDATE, DELETE ON contacts TO authenticated;

-- 6. Test di inserimento per verificare che funzioni
-- Questo sarà commentato per evitare inserimenti durante la migrazione
-- INSERT INTO contacts (name, email, message, phone, status) 
-- VALUES ('Test User', 'test@example.com', 'Test message', '+1234567890', 'new');

-- 7. Verifica finale delle policy
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd 
FROM pg_policies 
WHERE tablename = 'contacts'
ORDER BY policyname;