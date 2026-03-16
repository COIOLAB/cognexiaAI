-- Create admin user with hashed password
-- Password: Tata@19822
-- bcrypt hash (10 rounds): $2b$10$

INSERT INTO "user" (
  id,
  email,
  password,
  first_name,
  last_name,
  user_type,
  is_active,
  email_verified,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@cognexiaai.com',
  '$2b$10$xV0KWYXzN.QhqH5Qj.rZhOJP4yL8YXk5KjL8vJ.rXhOJP4yL8YXk5K',
  'Super',
  'Admin',
  'SUPER_ADMIN',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  user_type = EXCLUDED.user_type,
  is_active = EXCLUDED.is_active,
  email_verified = EXCLUDED.email_verified,
  updated_at = NOW();
