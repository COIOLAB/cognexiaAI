$body = @{
    email = "admin@cognexiaai.com"
    password = "Tata@19822"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "Testing login API..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3003/auth/login" -Method POST -Body $body -Headers $headers
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "User: $($response.user.email)" -ForegroundColor White
    Write-Host "User Type: $($response.user.userType)" -ForegroundColor White
    Write-Host "Access Token: $($response.accessToken.Substring(0, 50))..." -ForegroundColor White
    Write-Host ""
    Write-Host "Full Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
