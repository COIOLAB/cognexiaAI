# PostgreSQL Quick Setup Script
# Run this after installing PostgreSQL

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Setup for CognexiaAI CRM" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Configuration
$DB_NAME = "cognexia_crm"
$DB_USER = "postgres"
$DB_PASSWORD = "postgres"

# Check if PostgreSQL is installed
Write-Host "1. Checking PostgreSQL installation..." -ForegroundColor Yellow

$pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue

if (-not $pgService) {
    Write-Host "❌ PostgreSQL service not found!" -ForegroundColor Red
    Write-Host "`nPlease install PostgreSQL first:" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "  2. Run the installer" -ForegroundColor White
    Write-Host "  3. Set password to 'postgres' during installation" -ForegroundColor White
    Write-Host "  4. Run this script again after installation`n" -ForegroundColor White
    exit 1
}

Write-Host "✅ PostgreSQL service found: $($pgService.DisplayName)" -ForegroundColor Green

# Check service status
Write-Host "`n2. Checking PostgreSQL service status..." -ForegroundColor Yellow

if ($pgService.Status -ne 'Running') {
    Write-Host "⚠️  PostgreSQL service is not running. Starting..." -ForegroundColor Yellow
    try {
        Start-Service $pgService.Name
        Write-Host "✅ PostgreSQL service started successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start PostgreSQL service: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ PostgreSQL service is running" -ForegroundColor Green
}

# Check if psql is accessible
Write-Host "`n3. Checking PostgreSQL command-line tools..." -ForegroundColor Yellow

try {
    $psqlVersion = & psql --version 2>&1
    Write-Host "✅ psql found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  psql not in PATH. Adding PostgreSQL to PATH..." -ForegroundColor Yellow
    
    # Try common PostgreSQL installation paths
    $pgPaths = @(
        "C:\Program Files\PostgreSQL\16\bin",
        "C:\Program Files\PostgreSQL\15\bin",
        "C:\Program Files\PostgreSQL\14\bin",
        "C:\Program Files (x86)\PostgreSQL\16\bin",
        "C:\Program Files (x86)\PostgreSQL\15\bin"
    )
    
    $foundPath = $null
    foreach ($path in $pgPaths) {
        if (Test-Path "$path\psql.exe") {
            $foundPath = $path
            break
        }
    }
    
    if ($foundPath) {
        $env:Path += ";$foundPath"
        Write-Host "✅ Added PostgreSQL to PATH: $foundPath" -ForegroundColor Green
        Write-Host "   Note: This is temporary for this session only" -ForegroundColor Gray
    } else {
        Write-Host "❌ Could not find psql.exe. Please add PostgreSQL bin directory to PATH manually" -ForegroundColor Red
        exit 1
    }
}

# Check if database exists
Write-Host "`n4. Checking if database '$DB_NAME' exists..." -ForegroundColor Yellow

$env:PGPASSWORD = $DB_PASSWORD
$dbExists = & psql -U $DB_USER -lqt 2>$null | Select-String -Pattern "^\s*$DB_NAME\s"

if ($dbExists) {
    Write-Host "✅ Database '$DB_NAME' already exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database '$DB_NAME' does not exist. Creating..." -ForegroundColor Yellow
    
    try {
        $result = & psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database '$DB_NAME' created successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to create database. Error: $result" -ForegroundColor Red
            Write-Host "`nPlease create the database manually:" -ForegroundColor Yellow
            Write-Host "  psql -U postgres" -ForegroundColor White
            Write-Host "  CREATE DATABASE $DB_NAME;" -ForegroundColor White
            exit 1
        }
    } catch {
        Write-Host "❌ Error creating database: $_" -ForegroundColor Red
        exit 1
    }
}

# Test connection
Write-Host "`n5. Testing database connection..." -ForegroundColor Yellow

try {
    $testResult = & psql -U $DB_USER -d $DB_NAME -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully connected to database '$DB_NAME'" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to connect to database. Error: $testResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Connection test failed: $_" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ PostgreSQL Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Database Configuration:" -ForegroundColor White
Write-Host "  Host:     localhost" -ForegroundColor Gray
Write-Host "  Port:     5432" -ForegroundColor Gray
Write-Host "  Database: $DB_NAME" -ForegroundColor Gray
Write-Host "  User:     $DB_USER" -ForegroundColor Gray
Write-Host "  Password: $DB_PASSWORD" -ForegroundColor Gray

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. ✅ .env file is already configured" -ForegroundColor Green
Write-Host "  2. Run: npm run start:dev" -ForegroundColor White
Write-Host "  3. Server will start on: http://localhost:3003" -ForegroundColor White
Write-Host "  4. API docs at: http://localhost:3003/api/docs`n" -ForegroundColor White

Write-Host "🚀 Ready to start the CRM server!`n" -ForegroundColor Cyan

# Clean up
$env:PGPASSWORD = $null
