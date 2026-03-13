$BASE_URL = "http://localhost:3003/api/v1"

Write-Host ""
Write-Host ("=" * 100)
Write-Host "COMPREHENSIVE API RESPONSE CHECKER - CognexiaAI CRM"
Write-Host ("=" * 100)
Write-Host ""

# Test endpoints by module
$testEndpoints = @(
    @{ Method = "GET"; Path = "/activity"; Module = "Activity"; Auth = $true },
    @{ Method = "GET"; Path = "/arvr/test"; Module = "AR/VR"; Auth = $false },
    @{ Method = "GET"; Path = "/arvr/showrooms"; Module = "AR/VR"; Auth = $true },
    @{ Method = "GET"; Path = "/audit-logs/stats"; Module = "Audit"; Auth = $true },
    @{ Method = "POST"; Path = "/auth/login"; Module = "Auth"; Auth = $false },
    @{ Method = "GET"; Path = "/billing-transactions/reports/stats"; Module = "Billing"; Auth = $true },
    @{ Method = "GET"; Path = "/catalogs"; Module = "Catalog"; Auth = $true },
    @{ Method = "GET"; Path = "/contracts"; Module = "Contract"; Auth = $true },
    @{ Method = "GET"; Path = "/crm/ai/leads/nurturing-analytics"; Module = "CRM-AI"; Auth = $true },
    @{ Method = "GET"; Path = "/crm/analytics/overview"; Module = "CRM-Core"; Auth = $true },
    @{ Method = "GET"; Path = "/crm/customers"; Module = "Customer"; Auth = $true },
    @{ Method = "GET"; Path = "/dashboards"; Module = "Dashboard"; Auth = $true },
    @{ Method = "GET"; Path = "/documents/contracts"; Module = "Document"; Auth = $true },
    @{ Method = "GET"; Path = "/email/campaigns"; Module = "Email"; Auth = $true },
    @{ Method = "GET"; Path = "/forms"; Module = "Form"; Auth = $true },
    @{ Method = "GET"; Path = "/holographic/sessions"; Module = "Holographic"; Auth = $true },
    @{ Method = "GET"; Path = "/import-export/import"; Module = "Import"; Auth = $true },
    @{ Method = "GET"; Path = "/inventory/items"; Module = "Inventory"; Auth = $true },
    @{ Method = "GET"; Path = "/crm/marketing/campaigns"; Module = "Marketing"; Auth = $true },
    @{ Method = "GET"; Path = "/migration/status"; Module = "Migration"; Auth = $true },
    @{ Method = "GET"; Path = "/mobile/devices/statistics"; Module = "Mobile"; Auth = $true },
    @{ Method = "GET"; Path = "/monitoring/system"; Module = "Monitoring"; Auth = $true },
    @{ Method = "GET"; Path = "/notifications"; Module = "Notification"; Auth = $true },
    @{ Method = "GET"; Path = "/onboarding/status"; Module = "Onboarding"; Auth = $true },
    @{ Method = "GET"; Path = "/organizations/me/organization"; Module = "Organization"; Auth = $true },
    @{ Method = "GET"; Path = "/performance/requests"; Module = "Performance"; Auth = $true },
    @{ Method = "GET"; Path = "/portal/config"; Module = "Portal"; Auth = $true },
    @{ Method = "GET"; Path = "/price-lists/active"; Module = "Pricing"; Auth = $true },
    @{ Method = "GET"; Path = "/products/featured"; Module = "Product"; Auth = $true },
    @{ Method = "GET"; Path = "/quantum/test"; Module = "Quantum"; Auth = $false },
    @{ Method = "GET"; Path = "/real-time-analytics/dashboard"; Module = "Analytics"; Auth = $true },
    @{ Method = "GET"; Path = "/reporting/reports/templates"; Module = "Reporting"; Auth = $true },
    @{ Method = "GET"; Path = "/crm/sales/pipeline"; Module = "Sales"; Auth = $true },
    @{ Method = "GET"; Path = "/sequences/analytics/overall"; Module = "Sequence"; Auth = $true },
    @{ Method = "GET"; Path = "/subscription-plans"; Module = "Subscription"; Auth = $true },
    @{ Method = "GET"; Path = "/api/crm/support/statistics"; Module = "Support"; Auth = $true },
    @{ Method = "GET"; Path = "/calls/statistics"; Module = "Telephony"; Auth = $true },
    @{ Method = "GET"; Path = "/territories"; Module = "Territory"; Auth = $true },
    @{ Method = "GET"; Path = "/throttling/status"; Module = "Throttling"; Auth = $true },
    @{ Method = "GET"; Path = "/usage"; Module = "Usage"; Auth = $true }
)

