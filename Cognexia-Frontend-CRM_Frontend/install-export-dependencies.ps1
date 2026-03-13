# User Export Feature - Dependency Installation Script
# Run this script to install all required packages for export functionality

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "User Export Feature - Dependency Installer" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$superAdminPortalPath = "C:\Users\nshrm\Desktop\CognexiaAI-ERP\frontend\super-admin-portal"

# Check if directory exists
if (!(Test-Path $superAdminPortalPath)) {
    Write-Host "❌ Error: Super Admin Portal directory not found!" -ForegroundColor Red
    Write-Host "Expected path: $superAdminPortalPath" -ForegroundColor Yellow
    exit 1
}

# Navigate to super-admin-portal
Write-Host "📁 Navigating to super-admin-portal directory..." -ForegroundColor Yellow
Set-Location $superAdminPortalPath

# Check if package.json exists
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Directory found`n" -ForegroundColor Green

# Install production dependencies
Write-Host "📦 Installing production dependencies..." -ForegroundColor Yellow
Write-Host "   - jspdf (PDF generation)" -ForegroundColor Gray
Write-Host "   - jspdf-autotable (PDF tables)" -ForegroundColor Gray
Write-Host "   - xlsx (Excel generation)" -ForegroundColor Gray
Write-Host "   - docx (Word documents)" -ForegroundColor Gray
Write-Host "   - papaparse (CSV handling)" -ForegroundColor Gray
Write-Host "   - date-fns (date formatting)`n" -ForegroundColor Gray

npm install jspdf jspdf-autotable xlsx docx papaparse date-fns

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error: Failed to install production dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ Production dependencies installed successfully`n" -ForegroundColor Green

# Install dev dependencies
Write-Host "📦 Installing development dependencies..." -ForegroundColor Yellow
Write-Host "   - @types/papaparse (TypeScript types)`n" -ForegroundColor Gray

npm install --save-dev @types/papaparse

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error: Failed to install dev dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ Dev dependencies installed successfully`n" -ForegroundColor Green

# Verify installation
Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow

$packages = @("jspdf", "jspdf-autotable", "xlsx", "docx", "papaparse", "date-fns")
$allInstalled = $true

foreach ($package in $packages) {
    $result = npm list $package 2>&1
    if ($result -match $package) {
        Write-Host "   ✓ $package installed" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $package NOT installed" -ForegroundColor Red
        $allInstalled = $false
    }
}

if (!$allInstalled) {
    Write-Host "`n❌ Some packages failed to install. Please check errors above." -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start the development server: npm run dev" -ForegroundColor White
Write-Host "2. Open http://localhost:3001 in your browser" -ForegroundColor White
Write-Host "3. Navigate to Users page" -ForegroundColor White
Write-Host "4. Test the 'Export Users' button`n" -ForegroundColor White

Write-Host "📚 For detailed testing instructions, see:" -ForegroundColor Cyan
Write-Host "   USER_EXPORT_FEATURE_GUIDE.md`n" -ForegroundColor White

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
