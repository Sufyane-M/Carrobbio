-- Verifica i trigger sulla tabella contacts

-- 1. Lista tutti i trigger sulla tabella contacts
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers 
WHERE event_object_table = 'contacts'
ORDER BY trigger_name;

-- 2. Verifica se esiste il trigger updated_at
SELECT 
    t.trigger_name,
    t.action_statement,
    p.proname as function_name
FROM information_schema.triggers t
LEFT JOIN pg_proc p ON p.oid = t.action_statement::regproc
WHERE t.event_object_table = 'contacts'
    AND t.trigger_name LIKE '%updated_at%';

-- 3. Se il trigger updated_at esiste ma causa problemi, lo ricreiamo
-- Prima rimuoviamo il trigger esistente se presente
DROP TRIGGER IF EXISTS set_updated_at ON contacts;

-- Ricreiamo la funzione per aggiornare updated_at se non esiste
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ricreiamo il trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Test di inserimento per verificare che non ci siano problemi
-- Questo test sarà commentato per evitare inserimenti durante la migrazione
/*
INSERT INTO contacts (name, email, message, phone, status) 
VALUES ('Debug Test', 'debug@test.com', 'Debug message', '+1234567890', 'new');
*/

-- 5. Verifica finale dei trigger
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'contacts'
ORDER BY trigger_name;