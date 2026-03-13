$BASE_URL = "http://localhost:3003/api/v1"

Write-Host ""
Write-Host ("=" * 120)
Write-Host "COMPREHENSIVE ENDPOINT TEST - ALL GET/POST/PUT ENDPOINTS"
Write-Host ("=" * 120)
Write-Host ""

# Step 1: Authenticate
Write-Host "STEP 1: Authenticating..." -ForegroundColor Cyan
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$randomSuffix = -join ((65..90) + (97..122) | Get-Random -Count 8 | ForEach-Object {[char]$_})
$uniqueEmail = "test${timestamp}${randomSuffix}@test.local"
$uniqueOrgName = "TestOrg_${timestamp}_${randomSuffix}"

$registerPayload = @{
    email = $uniqueEmail
    password = "Test123!@#"
    firstName = "Test"
    lastName = "User"
    organizationName = $uniqueOrgName
    industry = "technology"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Body $registerPayload -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    $token = $registerResponse.data.accessToken
    $userId = $registerResponse.data.user.id
    $orgId = $registerResponse.data.user.organizationId
    
    Write-Host "SUCCESS! Token obtained" -ForegroundColor Green
    Write-Host "User ID: $userId | Org ID: $orgId"
    Write-Host ""
} catch {
    Write-Host "FAILED to authenticate!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# All endpoints to test
$allEndpoints = @(
    # Activity
    @{ Method = "GET"; Path = "/activity"; Module = "Activity"; Description = "Get activities" },
    @{ Method = "GET"; Path = "/activity/tasks"; Module = "Activity"; Description = "Get tasks" },
    @{ Method = "POST"; Path = "/activity"; Module = "Activity"; Description = "Create activity"; Body = @{ type = "note"; title = "Test Activity" } },
    
    # AR/VR
    @{ Method = "GET"; Path = "/arvr/showrooms"; Module = "AR/VR"; Description = "Get showrooms" },
    @{ Method = "GET"; Path = "/arvr/analytics"; Module = "AR/VR"; Description = "Get analytics" },
    @{ Method = "POST"; Path = "/arvr/sessions"; Module = "AR/VR"; Description = "Create session"; Body = @{ name = "Test Session" } },
    
    # Audit
    @{ Method = "GET"; Path = "/audit-logs/stats"; Module = "Audit"; Description = "Get audit stats" },
    
    # Billing
    @{ Method = "GET"; Path = "/billing-transactions/reports/stats"; Module = "Billing"; Description = "Get billing stats" },
    
    # Catalog
    @{ Method = "GET"; Path = "/catalogs"; Module = "Catalog"; Description = "Get catalogs" },
    @{ Method = "POST"; Path = "/catalogs"; Module = "Catalog"; Description = "Create catalog"; Body = @{ name = "Test Catalog" } },
    
    # Contract
    @{ Method = "GET"; Path = "/contracts"; Module = "Contract"; Description = "Get contracts" },
    @{ Method = "POST"; Path = "/contracts"; Module = "Contract"; Description = "Create contract"; Body = @{ name = "Test Contract"; startDate = "2026-01-01"; endDate = "2026-12-31" } },
    
    # CRM AI
    @{ Method = "GET"; Path = "/crm/ai/leads/nurturing-analytics"; Module = "CRM-AI"; Description = "Get lead analytics" },
    
    # CRM Core
    @{ Method = "GET"; Path = "/crm/analytics/overview"; Module = "CRM-Core"; Description = "Get CRM overview" },
    @{ Method = "GET"; Path = "/crm/pipeline"; Module = "CRM-Core"; Description = "Get pipeline" },
    @{ Method = "GET"; Path = "/crm/leads"; Module = "CRM-Core"; Description = "Get leads" },
    
    # Customer
    @{ Method = "GET"; Path = "/crm/customers"; Module = "Customer"; Description = "Get customers" },
    @{ Method = "POST"; Path = "/crm/customers"; Module = "Customer"; Description = "Create customer"; Body = @{ name = "Test Customer"; email = "customer@test.com" } },
    @{ Method = "POST"; Path = "/crm/customers/search"; Module = "Customer"; Description = "Search customers"; Body = @{ name = "Test" } },
    
    # Dashboard
    @{ Method = "GET"; Path = "/dashboards"; Module = "Dashboard"; Description = "Get dashboards" },
    @{ Method = "GET"; Path = "/dashboards/user/metrics"; Module = "Dashboard"; Description = "Get user metrics" },
    @{ Method = "POST"; Path = "/dashboards"; Module = "Dashboard"; Description = "Create dashboard"; Body = @{ name = "Test Dashboard" } },
    
    # Document
    @{ Method = "GET"; Path = "/documents/contracts"; Module = "Document"; Description = "Get contract documents" },
    @{ Method = "POST"; Path = "/documents"; Module = "Document"; Description = "Upload document"; Body = @{ name = "Test Doc" } },
    
    # Email
    @{ Method = "GET"; Path = "/email/campaigns"; Module = "Email"; Description = "Get campaigns" },
    @{ Method = "GET"; Path = "/email/templates"; Module = "Email"; Description = "Get templates" },
    @{ Method = "POST"; Path = "/email/templates"; Module = "Email"; Description = "Create template"; Body = @{ name = "Test Template"; subject = "Test"; body = "Test" } },
    
    # Form
    @{ Method = "GET"; Path = "/forms"; Module = "Form"; Description = "Get forms" },
    @{ Method = "POST"; Path = "/forms"; Module = "Form"; Description = "Create form"; Body = @{ name = "Test Form" } },
    
    # Holographic
    @{ Method = "GET"; Path = "/holographic/sessions"; Module = "Holographic"; Description = "Get sessions" },
    @{ Method = "POST"; Path = "/holographic/sessions"; Module = "Holographic"; Description = "Create session"; Body = @{ name = "Test Session" } },
    
    # Import/Export
    @{ Method = "GET"; Path = "/import-export/import"; Module = "Import"; Description = "Get imports" },
    
    # Inventory
    @{ Method = "GET"; Path = "/inventory/items"; Module = "Inventory"; Description = "Get items" },
    @{ Method = "GET"; Path = "/inventory/analytics"; Module = "Inventory"; Description = "Get analytics" },
    @{ Method = "POST"; Path = "/inventory/items"; Module = "Inventory"; Description = "Create item"; Body = @{ name = "Test Item"; sku = "TEST-001" } },
    
    # Marketing
    @{ Method = "GET"; Path = "/crm/marketing/campaigns"; Module = "Marketing"; Description = "Get campaigns" },
    @{ Method = "GET"; Path = "/crm/marketing/templates"; Module = "Marketing"; Description = "Get templates" },
    @{ Method = "POST"; Path = "/crm/marketing/campaigns"; Module = "Marketing"; Description = "Create campaign"; Body = @{ name = "Test Campaign" } },
    
    # Migration
    @{ Method = "GET"; Path = "/migration/status"; Module = "Migration"; Description = "Get migration status" },
    @{ Method = "POST"; Path = "/migration/import"; Module = "Migration"; Description = "Import data"; Body = @{ type = "customers" } },
    
    # Mobile
    @{ Method = "GET"; Path = "/mobile/devices/statistics"; Module = "Mobile"; Description = "Get device stats" },
    @{ Method = "POST"; Path = "/mobile/notifications/send"; Module = "Mobile"; Description = "Send notification"; Body = @{ message = "Test" } },
    
    # Monitoring
    @{ Method = "GET"; Path = "/monitoring/system"; Module = "Monitoring"; Description = "Get system status" },
    @{ Method = "GET"; Path = "/monitoring/dashboard"; Module = "Monitoring"; Description = "Get dashboard" },
    
    # Notification
    @{ Method = "GET"; Path = "/notifications"; Module = "Notification"; Description = "Get notifications" },
    @{ Method = "POST"; Path = "/notifications/send"; Module = "Notification"; Description = "Send notification"; Body = @{ message = "Test" } },
    
    # Onboarding
    @{ Method = "GET"; Path = "/onboarding/status"; Module = "Onboarding"; Description = "Get status" },
    @{ Method = "GET"; Path = "/onboarding/current"; Module = "Onboarding"; Description = "Get current session" },
    
    # Organization
    @{ Method = "GET"; Path = "/organizations/me/organization"; Module = "Organization"; Description = "Get my org" },
    
    # Performance
    @{ Method = "GET"; Path = "/performance/requests"; Module = "Performance"; Description = "Get requests" },
    
    # Portal
    @{ Method = "GET"; Path = "/portal/config"; Module = "Portal"; Description = "Get config" },
    @{ Method = "PUT"; Path = "/portal/config"; Module = "Portal"; Description = "Update config"; Body = @{ theme = "light" } },
    
    # Pricing
    @{ Method = "GET"; Path = "/price-lists/active"; Module = "Pricing"; Description = "Get active prices" },
    
    # Product
    @{ Method = "GET"; Path = "/products/featured"; Module = "Product"; Description = "Get featured" },
    @{ Method = "GET"; Path = "/products/best-sellers"; Module = "Product"; Description = "Get best sellers" },
    
    # Reporting
    @{ Method = "GET"; Path = "/reporting/reports/templates"; Module = "Reporting"; Description = "Get templates" },
    @{ Method = "POST"; Path = "/reporting/generate"; Module = "Reporting"; Description = "Generate report"; Body = @{ type = "sales" } },
    
    # Sales
    @{ Method = "GET"; Path = "/crm/sales/pipeline"; Module = "Sales"; Description = "Get pipeline" },
    @{ Method = "GET"; Path = "/crm/sales/metrics"; Module = "Sales"; Description = "Get metrics" },
    
    # Sequence
    @{ Method = "GET"; Path = "/sequences/analytics/overall"; Module = "Sequence"; Description = "Get analytics" },
    
    # Subscription
    @{ Method = "GET"; Path = "/subscription-plans"; Module = "Subscription"; Description = "Get plans" },
    @{ Method = "POST"; Path = "/subscription-plans"; Module = "Subscription"; Description = "Create plan"; Body = @{ name = "Test Plan"; price = 99 } },
    
    # Support
    @{ Method = "GET"; Path = "/api/crm/support/statistics"; Module = "Support"; Description = "Get statistics" },
    
    # Telephony
    @{ Method = "GET"; Path = "/calls/statistics"; Module = "Telephony"; Description = "Get stats" },
    @{ Method = "GET"; Path = "/calls/recent"; Module = "Telephony"; Description = "Get recent calls" },
    
    # Territory
    @{ Method = "GET"; Path = "/territories"; Module = "Territory"; Description = "Get territories" },
    @{ Method = "POST"; Path = "/territories"; Module = "Territory"; Description = "Create territory"; Body = @{ name = "Test Territory" } },
    
    # Throttling
    @{ Method = "GET"; Path = "/throttling/status"; Module = "Throttling"; Description = "Get status" },
    
    # Usage
    @{ Method = "GET"; Path = "/usage"; Module = "Usage"; Description = "Get usage" },
    @{ Method = "POST"; Path = "/usage/track"; Module = "Usage"; Description = "Track usage"; Body = @{ event = "test" } }
)

Write-Host "STEP 2: Testing $($allEndpoints.Count) endpoints..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$results = @()
$successCount = 0
$errorsByType = @{}

foreach ($endpoint in $allEndpoints) {
    $url = "$BASE_URL$($endpoint.Path)"
    
    $body = $null
    if ($endpoint.Body) {
        $body = $endpoint.Body | ConvertTo-Json
    }
    
    try {
        if ($body) {
            $response = Invoke-RestMethod -Uri $url -Method $endpoint.Method -Headers $headers -Body $body -UseBasicParsing -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $endpoint.Method -Headers $headers -UseBasicParsing -ErrorAction Stop
        }
        
        Write-Host "  SUCCESS " -ForegroundColor Green -NoNewline
        Write-Host "[$($endpoint.Module)] $($endpoint.Method) $($endpoint.Path)"
        $successCount++
        
        $results += [PSCustomObject]@{
            Module = $endpoint.Module
            Method = $endpoint.Method
            Path = $endpoint.Path
            Description = $endpoint.Description
            Status = 200
            Result = "SUCCESS"
            Error = ""
        }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $errorMsg = $_.Exception.Message
        
        if (-not $errorsByType.ContainsKey($status)) {
            $errorsByType[$status] = @()
        }
        $errorsByType[$status] += $endpoint
        
        $color = if ($status -eq 404) { "Yellow" } elseif ($status -eq 500) { "Red" } else { "DarkYellow" }
        Write-Host "  FAILED  " -ForegroundColor $color -NoNewline
        Write-Host "[$($endpoint.Module)] $($endpoint.Method) $($endpoint.Path) - $status"
        
        $results += [PSCustomObject]@{
            Module = $endpoint.Module
            Method = $endpoint.Method
            Path = $endpoint.Path
            Description = $endpoint.Description
            Status = $status
            Result = "FAILED"
            Error = $errorMsg
        }
    }
    
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host ("=" * 120)
Write-Host "TEST RESULTS SUMMARY"
Write-Host ("=" * 120)
Write-Host ""

Write-Host "Total Endpoints Tested: $($allEndpoints.Count)"
Write-Host "SUCCESS: $successCount" -ForegroundColor Green
Write-Host "FAILED: $($allEndpoints.Count - $successCount)" -ForegroundColor Red
Write-Host ""

$successRate = [math]::Round(($successCount / $allEndpoints.Count) * 100, 1)
Write-Host "SUCCESS RATE: $successRate%" -ForegroundColor $(if ($successRate -gt 70) { "Green" } elseif ($successRate -gt 50) { "Yellow" } else { "Red" })
Write-Host ""

# Error breakdown
Write-Host ("=" * 120)
Write-Host "ERRORS BY TYPE"
Write-Host ("=" * 120)
Write-Host ""

foreach ($statusCode in ($errorsByType.Keys | Sort-Object)) {
    $count = $errorsByType[$statusCode].Count
    $color = if ($statusCode -eq 404) { "Yellow" } elseif ($statusCode -eq 500) { "Red" } else { "DarkYellow" }
    
    Write-Host "$statusCode Errors: $count" -ForegroundColor $color
    foreach ($ep in $errorsByType[$statusCode]) {
        Write-Host "  - $($ep.Method) $($ep.Path) ($($ep.Module))"
    }
    Write-Host ""
}

# Export results
$results | Export-Csv -Path "endpoint-test-results.csv" -NoTypeInformation
Write-Host "Detailed results exported to: endpoint-test-results.csv" -ForegroundColor Cyan
Write-Host ""

# Summary by module
Write-Host ("=" * 120)
Write-Host "RESULTS BY MODULE"
Write-Host ("=" * 120)
Write-Host ""

$moduleStats = $results | Group-Object Module | Sort-Object Name
foreach ($module in $moduleStats) {
    $success = ($module.Group | Where-Object { $_.Status -eq 200 }).Count
    $total = $module.Count
    $pct = [math]::Round(($success / $total) * 100, 0)
    
    $status = if ($pct -eq 100) { "OK" } elseif ($pct -ge 50) { "PARTIAL" } else { "FAILED" }
    $color = if ($pct -eq 100) { "Green" } elseif ($pct -ge 50) { "Yellow" } else { "Red" }
    
    Write-Host "$($module.Name.PadRight(20)) $success/$total ($pct%) [$status]" -ForegroundColor $color
}

Write-Host ""
Write-Host ("=" * 120)
