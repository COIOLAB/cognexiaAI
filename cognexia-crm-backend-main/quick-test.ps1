$BASE_URL = "http://localhost:3003/api/v1"
$ErrorActionPreference = "SilentlyContinue"

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "QUICK API ENDPOINT TEST" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

# Register and authenticate
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$registerPayload = @{
    email = "quicktest_$timestamp@example.com"
    password = "Test123!@#"
    firstName = "Test"
    lastName = "User"
    organizationName = "Quick Test Org $timestamp"
    industry = "technology"
} | ConvertTo-Json

Write-Host "Authenticating..." -ForegroundColor Yellow
try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Body $registerPayload -ContentType "application/json" -UseBasicParsing
    $token = $registerResponse.data.accessToken
    Write-Host "✓ Authentication successful!" -ForegroundColor Green
} catch {
    Write-Host "✗ Authentication failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Read endpoints from file
$endpoints = Get-Content "test-endpoints.txt"
Write-Host "Testing $($endpoints.Count) endpoints..." -ForegroundColor Yellow
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$passCount = 0
$failCount = 0
$results = @()

foreach ($line in $endpoints) {
    $parts = $line.Split(" ")
    $method = $parts[0]
    $path = $parts[1]
    
    # Replace path params
    $testPath = $path `
        -replace ':id', '00000000-0000-0000-0000-000000000001' `
        -replace ':userId', '00000000-0000-0000-0000-000000000002' `
        -replace ':customerId', '00000000-0000-0000-0000-000000000003' `
        -replace ':contractId', '00000000-0000-0000-0000-000000000004' `
        -replace ':sessionId', '00000000-0000-0000-0000-000000000005' `
        -replace ':catalogId', '00000000-0000-0000-0000-000000000006' `
        -replace ':itemId', '00000000-0000-0000-0000-000000000007' `
        -replace ':campaignId', '00000000-0000-0000-0000-000000000008'
    
    $url = "$BASE_URL$($testPath -replace '/api/v1', '')"
    
    # Simple body for POST/PUT
    $body = $null
    if ($method -eq "POST" -or $method -eq "PUT") {
        $body = '{"name":"Test","description":"Test"}' | ConvertTo-Json
    }
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method $method -Headers $headers -Body $body -UseBasicParsing -ErrorAction Stop
        $status = 200
        $success = $true
        $passCount++
        Write-Host "✓ $method $path - 200" -ForegroundColor Green
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $success = $false
        $failCount++
        Write-Host "✗ $method $path - $status" -ForegroundColor Red
    }
    
    $results += [PSCustomObject]@{
        Method = $method
        Path = $path
        Status = $status
        Success = $success
    }
    
    Start-Sleep -Milliseconds 50
}

# Summary
Write-Host ""
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "Total Endpoints: $($endpoints.Count)"
$passPercent = [math]::Round($passCount / $endpoints.Count * 100, 1)
$failPercent = [math]::Round($failCount / $endpoints.Count * 100, 1)
Write-Host "Passed: $passCount ($passPercent%)" -ForegroundColor Green
Write-Host "Failed: $failCount ($failPercent%)" -ForegroundColor Red
Write-Host ""

# Status code breakdown
$statusGroups = $results | Group-Object Status | Sort-Object Name
Write-Host "STATUS CODE BREAKDOWN:" -ForegroundColor Yellow
foreach ($group in $statusGroups) {
    Write-Host "  $($group.Name): $($group.Count) endpoints"
}

Write-Host ""
Write-Host "=" * 80 -ForegroundColor Cyan
