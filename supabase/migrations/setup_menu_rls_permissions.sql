-- Sistema di Gestione Menu Admin - Row Level Security e Permessi
-- Configurazione sicurezza e permessi per le tabelle del menu

-- Abilitazione RLS
ALTER TABLE categorie ENABLE ROW LEVEL SECURITY;
ALTER TABLE piatti ENABLE ROW LEVEL SECURITY;
ALTER TABLE piatti_categorie ENABLE ROW LEVEL SECURITY;

-- Politiche per lettura pubblica
CREATE POLICY "Categorie leggibili da tutti" ON categorie
    FOR SELECT USING (attiva = true);

CREATE POLICY "Piatti leggibili da tutti" ON piatti
    FOR SELECT USING (disponibile = true);

CREATE POLICY "Relazioni leggibili da tutti" ON piatti_categorie
    FOR SELECT USING (true);

-- Politiche per admin autenticati
CREATE POLICY "Admin gestione completa categorie" ON categorie
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin gestione completa piatti" ON piatti
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin gestione relazioni" ON piatti_categorie
    FOR ALL USING (auth.role() = 'authenticated');

-- Permessi per ruoli
GRANT SELECT ON categorie TO anon;
GRANT SELECT ON piatti TO anon;
GRANT SELECT ON piatti_categorie TO anon;

GRANT ALL PRIVILEGES ON categorie TO authenticated;
GRANT ALL PRIVILEGES ON piatti TO authenticated;
GRANT ALL PRIVILEGES ON piatti_categorie TO authenticated;