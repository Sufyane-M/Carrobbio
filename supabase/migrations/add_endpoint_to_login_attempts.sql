-- Aggiunge la colonna endpoint alla tabella login_attempts
-- Questa colonna è necessaria per il rate limiting per endpoint

ALTER TABLE login_attempts 
ADD COLUMN endpoint VARCHAR(255) DEFAULT '/api/auth/login';

-- Aggiorna i record esistenti con il valore di default
UPDATE login_attempts 
SET endpoint = '/api/auth/login' 
WHERE endpoint IS NULL;

-- Rende la colonna NOT NULL dopo aver aggiornato i record esistenti
ALTER TABLE login_attempts 
ALTER COLUMN endpoint SET NOT NULL;

-- Commento per documentare la modifica
COMMENT ON COLUMN login_attempts.endpoint IS 'Endpoint API che ha generato il tentativo di login per il rate limiting';