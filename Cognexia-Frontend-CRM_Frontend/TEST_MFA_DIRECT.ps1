# Test MFA Endpoints Directly
# Run this script to test the SMS OTP flow step by step

Write-Host "`n=== Testing MFA SMS OTP Flow ===" -ForegroundColor Cyan
$baseUrl = "https://cognexia-crm-backend-production.up.railway.app/api/v1"
$mobile = "+918850815294"

# Step 1: Send OTP
Write-Host "`n1. Sending OTP to $mobile..." -ForegroundColor Yellow
try {
    $sendResponse = Invoke-WebRequest `
        -Uri "$baseUrl/mfa/send-otp" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            mobile = $mobile
            method = "sms"
        } | ConvertTo-Json) `
        -UseBasicParsing
    
    Write-Host "✓ OTP Sent Successfully!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $sendResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "✗ Failed to send OTP" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
    exit 1
}

# Step 2: Ask user for OTP code
Write-Host "`n2. Please check your SMS and enter the OTP code:" -ForegroundColor Yellow
$otpCode = Read-Host "Enter OTP"

# Step 3: Verify OTP
Write-Host "`n3. Verifying OTP code: $otpCode" -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-WebRequest `
        -Uri "$baseUrl/mfa/verify-otp" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            mobile = $mobile
            code = $otpCode
            method = "sms"
        } | ConvertTo-Json) `
        -UseBasicParsing
    
    Write-Host "✓ OTP Verified Successfully!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $verifyResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "✗ Failed to verify OTP" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
