$BASE_URL = "http://localhost:3032"

Write-Host ""
Write-Host ("=" * 130)
Write-Host "TESTING ALL 178 DOCUMENTED ENDPOINTS - COMPREHENSIVE TEST"
Write-Host ("=" * 130)
Write-Host ""

# Parse markdown file to extract all endpoints
function Parse-EndpointsFromMarkdown {
    param([string]$FilePath)
    
    $endpoints = @()
    $content = Get-Content $FilePath -Raw
    
    # Match table rows with endpoints
    $pattern = '\|\s*(GET|POST|PUT|DELETE|PATCH)\s*\|\s*`([^`]+)`'
    $matches = [regex]::Matches($content, $pattern)
    
    foreach ($match in $matches) {
        $method = $match.Groups[1].Value.Trim()
        $path = $match.Groups[2].Value.Trim()
        
        # Clean up path - remove /api/v1 if present
        $path = $path -replace '^/api/v1', ''
        if (-not $path.StartsWith('/')) {
            $path = '/' + $path
        }
        
        $endpoints += @{
            Method = $method
            Path = $path
        }
    }
    
    return $endpoints
}

# Step 1: Parse endpoints
Write-Host "STEP 1: Parsing endpoints from documentation..." -ForegroundColor Cyan
$mdFile = "ALL_API_ENDPOINTS_COMPLETE.md"

if (-not (Test-Path $mdFile)) {
    Write-Host "ERROR: $mdFile not found!" -ForegroundColor Red
    exit 1
}

$allEndpoints = Parse-EndpointsFromMarkdown $mdFile
Write-Host "Found $($allEndpoints.Count) endpoints in documentation"
Write-Host ""

# Step 2: Authenticate
Write-Host "STEP 2: Authenticating..." -ForegroundColor Cyan

# Check if test credentials file exists
$credentialsFile = "test-credentials.json"
if (Test-Path $credentialsFile) {
    Write-Host "✅ Using test credentials from $credentialsFile" -ForegroundColor Green
    $credentials = Get-Content $credentialsFile | ConvertFrom-Json
    $token = $credentials.token
    $userId = $credentials.userId
    $orgId = $credentials.organizationId
    
    Write-Host "SUCCESS! Token loaded" -ForegroundColor Green
    Write-Host "User ID: $userId | Org ID: $orgId"
    Write-Host ""
} else {
    Write-Host "⚠️  No test credentials found. Attempting registration..." -ForegroundColor Yellow
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
        
        Write-Host "SUCCESS! Token obtained via registration" -ForegroundColor Green
        Write-Host "User ID: $userId | Org ID: $orgId"
        Write-Host ""
    } catch {
        Write-Host "FAILED to authenticate!" -ForegroundColor Red
        Write-Host "💡 TIP: Run 'ts-node create-test-user-org.ts' to create test credentials" -ForegroundColor Yellow
        Write-Host $_.Exception.Message
        exit 1
    }
}

# Step 3: Test all endpoints
Write-Host "STEP 3: Testing all $($allEndpoints.Count) endpoints..." -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$results = @()
$successCount = 0
$error404Count = 0
$error500Count = 0
$otherErrorCount = 0

