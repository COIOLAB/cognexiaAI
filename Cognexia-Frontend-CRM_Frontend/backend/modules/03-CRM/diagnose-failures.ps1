$BASE_URL = "http://localhost:3003/api/v1"

Write-Host "DIAGNOSING FAILING ENDPOINTS" -ForegroundColor Cyan
Write-Host ("=" * 80)
Write-Host ""

# Step 1: Authenticate
Write-Host "Step 1: Authenticating..." -ForegroundColor Yellow
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$registerPayload = @{
    email = "diag_${timestamp}@test.com"
    password = "Test123!@#"
    firstName = "Diag"
    lastName = "User"
    organizationName = "DiagOrg_${timestamp}"
    industry = "technology"
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Body $registerPayload -ContentType "application/json" -UseBasicParsing
    $token = $authResponse.data.accessToken
    $userId = $authResponse.data.user.id
    Write-Host "✓ Authenticated successfully" -ForegroundColor Green
    Write-Host "  Token: $token"
    Write-Host "  User ID: $userId"
    Write-Host ""
} catch {
    Write-Host "✗ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test failing endpoints one by one
$failingEndpoints = @(
    @{method="GET"; path="/crm/customers"; name="List Customers"},
    @{method="POST"; path="/crm/customers"; name="Create Customer"; body=@{name="Test Customer"; email="test@example.com"}},
    @{method="GET"; path="/crm/sales/opportunities"; name="List Opportunities"},
    @{method="GET"; path="/crm/marketing/campaigns"; name="List Campaigns"},
    @{method="GET"; path="/products"; name="List Products"},
    @{method="GET"; path="/activity"; name="List Activities"},
    @{method="GET"; path="/documents"; name="List Documents"},
    @{method="GET"; path="/email/templates"; name="List Email Templates"},
    @{method="GET"; path="/forms"; name="List Forms"},
    @{method="GET"; path="/reporting/reports"; name="List Reports"},
    @{method="GET"; path="/sequences"; name="List Sequences"},
    @{method="GET"; path="/territories"; name="List Territories"}
)

Write-Host "Step 2: Testing failing endpoints..." -ForegroundColor Yellow
Write-Host ""

foreach ($endpoint in $failingEndpoints) {
    Write-Host "Testing: $($endpoint.name) [$($endpoint.method) $($endpoint.path)]" -ForegroundColor Cyan
    
    try {
        $body = if ($endpoint.body) { $endpoint.body | ConvertTo-Json } else { $null }
        
        if ($endpoint.method -eq "GET") {
            $response = Invoke-WebRequest -Uri "$BASE_URL$($endpoint.path)" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri "$BASE_URL$($endpoint.path)" -Method POST -Headers $headers -Body $body -UseBasicParsing -ErrorAction Stop
        }
        
        Write-Host "  ✓ SUCCESS (Status: $($response.StatusCode))" -ForegroundColor Green
        Write-Host "  Response: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))..."
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  ✗ FAILED (Status: $statusCode)" -ForegroundColor Red
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "  Error: $errorBody" -ForegroundColor Yellow
        } catch {
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

Write-Host ("=" * 80)
Write-Host "DIAGNOSIS COMPLETE" -ForegroundColor Cyan
