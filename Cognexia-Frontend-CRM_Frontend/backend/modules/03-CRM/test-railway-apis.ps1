# Test all APIs on Railway production CRM backend - check for 200 response
# Usage: .\test-railway-apis.ps1
# Or: $env:RAILWAY_API_BASE = "https://cognexia-crm-backend-production.up.railway.app"; .\test-railway-apis.ps1

$BASE = if ($env:RAILWAY_API_BASE) { $env:RAILWAY_API_BASE.TrimEnd('/') } else { "https://crm-backend-production-03da.up.railway.app" }
$API_BASE = "$BASE/api/v1"

Write-Host ""
Write-Host ("=" * 100)
Write-Host "RAILWAY PRODUCTION API TEST - $BASE"
Write-Host ("=" * 100)
Write-Host ""

# 1) Public endpoints (no /api/v1)
$publicEndpoints = @(
    @{ Method = "GET"; Path = "/"; Name = "Root" },
    @{ Method = "GET"; Path = "/health"; Name = "Health" }
)

# 2) Auth (no Bearer)
$authEndpoints = @(
    @{ Method = "POST"; Path = "/auth/demo-login"; Name = "Demo Login"; Body = "{}" },
    @{ Method = "POST"; Path = "/auth/refresh"; Name = "Refresh (needs body)"; Body = '{"refreshToken":""}' }
)

# 3) Protected endpoints (need Bearer) - representative list
$protectedEndpoints = @(
    @{ Method = "GET"; Path = "/organizations"; Name = "Organizations" },
    @{ Method = "GET"; Path = "/organizations/me/organization"; Name = "Me org" },
    @{ Method = "GET"; Path = "/subscription-plans"; Name = "Subscription plans" },
    @{ Method = "GET"; Path = "/crm/customers"; Name = "Customers" },
    @{ Method = "GET"; Path = "/crm/leads"; Name = "Leads" },
    @{ Method = "GET"; Path = "/crm/sales/pipeline"; Name = "Sales pipeline" },
    @{ Method = "GET"; Path = "/crm/analytics/overview"; Name = "Analytics overview" },
    @{ Method = "GET"; Path = "/support-tickets"; Name = "Support tickets" },
    @{ Method = "GET"; Path = "/support-tickets/stats/overview"; Name = "Support stats" },
    @{ Method = "GET"; Path = "/staff"; Name = "Staff" },
    @{ Method = "GET"; Path = "/dashboards"; Name = "Dashboards" },
    @{ Method = "GET"; Path = "/sequences"; Name = "Sequences" },
    @{ Method = "GET"; Path = "/audit-logs/stats"; Name = "Audit stats" },
    @{ Method = "GET"; Path = "/throttling/status"; Name = "Throttling status" },
    @{ Method = "GET"; Path = "/products"; Name = "Products" },
    @{ Method = "GET"; Path = "/price-lists/active"; Name = "Price lists" },
    @{ Method = "GET"; Path = "/reporting/reports"; Name = "Reports" },
    @{ Method = "GET"; Path = "/notifications/templates"; Name = "Notification templates" },
    @{ Method = "GET"; Path = "/usage"; Name = "Usage" },
    @{ Method = "GET"; Path = "/territories"; Name = "Territories" },
    @{ Method = "GET"; Path = "/calls/statistics"; Name = "Calls stats" }
)

function Get-Status {
    param($Method, $Url, $Headers, $Body)
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
            ErrorAction = "Stop"
            TimeoutSec = 15
        }
        if ($Body) { $params.Body = $Body; $params.ContentType = "application/json" }
        $r = Invoke-WebRequest @params
        return $r.StatusCode
    } catch {
        try {
            $code = [int]$_.Exception.Response.StatusCode
        } catch { $code = 0 }
        if (-not $code -and $_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode.value__
        }
        if (-not $code) { $code = 0 }
        return $code
    }
}

$allResults = @()
$token = $null

# --- Public (no prefix) ---
Write-Host "PUBLIC (no auth)" -ForegroundColor Cyan
foreach ($ep in $publicEndpoints) {
    $url = $BASE + $ep.Path
    $status = Get-Status -Method $ep.Method -Url $url -Headers @{}
    $ok = ($status -eq 200)
    Write-Host "  $($ep.Method) $($ep.Path) -> $status $(if($ok){'OK'}else{'FAIL'})" -ForegroundColor $(if($ok){'Green'}else{'Red'})
    $allResults += [PSCustomObject]@{ Method = $ep.Method; Path = $ep.Path; Status = $status; Is200 = $ok }
}

# --- Auth: demo-login to get token ---
Write-Host ""
Write-Host "AUTH (get token)" -ForegroundColor Cyan
$loginUrl = $API_BASE + "/auth/demo-login"
try {
    $loginResp = Invoke-RestMethod -Uri $loginUrl -Method POST -ContentType "application/json" -Body "{}" -UseBasicParsing -ErrorAction Stop
    $token = $loginResp.accessToken
    Write-Host "  POST /auth/demo-login -> 200 OK (token received)" -ForegroundColor Green
    $allResults += [PSCustomObject]@{ Method = "POST"; Path = "/api/v1/auth/demo-login"; Status = 200; Is200 = $true }
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if (-not $status) { $status = 0 }
    Write-Host "  POST /auth/demo-login -> $status FAIL (no token)" -ForegroundColor Red
    $allResults += [PSCustomObject]@{ Method = "POST"; Path = "/api/v1/auth/demo-login"; Status = $status; Is200 = $false }
}

# --- Protected ---
Write-Host ""
Write-Host "PROTECTED (Bearer token)" -ForegroundColor Cyan
$headers = @{ "Content-Type" = "application/json" }
if ($token) { $headers["Authorization"] = "Bearer $token" }

foreach ($ep in $protectedEndpoints) {
    $url = $API_BASE + $ep.Path
    $status = Get-Status -Method $ep.Method -Url $url -Headers $headers
    $ok = ($status -eq 200)
    Write-Host "  $($ep.Method) $($ep.Path) -> $status $(if($ok){'OK'}else{'FAIL'})" -ForegroundColor $(if($ok){'Green'}else{'Red'})
    $allResults += [PSCustomObject]@{ Method = $ep.Method; Path = "/api/v1$($ep.Path)"; Status = $status; Is200 = $ok }
    Start-Sleep -Milliseconds 80
}

# --- Summary ---
Write-Host ""
Write-Host ("=" * 100)
Write-Host "SUMMARY"
Write-Host ("=" * 100)
$total = $allResults.Count
$ok200 = ($allResults | Where-Object { $_.Is200 }).Count
$not200 = $total - $ok200
Write-Host "Total: $total | 200 OK: $ok200 | Not 200: $not200"
Write-Host "Success rate: $([math]::Round($ok200 / $total * 100, 1))%"
Write-Host ""
$allResults | Export-Csv -Path "railway-api-test-results.csv" -NoTypeInformation
Write-Host "Results saved to railway-api-test-results.csv"
Write-Host ""
Write-Host "To test in Swagger UI: Set ENABLE_SWAGGER=true in Railway Variables, redeploy, then open:"
Write-Host "  $BASE/api/v1/api/docs"
Write-Host ""
