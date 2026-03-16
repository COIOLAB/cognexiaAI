$BASE_URL = "http://localhost:3003/api/v1"

Write-Host ""
Write-Host ("=" * 100)
Write-Host "API TEST WITH VALID AUTHENTICATION"
Write-Host ("=" * 100)
Write-Host ""

# Create truly unique organization name
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$randomSuffix = -join ((65..90) + (97..122) | Get-Random -Count 8 | ForEach-Object {[char]$_})
$uniqueEmail = "apites${timestamp}${randomSuffix}@test.local"
$uniqueOrgName = "APITestOrg_${timestamp}_${randomSuffix}"

$registerPayload = @{
    email = $uniqueEmail
    password = "Test123!@#"
    firstName = "API"
    lastName = "Tester"
    organizationName = $uniqueOrgName
    industry = "technology"
} | ConvertTo-Json

Write-Host "Step 1: Registering new user..."
Write-Host "  Email: $uniqueEmail"
Write-Host "  Org: $uniqueOrgName"
Write-Host ""

try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Body $registerPayload -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    $token = $registerResponse.data.accessToken
    $userId = $registerResponse.data.user.id
    $orgId = $registerResponse.data.user.organizationId
    
    Write-Host "SUCCESS! Authentication token obtained" -ForegroundColor Green
    Write-Host "  User ID: $userId"
    Write-Host "  Org ID: $orgId"
    Write-Host ""
    
} catch {
    Write-Host "FAILED to register:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Attempting to use existing credentials..." -ForegroundColor Yellow
    
    # Try login with hardcoded test account if exists
    try {
        $loginPayload = @{
            email = "admin@test.com"
            password = "Test123!@#"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginPayload -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
        $token = $loginResponse.data.accessToken
        Write-Host "SUCCESS! Logged in with existing account" -ForegroundColor Green
    } catch {
        Write-Host "FAILED to login as well:" -ForegroundColor Red
        Write-Host $_.Exception.Message
        exit 1
    }
}

# Test endpoints WITH authentication
$testEndpoints = @(
    @{ Method = "GET"; Path = "/activity"; Module = "Activity" },
    @{ Method = "GET"; Path = "/crm/customers"; Module = "Customer" },
    @{ Method = "GET"; Path = "/crm/sales/pipeline"; Module = "Sales" },
    @{ Method = "GET"; Path = "/inventory/items"; Module = "Inventory" },
    @{ Method = "GET"; Path = "/email/campaigns"; Module = "Email" },
    @{ Method = "GET"; Path = "/notifications"; Module = "Notifications" },
    @{ Method = "GET"; Path = "/dashboards"; Module = "Dashboard" },
    @{ Method = "GET"; Path = "/onboarding/status"; Module = "Onboarding" },
    @{ Method = "GET"; Path = "/monitoring/system"; Module = "Monitoring" },
    @{ Method = "GET"; Path = "/contracts"; Module = "Contracts" }
)

Write-Host "Step 2: Testing authenticated endpoints..."
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$successCount = 0
$authErrorCount = 0
$otherErrorCount = 0

foreach ($endpoint in $testEndpoints) {
    $url = "$BASE_URL$($endpoint.Path)"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method $endpoint.Method -Headers $headers -UseBasicParsing -ErrorAction Stop
        Write-Host "SUCCESS [$($endpoint.Module)] $($endpoint.Method) $($endpoint.Path)" -ForegroundColor Green
        $successCount++
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        
        if ($status -eq 401 -or $status -eq 403) {
            Write-Host "AUTH_ERROR [$($endpoint.Module)] $($endpoint.Method) $($endpoint.Path) - $status" -ForegroundColor Yellow
            $authErrorCount++
        } else {
            Write-Host "FAILED [$($endpoint.Module)] $($endpoint.Method) $($endpoint.Path) - $status" -ForegroundColor Red
            $otherErrorCount++
        }
    }
}

Write-Host ""
Write-Host ("=" * 100)
Write-Host "AUTHENTICATED TEST RESULTS"
Write-Host ("=" * 100)
Write-Host "Total Tested: $($testEndpoints.Count)"
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Auth Errors: $authErrorCount" -ForegroundColor Yellow
Write-Host "Other Errors: $otherErrorCount" -ForegroundColor Red
Write-Host ""

$successRate = [math]::Round(($successCount / $testEndpoints.Count) * 100, 1)
Write-Host "Success Rate: $successRate%"

if ($successRate -gt 50) {
    Write-Host "AUTH SYSTEM IS WORKING!" -ForegroundColor Green
} else {
    Write-Host "Auth system may need more investigation" -ForegroundColor Yellow
}
