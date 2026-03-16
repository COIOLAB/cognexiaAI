# Seed Super Admin via Backend API Endpoint
# This creates a temporary endpoint on your Railway backend to seed the super admin

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Seed Super Admin via Backend API" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$backendUrl = "https://cognexia-crm-backend-production.up.railway.app"

Write-Host "Calling seed endpoint on Railway backend..." -ForegroundColor Yellow
Write-Host "URL: $backendUrl/api/v1/auth/seed-super-admin`n" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest `
        -Uri "$backendUrl/api/v1/auth/seed-super-admin" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"secret":"cognexia-admin-seed-2024"}' `
        -UseBasicParsing
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor White
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor White
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "If successful, you can now log in with:" -ForegroundColor Cyan
Write-Host "Email: superadmin@cognexiaai.com" -ForegroundColor White
Write-Host "Password: Akshita@19822" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan
