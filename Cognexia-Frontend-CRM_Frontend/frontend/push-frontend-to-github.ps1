<#
.SYNOPSIS
    Push the frontend (auth-portal, client-admin-portal, super-admin-portal, shared-ui) to the Cognexia Frontend GitHub repo.
.DESCRIPTION
    Clones your Cognexia Frontend repo, copies frontend contents into it (excluding node_modules, .next, etc.),
    adjusts Dockerfiles for frontend-only repo paths, then commits and pushes.
    Use this so Vercel can deploy from that repo, and optional Docker images can be built via GitHub Actions.
.PARAMETER RepoUrl
    Your Cognexia Frontend GitHub repo URL (HTTPS or SSH).
    Example: https://github.com/YOUR_USERNAME/Cognexia-Frontend.git
.PARAMETER Branch
    Branch to push to (default: main).
.PARAMETER TempDir
    Temp folder for clone (default: $env:TEMP\Cognexia-Frontend-Push).
.EXAMPLE
    .\push-frontend-to-github.ps1 -RepoUrl "https://github.com/MyOrg/Cognexia-Frontend.git"
.EXAMPLE
    .\push-frontend-to-github.ps1 -RepoUrl "https://github.com/MyOrg/Cognexia-Frontend.git" -Branch main
#>
param(
    [Parameter(Mandatory = $true)]
    [string] $RepoUrl,

    [Parameter(Mandatory = $false)]
    [string] $Branch = "main",

    [Parameter(Mandatory = $false)]
    [string] $TempDir = ""
)

$ErrorActionPreference = "Stop"

# #region agent log
$DebugLogPath = "c:\Users\nshrm\Desktop\CognexiaAI-ERP\.cursor\debug.log"
function Write-DebugLog { param($location,$message,$data,$hypothesisId)
    $entry = @{id="log_$(Get-Date -UFormat %s)_$([guid]::NewGuid().ToString('N').Substring(0,4))";timestamp=[long]((Get-Date) - (Get-Date "1970-01-01")).TotalMilliseconds;location=$location;message=$message;data=$data;sessionId="debug-session";runId="run1";hypothesisId=$hypothesisId}
    Add-Content -Path $DebugLogPath -Value ($entry | ConvertTo-Json -Compress -Depth 4)
}
# #endregion

# Script must run from frontend folder; project root is parent
$FrontendRoot = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($TempDir)) {
    $TempDir = Join-Path $FrontendRoot ".push-target"
}
$ProjectRoot = Split-Path -Parent $FrontendRoot

if (-not (Test-Path (Join-Path $FrontendRoot "auth-portal"))) {
    Write-Error "Expected frontend folder structure (auth-portal, client-admin-portal, etc.). Run this script from the frontend folder."
    exit 1
}

# #region agent log
Write-DebugLog -location "push-frontend-to-github.ps1:start" -message "Script start" -data @{FrontendRoot=$FrontendRoot;TempDir=$TempDir;RepoUrl=$RepoUrl} -hypothesisId "D"
# #endregion

Write-Host "Frontend root: $FrontendRoot"
Write-Host "Project root:  $ProjectRoot"
Write-Host "Target repo:   $RepoUrl"
Write-Host "Branch:       $Branch"
Write-Host ""

# Exclude these when copying (keep .gitignore and .env.production.example)
$ExcludeDirs = @("node_modules", ".next", ".vercel", "dist", "out", ".git")
$ExcludeFiles = @("*.log", ".env", ".env.local")

function Copy-FrontendContents {
    param([string]$Dest)
    $items = Get-ChildItem -Path $FrontendRoot -Force
    foreach ($item in $items) {
        $name = $item.Name
        if ($name -eq ".git") { continue }
        if ($ExcludeDirs -contains $name) { continue }
        $destPath = Join-Path $Dest $name
        if ($item.PSIsContainer) {
            Copy-Item -Path $item.FullName -Destination $destPath -Recurse -Force -ErrorAction SilentlyContinue
            # Remove excluded subdirs (node_modules, .next, etc.) from copied tree
            foreach ($ex in $ExcludeDirs) {
                Get-ChildItem -Path $destPath -Recurse -Directory -Filter $ex -ErrorAction SilentlyContinue | ForEach-Object {
                    Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
                }
            }
        } else {
            if ($name -match "\.(log|env)$" -and $name -notmatch "\.example$") { continue }
            Copy-Item -Path $item.FullName -Destination $destPath -Force -ErrorAction SilentlyContinue
        }
    }
}

# Adjust Dockerfiles for frontend-only repo (no "frontend/" prefix)
function Fix-DockerfilesForFrontendRepo {
    param([string]$Root)
    $dockerfiles = @(
        (Join-Path $Root "auth-portal\Dockerfile"),
        (Join-Path $Root "client-admin-portal\Dockerfile"),
        (Join-Path $Root "super-admin-portal\Dockerfile")
    )
    foreach ($df in $dockerfiles) {
        if (-not (Test-Path $df)) { continue }
        $content = Get-Content -Path $df -Raw -Encoding UTF8
        $content = $content -replace "frontend/", ""
        $content = $content -replace "/app/frontend/", "/app/"
        Set-Content -Path $df -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  Adjusted: $df"
    }
}

# Prepare temp dir and clone
if (Test-Path $TempDir) {
    Write-Host "Removing existing temp dir: $TempDir"
    Remove-Item -Path $TempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

Write-Host "Cloning Cognexia Frontend repo..."
$cloneErr = $null
& git clone --depth 1 --branch $Branch -q $RepoUrl $TempDir 2>&1 | Out-Null
$firstCloneExit = $LASTEXITCODE
# #region agent log
Write-DebugLog -location "push-frontend-to-github.ps1:after-first-clone" -message "After first clone" -data @{LASTEXITCODE=$firstCloneExit;TempDirExists=(Test-Path $TempDir);HasDotGit=(Test-Path (Join-Path $TempDir ".git"))} -hypothesisId "A"
# #endregion
if ($firstCloneExit -ne 0) {
    # Branch might not exist yet (new repo)
    if (Test-Path $TempDir) { Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue }
    & git clone -q $RepoUrl $TempDir 2>&1 | Out-Null
    $secondCloneExit = $LASTEXITCODE
    # #region agent log
    Write-DebugLog -location "push-frontend-to-github.ps1:after-second-clone" -message "After second clone" -data @{LASTEXITCODE=$secondCloneExit} -hypothesisId "A"
    # #endregion
    if ($secondCloneExit -ne 0) {
        Write-Error "Clone failed. Check RepoUrl, network, and GitHub credentials (HTTPS: use a Personal Access Token)."
        exit 1
    }
    Push-Location $TempDir
    & git checkout -b $Branch 2>&1 | Out-Null
    Pop-Location
}

Push-Location $TempDir
try {
    # Remove everything except .git so we replace with current frontend
    Get-ChildItem -Path . -Force | Where-Object { $_.Name -ne ".git" } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

    Write-Host "Copying frontend contents (excluding node_modules, .next, etc.)..."
    Copy-FrontendContents -Dest $TempDir
    # #region agent log
    Write-DebugLog -location "push-frontend-to-github.ps1:after-copy" -message "After copy" -data @{authPortalExists=(Test-Path (Join-Path $TempDir "auth-portal"));sharedUiExists=(Test-Path (Join-Path $TempDir "shared-ui"))} -hypothesisId "B"
    # #endregion

    Write-Host "Adjusting Dockerfiles for frontend-only repo..."
    Fix-DockerfilesForFrontendRepo -Root $TempDir

    & git add -A
    $status = & git status --short
    # #region agent log
    $statusStr = if ($status) { ($status | Out-String).Trim().Substring(0, [Math]::Min(400, ($status | Out-String).Length)) } else { "empty" }
    Write-DebugLog -location "push-frontend-to-github.ps1:after-git-add" -message "After git add" -data @{statusPreview=$statusStr;statusEmpty=(-not $status)} -hypothesisId "B"
    # #endregion
    if (-not $status) {
        # #region agent log
        Write-DebugLog -location "push-frontend-to-github.ps1:exit-no-changes" -message "Exiting: no changes to commit" -data @{} -hypothesisId "B"
        # #endregion
        Write-Host "No changes to commit."
        Pop-Location
        exit 0
    }
    Write-Host "Changes to commit:"
    & git status --short

    & git commit -m "chore: sync frontend from CognexiaAI-ERP (auth, client-admin, super-admin, shared-ui)"
    $commitExit = $LASTEXITCODE
    # #region agent log
    Write-DebugLog -location "push-frontend-to-github.ps1:after-commit" -message "After commit" -data @{LASTEXITCODE=$commitExit} -hypothesisId "C"
    # #endregion
    if ($commitExit -ne 0) {
        Write-Host "Commit had nothing to add or failed."
        Pop-Location
        exit 0
    }

    Write-Host "Pushing to $Branch..."
    & git push -u origin $Branch
    $pushExit = $LASTEXITCODE
    # #region agent log
    Write-DebugLog -location "push-frontend-to-github.ps1:after-push" -message "After push" -data @{LASTEXITCODE=$pushExit} -hypothesisId "C"
    # #endregion
    if ($pushExit -ne 0) {
        Write-Error "Push failed. Check credentials and branch."
        exit 1
    }

    # #region agent log
    Write-DebugLog -location "push-frontend-to-github.ps1:success" -message "Script completed successfully" -data @{} -hypothesisId "E"
    # #endregion
    Write-Host ""
    Write-Host "Done. Frontend pushed to: $RepoUrl (branch: $Branch)"
    Write-Host "Next: Connect Vercel to this repo and create 3 projects with Root Directory = auth-portal, client-admin-portal, super-admin-portal."
}
finally {
    Pop-Location
}
