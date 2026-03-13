# Full deployment via CLI: Railway (backend) then Vercel (frontends)
# Prerequisites: Railway CLI, Vercel CLI, railway login, vercel login

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== CognexiaAI ERP - Full CLI Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Deploy backend to Railway
Write-Host "Step 1/2: Deploying backend to Railway..." -ForegroundColor Yellow
& (Join-Path $ScriptDir "deploy-railway.ps1")
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend deploy failed. Fix errors and retry." -ForegroundColor Red
    exit 1
}

# Get Railway URL - user must update CORS and frontend env
Write-Host "`nAfter Railway deploy, get your API URL from Railway dashboard." -ForegroundColor Yellow
Write-Host "Then set: `$env:NEXT_PUBLIC_API_URL = 'https://your-app.railway.app/api/v1'" -ForegroundColor Gray
$ApiUrl = Read-Host "`nEnter your Railway API URL (https://xxx.railway.app/api/v1) or press Enter to skip frontend deploy"

if ($ApiUrl) {
    $env:NEXT_PUBLIC_API_URL = $ApiUrl
    Write-Host "`nStep 2/2: Deploying frontends to Vercel..." -ForegroundColor Yellow
    & (Join-Path $ScriptDir "deploy-vercel.ps1") -Target all
} else {
    Write-Host "Skipping Vercel deploy. Run: .\scripts\deploy-vercel.ps1 -Target all" -ForegroundColor Gray
}

Write-Host "`n=== Deployment flow complete ===" -ForegroundColor Green
