# Test CORS Configuration
# Run this after updating Railway CORS_ORIGINS

Write-Host "Testing CORS Configuration..." -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://cognexia-crm-backend-production.up.railway.app/api/v1/health"
$origins = @(
    "https://www.cognexiaai.com",
    "https://cognexiaai.com", 
    "https://admin.cognexiaai.com",
    "https://app.cognexiaai.com"
)

foreach ($origin in $origins) {
    Write-Host "Testing origin: $origin" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $backendUrl `
            -Method OPTIONS `
            -Headers @{
                "Origin" = $origin
                "Access-Control-Request-Method" = "GET"
                "Access-Control-Request-Headers" = "Content-Type,Authorization"
            } `
            -UseBasicParsing `
            -ErrorAction Stop
        
        $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
        
        if ($corsHeader) {
            Write-Host "  ✅ CORS Allowed: $corsHeader" -ForegroundColor Green
        } else {
            Write-Host "  ❌ CORS header not found" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "CORS Test Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If you see ✅ for all origins - CORS is working!" -ForegroundColor Green
Write-Host "2. If you see ❌ - Update CORS_ORIGINS in Railway and redeploy" -ForegroundColor Red
Write-Host "3. Then test the complete MFA flow from www.cognexiaai.com" -ForegroundColor Yellow
