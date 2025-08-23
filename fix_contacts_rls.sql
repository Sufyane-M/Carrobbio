-- SCRIPT PER RISOLVERE IL PROBLEMA RLS DELLA TABELLA CONTACTS
-- Eseguire questo script nel dashboard di Supabase o tramite psql

-- 1. Disabilita temporaneamente RLS
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;

-- 2. Rimuovi tutte le policy esistenti
DROP POLICY IF EXISTS "contacts_anonymous_insert_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_public_insert_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_authenticated_all_policy" ON public.contacts;
DROP POLICY IF EXISTS "allow_anon_insert_contacts" ON public.contacts;
DROP POLICY IF EXISTS "allow_public_insert_contacts" ON public.contacts;
DROP POLICY IF EXISTS "allow_authenticated_all_contacts" ON public.contacts;

-- 3. Riabilita RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 4. Crea policy semplici e funzionali
CREATE POLICY "contacts_anon_insert" ON public.contacts
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "contacts_public_insert" ON public.contacts
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "contacts_auth_all" ON public.contacts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Assegna i permessi espliciti
GRANT INSERT ON public.contacts TO anon;
GRANT INSERT ON public.contacts TO public;
GRANT ALL PRIVILEGES ON public.contacts TO authenticated;

-- 6. Assegna permessi sullo schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO public;

-- 7. Permessi sulle sequenze per la generazione degli ID
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO public;

-- 8. Verifica la configurazione
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

-- 9. Test di inserimento (opzionale)
-- INSERT INTO public.contacts (name, email, message) 
-- VALUES ('Test User', 'test@example.com', 'Test message');

SELECT 'RLS policies configured successfully for contacts table' as status;