$counter = 0
foreach ($endpoint in $allEndpoints) {
    $counter++
    
    # Replace path parameters with test IDs
    $testPath = $endpoint.Path
    $testPath = $testPath -replace ':id\b', '00000000-0000-0000-0000-000000000001'
    $testPath = $testPath -replace ':customerId\b', '00000000-0000-0000-0000-000000000002'
    $testPath = $testPath -replace ':organizationId\b', $orgId
    $testPath = $testPath -replace ':contractId\b', '00000000-0000-0000-0000-000000000003'
    $testPath = $testPath -replace ':sessionId\b', '00000000-0000-0000-0000-000000000004'
    $testPath = $testPath -replace ':catalogId\b', '00000000-0000-0000-0000-000000000005'
    $testPath = $testPath -replace ':itemId\b', '00000000-0000-0000-0000-000000000006'
    $testPath = $testPath -replace ':campaignId\b', '00000000-0000-0000-0000-000000000007'
    $testPath = $testPath -replace ':opportunityId\b', '00000000-0000-0000-0000-000000000008'
    $testPath = $testPath -replace ':conversationId\b', '00000000-0000-0000-0000-000000000009'
    $testPath = $testPath -replace ':dashboardId\b', '0000000-0000-0000-0000-00000000000a'
    $testPath = $testPath -replace ':showroomId\b', '00000000-0000-0000-0000-00000000000b'
    
    $url = "$BASE_URL$testPath"
    $method = $endpoint.Method
    
    # Create minimal body for POST/PUT/PATCH
    $body = $null
    if ($method -in @('POST', 'PUT', 'PATCH')) {
        $body = '{"name":"Test","description":"Test"}'
    }
    
    try {
        if ($body) {
            $response = Invoke-RestMethod -Uri $url -Method $method -Headers $headers -Body $body -UseBasicParsing -ErrorAction Stop -TimeoutSec 10
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $method -Headers $headers -UseBasicParsing -ErrorAction Stop -TimeoutSec 10
        }
        
        $successCount++
        Write-Host "[$counter/$($allEndpoints.Count)] SUCCESS " -ForegroundColor Green -NoNewline
        Write-Host "$method $($endpoint.Path)"
        
        $results += [PSCustomObject]@{
            Number = $counter
            Method = $method
            Path = $endpoint.Path
            Status = 200
            Result = "SUCCESS"
        }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if (-not $status) { $status = 0 }
        
        if ($status -eq 404) {
            $error404Count++
            $color = "Yellow"
            $result = "NOT_FOUND"
        } elseif ($status -eq 500) {
            $error500Count++
            $color = "Red"
            $result = "SERVER_ERROR"
        } else {
            $otherErrorCount++
            $color = "DarkYellow"
            $result = "ERROR_$status"
        }
        
        Write-Host "[$counter/$($allEndpoints.Count)] FAILED  " -ForegroundColor $color -NoNewline
        Write-Host "$method $($endpoint.Path) - $status"
        
        $results += [PSCustomObject]@{
            Number = $counter
            Method = $method
            Path = $endpoint.Path
            Status = $status
            Result = $result
        }
    }
    
    # Small delay to not overwhelm server
    Start-Sleep -Milliseconds 50
}

# Results Summary
Write-Host ""
Write-Host ("=" * 130)
Write-Host "FINAL TEST RESULTS - ALL 178 ENDPOINTS"
Write-Host ("=" * 130)
Write-Host ""

Write-Host "Total Endpoints Tested: $($allEndpoints.Count)"
Write-Host "SUCCESS (200): $successCount" -ForegroundColor Green
Write-Host "NOT FOUND (404): $error404Count" -ForegroundColor Yellow
Write-Host "SERVER ERROR (500): $error500Count" -ForegroundColor Red
Write-Host "OTHER ERRORS: $otherErrorCount" -ForegroundColor DarkYellow
Write-Host ""

$successRate = [math]::Round(($successCount / $allEndpoints.Count) * 100, 1)
$workingRate = [math]::Round((($successCount) / $allEndpoints.Count) * 100, 1)

Write-Host "SUCCESS RATE: $successRate%" -ForegroundColor $(if ($successRate -gt 70) { "Green" } elseif ($successRate -gt 50) { "Yellow" } else { "Red" })
Write-Host ""

# Group by status
Write-Host ("=" * 130)
Write-Host "ERRORS BY STATUS CODE"
Write-Host ("=" * 130)
Write-Host ""

$errorGroups = $results | Where-Object { $_.Status -ne 200 } | Group-Object Status | Sort-Object Name

foreach ($group in $errorGroups) {
    $color = if ($group.Name -eq "404") { "Yellow" } elseif ($group.Name -eq "500") { "Red" } else { "DarkYellow" }
    Write-Host "$($group.Name) Errors: $($group.Count)" -ForegroundColor $color
    
    foreach ($item in $group.Group | Select-Object -First 10) {
        Write-Host "  - $($item.Method) $($item.Path)"
    }
    
    if ($group.Count -gt 10) {
        Write-Host "  ... and $($group.Count - 10) more"
    }
    Write-Host ""
}

# Export results
$results | Export-Csv -Path "all-178-endpoints-results.csv" -NoTypeInformation
Write-Host "Detailed results exported to: all-178-endpoints-results.csv" -ForegroundColor Cyan
Write-Host ""

# Priority recommendations
Write-Host ("=" * 130)
Write-Host "RECOMMENDATIONS"
Write-Host ("=" * 130)
Write-Host ""

if ($error500Count -gt 0) {
    Write-Host "PRIORITY 1: Fix $error500Count endpoints with 500 errors (add null checks/error handling)" -ForegroundColor Red
}

if ($error404Count -gt 0) {
    Write-Host "PRIORITY 2: Fix $error404Count endpoints with 404 errors (add missing routes)" -ForegroundColor Yellow
}

if ($successRate -eq 100) {
    Write-Host "ALL ENDPOINTS WORKING! System is production-ready!" -ForegroundColor Green
} elseif ($successRate -gt 80) {
    Write-Host "System is mostly working. Fix remaining issues for production." -ForegroundColor Yellow
} else {
    Write-Host "Significant work needed. Focus on CRITICAL modules first." -ForegroundColor Red
}

Write-Host ""
Write-Host ("=" * 130)
