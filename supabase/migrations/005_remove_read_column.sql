-- Remove the old 'read' column from contacts table
-- This column is no longer needed as we now use 'status' column

ALTER TABLE contacts DROP COLUMN IF EXISTS read;