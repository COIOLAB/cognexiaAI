# Backend Module Readiness Analysis Script
# Analysis of all 29 Industry 5.0 ERP Backend Modules

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Industry 5.0 ERP Backend Module Analysis" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$moduleReport = @()

# Get all module directories
$modules = Get-ChildItem "modules" -Directory | Sort-Object Name

foreach ($module in $modules) {
    $moduleName = $module.Name
    $modulePath = $module.FullName
    
    Write-Host "Analyzing Module: $moduleName" -ForegroundColor Yellow
    Write-Host "----------------------------------------"
    
    $moduleInfo = [PSCustomObject]@{
        ModuleName = $moduleName
        Path = $modulePath
        HasSrc = $false
        HasReadme = $false
        HasPackageJson = $false
        HasTsConfig = $false
        TSFiles = 0
        JSFiles = 0
        Controllers = 0
        Services = 0
        Entities = 0
        DTOs = 0
        Tests = 0
        Status = "Unknown"
        Issues = @()
        Recommendations = @()
    }
    
    # Check for src directory
    $srcPath = Join-Path $modulePath "src"
    if (Test-Path $srcPath) {
        $moduleInfo.HasSrc = $true
        Write-Host "✅ src directory exists" -ForegroundColor Green
        
        # Count TypeScript and JavaScript files
        $tsFiles = Get-ChildItem $srcPath -Recurse -Include "*.ts" | Measure-Object
        $jsFiles = Get-ChildItem $srcPath -Recurse -Include "*.js" | Measure-Object
        $moduleInfo.TSFiles = $tsFiles.Count
        $moduleInfo.JSFiles = $jsFiles.Count
        
        # Count specific file types
        $controllers = Get-ChildItem $srcPath -Recurse -Include "*controller*" | Measure-Object
        $services = Get-ChildItem $srcPath -Recurse -Include "*service*" | Measure-Object
        $entities = Get-ChildItem $srcPath -Recurse -Include "*entity*" | Measure-Object
        $dtos = Get-ChildItem $srcPath -Recurse -Include "*dto*" | Measure-Object
        
        $moduleInfo.Controllers = $controllers.Count
        $moduleInfo.Services = $services.Count
        $moduleInfo.Entities = $entities.Count
        $moduleInfo.DTOs = $dtos.Count
        
        Write-Host "  📁 TypeScript files: $($moduleInfo.TSFiles)" -ForegroundColor Cyan
        Write-Host "  📁 JavaScript files: $($moduleInfo.JSFiles)" -ForegroundColor Cyan
        Write-Host "  🎮 Controllers: $($moduleInfo.Controllers)" -ForegroundColor Cyan
        Write-Host "  ⚙️  Services: $($moduleInfo.Services)" -ForegroundColor Cyan
        Write-Host "  🗃️  Entities: $($moduleInfo.Entities)" -ForegroundColor Cyan
        Write-Host "  📦 DTOs: $($moduleInfo.DTOs)" -ForegroundColor Cyan
    } else {
        $moduleInfo.Issues += "Missing src directory"
        Write-Host "❌ src directory missing" -ForegroundColor Red
    }
    
    # Check for README
    $readmePath = Join-Path $modulePath "README.md"
    if (Test-Path $readmePath) {
        $moduleInfo.HasReadme = $true
        Write-Host "✅ README.md exists" -ForegroundColor Green
    } else {
        $moduleInfo.Issues += "Missing README.md"
        Write-Host "❌ README.md missing" -ForegroundColor Red
    }
    
    # Check for package.json
    $packagePath = Join-Path $modulePath "package.json"
    if (Test-Path $packagePath) {
        $moduleInfo.HasPackageJson = $true
        Write-Host "✅ package.json exists" -ForegroundColor Green
    } else {
        $moduleInfo.Issues += "Missing package.json"
        Write-Host "⚠️  package.json missing (may use parent)" -ForegroundColor Yellow
    }
    
    # Check for tsconfig.json
    $tsconfigPath = Join-Path $modulePath "tsconfig.json"
    if (Test-Path $tsconfigPath) {
        $moduleInfo.HasTsConfig = $true
        Write-Host "✅ tsconfig.json exists" -ForegroundColor Green
    } else {
        $moduleInfo.Issues += "Missing tsconfig.json"
        Write-Host "⚠️  tsconfig.json missing (may use parent)" -ForegroundColor Yellow
    }
    
    # Check for tests
    $testsPath = Join-Path $modulePath "tests"
    if (Test-Path $testsPath) {
        $testFiles = Get-ChildItem $testsPath -Recurse -Include "*.test.ts", "*.spec.ts" | Measure-Object
        $moduleInfo.Tests = $testFiles.Count
        Write-Host "✅ Tests directory exists ($($moduleInfo.Tests) test files)" -ForegroundColor Green
    } else {
        $moduleInfo.Issues += "Missing tests directory"
        Write-Host "❌ tests directory missing" -ForegroundColor Red
    }
    
    # Determine overall status
    if ($moduleInfo.HasSrc -and $moduleInfo.TSFiles -gt 0) {
        if ($moduleInfo.Controllers -gt 0 -and $moduleInfo.Services -gt 0) {
            $moduleInfo.Status = "Complete"
        } elseif ($moduleInfo.TSFiles -gt 10) {
            $moduleInfo.Status = "Good"
        } else {
            $moduleInfo.Status = "Basic"
        }
    } else {
        $moduleInfo.Status = "Incomplete"
    }
    
    # Add recommendations
    if ($moduleInfo.TSFiles -eq 0) {
        $moduleInfo.Recommendations += "Add TypeScript implementation files"
    }
    if ($moduleInfo.Controllers -eq 0) {
        $moduleInfo.Recommendations += "Add API controllers"
    }
    if ($moduleInfo.Services -eq 0) {
        $moduleInfo.Recommendations += "Add business logic services"
    }
    if ($moduleInfo.Entities -eq 0) {
        $moduleInfo.Recommendations += "Add database entities"
    }
    if ($moduleInfo.Tests -eq 0) {
        $moduleInfo.Recommendations += "Add test coverage"
    }
    
    $moduleReport += $moduleInfo
    
    Write-Host "Status: $($moduleInfo.Status)" -ForegroundColor $(
        switch ($moduleInfo.Status) {
            "Complete" { "Green" }
            "Good" { "Cyan" }
            "Basic" { "Yellow" }
            "Incomplete" { "Red" }
            default { "White" }
        }
    )
    Write-Host ""
}

