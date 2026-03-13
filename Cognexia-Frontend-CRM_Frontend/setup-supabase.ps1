# Supabase Setup Automation Script
# Run this in PowerShell to quickly configure Supabase

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   Supabase Setup for CognexiaAI ERP" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Step 1: Collect credentials
Write-Host "Step 1: Supabase Credentials" -ForegroundColor Yellow
Write-Host "Login to https://supabase.com/dashboard and get your credentials`n"

$projectRef = Read-Host "Enter your PROJECT-REF (from URL)"
$dbPassword = Read-Host "Enter your Database Password" -AsSecureString
$dbPasswordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
$region = Read-Host "Enter your Region (e.g., us-east-1)"
$anonKey = Read-Host "Enter your ANON_KEY (from Settings > API)"
$serviceKey = Read-Host "Enter your SERVICE_ROLE_KEY (from Settings > API)"

# Step 2: Generate connection strings
Write-Host "`nStep 2: Generating configuration..." -ForegroundColor Yellow

$poolerUrl = "postgresql://postgres.$projectRef`:$dbPasswordText@aws-0-$region.pooler.supabase.com:6543/postgres"
$directHost = "db.$projectRef.supabase.co"
$supabaseUrl = "https://$projectRef.supabase.co"

# Step 3: Create/Update .env file
Write-Host "Step 3: Updating .env file..." -ForegroundColor Yellow

$envPath = ".\backend\.env"

if (Test-Path $envPath) {
    Write-Host "Found existing .env file" -ForegroundColor Green
    $backup = ".\backend\.env.backup." + (Get-Date -Format "yyyyMMdd_HHmmss")
    Copy-Item $envPath $backup
    Write-Host "Created backup: $backup" -ForegroundColor Gray
} else {
    Write-Host "Creating new .env file from template..." -ForegroundColor Green
    if (Test-Path ".\backend\.env.example") {
        Copy-Item ".\backend\.env.example" $envPath
    } else {
        New-Item $envPath -ItemType File | Out-Null
    }
}

# Add Supabase configuration
$supabaseConfig = @"

# ==========================================
# SUPABASE CONFIGURATION (Added $(Get-Date -Format "yyyy-MM-dd HH:mm"))
# ==========================================
USE_SUPABASE=true

SUPABASE_DATABASE_URL=$poolerUrl
SUPABASE_DB_HOST=$directHost
SUPABASE_DB_PASSWORD=$dbPasswordText
SUPABASE_URL=$supabaseUrl
SUPABASE_ANON_KEY=$anonKey
SUPABASE_SERVICE_ROLE_KEY=$serviceKey

# Hybrid mode (optional)
ENABLE_DUAL_WRITE=false
"@

Add-Content -Path $envPath -Value $supabaseConfig
Write-Host "✅ Configuration added to .env file" -ForegroundColor Green

# Step 4: Test connection
Write-Host "`nStep 4: Testing connection..." -ForegroundColor Yellow

$testScript = @"
const SUPABASE_URL = '$poolerUrl';
const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: SUPABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('✅ SUCCESS: Connected to Supabase!');
    console.log('Server time:', res.rows[0].now);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ FAILED:', err.message);
    process.exit(1);
  }
}

test();
"@

$testScript | Out-File -FilePath ".\backend\test-connection-temp.js" -Encoding UTF8

Push-Location .\backend
try {
    $result = node test-connection-temp.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $result -ForegroundColor Green
    } else {
        Write-Host $result -ForegroundColor Red
        Write-Host "`nConnection test failed. Please check your credentials." -ForegroundColor Red
    }
} finally {
    Remove-Item test-connection-temp.js -ErrorAction SilentlyContinue
    Pop-Location
}

# Step 5: Summary
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "Configuration saved to: backend\.env" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. cd backend"
Write-Host "2. npm install (if not done)"
Write-Host "3. npm run start:dev"
Write-Host "`n⚠️  IMPORTANT: Change your Supabase password after setup!" -ForegroundColor Red
Write-Host ""

# Cleanup sensitive data from memory
$dbPasswordText = $null
[System.GC]::Collect()
