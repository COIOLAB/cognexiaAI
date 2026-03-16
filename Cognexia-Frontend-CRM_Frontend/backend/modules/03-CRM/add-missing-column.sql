-- Add missing userTierConfig column to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "userTierConfig" json;