# Generate Summary Report
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY REPORT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$totalModules = $moduleReport.Count
$completeModules = ($moduleReport | Where-Object { $_.Status -eq "Complete" }).Count
$goodModules = ($moduleReport | Where-Object { $_.Status -eq "Good" }).Count
$basicModules = ($moduleReport | Where-Object { $_.Status -eq "Basic" }).Count
$incompleteModules = ($moduleReport | Where-Object { $_.Status -eq "Incomplete" }).Count

Write-Host "Total Modules: $totalModules" -ForegroundColor White
Write-Host "Complete: $completeModules" -ForegroundColor Green
Write-Host "Good: $goodModules" -ForegroundColor Cyan
Write-Host "Basic: $basicModules" -ForegroundColor Yellow
Write-Host "Incomplete: $incompleteModules" -ForegroundColor Red
Write-Host ""

# Detailed Status by Module
Write-Host "DETAILED MODULE STATUS:" -ForegroundColor Cyan
Write-Host "----------------------------------------"

foreach ($module in $moduleReport | Sort-Object Status -Descending) {
    $statusColor = switch ($module.Status) {
        "Complete" { "Green" }
        "Good" { "Cyan" }
        "Basic" { "Yellow" }
        "Incomplete" { "Red" }
        default { "White" }
    }
    
    Write-Host "$($module.ModuleName.PadRight(30)) : $($module.Status)" -ForegroundColor $statusColor
    Write-Host "  Files: TS=$($module.TSFiles), Controllers=$($module.Controllers), Services=$($module.Services)" -ForegroundColor Gray
    
    if ($module.Issues.Count -gt 0) {
        Write-Host "  Issues: $($module.Issues -join ', ')" -ForegroundColor Red
    }
    
    if ($module.Recommendations.Count -gt 0) {
        Write-Host "  Recommendations: $($module.Recommendations -join ', ')" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Export detailed report to JSON
$reportPath = "Backend-Module-Analysis-Report.json"
$moduleReport | ConvertTo-Json -Depth 3 | Out-File $reportPath
Write-Host "Detailed report exported to: $reportPath" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Analysis Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
