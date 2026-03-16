$BASE_URL = "http://localhost:3003/api/v1"

Write-Host ""
Write-Host ("=" * 100) -ForegroundColor Cyan
Write-Host "COMPREHENSIVE API RESPONSE CHECKER - CognexiaAI CRM" -ForegroundColor Cyan
Write-Host ("=" * 100) -ForegroundColor Cyan
Write-Host ""

# Test endpoints by module (representative endpoints from each controller)
$testEndpoints = @(
    # Activity
    @{ Method = "GET"; Path = "/activity"; Module = "Activity"; Auth = $true },
    @{ Method = "GET"; Path = "/activity/tasks"; Module = "Activity"; Auth = $true },
    
    # AR/VR Sales
    @{ Method = "GET"; Path = "/arvr/test"; Module = "AR/VR"; Auth = $false },
    @{ Method = "GET"; Path = "/arvr/showrooms"; Module = "AR/VR"; Auth = $true },
    
    # Audit Log
    @{ Method = "GET"; Path = "/audit-logs/stats"; Module = "Audit Log"; Auth = $true },
    
    # Auth
    @{ Method = "POST"; Path = "/auth/login"; Module = "Auth"; Auth = $false },
    @{ Method = "POST"; Path = "/auth/register"; Module = "Auth"; Auth = $false },
    
    # Billing
    @{ Method = "GET"; Path = "/billing-transactions/reports/stats"; Module = "Billing"; Auth = $true },
    
    # Catalog Management
    @{ Method = "GET"; Path = "/catalogs"; Module = "Catalog"; Auth = $true },
    
    # Contract Management
    @{ Method = "GET"; Path = "/contracts"; Module = "Contract"; Auth = $true },
    
    # CRM AI Integration
    @{ Method = "GET"; Path = "/crm/ai/leads/nurturing-analytics"; Module = "CRM AI"; Auth = $true },
    
    # CRM Core
    @{ Method = "GET"; Path = "/crm/analytics/overview"; Module = "CRM Core"; Auth = $true },
    @{ Method = "GET"; Path = "/crm/pipeline"; Module = "CRM Core"; Auth = $true },
    
    # Customer
    @{ Method = "GET"; Path = "/crm/customers"; Module = "Customer"; Auth = $true },
    
    # Dashboard
    @{ Method = "GET"; Path = "/dashboards"; Module = "Dashboard"; Auth = $true },
    @{ Method = "GET"; Path = "/dashboards/user/metrics"; Module = "Dashboard"; Auth = $true },
    
    # Document
    @{ Method = "GET"; Path = "/documents/contracts"; Module = "Document"; Auth = $true },
    
    # Email
    @{ Method = "GET"; Path = "/email/campaigns"; Module = "Email"; Auth = $true },
    @{ Method = "GET"; Path = "/email/templates"; Module = "Email"; Auth = $true },
    
    # Form
    @{ Method = "GET"; Path = "/forms"; Module = "Form"; Auth = $true },
    
    # Holographic
    @{ Method = "GET"; Path = "/holographic/sessions"; Module = "Holographic"; Auth = $true },
    
    # Import/Export
    @{ Method = "GET"; Path = "/import-export/import"; Module = "Import/Export"; Auth = $true },
    
    # Inventory
    @{ Method = "GET"; Path = "/inventory/items"; Module = "Inventory"; Auth = $true },
    @{ Method = "GET"; Path = "/inventory/analytics"; Module = "Inventory"; Auth = $true },
    
    # Marketing
    @{ Method = "GET"; Path = "/crm/marketing/campaigns"; Module = "Marketing"; Auth = $true },
    @{ Method = "GET"; Path = "/crm/marketing/templates"; Module = "Marketing"; Auth = $true },
    
    # Migration
    @{ Method = "GET"; Path = "/migration/status"; Module = "Migration"; Auth = $true },
    
    # Mobile
    @{ Method = "GET"; Path = "/mobile/devices/statistics"; Module = "Mobile"; Auth = $true },
    
    # Monitoring
    @{ Method = "GET"; Path = "/monitoring/system"; Module = "Monitoring"; Auth = $true },
    @{ Method = "GET"; Path = "/monitoring/dashboard"; Module = "Monitoring"; Auth = $true },
    
    # Notification
    @{ Method = "GET"; Path = "/notifications"; Module = "Notification"; Auth = $true },
    
    # Onboarding
    @{ Method = "GET"; Path = "/onboarding/status"; Module = "Onboarding"; Auth = $true },
    @{ Method = "GET"; Path = "/onboarding/current"; Module = "Onboarding"; Auth = $true },
    
    # Organization
    @{ Method = "GET"; Path = "/organizations/me/organization"; Module = "Organization"; Auth = $true },
    
    # Performance
    @{ Method = "GET"; Path = "/performance/requests"; Module = "Performance"; Auth = $true },
    
    # Portal
    @{ Method = "GET"; Path = "/portal/config"; Module = "Portal"; Auth = $true },
    
    # Pricing
    @{ Method = "GET"; Path = "/price-lists/active"; Module = "Pricing"; Auth = $true },
    
    # Product
    @{ Method = "GET"; Path = "/products/featured"; Module = "Product"; Auth = $true },
    @{ Method = "GET"; Path = "/products/best-sellers"; Module = "Product"; Auth = $true },
    
    # Quantum Intelligence
    @{ Method = "GET"; Path = "/quantum/test"; Module = "Quantum"; Auth = $false },
    
    # Real-time Analytics
    @{ Method = "GET"; Path = "/real-time-analytics/dashboard"; Module = "Real-time Analytics"; Auth = $true },
    
    # Reporting
    @{ Method = "GET"; Path = "/reporting/reports/templates"; Module = "Reporting"; Auth = $true },
    
    # Sales
    @{ Method = "GET"; Path = "/crm/sales/pipeline"; Module = "Sales"; Auth = $true },
    @{ Method = "GET"; Path = "/crm/sales/metrics"; Module = "Sales"; Auth = $true },
    
    # Sequence
    @{ Method = "GET"; Path = "/sequences/analytics/overall"; Module = "Sequence"; Auth = $true },
    
    # Stripe Payment
    @{ Method = "GET"; Path = "/stripe"; Module = "Stripe"; Auth = $true },
    
    # Subscription Plans
    @{ Method = "GET"; Path = "/subscription-plans"; Module = "Subscription"; Auth = $true },
    
    # Support
    @{ Method = "GET"; Path = "/api/crm/support/statistics"; Module = "Support"; Auth = $true },
    
    # Telephony
    @{ Method = "GET"; Path = "/calls/statistics"; Module = "Telephony"; Auth = $true },
    @{ Method = "GET"; Path = "/calls/recent"; Module = "Telephony"; Auth = $true },
    
    # Territory
    @{ Method = "GET"; Path = "/territories"; Module = "Territory"; Auth = $true },
    
    # Throttling
    @{ Method = "GET"; Path = "/throttling/status"; Module = "Throttling"; Auth = $true },
    
    # Usage Tracking
    @{ Method = "GET"; Path = "/usage"; Module = "Usage"; Auth = $true }
)

