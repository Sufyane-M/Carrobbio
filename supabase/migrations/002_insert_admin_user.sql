-- Inserisci admin di default se non esiste già
INSERT INTO admin_users (email, password_hash, role) 
SELECT 'admin@ilcarrobbio.com', '$2b$10$WrGjsoz9cpeXBncCKhpXpeqNYPYY9aE9JE8t5rqrvwGcouCK2lw9G', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM admin_users WHERE email = 'admin@ilcarrobbio.com'
);

-- Inserisci anche l'altro admin se non esiste
INSERT INTO admin_users (email, password_hash, role) 
SELECT 'admin@carrobbio.com', '$2b$10$WaeIjE9N4XXCwpJ0eCx/gOucAQH6d9IPAs2yoDysQWHEK3G4QOfSK', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM admin_users WHERE email = 'admin@carrobbio.com'
);