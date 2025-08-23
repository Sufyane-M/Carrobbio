-- Add status and updated_at columns to contacts table

-- Add status column with default 'new' and CHECK constraint
ALTER TABLE contacts 
ADD COLUMN status VARCHAR(20) DEFAULT 'new' 
CHECK (status IN ('new', 'read', 'replied'));

-- Add updated_at column with default NOW()
ALTER TABLE contacts 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row modification
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Update existing records to have 'new' status if null
UPDATE contacts SET status = 'new' WHERE status IS NULL;