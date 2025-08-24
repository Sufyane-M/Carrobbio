-- Aggiungi policy per permettere lettura admin_users anche agli utenti anonimi (solo per debug)
CREATE POLICY "Allow anon read admin for debug" ON admin_users FOR SELECT TO anon USING (true);

-- Aggiungi anche permessi GRANT per anon
GRANT SELECT ON admin_users TO anon;