-- Add camelCase columns to organization table (for backward compatibility with direct SQL inserts)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'subscriptionTier') THEN
        ALTER TABLE organization ADD COLUMN "subscriptionTier" VARCHAR(50) DEFAULT 'free';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'maxStorage') THEN
        ALTER TABLE organization ADD COLUMN "maxStorage" BIGINT DEFAULT 10737418240;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'firstName') THEN
        ALTER TABLE "user" ADD COLUMN "firstName" VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'lastName') THEN
        ALTER TABLE "user" ADD COLUMN "lastName" VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'userType') THEN
        ALTER TABLE "user" ADD COLUMN "userType" VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'organizationId') THEN
        ALTER TABLE "user" ADD COLUMN "organizationId" UUID REFERENCES organization(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'permissions') THEN
        ALTER TABLE "user" ADD COLUMN permissions TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'isActive') THEN
        ALTER TABLE "user" ADD COLUMN "isActive" BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'emailVerified') THEN
        ALTER TABLE "user" ADD COLUMN "emailVerified" BOOLEAN DEFAULT false;
    END IF;
    
    RAISE NOTICE 'CamelCase columns added successfully';
END $$;

SELECT 'CamelCase columns added successfully!' AS status;
