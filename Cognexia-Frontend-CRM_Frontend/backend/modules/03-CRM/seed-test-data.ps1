$BASE_URL = "http://localhost:3003/api/v1"

Write-Host ""
Write-Host ("=" * 130)
Write-Host "SEEDING DATABASE WITH TEST DATA"
Write-Host ("=" * 130)
Write-Host ""

# Step 1: Authenticate
Write-Host "STEP 1: Authenticating..." -ForegroundColor Cyan
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$randomSuffix = -join ((65..90) + (97..122) | Get-Random -Count 8 | ForEach-Object {[char]$_})
$uniqueEmail = "admin${timestamp}@test.local"
$uniqueOrgName = "TestOrg_${timestamp}"

$registerPayload = @{
    email = $uniqueEmail
    password = "Test123!@#"
    firstName = "Admin"
    lastName = "User"
    organizationName = $uniqueOrgName
    industry = "technology"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Body $registerPayload -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    $token = $registerResponse.data.accessToken
    $userId = $registerResponse.data.user.id
    $orgId = $registerResponse.data.user.organizationId
    
    Write-Host "SUCCESS! Token obtained" -ForegroundColor Green
    Write-Host "User ID: $userId | Org ID: $orgId"
    Write-Host ""
} catch {
    Write-Host "FAILED to authenticate!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Store created IDs
$createdIds = @{
    customers = @()
    products = @()
    campaigns = @()
    opportunities = @()
    contracts = @()
    catalogs = @()
    inventoryItems = @()
    showrooms = @()
}

# Step 2: Create Customers
Write-Host "STEP 2: Creating customers..." -ForegroundColor Cyan
1..5 | ForEach-Object {
    $customerData = @{
        name = "Customer $_"
        email = "customer$_@example.com"
        phone = "+1-555-000-$($_)"
        company = "Company $_"
        status = "active"
        industry = "technology"
        customerType = "enterprise"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/crm/customers" -Method POST -Headers $headers -Body $customerData -UseBasicParsing -ErrorAction Stop
        $createdIds.customers += $response.data.id
        Write-Host "  Created: Customer $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Customer $_" -ForegroundColor Yellow
    }
}

# Step 3: Create Products
Write-Host "STEP 3: Creating products..." -ForegroundColor Cyan
1..5 | ForEach-Object {
    $productData = @{
        name = "Product $_"
        description = "Description for Product $_"
        sku = "PROD-$_"
        price = 100 * $_
        category = "Electronics"
        status = "active"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/products" -Method POST -Headers $headers -Body $productData -UseBasicParsing -ErrorAction Stop
        $createdIds.products += $response.data.id
        Write-Host "  Created: Product $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Product $_" -ForegroundColor Yellow
    }
}

# Step 4: Create Sales Opportunities
Write-Host "STEP 4: Creating sales opportunities..." -ForegroundColor Cyan
1..3 | ForEach-Object {
    $opportunityData = @{
        name = "Opportunity $_"
        description = "Sales opportunity $_"
        value = 10000 * $_
        stage = "qualification"
        probability = 50 + ($_ * 10)
        expectedCloseDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/crm/sales/opportunities" -Method POST -Headers $headers -Body $opportunityData -UseBasicParsing -ErrorAction Stop
        $createdIds.opportunities += $response.data.id
        Write-Host "  Created: Opportunity $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Opportunity $_" -ForegroundColor Yellow
    }
}

# Step 5: Create Marketing Campaigns
Write-Host "STEP 5: Creating marketing campaigns..." -ForegroundColor Cyan
1..3 | ForEach-Object {
    $campaignData = @{
        name = "Campaign $_"
        description = "Marketing campaign $_"
        type = "email"
        status = "active"
        startDate = (Get-Date).ToString("yyyy-MM-dd")
        budget = 5000 * $_
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/crm/marketing/campaigns" -Method POST -Headers $headers -Body $campaignData -UseBasicParsing -ErrorAction Stop
        $createdIds.campaigns += $response.data.id
        Write-Host "  Created: Campaign $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Campaign $_" -ForegroundColor Yellow
    }
}

# Step 6: Create Contracts
Write-Host "STEP 6: Creating contracts..." -ForegroundColor Cyan
1..3 | ForEach-Object {
    $contractData = @{
        name = "Contract $_"
        description = "Contract agreement $_"
        value = 50000 * $_
        startDate = (Get-Date).ToString("yyyy-MM-dd")
        endDate = (Get-Date).AddMonths(12).ToString("yyyy-MM-dd")
        status = "active"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/contracts" -Method POST -Headers $headers -Body $contractData -UseBasicParsing -ErrorAction Stop
        $createdIds.contracts += $response.data.id
        Write-Host "  Created: Contract $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Contract $_" -ForegroundColor Yellow
    }
}

# Step 7: Create Catalogs
Write-Host "STEP 7: Creating catalogs..." -ForegroundColor Cyan
1..3 | ForEach-Object {
    $catalogData = @{
        name = "Catalog $_"
        description = "Product catalog $_"
        type = "standard"
        status = "active"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/catalogs" -Method POST -Headers $headers -Body $catalogData -UseBasicParsing -ErrorAction Stop
        $createdIds.catalogs += $response.data.id
        Write-Host "  Created: Catalog $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Catalog $_" -ForegroundColor Yellow
    }
}

# Step 8: Create Inventory Items
Write-Host "STEP 8: Creating inventory items..." -ForegroundColor Cyan
1..5 | ForEach-Object {
    $inventoryData = @{
        name = "Inventory Item $_"
        description = "Inventory item $_"
        sku = "INV-$_"
        quantity = 100 * $_
        location = "Warehouse A"
        status = "in_stock"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/inventory/items" -Method POST -Headers $headers -Body $inventoryData -UseBasicParsing -ErrorAction Stop
        $createdIds.inventoryItems += $response.data.id
        Write-Host "  Created: Inventory Item $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Inventory Item $_" -ForegroundColor Yellow
    }
}

# Step 9: Create AR/VR Showrooms
Write-Host "STEP 9: Creating AR/VR showrooms..." -ForegroundColor Cyan
1..3 | ForEach-Object {
    $showroomData = @{
        name = "Showroom $_"
        description = "Virtual showroom $_"
        type = "vr"
        status = "active"
        capacity = 50 + ($_ * 10)
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/arvr/showrooms" -Method POST -Headers $headers -Body $showroomData -UseBasicParsing -ErrorAction Stop
        $createdIds.showrooms += $response.data.id
        Write-Host "  Created: Showroom $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Showroom $_" -ForegroundColor Yellow
    }
}

# Step 10: Create Activities
Write-Host "STEP 10: Creating activities..." -ForegroundColor Cyan
1..5 | ForEach-Object {
    $activityData = @{
        type = "meeting"
        subject = "Activity $_"
        description = "Activity description $_"
        status = "completed"
        date = (Get-Date).ToString("yyyy-MM-dd")
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/activity" -Method POST -Headers $headers -Body $activityData -UseBasicParsing -ErrorAction Stop
        Write-Host "  Created: Activity $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Activity $_" -ForegroundColor Yellow
    }
}

# Step 11: Create Documents
Write-Host "STEP 11: Creating documents..." -ForegroundColor Cyan
1..3 | ForEach-Object {
    $documentData = @{
        name = "Document $_"
        description = "Document description $_"
        type = "pdf"
        url = "https://example.com/doc$_.pdf"
        status = "active"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/documents" -Method POST -Headers $headers -Body $documentData -UseBasicParsing -ErrorAction Stop
        Write-Host "  Created: Document $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Document $_" -ForegroundColor Yellow
    }
}

# Step 12: Create Forms
Write-Host "STEP 12: Creating forms..." -ForegroundColor Cyan
1..3 | ForEach-Object {
    $formData = @{
        name = "Form $_"
        description = "Form description $_"
        type = "survey"
        status = "active"
        fields = @(@{
            name = "field1"
            type = "text"
            required = $true
        })
    } | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/forms" -Method POST -Headers $headers -Body $formData -UseBasicParsing -ErrorAction Stop
        Write-Host "  Created: Form $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Form $_" -ForegroundColor Yellow
    }
}

