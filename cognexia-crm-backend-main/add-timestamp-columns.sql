-- Add timestamp columns to organization table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'createdAt') THEN
        ALTER TABLE organization ADD COLUMN "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'updatedAt') THEN
        ALTER TABLE organization ADD COLUMN "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Add timestamp columns to user table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'createdAt') THEN
        ALTER TABLE "user" ADD COLUMN "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'updatedAt') THEN
        ALTER TABLE "user" ADD COLUMN "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    RAISE NOTICE 'Timestamp columns added successfully';
END $$;

SELECT 'Timestamp columns added successfully!' AS status;
