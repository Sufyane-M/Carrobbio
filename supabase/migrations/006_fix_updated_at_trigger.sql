-- Ricrea il trigger updated_at per la tabella contacts

-- Rimuovi il trigger esistente se presente
DROP TRIGGER IF EXISTS set_updated_at ON contacts;

-- Crea o ricrea la funzione per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ricrea il trigger solo per UPDATE (non per INSERT)
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();