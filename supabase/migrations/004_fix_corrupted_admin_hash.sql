-- Correggi l'hash corrotto per admin@ilcarrobbio.com
-- L'hash attuale ha 61 caratteri invece di 60 ed è corrotto

-- Aggiorna l'hash per admin@ilcarrobbio.com con un hash bcrypt valido per la password 'admin123'
UPDATE admin_users 
SET password_hash = '$2b$10$WrGjsoz9cpeXBncCKhpXpeqNYPYY9aE9JE8t5rqrvwGcouCK2lw9G'
WHERE email = 'admin@ilcarrobbio.com';

-- Verifica che l'aggiornamento sia andato a buon fine
SELECT email, LENGTH(password_hash) as hash_length, password_hash 
FROM admin_users 
WHERE email = 'admin@ilcarrobbio.com';