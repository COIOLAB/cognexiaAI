# Deploy CRM Backend to Railway via CLI
# Prerequisites: npm i -g @railway/cli, railway login, railway link (from backend/modules/03-CRM)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot
$CrmDir = Join-Path $RootDir "backend\modules\03-CRM"

Write-Host "=== Deploying CRM Backend to Railway ===" -ForegroundColor Cyan
Write-Host "Directory: $CrmDir" -ForegroundColor Gray

# Navigate to CRM directory and deploy
Push-Location $CrmDir
try {
    Write-Host "`nRunning: railway up" -ForegroundColor Green
    railway up
    if ($LASTEXITCODE -ne 0) { throw "railway up exited with code $LASTEXITCODE" }
    Write-Host "`nDeploy complete. Check Railway dashboard for URL." -ForegroundColor Green
} catch {
    Write-Host "Deploy failed: $_" -ForegroundColor Red
    Write-Host "`nFirst time setup:" -ForegroundColor Yellow
    Write-Host "  1. railway login   (opens browser)" -ForegroundColor Gray
    Write-Host "  2. railway link    (link this folder to a Railway project)" -ForegroundColor Gray
    Write-Host "  3. railway up      (deploy)" -ForegroundColor Gray
    Write-Host "`nRun these from: $CrmDir" -ForegroundColor Gray
    exit 1
} finally {
    Pop-Location
}
