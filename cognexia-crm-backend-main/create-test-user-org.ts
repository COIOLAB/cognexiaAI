import { NestFactory } from '@nestjs/core';
import { CRMModule } from './src/crm.module';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
  console.log('🚀 Creating Test Organization and User...\n');

  const app = await NestFactory.createApplicationContext(CRMModule);
  const dataSource = app.get(DataSource);
  const jwtService = app.get(JwtService);

  try {
    // Step 1: Create Organization
    console.log('📦 Step 1: Creating test organization...');
    const orgId = uuidv4();
    const organization = await dataSource.query(`
      INSERT INTO organization (
        id, 
        name, 
        domain, 
        "subscriptionTier", 
        "subscriptionStatus",
        "maxUsers",
        "maxStorage",
        "isActive",
        "createdAt",
        "updatedAt"
      ) VALUES (
        $1, 
        'Test Organization',
        'test.example.com',
        'enterprise',
        'active',
        1000,
        107374182400,
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (id) DO UPDATE 
        SET name = EXCLUDED.name,
            "isActive" = EXCLUDED."isActive"
      RETURNING *
    `, [orgId]);

    console.log('✅ Organization created:', {
      id: orgId,
      name: 'Test Organization',
      subscriptionTier: 'enterprise',
      subscriptionStatus: 'active'
    });

    // Step 2: Create User
    console.log('\n👤 Step 2: Creating test user...');
    const userId = uuidv4();
    const email = 'admin@test.com';
    const password = 'Test@123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await dataSource.query(`
      INSERT INTO "user" (
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
      ) VALUES (
        $1,
        $2,
        $3,
        'Test',
        'Admin',
        'organization_admin',
        $4,
        ARRAY['admin', 'manager', 'sales_manager', 'sales_rep', 'marketing', 'viewer']::text[],
        ARRAY['read', 'write', 'delete', 'admin']::text[],
        true,
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO UPDATE
        SET password = EXCLUDED.password,
            "organizationId" = EXCLUDED."organizationId",
            roles = EXCLUDED.roles,
            permissions = EXCLUDED.permissions,
            "isActive" = EXCLUDED."isActive",
            "emailVerified" = EXCLUDED."emailVerified"
      RETURNING *
    `, [userId, email, hashedPassword, orgId]);

    console.log('✅ User created:', {
      id: userId,
      email: email,
      password: password,
      organizationId: orgId,
      roles: ['admin', 'manager', 'sales_manager', 'sales_rep', 'marketing', 'viewer'],
      userType: 'organization_admin'
    });

    // Step 3: Generate JWT Token
    console.log('\n🔐 Step 3: Generating JWT token...');
    const payload = {
      sub: userId,
      email: email,
      userType: 'organization_admin',
      organizationId: orgId,
      roles: ['admin', 'manager', 'sales_manager', 'sales_rep', 'marketing', 'viewer'],
      permissions: ['read', 'write', 'delete', 'admin']
    };

    const token = jwtService.sign(payload);

    console.log('✅ JWT Token generated successfully');
    console.log('\n' + '='.repeat(80));
    console.log('📝 AUTHENTICATION DETAILS');
    console.log('='.repeat(80));
    console.log('\n🔑 Login Credentials:');
    console.log('   Email:    ', email);
    console.log('   Password: ', password);
    console.log('\n🎫 JWT Token:');
    console.log('   ', token);
    console.log('\n🏢 Organization Details:');
    console.log('   ID:   ', orgId);
    console.log('   Name: ', 'Test Organization');
    console.log('\n👤 User Details:');
    console.log('   ID:    ', userId);
    console.log('   Email: ', email);
    console.log('   Roles: ', 'admin, manager, sales_manager, sales_rep, marketing, viewer');
    console.log('\n' + '='.repeat(80));

    // Step 4: Save credentials to file for test script
    console.log('\n💾 Step 4: Saving credentials to test-credentials.json...');
    const fs = require('fs');
    const credentials = {
      token: token,
      userId: userId,
      organizationId: orgId,
      email: email,
      password: password,
      roles: ['admin', 'manager', 'sales_manager', 'sales_rep', 'marketing', 'viewer'],
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(
      './test-credentials.json',
      JSON.stringify(credentials, null, 2)
    );

    console.log('✅ Credentials saved to test-credentials.json');

    // Step 5: Verify token works
    console.log('\n🧪 Step 5: Verifying token...');
    try {
      const decoded = jwtService.verify(token);
      console.log('✅ Token is valid');
      console.log('   User ID:       ', decoded.sub);
      console.log('   Email:         ', decoded.email);
      console.log('   Organization:  ', decoded.organizationId);
      console.log('   Roles:         ', decoded.roles.join(', '));
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ SETUP COMPLETE!');
    console.log('='.repeat(80));
    console.log('\n📋 Next Steps:');
    console.log('   1. Use the token above in your API requests');
    console.log('   2. Run: .\\test-all-178-endpoints.ps1');
    console.log('   3. Expected: ~76% success rate (138/178 endpoints)');
    console.log('\n💡 Test with:');
    console.log('   curl -H "Authorization: Bearer <token>" http://localhost:3003/api/v1/crm/customers');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    
    // If organization table doesn't exist, try to create it
    if (error.message.includes('relation "organization" does not exist')) {
      console.log('\n⚠️  Database tables not found. Running synchronize...');
      try {
        await dataSource.synchronize();
        console.log('✅ Database synchronized. Please run this script again.');
      } catch (syncError) {
        console.error('❌ Synchronization failed:', syncError.message);
      }
    }
  } finally {
    await app.close();
  }
}

bootstrap().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
