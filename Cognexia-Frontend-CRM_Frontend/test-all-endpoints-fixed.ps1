# ========================================
# CognexiaAI CRM - Fixed API Endpoint Tester
# ========================================

$baseUrl = "http://localhost:3003/api/v1"
$testResults = @()
$token = $null

# Helper function to test endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Name,
        [object]$Body = $null,
        [bool]$RequiresAuth = $true
    )
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($RequiresAuth -and $token) {
            $headers["Authorization"] = "Bearer $token"
        }
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        Write-Host "[TESTING] $Method $Url" -ForegroundColor Cyan
        $response = Invoke-RestMethod @params
        
        $responsePreview = ""
        if ($response) {
            $responseJson = $response | ConvertTo-Json -Depth 2 -Compress
            $responsePreview = $responseJson.Substring(0, [Math]::Min(100, $responseJson.Length))
        }
        
        $result = [PSCustomObject]@{
            Endpoint = $Name
            Method = $Method
            Url = $Url
            Status = "SUCCESS"
            StatusCode = 200
            Response = $responsePreview
            Error = ""
        }
        
        Write-Host "  [OK] SUCCESS" -ForegroundColor Green
        return $result
        
    } catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
        $errorMessage = $_.Exception.Message
        
        # Try to get detailed error
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            $errorMessage = $_.ErrorDetails.Message
        }
        
        $result = [PSCustomObject]@{
            Endpoint = $Name
            Method = $Method
            Url = $Url
            Status = "FAILED"
            StatusCode = $statusCode
            Response = ""
            Error = $errorMessage
        }
        
        Write-Host "  [X] FAILED - $statusCode - $errorMessage" -ForegroundColor Red
        return $result
    }
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "CognexiaAI CRM API Endpoint Testing" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

# ========================================
# STEP 1: Authentication (FIXED DTOs)
# ========================================
Write-Host "`n=== AUTHENTICATION ===" -ForegroundColor Magenta

# Register a test user with CORRECT DTO format
$randomEmail = "testuser.$(Get-Random)@example.com"
$registerBody = @{
    email = $randomEmail
    password = "TestPassword123!"
    firstName = "Test"
    lastName = "User"
    companyName = "Test Organization $(Get-Random)"
    phone = "+1234567890"
}

Write-Host "[INFO] Registering with email: $randomEmail" -ForegroundColor Gray
$registerResult = Test-Endpoint -Method "POST" -Url "$baseUrl/auth/register" -Name "Register User" -Body $registerBody -RequiresAuth $false
$testResults += $registerResult

if ($registerResult.Status -eq "SUCCESS") {
    # Get the actual token
    try {
        $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body ($registerBody | ConvertTo-Json) -ContentType "application/json"
        $token = $registerResponse.accessToken
        Write-Host "`n[TOKEN] Token obtained successfully!" -ForegroundColor Green
        Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
    } catch {
        Write-Host "[ERROR] Could not get token for subsequent tests" -ForegroundColor Red
    }
}

# Login with the same user
if ($registerResult.Status -eq "SUCCESS") {
    Start-Sleep -Seconds 1
    $loginBody = @{
        email = $randomEmail
        password = "TestPassword123!"
    }
    $testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/auth/login" -Name "Login User" -Body $loginBody -RequiresAuth $false
}

# Get Current User
if ($token) {
    $testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/auth/me" -Name "Get Current User" -RequiresAuth $true
}

Start-Sleep -Milliseconds 500

# ========================================
# STEP 2: Industry 5.0 - Quantum Intelligence
# ========================================
Write-Host "`n=== QUANTUM INTELLIGENCE ===" -ForegroundColor Magenta

$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/quantum/personality-profile" -Name "Generate Personality Profile" -Body @{customerId="00000000-0000-0000-0000-000000000456"}
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/quantum/entanglement/00000000-0000-0000-0000-000000000456" -Name "Analyze Customer Entanglement"
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/quantum/consciousness-simulation" -Name "Simulate Consciousness" -Body @{customerId="00000000-0000-0000-0000-000000000456"}
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/quantum/behavioral-predictions/00000000-0000-0000-0000-000000000456" -Name "Predict Quantum Behavior"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/quantum/emotional-resonance/00000000-0000-0000-0000-000000000456" -Name "Analyze Emotional Resonance"

Start-Sleep -Milliseconds 500

# ========================================
# STEP 3: Holographic Experience
# ========================================
Write-Host "`n=== HOLOGRAPHIC EXPERIENCE ===" -ForegroundColor Magenta

$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/holographic/projections" -Name "Create Holographic Projection" -Body @{customerId="00000000-0000-0000-0000-000000000456"; type="PRODUCT_DEMO"}
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/holographic/spatial-computing/start" -Name "Start Spatial Computing Session" -Body @{customerId="00000000-0000-0000-0000-000000000456"}
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/holographic/multi-user/sync" -Name "Sync Multi-User Space" -Body @{sessionId="session-123"}

Start-Sleep -Milliseconds 500

# ========================================
# STEP 4: AR/VR Sales
# ========================================
Write-Host "`n=== AR/VR SALES ===" -ForegroundColor Magenta

