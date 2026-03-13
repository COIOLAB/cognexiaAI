# Test all API endpoints
$BASE_URL = "http://localhost:3003/api/v1"

Write-Host "=" * 80
Write-Host "API ENDPOINT COMPREHENSIVE TEST"
Write-Host "=" * 80
Write-Host ""

# Check if server is running
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Server is running at $BASE_URL" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is not running at $BASE_URL" -ForegroundColor Red
    Write-Host "Please start the server first with: npm start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Running test script..."
Write-Host ""

# Run the TypeScript test script
cd "$PSScriptRoot"
npx ts-node scripts/test-all-endpoints.ts