Write-Host "Testing $($testEndpoints.Count) representative API endpoints across all modules..."
Write-Host ""

# Try to get auth token
$token = $null
Write-Host "Step 1: Getting authentication token..."

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
    Write-Host "Authentication successful!" -ForegroundColor Green
} catch {
    Write-Host "Registration failed. Proceeding with public endpoints only..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Testing endpoints..."
Write-Host ""

$results = @()
$moduleStats = @{}

foreach ($endpoint in $testEndpoints) {
    $url = "$BASE_URL$($endpoint.Path)"
    $method = $endpoint.Method
    $module = $endpoint.Module
    
    if (-not $moduleStats.ContainsKey($module)) {
        $moduleStats[$module] = @{ Total = 0; Success = 0; Auth = 0; Failed = 0 }
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
        
        $hasData = $response.PSObject.Properties.Name -contains "data"
        $hasSuccess = $response.PSObject.Properties.Name -contains "success"
        $responseType = if ($hasData -and $hasSuccess) { "Standard" } elseif ($hasData) { "Data" } else { "Raw" }
        
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        
        if ($status -eq 401) {
            $statusText = "AUTH_REQUIRED"
            $moduleStats[$module].Auth++
            $color = "Yellow"
        } elseif ($status -eq 404) {
            $statusText = "NOT_FOUND"
            $moduleStats[$module].Failed++
            $color = "Red"
        } else {
            $statusText = "ERROR_$status"
            $moduleStats[$module].Failed++
            $color = "Red"
        }
        
        $responseType = "N/A"
        $hasData = $false
        $hasSuccess = $false
    }
    
    Write-Host "[$module] $method $($endpoint.Path) - $statusText" -ForegroundColor $color
    
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
Write-Host ("=" * 100)
Write-Host "SUMMARY BY MODULE"
Write-Host ("=" * 100)
Write-Host ""

$totalEndpoints = 0
$totalSuccess = 0
$totalAuth = 0
$totalFailed = 0

foreach ($moduleName in ($moduleStats.Keys | Sort-Object)) {
    $stats = $moduleStats[$moduleName]
    $totalEndpoints += $stats.Total
    $totalSuccess += $stats.Success
    $totalAuth += $stats.Auth
    $totalFailed += $stats.Failed
    
    $line = "[{0}] Total: {1:D2} | Success: {2:D2} | Auth: {3:D2} | Failed: {4:D2}" -f $moduleName.PadRight(20), $stats.Total, $stats.Success, $stats.Auth, $stats.Failed
    Write-Host $line
}

Write-Host ""
Write-Host ("=" * 100)
Write-Host "OVERALL STATISTICS"
Write-Host ("=" * 100)
Write-Host ""
Write-Host "Total Endpoints Tested: $totalEndpoints"
Write-Host "Successful (200): $totalSuccess" -ForegroundColor Green
Write-Host "Auth Required (401): $totalAuth" -ForegroundColor Yellow
Write-Host "Failed (404/500): $totalFailed" -ForegroundColor Red
Write-Host ""

$successRate = [math]::Round(($totalSuccess / $totalEndpoints) * 100, 1)
$workingRate = [math]::Round((($totalSuccess + $totalAuth) / $totalEndpoints) * 100, 1)

Write-Host "Success Rate: $successRate%"
Write-Host "Working Rate (Success + Auth): $workingRate%"
Write-Host ""

# Response structure analysis
Write-Host ("=" * 100)
Write-Host "API RESPONSE STRUCTURE ANALYSIS"
Write-Host ("=" * 100)
Write-Host ""

$standardFormat = ($results | Where-Object { $_.ResponseType -eq "Standard" }).Count
$dataOnly = ($results | Where-Object { $_.ResponseType -eq "Data" }).Count
$raw = ($results | Where-Object { $_.ResponseType -eq "Raw" }).Count

Write-Host "Response Format Distribution:"
Write-Host "  Standard Format (success + data): $standardFormat"
Write-Host "  Data Only: $dataOnly"
Write-Host "  Raw/Other: $raw"
Write-Host ""

Write-Host ("=" * 100)
Write-Host ""
Write-Host "API Response Check Complete!"
Write-Host ""

# Export results
$results | Export-Csv -Path "api-check-results.csv" -NoTypeInformation
Write-Host "Detailed results exported to: api-check-results.csv"
