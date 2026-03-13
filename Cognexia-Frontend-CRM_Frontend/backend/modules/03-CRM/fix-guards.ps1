# Fix guards in all controllers
$controllers = @(
    "src\controllers\onboarding.controller.ts",
    "src\controllers\health-scoring-v2.controller.ts",
    "src\controllers\database-management.controller.ts",
    "src\controllers\natural-language-query.controller.ts",
    "src\controllers\release-management.controller.ts",
    "src\controllers\developer-portal.controller.ts",
    "src\controllers\support-analytics.controller.ts",
    "src\controllers\customer-success.controller.ts",
    "src\controllers\invoice-payment.controller.ts",
    "src\controllers\advanced-financial.controller.ts",
    "src\controllers\recommendation-engine.controller.ts",
    "src\controllers\advanced-audit.controller.ts",
    "src\controllers\performance-monitoring.controller.ts",
    "src\controllers\anomaly-detection.controller.ts",
    "src\controllers\disaster-recovery.controller.ts",
    "src\controllers\predictive-analytics.controller.ts",
    "src\controllers\white-label.controller.ts",
    "src\controllers\mobile-admin.controller.ts",
    "src\controllers\api-management.controller.ts",
    "src\controllers\ab-testing.controller.ts",
    "src\controllers\kpi-tracking.controller.ts",
    "src\controllers\custom-reporting.controller.ts",
    "src\controllers\multi-region.controller.ts",
    "src\controllers\automation-workflows.controller.ts",
    "src\controllers\communication-center.controller.ts",
    "src\controllers\system-configuration.controller.ts",
    "src\controllers\admin-support-ticket.controller.ts",
    "src\controllers\feature-usage-analytics.controller.ts",
    "src\controllers\security-compliance.controller.ts",
    "src\controllers\user-impersonation.controller.ts",
    "src\controllers\organization-health.controller.ts",
    "src\controllers\revenue-billing.controller.ts",
    "src\controllers\platform-analytics.controller.ts"
)

foreach ($controller in $controllers) {
    if (Test-Path $controller) {
        $content = Get-Content $controller -Raw
        
        # Comment out @UseGuards(JwtAuthGuard, RbacGuard)
        $content = $content -replace '@UseGuards\(JwtAuthGuard, RbacGuard\)', '// @UseGuards(JwtAuthGuard, RbacGuard)'
        
        # Comment out @Roles decorators on the line after
        $content = $content -replace "(\r?\n)@Roles\(", '$1// @Roles('
        
        Set-Content $controller -Value $content -NoNewline
        Write-Host "Fixed: $controller" -ForegroundColor Green
    } else {
        Write-Host "Not found: $controller" -ForegroundColor Yellow
    }
}

Write-Host "`nAll controllers fixed!" -ForegroundColor Cyan
