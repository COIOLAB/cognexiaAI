# CognexiaAI ERP - Full Deployment (Railway + Vercel)
# Run this in PowerShell (not Cursor's terminal - use VS Code terminal or Windows Terminal)
# Account: nirmal.singh@cognexiaai.com

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot
$CrmDir = Join-Path $RootDir "backend\modules\03-CRM"

Write-Host "`n=== CognexiaAI ERP Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify login
Write-Host "Step 1: Verifying Railway login..." -ForegroundColor Yellow
$railwayOk = $false
try { railway whoami 2>$null; if ($LASTEXITCODE -eq 0) { $railwayOk = $true } } catch {}
if (-not $railwayOk) {
    Write-Host "  Railway: Not logged in. Run: railway login" -ForegroundColor Red
    Write-Host "  (Opens browser - use nirmal.singh@cognexiaai.com)" -ForegroundColor Gray
} else {
    Write-Host "  Railway: Logged in" -ForegroundColor Green
}

Write-Host "Step 1: Verifying Vercel login..." -ForegroundColor Yellow
$vercelOk = $false
try { vercel whoami 2>$null; if ($LASTEXITCODE -eq 0) { $vercelOk = $true } } catch {}
if (-not $vercelOk) {
    Write-Host "  Vercel: Not logged in. Run: vercel login" -ForegroundColor Red
} else {
    Write-Host "  Vercel: Logged in" -ForegroundColor Green
}

if (-not $railwayOk -or -not $vercelOk) {
    Write-Host "`nPlease run login commands in THIS terminal, then re-run this script." -ForegroundColor Yellow
    Write-Host "  railway login" -ForegroundColor Gray
    Write-Host "  vercel login" -ForegroundColor Gray
    exit 1
}

# Step 2: Railway - Link & Deploy
Write-Host "`nStep 2: Deploying backend to Railway..." -ForegroundColor Yellow
Push-Location $CrmDir
try {
    # Check if linked
    $linked = Test-Path ".railway" -ErrorAction SilentlyContinue
    if (-not $linked) {
        Write-Host "  First time: Linking to Railway project..." -ForegroundColor Gray
        railway link
        if ($LASTEXITCODE -ne 0) { throw "railway link failed" }
    }
    Write-Host "  Deploying..." -ForegroundColor Gray
    railway up
    if ($LASTEXITCODE -ne 0) { throw "railway up failed" }
    Write-Host "  Railway deploy complete!" -ForegroundColor Green
} catch {
    Write-Host "  Railway failed: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Step 3: Get Railway URL for frontends
Write-Host "`nStep 3: Deploying frontends to Vercel..." -ForegroundColor Yellow
$ApiUrl = $env:NEXT_PUBLIC_API_URL
if (-not $ApiUrl) {
    $ApiUrl = Read-Host "Enter your Railway API URL (e.g. https://cognexia-crm-production.up.railway.app/api/v1)"
    $env:NEXT_PUBLIC_API_URL = $ApiUrl
}

# Deploy each frontend
$Portals = @(
    @{ Name = "Auth Portal"; Path = "frontend\auth-portal" },
    @{ Name = "Client Admin"; Path = "frontend\client-admin-portal" },
    @{ Name = "Super Admin"; Path = "frontend\super-admin-portal" }
)

foreach ($p in $Portals) {
    $Path = Join-Path $RootDir $p.Path
    Write-Host "  Deploying $($p.Name)..." -ForegroundColor Gray
    Push-Location $Path
    try {
        $env:NEXT_PUBLIC_API_URL = $ApiUrl
        vercel --prod --yes -b "NEXT_PUBLIC_API_URL=$ApiUrl"
        if ($LASTEXITCODE -ne 0) { throw "vercel deploy failed" }
        Write-Host "  $($p.Name) deployed!" -ForegroundColor Green
    } catch {
        Write-Host "  $($p.Name) failed: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

Write-Host "`n=== Deployment complete ===" -ForegroundColor Green
Write-Host "Backend: Check Railway dashboard for URL" -ForegroundColor Gray
Write-Host "Frontends: Check Vercel dashboard for URLs" -ForegroundColor Gray
Write-Host "Remember: Update CORS_ORIGIN in Railway with your Vercel URLs" -ForegroundColor Yellow
