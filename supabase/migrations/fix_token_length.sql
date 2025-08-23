-- Modifica i campi session_token e refresh_token per supportare token più lunghi
-- I JWT possono essere molto lunghi (500+ caratteri)

ALTER TABLE admin_sessions 
ALTER COLUMN session_token TYPE TEXT,
ALTER COLUMN refresh_token TYPE TEXT;

-- Mantieni i vincoli di lunghezza minima
ALTER TABLE admin_sessions 
DROP CONSTRAINT IF EXISTS admin_sessions_session_token_check,
DROP CONSTRAINT IF EXISTS admin_sessions_refresh_token_check;

ALTER TABLE admin_sessions 
ADD CONSTRAINT admin_sessions_session_token_check CHECK (length(session_token) >= 32),
ADD CONSTRAINT admin_sessions_refresh_token_check CHECK (length(refresh_token) >= 32);