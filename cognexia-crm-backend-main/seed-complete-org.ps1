param()

$ErrorActionPreference = "Continue"
$BASE_URL = "http://localhost:3003/api/v1"

Write-Host ""
Write-Host "=" * 130
Write-Host "CREATING COMPLETE TEST ORGANIZATION WITH ALL DATA"
Write-Host "=" * 130
Write-Host ""

# Step 1: Create Organization
Write-Host "STEP 1: Creating Test Organization..." -ForegroundColor Cyan
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$orgName = "TestCorp_$timestamp"
$adminEmail = "admin_${timestamp}@testcorp.com"

$registerPayload = @{
    email = $adminEmail
    password = "Admin123!@#"
    firstName = "John"
    lastName = "Admin"
    organizationName = $orgName
    industry = "technology"
}

$registerJson = $registerPayload | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method POST -Body $registerJson -ContentType "application/json" -UseBasicParsing
    $token = $authResponse.data.accessToken
    $userId = $authResponse.data.user.id
    $orgId = $authResponse.data.user.organizationId
    
    Write-Host "Success: Organization Created: $orgName" -ForegroundColor Green
    Write-Host "  Admin: $adminEmail" -ForegroundColor Gray
    Write-Host "  Org ID: $orgId" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed to create organization" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$stats = @{
    customers = 0
    products = 0
    opportunities = 0
    campaigns = 0
    contracts = 0
    catalogs = 0
    inventory = 0
    showrooms = 0
    activities = 0
    documents = 0
    forms = 0
    emailTemplates = 0
    territories = 0
    sequences = 0
    plans = 0
}

# Step 2: Create Customers
Write-Host "STEP 2: Creating Customers (10)..." -ForegroundColor Cyan
$customers = @(
    "Acme Corporation",
    "TechStart Inc",
    "Global Solutions Ltd",
    "Retail Express",
    "Healthcare Plus",
    "EduTech Pro",
    "Finance Partners",
    "Media Group",
    "Energy Corp",
    "Food Beverage Co"
)

