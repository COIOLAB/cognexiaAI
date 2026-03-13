-- Add domain column to organization table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'organization' 
        AND column_name = 'domain'
    ) THEN
        ALTER TABLE organization ADD COLUMN domain VARCHAR(255);
        RAISE NOTICE 'domain column added to organization table';
    ELSE
        RAISE NOTICE 'domain column already exists in organization table';
    END IF;
END $$;

-- Add domain column to organizations table (plural) if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'organizations'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'organizations' 
            AND column_name = 'domain'
        ) THEN
            ALTER TABLE organizations ADD COLUMN domain VARCHAR(255);
            RAISE NOTICE 'domain column added to organizations table';
        ELSE
            RAISE NOTICE 'domain column already exists in organizations table';
        END IF;
    END IF;
END $$;

SELECT 'Domain column added successfully!' AS status;
