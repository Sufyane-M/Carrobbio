-- Rimuovi la policy temporanea per il debug
DROP POLICY IF EXISTS "Allow anon read admin for debug" ON admin_users;

-- Rimuovi i permessi GRANT temporanei per anon
REVOKE SELECT ON admin_users FROM anon;