foreach ($custName in $customers) {
    $customerData = @{
        name = $custName
        email = ($custName -replace ' ', '').ToLower() + "@example.com"
        phone = "+1-555-" + (Get-Random -Minimum 1000 -Maximum 9999).ToString()
        company = $custName
        industry = "technology"
        customerType = "enterprise"
        organizationId = $orgId
        status = "active"
    }
    
    $customerJson = $customerData | ConvertTo-Json -Depth 5
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/crm/customers" -Method POST -Headers $headers -Body $customerJson -UseBasicParsing
        $stats.customers++
        Write-Host "  Success: $custName" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: $custName" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 3: Create Products
Write-Host "STEP 3: Creating Products (15)..." -ForegroundColor Cyan
$products = @(
    "Enterprise CRM License",
    "Sales Pro Package",
    "Marketing Automation",
    "Analytics Dashboard",
    "Mobile App Access",
    "API Integration",
    "Custom Development",
    "Training Package",
    "Premium Support",
    "Data Migration",
    "Hardware Bundle",
    "Server License",
    "Cloud Storage 1TB",
    "Consulting Hours",
    "AR VR Module"
)

foreach ($prodName in $products) {
    $productData = @{
        name = $prodName
        description = "Professional $prodName solution"
        sku = "PROD-" + (Get-Random -Minimum 10000 -Maximum 99999).ToString()
        price = (Get-Random -Minimum 1000 -Maximum 25000)
        category = "Software"
        organizationId = $orgId
        status = "active"
    }
    
    $productJson = $productData | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/products" -Method POST -Headers $headers -Body $productJson -UseBasicParsing
        $stats.products++
        Write-Host "  Success: $prodName" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: $prodName" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 4: Create Sales Opportunities
Write-Host "STEP 4: Creating Sales Opportunities (8)..." -ForegroundColor Cyan
for ($i = 1; $i -le 8; $i++) {
    $oppData = @{
        name = "Q$i Enterprise Deal"
        description = "Major enterprise opportunity Q$i"
        value = (Get-Random -Minimum 50000 -Maximum 500000)
        stage = "prospecting"
        probability = (Get-Random -Minimum 30 -Maximum 95)
        expectedCloseDate = (Get-Date).AddDays((Get-Random -Minimum 15 -Maximum 90)).ToString("yyyy-MM-dd")
        organizationId = $orgId
        source = "referral"
        owner = $userId
    }
    
    $oppJson = $oppData | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/crm/sales/opportunities" -Method POST -Headers $headers -Body $oppJson -UseBasicParsing
        $stats.opportunities++
        Write-Host "  Success: Opportunity $i" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Opportunity $i" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 5: Create Marketing Campaigns
Write-Host "STEP 5: Creating Marketing Campaigns (6)..." -ForegroundColor Cyan
$campaignTypes = @("email", "social", "webinar", "content", "event", "advertising")
foreach ($type in $campaignTypes) {
    $campaignData = @{
        name = "$type Campaign 2026"
        description = "Strategic $type marketing initiative"
        type = $type
        status = "active"
        startDate = (Get-Date).ToString("yyyy-MM-dd")
        endDate = (Get-Date).AddMonths(3).ToString("yyyy-MM-dd")
        budget = (Get-Random -Minimum 5000 -Maximum 50000)
        organizationId = $orgId
        targetAudience = "Enterprise customers"
    }
    
    $campaignJson = $campaignData | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/crm/marketing/campaigns" -Method POST -Headers $headers -Body $campaignJson -UseBasicParsing
        $stats.campaigns++
        Write-Host "  Success: $type Campaign" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: $type Campaign" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 6: Create Contracts
Write-Host "STEP 6: Creating Contracts (5)..." -ForegroundColor Cyan
$contractTypes = @("annual", "quarterly", "monthly", "multi-year", "perpetual")
foreach ($type in $contractTypes) {
    $contractData = @{
        name = "$type Service Agreement"
        description = "Professional services $type contract"
        type = $type
        value = (Get-Random -Minimum 25000 -Maximum 250000)
        startDate = (Get-Date).ToString("yyyy-MM-dd")
        endDate = (Get-Date).AddMonths(12).ToString("yyyy-MM-dd")
        status = "active"
        organizationId = $orgId
        terms = "Standard enterprise terms"
        autoRenew = $true
    }
    
    $contractJson = $contractData | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/contracts" -Method POST -Headers $headers -Body $contractJson -UseBasicParsing
        $stats.contracts++
        Write-Host "  Success: $type Contract" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: $type Contract" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 7: Create Catalogs
Write-Host "STEP 7: Creating Product Catalogs (4)..." -ForegroundColor Cyan
$catalogNames = @("Enterprise Solutions", "SMB Packages", "Add-on Services", "Hardware Equipment")
foreach ($catName in $catalogNames) {
    $catalogData = @{
        name = $catName
        description = "Comprehensive $catName catalog"
        type = "standard"
        status = "active"
        organizationId = $orgId
        visibility = "public"
    }
    
    $catalogJson = $catalogData | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/catalogs" -Method POST -Headers $headers -Body $catalogJson -UseBasicParsing
        $stats.catalogs++
        Write-Host "  Success: $catName" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: $catName" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 8: Create Inventory Items
Write-Host "STEP 8: Creating Inventory Items (12)..." -ForegroundColor Cyan
for ($i = 1; $i -le 12; $i++) {
    $inventoryData = @{
        name = "Inventory Item $i Hardware"
        description = "Physical inventory item $i"
        sku = "INV-$i-" + (Get-Random -Minimum 1000 -Maximum 9999).ToString()
        quantity = (Get-Random -Minimum 50 -Maximum 500)
        location = "Warehouse A"
        status = "in_stock"
        organizationId = $orgId
        reorderPoint = 20
        unitCost = (Get-Random -Minimum 10 -Maximum 1000)
    }
    
    $inventoryJson = $inventoryData | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/inventory/items" -Method POST -Headers $headers -Body $inventoryJson -UseBasicParsing
        $stats.inventory++
        Write-Host "  Success: Item $i" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Item $i" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 9: Create AR/VR Showrooms
Write-Host "STEP 9: Creating AR/VR Showrooms (5)..." -ForegroundColor Cyan
$showroomThemes = @("Modern Tech", "Industrial", "Luxury", "Minimalist", "Futuristic")
foreach ($theme in $showroomThemes) {
    $showroomData = @{
        name = "$theme Virtual Showroom"
        description = "$theme themed virtual experience"
        type = "vr"
        status = "active"
        capacity = (Get-Random -Minimum 50 -Maximum 200)
        organizationId = $orgId
    }
    
    $showroomJson = $showroomData | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/arvr/showrooms" -Method POST -Headers $headers -Body $showroomJson -UseBasicParsing
        $stats.showrooms++
        Write-Host "  Success: $theme Showroom" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: $theme Showroom" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 10: Create Activities
Write-Host "STEP 10: Creating Activities (10)..." -ForegroundColor Cyan
$activityTypes = @("call", "email", "meeting", "task", "note")
for ($i = 1; $i -le 10; $i++) {
    $type = $activityTypes[(Get-Random -Minimum 0 -Maximum $activityTypes.Length)]
    $activityData = @{
        type = $type
        subject = "Activity $i $type"
        description = "Details about $type activity $i"
        status = "completed"
        priority = "medium"
        dueDate = (Get-Date).AddDays((Get-Random -Minimum -10 -Maximum 30)).ToString("yyyy-MM-dd")
        organizationId = $orgId
        assignedTo = $userId
    }
    
    $activityJson = $activityData | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/activity" -Method POST -Headers $headers -Body $activityJson -UseBasicParsing
        $stats.activities++
        Write-Host "  Success: $type Activity $i" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: Activity $i" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 11: Create Documents
Write-Host "STEP 11: Creating Documents (8)..." -ForegroundColor Cyan
$docTypes = @("contract", "proposal", "invoice", "presentation", "report", "whitepaper", "case_study", "datasheet")
foreach ($docType in $docTypes) {
    $documentData = @{
        name = "$docType-2026"
        description = "Important $docType document"
        type = "pdf"
        category = $docType
        url = "https://docs.example.com/$docType.pdf"
        status = "active"
        organizationId = $orgId
        version = "1.0"
        size = (Get-Random -Minimum 100 -Maximum 5000)
    }
    
    $documentJson = $documentData | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/documents" -Method POST -Headers $headers -Body $documentJson -UseBasicParsing
        $stats.documents++
        Write-Host "  Success: $docType Document" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: $docType Document" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 12: Create Forms
Write-Host "STEP 12: Creating Forms (5)..." -ForegroundColor Cyan
$formTypes = @("Contact", "Lead Generation", "Survey", "Feedback", "Registration")
foreach ($formType in $formTypes) {
    $formData = @{
        name = "$formType Form"
        description = "$formType form for data collection"
        type = ($formType.ToLower() -replace ' ', '_')
        status = "active"
        organizationId = $orgId
        fields = @(
            @{name="name"; type="text"; required=$true; label="Full Name"},
            @{name="email"; type="email"; required=$true; label="Email Address"}
        )
    }
    
    $formJson = $formData | ConvertTo-Json -Depth 4
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/forms" -Method POST -Headers $headers -Body $formJson -UseBasicParsing
        $stats.forms++
        Write-Host "  Success: $formType Form" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: $formType Form" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 13: Create Email Templates
Write-Host "STEP 13: Creating Email Templates (6)..." -ForegroundColor Cyan
$templateTypes = @("Welcome", "Follow-up", "Promotion", "Newsletter", "Thank You", "Reminder")
foreach ($template in $templateTypes) {
    $templateData = @{
        name = "$template Email Template"
        subject = "$template Message"
        body = "Dear Customer, This is a $template email. Best regards, Team"
        type = "marketing"
        status = "active"
        organizationId = $orgId
        category = $template.ToLower()
    }
    
    $templateJson = $templateData | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/email/templates" -Method POST -Headers $headers -Body $templateJson -UseBasicParsing
        $stats.emailTemplates++
        Write-Host "  Success: $template Template" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: $template Template" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 14: Create Territories
Write-Host "STEP 14: Creating Territories (5)..." -ForegroundColor Cyan
$regions = @("North America", "Europe", "Asia Pacific", "Latin America", "Middle East Africa")
foreach ($region in $regions) {
    $territoryData = @{
        name = $region
        description = "$region sales territory"
        region = $region
        status = "active"
        organizationId = $orgId
        quota = (Get-Random -Minimum 500000 -Maximum 5000000)
    }
    
    $territoryJson = $territoryData | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/territories" -Method POST -Headers $headers -Body $territoryJson -UseBasicParsing
        $stats.territories++
        Write-Host "  Success: $region" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: $region" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 15: Create Sequences
Write-Host "STEP 15: Creating Sequences (4)..." -ForegroundColor Cyan
$sequenceNames = @("Onboarding", "Nurture", "Re-engagement", "Upsell")
foreach ($seq in $sequenceNames) {
    $sequenceData = @{
        name = "$seq Sequence"
        description = "Automated $seq sequence"
        type = "email"
        status = "active"
        organizationId = $orgId
        steps = @()
    }
    
    $sequenceJson = $sequenceData | ConvertTo-Json -Depth 4
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/sequences" -Method POST -Headers $headers -Body $sequenceJson -UseBasicParsing
        $stats.sequences++
        Write-Host "  Success: $seq Sequence" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: $seq Sequence" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 16: Create Subscription Plans
Write-Host "STEP 16: Creating Subscription Plans (4)..." -ForegroundColor Cyan
$plans = @(
    @{name="Basic"; price=99},
    @{name="Professional"; price=299},
    @{name="Enterprise"; price=999},
    @{name="Ultimate"; price=2499}
)

foreach ($plan in $plans) {
    $planData = @{
        name = "$($plan.name) Plan"
        description = "$($plan.name) tier subscription"
        price = $plan.price
        interval = "monthly"
        status = "active"
        organizationId = $orgId
        features = @("Feature 1", "Feature 2")
        trialDays = 14
    }
    
    $planJson = $planData | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/subscription-plans" -Method POST -Headers $headers -Body $planJson -UseBasicParsing
        $stats.plans++
        Write-Host "  Success: $($plan.name) Plan" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: $($plan.name) Plan" -ForegroundColor Yellow
    }
}
Write-Host ""

# Summary
Write-Host "=" * 130
Write-Host "DATABASE SEEDING COMPLETE!" -ForegroundColor Green
Write-Host "=" * 130
Write-Host ""
Write-Host "Organization: $orgName" -ForegroundColor Cyan
Write-Host "Admin Email: $adminEmail" -ForegroundColor Cyan
Write-Host "Password: Admin123!@#" -ForegroundColor Cyan
Write-Host "Org ID: $orgId" -ForegroundColor Cyan
Write-Host ""
Write-Host "Created Data Summary:" -ForegroundColor Yellow
Write-Host "  Customers: $($stats.customers)" -ForegroundColor White
Write-Host "  Products: $($stats.products)" -ForegroundColor White
Write-Host "  Opportunities: $($stats.opportunities)" -ForegroundColor White
Write-Host "  Campaigns: $($stats.campaigns)" -ForegroundColor White
Write-Host "  Contracts: $($stats.contracts)" -ForegroundColor White
Write-Host "  Catalogs: $($stats.catalogs)" -ForegroundColor White
Write-Host "  Inventory Items: $($stats.inventory)" -ForegroundColor White
Write-Host "  Showrooms: $($stats.showrooms)" -ForegroundColor White
Write-Host "  Activities: $($stats.activities)" -ForegroundColor White
Write-Host "  Documents: $($stats.documents)" -ForegroundColor White
Write-Host "  Forms: $($stats.forms)" -ForegroundColor White
Write-Host "  Email Templates: $($stats.emailTemplates)" -ForegroundColor White
Write-Host "  Territories: $($stats.territories)" -ForegroundColor White
Write-Host "  Sequences: $($stats.sequences)" -ForegroundColor White
Write-Host "  Subscription Plans: $($stats.plans)" -ForegroundColor White
Write-Host ""
Write-Host "Next: Run .\test-all-178-endpoints.ps1 to verify endpoints" -ForegroundColor Green
Write-Host ""
Write-Host "Token: $token" -ForegroundColor Gray
Write-Host ""
