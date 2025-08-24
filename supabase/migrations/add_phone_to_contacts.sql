-- Add phone column to contacts table
ALTER TABLE contacts ADD COLUMN phone VARCHAR(20);

-- Create index for phone column
CREATE INDEX idx_contacts_phone ON contacts(phone);