Write-Host "Testing $($testEndpoints.Count) representative API endpoints across all modules..." -ForegroundColor Yellow
Write-Host ""

# Register a test user if needed
$token = $null
Write-Host "Step 1: Getting authentication token..." -ForegroundColor Yellow

$rand = Get-Random -Minimum 100000 -Maximum 999999
$ts = Get-Date -Format "yyyyMMddHHmmssffff"
$registerPayload = @{
    email = "apicheck_${ts}_${rand}@example.com"
    password = "Test123!@#"
    firstName = "API"
    lastName = "Checker"
    organizationName = "API-CHECK-ORG-${ts}-${rand}"
    industry = "technology"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Body $registerPayload -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    $token = $registerResponse.data.accessToken
    Write-Host "✓ Authentication successful!" -ForegroundColor Green
} catch {
    Write-Host "⚠ Registration failed (org may exist). Proceeding with public endpoints only..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Testing endpoints..." -ForegroundColor Yellow
Write-Host ""

$results = @()
$moduleStats = @{}

foreach ($endpoint in $testEndpoints) {
    $url = "$BASE_URL$($endpoint.Path)"
    $method = $endpoint.Method
    $module = $endpoint.Module
    
    # Initialize module stats
    if (-not $moduleStats.ContainsKey($module)) {
        $moduleStats[$module] = @{ Total = 0; Success = 0; AuthRequired = 0; Failed = 0 }
    }
    $moduleStats[$module].Total++
    
    $headers = @{ "Content-Type" = "application/json" }
    if ($endpoint.Auth -and $token) {
        $headers["Authorization"] = "Bearer $token"
    }
    
    $body = $null
    if ($method -eq "POST") {
        $body = '{"test":"data"}'
    }
    
    try {
        if ($body) {
            $response = Invoke-RestMethod -Uri $url -Method $method -Headers $headers -Body $body -UseBasicParsing -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $method -Headers $headers -UseBasicParsing -ErrorAction Stop
        }
        
        $status = 200
        $statusText = "SUCCESS"
        $moduleStats[$module].Success++
        $color = "Green"
        $icon = "✓"
        
        # Check response structure
        $hasData = $response.PSObject.Properties.Name -contains "data"
        $hasSuccess = $response.PSObject.Properties.Name -contains "success"
        $responseType = if ($hasData -and $hasSuccess) { "Standard" } elseif ($hasData) { "Data Only" } else { "Raw" }
        
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        
        if ($status -eq 401) {
            $statusText = "AUTH REQUIRED"
            $moduleStats[$module].AuthRequired++
            $color = "Yellow"
            $icon = "⚠"
        } elseif ($status -eq 404) {
            $statusText = "NOT FOUND"
            $moduleStats[$module].Failed++
            $color = "Red"
            $icon = "✗"
        } else {
            $statusText = "ERROR $status"
            $moduleStats[$module].Failed++
            $color = "Red"
            $icon = "✗"
        }
        
        $responseType = "N/A"
        $hasData = $false
        $hasSuccess = $false
    }
    
    Write-Host "$icon [$module] $method $($endpoint.Path) - $statusText" -ForegroundColor $color
    
    $results += [PSCustomObject]@{
        Module = $module
        Method = $method
        Path = $endpoint.Path
        Status = $status
        StatusText = $statusText
        ResponseType = $responseType
        HasDataField = $hasData
        HasSuccessField = $hasSuccess
    }
    
    Start-Sleep -Milliseconds 100
}

# Summary
Write-Host ""
Write-Host ("=" * 100) -ForegroundColor Cyan
Write-Host "SUMMARY BY MODULE" -ForegroundColor Cyan
Write-Host ("=" * 100) -ForegroundColor Cyan
Write-Host ""

$totalEndpoints = 0
$totalSuccess = 0
$totalAuthRequired = 0
$totalFailed = 0

foreach ($moduleName in ($moduleStats.Keys | Sort-Object)) {
    $stats = $moduleStats[$moduleName]
    $totalEndpoints += $stats.Total
    $totalSuccess += $stats.Success
    $totalAuthRequired += $stats.AuthRequired
    $totalFailed += $stats.Failed
    
    Write-Host ("[{0}]" -f $moduleName.PadRight(25)) -NoNewline
    Write-Host (" Total: {0:D2}" -f $stats.Total) -NoNewline
    Write-Host (" | ✓ Success: {0:D2}" -f $stats.Success) -ForegroundColor Green -NoNewline
    Write-Host (" | ⚠ Auth: {0:D2}" -f $stats.AuthRequired) -ForegroundColor Yellow -NoNewline
    Write-Host (" | ✗ Failed: {0:D2}" -f $stats.Failed) -ForegroundColor Red
}

Write-Host ""
Write-Host ("=" * 100) -ForegroundColor Cyan
Write-Host "OVERALL STATISTICS" -ForegroundColor Cyan
Write-Host ("=" * 100) -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Endpoints Tested: $totalEndpoints"
Write-Host "✓ Successful (200): $totalSuccess" -ForegroundColor Green
Write-Host "⚠ Auth Required (401): $totalAuthRequired" -ForegroundColor Yellow
Write-Host "✗ Failed (404/500): $totalFailed" -ForegroundColor Red
Write-Host ""

$successRate = [math]::Round(($totalSuccess / $totalEndpoints) * 100, 1)
$workingRate = [math]::Round((($totalSuccess + $totalAuthRequired) / $totalEndpoints) * 100, 1)

Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -gt 50) { "Green" } else { "Yellow" })
Write-Host "Working Rate (Success + Auth): $workingRate%" -ForegroundColor $(if ($workingRate -gt 80) { "Green" } else { "Yellow" })
Write-Host ""

# Response structure analysis
Write-Host ("=" * 100) -ForegroundColor Cyan
Write-Host "API RESPONSE STRUCTURE ANALYSIS" -ForegroundColor Cyan
Write-Host ("=" * 100) -ForegroundColor Cyan
Write-Host ""

$standardFormat = ($results | Where-Object { $_.ResponseType -eq "Standard" }).Count
$dataOnly = ($results | Where-Object { $_.ResponseType -eq "Data Only" }).Count
$raw = ($results | Where-Object { $_.ResponseType -eq "Raw" }).Count

Write-Host "Response Format Distribution:"
Write-Host "  Standard Format (success + data): $standardFormat"
Write-Host "  Data Only: $dataOnly"
Write-Host "  Raw/Other: $raw"
Write-Host ""

Write-Host ("=" * 100) -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ API Response Check Complete!" -ForegroundColor Green
Write-Host ""

# Export results
$results | Export-Csv -Path "api-check-results.csv" -NoTypeInformation
Write-Host "Detailed results exported to: api-check-results.csv" -ForegroundColor Cyan
