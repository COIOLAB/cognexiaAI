# CognexiaAI - Start All Services
# This script starts all backend and frontend services in separate PowerShell windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CognexiaAI - Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Base directory
$baseDir = "C:\Users\nshrm\Desktop\CognexiaAI-ERP"

# Function to start service in new window
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Port
    )
    
    Write-Host "Starting $Name on port $Port..." -ForegroundColor Yellow
    
    $fullPath = Join-Path $baseDir $Path
    
    # Create a new PowerShell window and run the command
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$fullPath'; Write-Host '=== $Name ===' -ForegroundColor Green; Write-Host 'Port: $Port' -ForegroundColor Cyan; Write-Host ''; $Command"
    
    Start-Sleep -Seconds 2
}

# Start Backend CRM (Port 3003)
Start-Service -Name "CRM Backend" -Path "backend\modules\03-CRM" -Command "npm run start:dev" -Port "3003"

# Wait for backend to initialize
Write-Host "Waiting for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Start Frontend Auth Portal (Port 3010)
Start-Service -Name "Auth Portal Frontend" -Path "frontend\auth-portal" -Command "npm run dev -- -p 3010" -Port "3010"

# Wait a bit before starting next service
Start-Sleep -Seconds 3

# Start Super Admin Portal (Port 3001)
Start-Service -Name "Super Admin Portal" -Path "frontend\super-admin-portal" -Command "npm run dev" -Port "3001"

# Wait a bit before starting next service
Start-Sleep -Seconds 3

# Start Client Admin Portal (Port 3002)
Start-Service -Name "Client Admin Portal" -Path "frontend\client-admin-portal" -Command "npm run dev" -Port "3002"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All Services Starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services are starting in separate windows:" -ForegroundColor White
Write-Host "  1. CRM Backend       -> http://localhost:3003" -ForegroundColor Cyan
Write-Host "  2. Auth Portal       -> http://localhost:3010" -ForegroundColor Cyan
Write-Host "  3. Super Admin       -> http://localhost:3001" -ForegroundColor Cyan
Write-Host "  4. Client Admin      -> http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait 30-60 seconds for all services to fully start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Test URLs:" -ForegroundColor White
Write-Host "  - Home:            http://localhost:3010" -ForegroundColor Gray
Write-Host "  - About:           http://localhost:3010/about" -ForegroundColor Gray
Write-Host "  - Careers:         http://localhost:3010/careers" -ForegroundColor Gray
Write-Host "  - Job Application: http://localhost:3010/careers/apply" -ForegroundColor Gray
Write-Host "  - Contact:         http://localhost:3010/contact" -ForegroundColor Gray
Write-Host "  - Super Admin:     http://localhost:3001" -ForegroundColor Gray
Write-Host "  - Client Admin:    http://localhost:3002" -ForegroundColor Gray
Write-Host "  - Backend API:     http://localhost:3003/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit (services will continue running)..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
