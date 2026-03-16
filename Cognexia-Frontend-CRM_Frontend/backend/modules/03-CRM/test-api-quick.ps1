$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:3003/api/v1"

Write-Host "`n=== Quick API Endpoint Test ===`n" -ForegroundColor Cyan

$tests = @(
    @{Name="Root API"; Url="$baseUrl"},
    @{Name="Auth Demo Login"; Url="$baseUrl/auth/demo-login"; Method="POST"; Body='{"type":"admin"}'},
    @{Name="CRM Module"; Url="$baseUrl/crm"},
    @{Name="Admin Module"; Url="$baseUrl/admin"},
    @{Name="Products"; Url="$baseUrl/crm/products"},
    @{Name="Customers"; Url="$baseUrl/crm/customers"},
    @{Name="Organizations"; Url="$baseUrl/admin/organizations"}
)

$successCount = 0
$authRequiredCount = 0
$errorCount = 0

foreach ($test in $tests) {
    Write-Host "$($test.Name):" -ForegroundColor Yellow
    
    $method = if ($test.Method) { $test.Method } else { "GET" }
    
    try {
        $params = @{
            Uri = $test.Url
            Method = $method
            UseBasicParsing = $true
            TimeoutSec = 5
            ErrorAction = "Stop"
        }
        
        if ($test.Body) {
            $params.Body = $test.Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        Write-Host "  ✅ Success: $($response.StatusCode)" -ForegroundColor Green
        $successCount++
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 401 -or $statusCode -eq 403) {
            Write-Host "  🔒 Auth Required: $statusCode (Working, needs token)" -ForegroundColor Yellow
            $authRequiredCount++
        }
        elseif ($statusCode -eq 404) {
            Write-Host "  ⚠️  Not Found: 404" -ForegroundColor Magenta
            $errorCount++
        }
        else {
            Write-Host "  ❌ Error: $statusCode" -ForegroundColor Red
            $errorCount++
        }
    }
    
    Write-Host ""
}

Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "✅ Working: $successCount" -ForegroundColor Green
Write-Host "🔒 Requires Auth: $authRequiredCount (Working)" -ForegroundColor Yellow
Write-Host "❌ Errors/Not Found: $errorCount" -ForegroundColor Red
Write-Host "`nTotal: $($tests.Count) endpoints tested" -ForegroundColor Cyan
