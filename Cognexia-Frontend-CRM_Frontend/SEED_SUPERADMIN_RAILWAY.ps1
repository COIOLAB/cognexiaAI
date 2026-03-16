# Seed Super Admin User to Railway Database
# This script creates or updates the super admin user in your Railway Postgres database

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Seeding Super Admin User to Railway DB" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "IMPORTANT: You need to get your Railway database credentials first!" -ForegroundColor Yellow
Write-Host "1. Go to Railway.app" -ForegroundColor Yellow
Write-Host "2. Select your project" -ForegroundColor Yellow
Write-Host "3. Click on your Postgres service" -ForegroundColor Yellow
Write-Host "4. Go to 'Variables' tab" -ForegroundColor Yellow
Write-Host "5. Copy the following values:`n" -ForegroundColor Yellow

# Prompt for Railway database credentials
$dbHost = Read-Host "Enter DATABASE_HOST (e.g. postgres.railway.internal or monorail.proxy.rlwy.net)"
$dbPort = Read-Host "Enter DATABASE_PORT (usually 5432)"
$dbUser = Read-Host "Enter DATABASE_USER (usually postgres)"
$dbPassword = Read-Host "Enter DATABASE_PASSWORD" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
$dbName = Read-Host "Enter DATABASE_NAME (e.g. railway)"

Write-Host "`n" -ForegroundColor Cyan
Write-Host "Super Admin Credentials:" -ForegroundColor Cyan
Write-Host "Email: superadmin@cognexiaai.com" -ForegroundColor Green
Write-Host "Password: Akshita@19822" -ForegroundColor Green

Write-Host "`nPress Enter to create/update the super admin user in Railway..." -ForegroundColor Yellow
Read-Host

# Set environment variables for the seed script
$env:DATABASE_HOST = $dbHost
$env:DATABASE_PORT = $dbPort
$env:DATABASE_USER = $dbUser
$env:DATABASE_PASSWORD = $dbPasswordPlain
$env:DATABASE_NAME = $dbName
$env:SUPER_ADMIN_EMAIL = "superadmin@cognexiaai.com"
$env:SUPER_ADMIN_PASSWORD = "Akshita@19822"

# Navigate to backend CRM directory
Set-Location "C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM"

Write-Host "`nRunning seed script..." -ForegroundColor Yellow

# Run the seed script using ts-node
try {
    npm run seed-admin-user
    Write-Host "`n✅ Super admin user created/updated successfully!" -ForegroundColor Green
    Write-Host "`nYou can now log in with:" -ForegroundColor Cyan
    Write-Host "Email: superadmin@cognexiaai.com" -ForegroundColor White
    Write-Host "Password: Akshita@19822" -ForegroundColor White
} catch {
    Write-Host "`n❌ Error seeding super admin user" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Return to frontend directory
Set-Location "C:\Users\nshrm\Desktop\CognexiaAI-ERP\frontend"
