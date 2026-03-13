# CognexiaAI ERP - Comprehensive API Testing Script
# Tests all APIs end-to-end with demo user credentials

$BASE_URL = "https://cognexia-crm-backend-production.up.railway.app/api/v1"
$DEMO_EMAIL = "demo@cognexiaai.com"
$DEMO_PASSWORD = "Demo@12345"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CognexiaAI ERP - API Testing Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Login to get auth token
Write-Host "[1/12] Testing Authentication..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $DEMO_EMAIL
        password = $DEMO_PASSWORD
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/demo-login" `
        -Method POST `
        -ContentType "application/json" `
        -UseBasicParsing

    $ACCESS_TOKEN = $loginResponse.accessToken
    Write-Host "✅ Authentication successful" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.user.email)" -ForegroundColor Gray
    Write-Host "   Organization: $($loginResponse.user.organizationName)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Authentication failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $ACCESS_TOKEN"
    "Content-Type" = "application/json"
}

# Step 2: Test Customers API
Write-Host "[2/12] Testing Customers API..." -ForegroundColor Yellow
try {
    $customers = Invoke-RestMethod -Uri "$BASE_URL/crm/customers" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Customers API working - Found $($customers.data.customers.Count) customers`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Customers API failed: $_`n" -ForegroundColor Red
}

# Step 3: Test Contacts API
Write-Host "[3/12] Testing Contacts API..." -ForegroundColor Yellow
try {
    $contacts = Invoke-RestMethod -Uri "$BASE_URL/crm/contacts" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Contacts API working - Found $($contacts.data.contacts.Count) contacts`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Contacts API failed: $_`n" -ForegroundColor Red
}

# Step 4: Test Leads API
Write-Host "[4/12] Testing Leads API..." -ForegroundColor Yellow
try {
    $leads = Invoke-RestMethod -Uri "$BASE_URL/crm/leads" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Leads API working - Found $($leads.data.leads.Count) leads`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Leads API failed: $_`n" -ForegroundColor Red
}

# Step 5: Test Opportunities API
Write-Host "[5/12] Testing Opportunities API..." -ForegroundColor Yellow
try {
    $opportunities = Invoke-RestMethod -Uri "$BASE_URL/crm/opportunities" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Opportunities API working - Found $($opportunities.data.opportunities.Count) opportunities`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Opportunities API failed: $_`n" -ForegroundColor Red
}

# Step 6: Test Accounts API
Write-Host "[6/12] Testing Accounts API..." -ForegroundColor Yellow
try {
    $accounts = Invoke-RestMethod -Uri "$BASE_URL/sales/accounts" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Accounts API working - Found accounts`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Accounts API failed: $_`n" -ForegroundColor Red
}

# Step 7: Test Products API
Write-Host "[7/12] Testing Products API..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$BASE_URL/products" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Products API working - Found $($products.data.Count) products`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Products API failed: $_`n" -ForegroundColor Red
}

# Step 8: Test Tasks API
Write-Host "[8/12] Testing Tasks API..." -ForegroundColor Yellow
try {
    $tasks = Invoke-RestMethod -Uri "$BASE_URL/tasks" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Tasks API working - Found $($tasks.data.Count) tasks`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Tasks API failed: $_`n" -ForegroundColor Red
}

# Step 9: Test Activities API
Write-Host "[9/12] Testing Activities API..." -ForegroundColor Yellow
try {
    $activities = Invoke-RestMethod -Uri "$BASE_URL/activities" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Activities API working - Found $($activities.data.Count) activities`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Activities API failed: $_`n" -ForegroundColor Red
}

# Step 10: Test Events API
Write-Host "[10/12] Testing Events API..." -ForegroundColor Yellow
try {
    $events = Invoke-RestMethod -Uri "$BASE_URL/events" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Events API working - Found $($events.data.Count) events`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Events API failed: $_`n" -ForegroundColor Red
}

# Step 11: Test Dashboard Analytics
Write-Host "[11/12] Testing Dashboard Analytics..." -ForegroundColor Yellow
try {
    $dashboard = Invoke-RestMethod -Uri "$BASE_URL/dashboard" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Dashboard API working`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Dashboard API failed: $_`n" -ForegroundColor Red
}

# Step 12: Test AI/LLM Integration (if available)
Write-Host "[12/12] Testing AI Lab Integration..." -ForegroundColor Yellow
try {
    $aiTestBody = @{
        prompt = "Generate a sales forecast for next quarter"
        model = "llama3-8b-8192"
    } | ConvertTo-Json

    $aiResponse = Invoke-RestMethod -Uri "$BASE_URL/ai/generate" `
        -Method POST `
        -Headers $headers `
        -Body $aiTestBody `
        -UseBasicParsing
    
    Write-Host "✅ AI Lab API working - Response received`n" -ForegroundColor Green
} catch {
    Write-Host "⚠️  AI Lab API not available or failed: $_`n" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "API Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Login to demo at: https://cognexiaai.com" -ForegroundColor White
Write-Host "2. Click 'Try Demo' button" -ForegroundColor White
Write-Host "3. Verify all data appears in dashboard" -ForegroundColor White
Write-Host "4. Test each module (CRM, Sales, Marketing, Support)" -ForegroundColor White
Write-Host "5. Test AI Lab with real LLM calls`n" -ForegroundColor White
