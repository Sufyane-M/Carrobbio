-- Sistema di Gestione Menu Admin - Storage per Immagini
-- Configurazione bucket e politiche per le immagini del menu

-- Creazione bucket per immagini menu
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Politiche storage per lettura pubblica
CREATE POLICY "Immagini menu pubbliche" ON storage.objects
    FOR SELECT USING (bucket_id = 'menu-images');

-- Politiche storage per admin autenticati
CREATE POLICY "Admin upload immagini" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'menu-images' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Admin gestione immagini" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'menu-images' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Admin eliminazione immagini" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'menu-images' AND
        auth.role() = 'authenticated'
    );