# Step 13: Create Email Templates
Write-Host "STEP 13: Creating email templates..." -ForegroundColor Cyan
1..3 | ForEach-Object {
    $templateData = @{
        name = "Template $_"
        subject = "Email Subject $_"
        body = "Email body $_"
        type = "marketing"
        status = "active"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/email/templates" -Method POST -Headers $headers -Body $templateData -UseBasicParsing -ErrorAction Stop
        Write-Host "  Created: Email Template $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Email Template $_" -ForegroundColor Yellow
    }
}

# Step 14: Create Territories
Write-Host "STEP 14: Creating territories..." -ForegroundColor Cyan
1..3 | ForEach-Object {
    $territoryData = @{
        name = "Territory $_"
        description = "Territory description $_"
        region = "Region $_"
        status = "active"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/territories" -Method POST -Headers $headers -Body $territoryData -UseBasicParsing -ErrorAction Stop
        Write-Host "  Created: Territory $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Territory $_" -ForegroundColor Yellow
    }
}

# Step 15: Create Sequences
Write-Host "STEP 15: Creating sequences..." -ForegroundColor Cyan
1..3 | ForEach-Object {
    $sequenceData = @{
        name = "Sequence $_"
        description = "Sequence description $_"
        type = "email"
        status = "active"
        steps = @()
    } | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/sequences" -Method POST -Headers $headers -Body $sequenceData -UseBasicParsing -ErrorAction Stop
        Write-Host "  Created: Sequence $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Sequence $_" -ForegroundColor Yellow
    }
}

# Step 16: Create Subscription Plans
Write-Host "STEP 16: Creating subscription plans..." -ForegroundColor Cyan
1..3 | ForEach-Object {
    $planData = @{
        name = "Plan $_"
        description = "Subscription plan $_"
        price = 100 * $_
        interval = "monthly"
        status = "active"
        features = @("Feature 1", "Feature 2")
    } | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/subscription-plans" -Method POST -Headers $headers -Body $planData -UseBasicParsing -ErrorAction Stop
        Write-Host "  Created: Subscription Plan $_" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Subscription Plan $_" -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host ("=" * 130)
Write-Host "DATABASE SEEDING COMPLETE!"
Write-Host ("=" * 130)
Write-Host ""
Write-Host "Created Data:" -ForegroundColor Green
Write-Host "  Customers: $($createdIds.customers.Count)" -ForegroundColor Cyan
Write-Host "  Products: $($createdIds.products.Count)" -ForegroundColor Cyan
Write-Host "  Opportunities: $($createdIds.opportunities.Count)" -ForegroundColor Cyan
Write-Host "  Campaigns: $($createdIds.campaigns.Count)" -ForegroundColor Cyan
Write-Host "  Contracts: $($createdIds.contracts.Count)" -ForegroundColor Cyan
Write-Host "  Catalogs: $($createdIds.catalogs.Count)" -ForegroundColor Cyan
Write-Host "  Inventory Items: $($createdIds.inventoryItems.Count)" -ForegroundColor Cyan
Write-Host "  Showrooms: $($createdIds.showrooms.Count)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Authentication Token: $token" -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now run: .\test-all-178-endpoints.ps1" -ForegroundColor Green
Write-Host ""
