# CognexiaAI CRM - Start All Services
# This script starts both backend and frontend in separate windows

Write-Host "🚀 Starting CognexiaAI CRM Application..." -ForegroundColor Green
Write-Host ""

# Get the script directory
$ROOT_DIR = "C:\Users\nshrm\Desktop\CognexiaAI-ERP"

# Start Backend (CRM Module)
Write-Host "📡 Starting Backend API (Port 3003)..." -ForegroundColor Cyan
$backendPath = "$ROOT_DIR\backend\modules\03-CRM"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🔧 CRM Backend Starting...' -ForegroundColor Yellow; npm run start:dev"

# Wait a bit for backend to initialize
Write-Host "⏳ Waiting 5 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend (Client Admin Portal)
Write-Host "🎨 Starting Frontend App (Port 3002)..." -ForegroundColor Cyan
$frontendPath = "$ROOT_DIR\frontend\client-admin-portal"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🎨 Frontend Starting...' -ForegroundColor Yellow; npm run dev"

Write-Host ""
Write-Host "✅ Services are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Access Points:" -ForegroundColor White
Write-Host "   Frontend:    http://localhost:3002" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost:3003" -ForegroundColor Cyan
Write-Host "   API Docs:    http://localhost:3003/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏱️  Give it 30-60 seconds to fully start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🛑 To stop: Close the terminal windows or press Ctrl+C in each" -ForegroundColor Red
Write-Host ""