$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/arvr/showrooms" -Name "Get VR Showrooms"
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/arvr/showrooms" -Name "Create VR Showroom" -Body @{name="Luxury Showroom"; environment="MODERN"}
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/arvr/meetings" -Name "Schedule Virtual Meeting" -Body @{customerId="00000000-0000-0000-0000-000000000456"; scheduledAt="2026-01-20T10:00:00Z"}
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/arvr/product-demos" -Name "Create 3D Product Demo" -Body @{productId="00000000-0000-0000-0000-000000000123"}
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/arvr/configurator/initialize" -Name "Initialize 3D Configurator" -Body @{productId="00000000-0000-0000-0000-000000000123"}

Start-Sleep -Milliseconds 500

# ========================================
# STEP 5: Contract Management
# ========================================
Write-Host "`n=== CONTRACT MANAGEMENT ===" -ForegroundColor Magenta

$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/contracts" -Name "Get All Contracts"
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/contracts" -Name "Create Contract" -Body @{name="Service Agreement"; customerId="00000000-0000-0000-0000-000000000456"; value=100000}
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/contracts/templates" -Name "Get Contract Templates"

Start-Sleep -Milliseconds 500

# ========================================
# STEP 6: Inventory Management
# ========================================
Write-Host "`n=== INVENTORY MANAGEMENT ===" -ForegroundColor Magenta

$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/inventory/stock-levels" -Name "Get Stock Levels"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/inventory/warehouses" -Name "Get Warehouses"
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/inventory/warehouses" -Name "Create Warehouse" -Body @{name="Main Warehouse"; location="New York"}
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/inventory/reorder-points" -Name "Get Reorder Points"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/inventory/analytics" -Name "Get Inventory Analytics"

Start-Sleep -Milliseconds 500

# ========================================
# STEP 7: Catalog Management
# ========================================
Write-Host "`n=== CATALOG MANAGEMENT ===" -ForegroundColor Magenta

$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/catalogs" -Name "Get All Catalogs"
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/catalogs" -Name "Create Catalog" -Body @{name="Summer 2026 Catalog"; description="New collection"}

Start-Sleep -Milliseconds 500

# ========================================
# STEP 8: LLM Integration
# ========================================
Write-Host "`n=== LLM INTEGRATION ===" -ForegroundColor Magenta

$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/llm/chat" -Name "Start Chat Conversation" -Body @{customerId="00000000-0000-0000-0000-000000000456"; context="sales"}
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/llm/content-generation" -Name "Generate Content" -Body @{prompt="Write a product description"; contentType="marketing"}
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/llm/sentiment" -Name "Analyze Sentiment" -Body @{customerId="00000000-0000-0000-0000-000000000456"}
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/llm/summarize" -Name "Summarize Text" -Body @{text="Long text to summarize..."}
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/llm/models" -Name "Get Available Models"

Start-Sleep -Milliseconds 500

# ========================================
# STEP 9: Real-Time Analytics
# ========================================
Write-Host "`n=== REAL-TIME ANALYTICS ===" -ForegroundColor Magenta

$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/real-time/metrics/live" -Name "Get Live Metrics"
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/real-time/events" -Name "Publish Event" -Body @{eventType="CUSTOMER_ACTION"; data=@{action="page_view"}}
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/real-time/alerts" -Name "Get Alerts"
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/real-time/alerts" -Name "Create Alert" -Body @{name="High Revenue Alert"; threshold=10000}
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/real-time/customer-activity/live" -Name "Get Live Customer Activity"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/real-time/conversions/live" -Name "Get Live Conversions"

# ========================================
# RESULTS SUMMARY
# ========================================
Write-Host "`n`n========================================" -ForegroundColor Yellow
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

$successCount = ($testResults | Where-Object { $_.Status -eq "SUCCESS" }).Count
$failedCount = ($testResults | Where-Object { $_.Status -eq "FAILED" }).Count
$totalCount = $testResults.Count

Write-Host "`nTotal Endpoints Tested: $totalCount" -ForegroundColor White
Write-Host "[OK] Successful: $successCount" -ForegroundColor Green
Write-Host "[X] Failed: $failedCount" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($successCount/$totalCount)*100, 2))%" -ForegroundColor Cyan

# Failed endpoints details
if ($failedCount -gt 0) {
    Write-Host "`n=== FAILED ENDPOINTS ===" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAILED" } | ForEach-Object {
        Write-Host "`n[X] $($_.Endpoint)" -ForegroundColor Red
        Write-Host "   Method: $($_.Method)" -ForegroundColor Gray
        Write-Host "   URL: $($_.Url)" -ForegroundColor Gray
        Write-Host "   Status Code: $($_.StatusCode)" -ForegroundColor Gray
        Write-Host "   Error: $($_.Error)" -ForegroundColor Yellow
    }
}

# Export results to CSV
$csvPath = "C:\Users\nshrm\Desktop\CognexiaAI-ERP\api-test-results-fixed.csv"
$testResults | Export-Csv -Path $csvPath -NoTypeInformation
Write-Host "`n[CSV] Detailed results exported to: $csvPath" -ForegroundColor Cyan

Write-Host "`n========================================`n" -ForegroundColor Yellow
