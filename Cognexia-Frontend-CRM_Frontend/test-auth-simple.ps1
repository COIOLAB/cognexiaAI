# Simple Authentication Test
$baseUrl = "http://localhost:3003/api/v1"

Write-Host "`n=== AUTHENTICATION DIAGNOSTICS ===`n" -ForegroundColor Yellow

# Test 1: Check server is running
Write-Host "[1] Testing server connectivity..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/../" -Method Get -ErrorAction Stop
    Write-Host "    [OK] Server is running!" -ForegroundColor Green
} catch {
    Write-Host "    [X] Server not responding: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 2: Register with detailed error
Write-Host "`n[2] Testing registration..." -ForegroundColor Cyan
$registerBody = @{
    email = "testuser.$(Get-Random)@example.com"
    password = "StrongPass123!"
    name = "Test User"
    organizationName = "Test Org"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "    [OK] Registration successful!" -ForegroundColor Green
    Write-Host "    Token: $($response.accessToken.Substring(0, 50))..." -ForegroundColor Gray
    
    # Try using the token
    Write-Host "`n[3] Testing token with /auth/me..." -ForegroundColor Cyan
    $headers = @{
        "Authorization" = "Bearer $($response.accessToken)"
        "Content-Type" = "application/json"
    }
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "    [OK] Token is valid!" -ForegroundColor Green
    Write-Host "    User: $($meResponse.email)" -ForegroundColor Gray
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "    [X] FAILED - Status Code: $statusCode" -ForegroundColor Red
    
    # Try to get detailed error
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "    Error Details:" -ForegroundColor Yellow
        Write-Host "    $errorBody" -ForegroundColor Yellow
    } catch {
        Write-Host "    Error Message: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================`n" -ForegroundColor Yellow
