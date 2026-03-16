# Deploy Frontends to Vercel via CLI
# Prerequisites: npm i -g vercel, vercel login
# Usage: .\deploy-vercel.ps1 [auth|client|super|all]

param(
    [ValidateSet("auth","client","super","all")]
    [string]$Target = "all"
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot
$FrontendDir = Join-Path $RootDir "frontend"

# API URL - update after Railway deploy
$ApiUrl = $env:NEXT_PUBLIC_API_URL
if (-not $ApiUrl) {
    $ApiUrl = Read-Host "Enter API URL (e.g. https://xxx.railway.app/api/v1)"
}

# Use npx (no global install required)
$VercelCmd = if (Get-Command vercel -ErrorAction SilentlyContinue) { "vercel" } else { "npx -y vercel" }

function Deploy-Vercel {
    param([string]$Name, [string]$Path, [hashtable]$EnvVars = @{})
    Write-Host "`n=== Deploying $Name ===" -ForegroundColor Cyan
    Push-Location $Path
    try {
        # Set env vars for build (Next.js reads at build time)
        $env:NEXT_PUBLIC_API_URL = $ApiUrl
        foreach ($k in $EnvVars.Keys) { $env:$k = $EnvVars[$k] }
        # Deploy - -b passes build-time vars to Vercel
        Invoke-Expression "$VercelCmd --prod --yes -b `"NEXT_PUBLIC_API_URL=$ApiUrl`""
        Write-Host "Deployed: $Name" -ForegroundColor Green
    } catch {
        Write-Host "Deploy failed for $Name : $_" -ForegroundColor Red
        exit 1
    } finally {
        Pop-Location
    }
}

$AuthPath = Join-Path $FrontendDir "auth-portal"
$ClientPath = Join-Path $FrontendDir "client-admin-portal"
$SuperPath = Join-Path $FrontendDir "super-admin-portal"

switch ($Target) {
    "auth"  { Deploy-Vercel -Name "Auth Portal" -Path $AuthPath }
    "client" { Deploy-Vercel -Name "Client Admin Portal" -Path $ClientPath }
    "super" { Deploy-Vercel -Name "Super Admin Portal" -Path $SuperPath }
    "all"   {
        Deploy-Vercel -Name "Auth Portal" -Path $AuthPath
        Deploy-Vercel -Name "Client Admin Portal" -Path $ClientPath
        Deploy-Vercel -Name "Super Admin Portal" -Path $SuperPath
    }
}

Write-Host "`n=== Vercel deploy complete ===" -ForegroundColor Green
