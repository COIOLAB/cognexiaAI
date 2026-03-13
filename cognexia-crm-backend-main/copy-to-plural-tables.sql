-- Copy organization data to organizations table (if organizations exists and is empty)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        -- Copy data from organization to organizations
        INSERT INTO organizations (id, name, email, "createdAt", "updatedAt")
        SELECT 
            id, 
            name, 
            COALESCE(email, 'test@example.com'),
            "createdAt",
            "updatedAt"
        FROM organization
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Copied data to organizations table';
    END IF;
END $$;

-- Copy user data to users table (if users exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- First, ensure users table has required columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'organizationId') THEN
            ALTER TABLE users ADD COLUMN "organizationId" UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'firstName') THEN
            ALTER TABLE users ADD COLUMN "firstName" VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'lastName') THEN
            ALTER TABLE users ADD COLUMN "lastName" VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'userType') THEN
            ALTER TABLE users ADD COLUMN "userType" VARCHAR(100);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'isActive') THEN
            ALTER TABLE users ADD COLUMN "isActive" BOOLEAN DEFAULT true;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'emailVerified') THEN
            ALTER TABLE users ADD COLUMN "emailVerified" BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'createdAt') THEN
            ALTER TABLE users ADD COLUMN "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updatedAt') THEN
            ALTER TABLE users ADD COLUMN "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        -- Copy data from user to users
        INSERT INTO users (id, email, password, "firstName", "lastName", "userType", "organizationId", roles, permissions, "isActive", "emailVerified", "createdAt", "updatedAt")
        SELECT 
            id, 
            email, 
            password,
            "firstName",
            "lastName",
            "userType",
            "organizationId",
            roles,
            permissions,
            "isActive",
            "emailVerified",
            "createdAt",
            "updatedAt"
        FROM "user"
        ON CONFLICT (email) DO UPDATE SET
            password = EXCLUDED.password,
            "firstName" = EXCLUDED."firstName",
            "lastName" = EXCLUDED."lastName",
            "userType" = EXCLUDED."userType",
            "organizationId" = EXCLUDED."organizationId",
            roles = EXCLUDED.roles,
            permissions = EXCLUDED.permissions,
            "isActive" = EXCLUDED."isActive",
            "emailVerified" = EXCLUDED."emailVerified",
            "updatedAt" = EXCLUDED."updatedAt";
        
        RAISE NOTICE 'Copied data to users table';
    END IF;
END $$;

SELECT 'Data copied to plural tables successfully!' AS status;
