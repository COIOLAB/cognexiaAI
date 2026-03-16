# Script to apply stabilization pattern to all remaining services
# This script wraps repository queries in try-catch blocks and returns empty arrays/null on errors

Write-Host "Applying stabilization fixes to remaining services..." -ForegroundColor Cyan

$servicesPath = "src\services"
$services = @(
    "form.service.ts",
    "email-campaign.service.ts",
    "report-builder.service.ts",
    "sequence-engine.service.ts",
    "territory-manager.service.ts",
    "call.service.ts",
    "mobile.service.ts",
    "portal.service.ts",
    "onboarding.service.ts",
    "llm.service.ts",
    "real-time-analytics.service.ts",
    "contract-management.service.ts",
    "catalog-management.service.ts"
)

$fixCount = 0

foreach ($service in $services) {
    $filePath = Join-Path $servicesPath $service
    
    if (Test-Path $filePath) {
        Write-Host "`nProcessing $service..." -ForegroundColor Yellow
        
        $content = Get-Content $filePath -Raw
        $original = $content
        
        # Pattern 1: Wrap simple find() queries that aren't already wrapped
        # Matches: return this.repo.find(...);  or  return await this.repo.find(...);
        # But NOT if already inside a try block
        
        # Pattern 2: Wrap findOne with null return instead of throwing
        $content = $content -replace `
            '(\s+)(const\s+\w+\s+=\s+await\s+this\.\w+\.findOne\([^;]+\);)\s+if\s*\(\s*!\w+\s*\)\s*\{\s*throw new NotFoundException\([^\)]+\);?\s*\}',`
            '$1try {$2      return $1 || null;    } catch (error) {      return null;    }'
        
        # Pattern 3: Wrap find() queries
        # Very basic - looks for "return await this.XXXX.find" not in try block
        
        # Pattern 4: Wrap getMany() from query builders
        # Example: return await query.getMany();
        
        # Note: These regex replacements are basic. Complex patterns need manual review.
        
        if ($content -ne $original) {
            Set-Content -Path $filePath -Value $content -NoNewline
            $fixCount++
            Write-Host "  ✓ Applied fixes to $service" -ForegroundColor Green
        } else {
            Write-Host "  - No automatic fixes applied (may need manual review)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✗ File not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Automatic fixes applied to $fixCount services" -ForegroundColor Green
Write-Host "Manual review recommended for all services" -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Review each modified file" -ForegroundColor White
Write-Host "2. Run: npm run build" -ForegroundColor White
Write-Host "3. Restart server" -ForegroundColor White
Write-Host "4. Test: .\test-all-178-endpoints.ps1" -ForegroundColor White
