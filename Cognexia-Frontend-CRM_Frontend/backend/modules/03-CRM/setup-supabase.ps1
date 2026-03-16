# =========================================
# SUPABASE SETUP SCRIPT FOR CRM MODULE
# =========================================
# Purpose: Interactive setup for Supabase database
# Platform: Windows PowerShell
# Date: January 9, 2026

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  CRM MODULE - SUPABASE SETUP WIZARD" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
$envPath = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env template..." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found .env file" -ForegroundColor Green
Write-Host ""

# Step 1: Check Supabase account
Write-Host "STEP 1: Supabase Account Setup" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Do you have a Supabase account?" -ForegroundColor White
Write-Host "1. Yes, I have an account"
Write-Host "2. No, I need to create one"
Write-Host ""
$accountChoice = Read-Host "Enter your choice (1 or 2)"

if ($accountChoice -eq "2") {
    Write-Host ""
    Write-Host "Opening Supabase signup page in browser..." -ForegroundColor Cyan
    Start-Process "https://supabase.com"
    Write-Host ""
    Write-Host "📝 Instructions:" -ForegroundColor Yellow
    Write-Host "1. Sign up with GitHub, Google, or Email"
    Write-Host "2. Verify your email"
    Write-Host "3. Come back here when done"
    Write-Host ""
    Read-Host "Press Enter when you've created your account"
}

# Step 2: Create project
Write-Host ""
Write-Host "STEP 2: Create Supabase Project" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Have you created a Supabase project for this CRM?" -ForegroundColor White
Write-Host "1. Yes, I have a project"
Write-Host "2. No, I need to create one"
Write-Host ""
$projectChoice = Read-Host "Enter your choice (1 or 2)"

if ($projectChoice -eq "2") {
    Write-Host ""
    Write-Host "Opening Supabase dashboard..." -ForegroundColor Cyan
    Start-Process "https://app.supabase.com"
    Write-Host ""
    Write-Host "📝 Instructions:" -ForegroundColor Yellow
    Write-Host "1. Click 'New Project'"
    Write-Host "2. Fill in project details:"
    Write-Host "   - Name: industry50-crm-production"
    Write-Host "   - Database Password: [Generate strong password - SAVE THIS!]"
    Write-Host "   - Region: Choose closest to you (e.g., us-east-1)"
    Write-Host "   - Plan: Free (for testing) or Pro (for production)"
    Write-Host "3. Click 'Create new project'"
    Write-Host "4. Wait 2-3 minutes for provisioning"
    Write-Host ""
    Read-Host "Press Enter when your project is ready"
}

# Step 3: Get credentials
Write-Host ""
Write-Host "STEP 3: Get Supabase Credentials" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening Supabase project settings..." -ForegroundColor Cyan
Start-Process "https://app.supabase.com"
Write-Host ""
Write-Host "📝 Instructions:" -ForegroundColor Yellow
Write-Host "1. Go to Settings → API"
Write-Host "2. Copy these values:"
Write-Host "   - Project URL"
Write-Host "   - anon/public key"
Write-Host "   - service_role key"
Write-Host ""
Write-Host "3. Go to Settings → Database"
Write-Host "4. Copy:"
Write-Host "   - Host"
Write-Host "   - Database password (from step 2)"
Write-Host ""
Write-Host "Now, let's enter your credentials..." -ForegroundColor Cyan
Write-Host ""

# Collect credentials
$projectRef = Read-Host "Enter your PROJECT_REF (e.g., abcdefghijklmnop)"
$anonKey = Read-Host "Enter your SUPABASE_ANON_KEY"
$serviceKey = Read-Host "Enter your SUPABASE_SERVICE_ROLE_KEY"
$dbPassword = Read-Host "Enter your DATABASE_PASSWORD" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

# Update .env file
Write-Host ""
Write-Host "Updating .env file..." -ForegroundColor Cyan

$envContent = Get-Content $envPath -Raw

# Replace placeholders
$envContent = $envContent -replace '\[YOUR_PROJECT_REF\]', $projectRef
$envContent = $envContent -replace '\[YOUR_ANON_KEY_HERE\]', $anonKey
$envContent = $envContent -replace '\[YOUR_SERVICE_ROLE_KEY_HERE\]', $serviceKey
$envContent = $envContent -replace '\[YOUR_PASSWORD\]', $dbPasswordPlain
$envContent = $envContent -replace '\[YOUR_DATABASE_PASSWORD\]', $dbPasswordPlain

Set-Content -Path $envPath -Value $envContent

Write-Host "✅ .env file updated successfully!" -ForegroundColor Green
Write-Host ""

# Step 4: Install dependencies
Write-Host "STEP 4: Install Dependencies" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Checking if node_modules exists..." -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Step 5: Test connection
Write-Host ""
Write-Host "STEP 5: Test Database Connection" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Testing Supabase connection..." -ForegroundColor Cyan

# Create simple test script
$testScript = @"
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
        if (error && error.code !== '42P01') { // Table doesn't exist is OK
            throw error;
        }
        console.log('✅ Supabase connection successful!');
        return true;
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        return false;
    }
}

testConnection();
"@

Set-Content -Path "test-connection.js" -Value $testScript
node test-connection.js
Remove-Item "test-connection.js"

# Step 6: Next steps
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE! 🎉" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Run database migrations:" -ForegroundColor White
Write-Host "   npm run migration:run" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Enable Row-Level Security (RLS):" -ForegroundColor White
Write-Host "   Follow: SUPABASE_SETUP_GUIDE.md (Step 3)" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Run seed data (optional):" -ForegroundColor White
Write-Host "   npm run db:seed" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Start the application:" -ForegroundColor White
Write-Host "   npm run start:dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. View API documentation:" -ForegroundColor White
Write-Host "   http://localhost:3003/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed setup instructions, see:" -ForegroundColor Yellow
Write-Host "SUPABASE_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
