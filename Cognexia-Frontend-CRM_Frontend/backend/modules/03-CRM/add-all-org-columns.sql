-- Add all missing columns to organization table (singular - for backward compatibility)
DO $$ 
BEGIN
    -- Add email column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'email') THEN
        ALTER TABLE organization ADD COLUMN email VARCHAR(255) UNIQUE;
    END IF;
    
    -- Add phone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'phone') THEN
        ALTER TABLE organization ADD COLUMN phone VARCHAR(255);
    END IF;
    
    -- Add address column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'address') THEN
        ALTER TABLE organization ADD COLUMN address TEXT;
    END IF;
    
    -- Add website column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'website') THEN
        ALTER TABLE organization ADD COLUMN website VARCHAR(255);
    END IF;
    
    -- Add logoUrl column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'logoUrl') THEN
        ALTER TABLE organization ADD COLUMN "logoUrl" VARCHAR(255);
    END IF;
    
    -- Add masterOrganizationId column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'masterOrganizationId') THEN
        ALTER TABLE organization ADD COLUMN "masterOrganizationId" UUID;
    END IF;
    
    -- Add subscriptionPlanId column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'subscriptionPlanId') THEN
        ALTER TABLE organization ADD COLUMN "subscriptionPlanId" UUID;
    END IF;
    
    -- Add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'status') THEN
        ALTER TABLE organization ADD COLUMN status VARCHAR(50) DEFAULT 'trial';
    END IF;
    
    -- Add subscriptionStatus column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'subscriptionStatus') THEN
        ALTER TABLE organization ADD COLUMN "subscriptionStatus" VARCHAR(50) DEFAULT 'trial';
    END IF;
    
    -- Add isActive column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'isActive') THEN
        ALTER TABLE organization ADD COLUMN "isActive" BOOLEAN DEFAULT true;
    END IF;
    
    -- Add trialEndsAt column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'trialEndsAt') THEN
        ALTER TABLE organization ADD COLUMN "trialEndsAt" TIMESTAMP;
    END IF;
    
    -- Add maxUsers column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'maxUsers') THEN
        ALTER TABLE organization ADD COLUMN "maxUsers" INTEGER DEFAULT 5;
    END IF;
    
    -- Add currentUserCount column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'currentUserCount') THEN
        ALTER TABLE organization ADD COLUMN "currentUserCount" INTEGER DEFAULT 0;
    END IF;
    
    -- Add contact person columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'contactPersonName') THEN
        ALTER TABLE organization ADD COLUMN "contactPersonName" VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'contactPersonEmail') THEN
        ALTER TABLE organization ADD COLUMN "contactPersonEmail" VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'contactPersonPhone') THEN
        ALTER TABLE organization ADD COLUMN "contactPersonPhone" VARCHAR(255);
    END IF;
    
    -- Add Stripe columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'stripeCustomerId') THEN
        ALTER TABLE organization ADD COLUMN "stripeCustomerId" VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'stripeSubscriptionId') THEN
        ALTER TABLE organization ADD COLUMN "stripeSubscriptionId" VARCHAR(255);
    END IF;
    
    -- Add billing date columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'nextBillingDate') THEN
        ALTER TABLE organization ADD COLUMN "nextBillingDate" TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'lastBillingDate') THEN
        ALTER TABLE organization ADD COLUMN "lastBillingDate" TIMESTAMP;
    END IF;
    
    -- Add monthlyRevenue column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'monthlyRevenue') THEN
        ALTER TABLE organization ADD COLUMN "monthlyRevenue" DECIMAL(10, 2) DEFAULT 0;
    END IF;
    
    -- Add JSON columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'settings') THEN
        ALTER TABLE organization ADD COLUMN settings JSON;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'branding') THEN
        ALTER TABLE organization ADD COLUMN branding JSON;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'metadata') THEN
        ALTER TABLE organization ADD COLUMN metadata JSON;
    END IF;
    
    -- Add subscription date columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'subscriptionEndDate') THEN
        ALTER TABLE organization ADD COLUMN "subscriptionEndDate" TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'subscriptionStartDate') THEN
        ALTER TABLE organization ADD COLUMN "subscriptionStartDate" TIMESTAMP;
    END IF;
    
    -- Add deletedAt column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'deletedAt') THEN
        ALTER TABLE organization ADD COLUMN "deletedAt" TIMESTAMP;
    END IF;
    
    RAISE NOTICE 'All columns added to organization table';
END $$;

-- Add same columns to organizations table (plural) if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        -- Add all the same columns to organizations table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'email') THEN
            ALTER TABLE organizations ADD COLUMN email VARCHAR(255) UNIQUE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'phone') THEN
            ALTER TABLE organizations ADD COLUMN phone VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'address') THEN
            ALTER TABLE organizations ADD COLUMN address TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'website') THEN
            ALTER TABLE organizations ADD COLUMN website VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'logoUrl') THEN
            ALTER TABLE organizations ADD COLUMN "logoUrl" VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'masterOrganizationId') THEN
            ALTER TABLE organizations ADD COLUMN "masterOrganizationId" UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'subscriptionPlanId') THEN
            ALTER TABLE organizations ADD COLUMN "subscriptionPlanId" UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'status') THEN
            ALTER TABLE organizations ADD COLUMN status VARCHAR(50) DEFAULT 'trial';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'subscriptionStatus') THEN
            ALTER TABLE organizations ADD COLUMN "subscriptionStatus" VARCHAR(50) DEFAULT 'trial';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'isActive') THEN
            ALTER TABLE organizations ADD COLUMN "isActive" BOOLEAN DEFAULT true;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'trialEndsAt') THEN
            ALTER TABLE organizations ADD COLUMN "trialEndsAt" TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'maxUsers') THEN
            ALTER TABLE organizations ADD COLUMN "maxUsers" INTEGER DEFAULT 5;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'currentUserCount') THEN
            ALTER TABLE organizations ADD COLUMN "currentUserCount" INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'contactPersonName') THEN
            ALTER TABLE organizations ADD COLUMN "contactPersonName" VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'contactPersonEmail') THEN
            ALTER TABLE organizations ADD COLUMN "contactPersonEmail" VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'contactPersonPhone') THEN
            ALTER TABLE organizations ADD COLUMN "contactPersonPhone" VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'stripeCustomerId') THEN
            ALTER TABLE organizations ADD COLUMN "stripeCustomerId" VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'stripeSubscriptionId') THEN
            ALTER TABLE organizations ADD COLUMN "stripeSubscriptionId" VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'nextBillingDate') THEN
            ALTER TABLE organizations ADD COLUMN "nextBillingDate" TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'lastBillingDate') THEN
            ALTER TABLE organizations ADD COLUMN "lastBillingDate" TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'monthlyRevenue') THEN
            ALTER TABLE organizations ADD COLUMN "monthlyRevenue" DECIMAL(10, 2) DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'settings') THEN
            ALTER TABLE organizations ADD COLUMN settings JSON;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'branding') THEN
            ALTER TABLE organizations ADD COLUMN branding JSON;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'metadata') THEN
            ALTER TABLE organizations ADD COLUMN metadata JSON;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'subscriptionEndDate') THEN
            ALTER TABLE organizations ADD COLUMN "subscriptionEndDate" TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'subscriptionStartDate') THEN
            ALTER TABLE organizations ADD COLUMN "subscriptionStartDate" TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'deletedAt') THEN
            ALTER TABLE organizations ADD COLUMN "deletedAt" TIMESTAMP;
        END IF;
        
        RAISE NOTICE 'All columns added to organizations table';
    END IF;
END $$;

SELECT 'All organization columns added successfully!' AS status;
