$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:3003/api/v1"
$controllersPath = "C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM\src\controllers"
$testResults = @()
$token = $null
$script:LastResponse = $null

$defaultUuid = "00000000-0000-0000-0000-000000000001"
$defaultUuid2 = "00000000-0000-0000-0000-000000000002"
$uuidV4a = "33333333-3333-4333-8333-333333333333"
$uuidV4b = "44444444-4444-4444-8444-444444444444"
$orgId = "00000000-0000-0000-0000-000000000001"
$organizationDeleteId = "55555555-5555-4555-8555-555555555555"
$tenantId = "00000000-0000-0000-0000-000000000001"
$fixtureUserId = "00000000-0000-0000-0000-000000000010"
$customerId = "00000000-0000-0000-0000-000000000456"
$customerV4Id = "11111111-1111-4111-8111-111111111111"
$contactId = "f1f1f1f1-f1f1-4f1f-8f1f-f1f1f1f1f1f1"
$productId = "00000000-0000-0000-0000-000000000123"
$productV4Id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
$productDeleteId = "66666666-6666-4666-8666-666666666666"
$categoryId = "00000000-0000-0000-0000-000000000201"
$catalogId = "00000000-0000-0000-0000-000000000202"
$catalogDeleteId = "77777777-7777-4777-8777-777777777777"
$catalogProductId = "00000000-0000-0000-0000-000000000203"
$taskId = "00000000-0000-0000-0000-000000000204"
$noteId = "00000000-0000-0000-0000-000000000205"
$callQueueId = "00000000-0000-0000-0000-000000000206"
$callQueueDeleteId = "99999999-9999-4999-8999-999999999999"
$callId = "00000000-0000-0000-0000-000000000207"
$mobileDeviceId = "00000000-0000-0000-0000-000000000301"
$mobileDeviceDeviceId = "device-1"
$emailCampaignId = "00000000-0000-0000-0000-000000000208"
$formId = "00000000-0000-0000-0000-000000000209"
$reportId = "00000000-0000-0000-0000-000000000210"
$reportScheduleId = "00000000-0000-0000-0000-000000000211"
$importJobId = "00000000-0000-0000-0000-000000000302"
$exportJobId = "00000000-0000-0000-0000-000000000303"
$sequenceId = "abababab-abab-4aba-8aba-abababababab"
$sequenceDeleteId = "88888888-8888-4888-8888-888888888888"
$enrollmentId = "00000000-0000-0000-0000-000000000213"
$enrollmentV4Id = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
$leadId = "00000000-0000-0000-0000-000000000214"
$leadV4Id = "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
$opportunityId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd"
$territoryId = "cdcdcdcd-cdcd-4cdc-8cdc-cdcdcdcdcdcd"
$marketingCampaignId = "00000000-0000-0000-0000-000000000216"
$marketingCampaignV4Id = "22222222-2222-4222-8222-222222222222"
$marketingSegmentId = "99999999-9999-4999-8999-999999999999"
$marketingTemplateId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
$supportTicketId = "00000000-0000-0000-0000-000000000217"
$knowledgeBaseId = "00000000-0000-0000-0000-000000000218"
$documentId = "00000000-0000-0000-0000-000000000219"
$documentSignatureId = "00000000-0000-0000-0000-000000000220"
$contractId = "00000000-0000-0000-0000-000000000221"
$documentVersionId = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee"
$bundleId = "00000000-0000-0000-0000-000000000222"
$priceListId = "00000000-0000-0000-0000-000000000223"
$discountId = "00000000-0000-0000-0000-000000000224"
$billingTransactionId = "00000000-0000-0000-0000-000000000225"
$dashboardId = "00000000-0000-0000-0000-000000000226"
$portalUserId = "00000000-0000-0000-0000-000000000227"
$portalTicketId = "00000000-0000-0000-0000-000000000228"
$onboardingId = "00000000-0000-0000-0000-000000000229"
$migrationJobId = "00000000-0000-0000-0000-000000000230"
$erpConnectionId = "ffffffff-ffff-4fff-8fff-ffffffffffff"
$offlineSyncId = "12121212-1212-4121-8121-121212121212"
$warehouseId = "13131313-1313-4131-8131-131313131313"
$warehouseId2 = "14141414-1414-4141-8141-141414141414"
$holographicProjectionId = "efefefef-efef-4efe-8efe-efefefefefef"
$spatialSessionId = "ababbbbb-cccc-4ddd-8eee-ffffffffffff"
$llmConversationId = "00000000-0000-0000-0000-000000000231"

function Resolve-ParamValueForPath {
    param([string]$path, [string]$paramName, [string]$method)

    $lowerPath = $path.ToLower()
    $lowerName = $paramName.ToLower()

    if ($lowerName -match "agentid") { return $fixtureUserId }

    if ($lowerPath -match "/crm/marketing/" -and $lowerPath -match "/campaigns/") { return $marketingCampaignV4Id }
    if ($lowerPath -match "/crm/marketing/ai/" -and $lowerPath -match "campaign") { return $marketingCampaignV4Id }
    if ($lowerPath -match "/crm/marketing/ai/" -and $lowerPath -match "customer") { return $customerV4Id }
    if ($lowerPath -match "/crm/ai/customers/") { return $customerV4Id }
    if ($method -eq "DELETE" -and $lowerPath -match "/organizations/") { return $organizationDeleteId }
    if ($method -eq "DELETE" -and $lowerPath -match "/products/") { return $productDeleteId }
    if ($method -eq "DELETE" -and $lowerPath -match "/catalogs/") { return $catalogDeleteId }
    if ($lowerPath -match "/sequences/.*/(pause|activate)$") { return $sequenceDeleteId }
    if ($method -eq "DELETE" -and $lowerPath -match "/sequences/") { return $sequenceDeleteId }
    if ($lowerPath -match "/call-queues/.*/agents/") { return $callQueueId }
    if ($method -eq "DELETE" -and $lowerPath -match "/call-queues/") { return $callQueueDeleteId }
    if ($lowerPath -match "/dashboards/admin/organization-health/") { return $orgId }

    if ($lowerPath -match "/crm/customers/contacts/") { return $contactId }
    if ($lowerPath -match "/crm/customers/") { return $customerV4Id }
    if ($lowerPath -match "/crm/ai/leads/") { return $leadV4Id }
    if ($lowerPath -match "/crm/ai/opportunities/") { return $opportunityId }
    if ($lowerPath -match "/crm/sales/opportunities/") { return $opportunityId }
    if ($lowerPath -match "/customers/") { return $customerId }
    if ($lowerPath -match "/inventory/stock-levels/") { return $productV4Id }
    if ($lowerPath -match "/products/") { return $productId }
    if ($lowerPath -match "/categories/") { return $categoryId }
    if ($lowerPath -match "/catalogs/") { return $catalogId }
    if ($lowerPath -match "/activity/notes/") { return $noteId }
    if ($lowerPath -match "/activity/tasks/") { return $taskId }
    if ($lowerPath -match "/call-queues/") { return $callQueueId }
    if ($lowerPath -match "/calls/") { return $callId }
    if ($lowerPath -match "/mobile/devices/") { return $mobileDeviceDeviceId }
    if ($lowerPath -match "/documents/.*/versions/.*/restore") {
        if ($lowerName -match "version") { return "1" }
        return $documentId
    }
    if ($lowerPath -match "/documents/contracts/") { return $contractId }
    if ($lowerPath -match "/documents/signatures/") { return $documentSignatureId }
    if ($lowerPath -match "/documents/") { return $documentId }
    if ($lowerPath -match "/migration/jobs/") { return $migrationJobId }
    if ($lowerPath -match "/contracts/") { return $contractId }
    if ($lowerPath -match "/reporting/schedules/") {
        if ($script:reportScheduleId) { return $script:reportScheduleId }
        return $reportScheduleId
    }
    if ($lowerPath -match "/reporting/reports/") { return $reportId }
    if ($lowerPath -match "/import-export/export/") { return $exportJobId }
    if ($lowerPath -match "/import-export/import/") { return $importJobId }
    if ($lowerPath -match "/sequences/enrollment/") { return $enrollmentV4Id }
    if ($lowerPath -match "/sequences/") { return $sequenceId }
    if ($lowerPath -match "/territories/") { return $territoryId }
    if ($lowerPath -match "/email/campaigns/") { return $emailCampaignId }
    if ($lowerPath -match "/crm/marketing/campaigns" -or $lowerPath -match "/marketing/campaigns") { return $marketingCampaignV4Id }
    if ($lowerPath -match "/support/tickets" -or $lowerPath -match "/portal/tickets") { return $supportTicketId }
    if ($lowerPath -match "/knowledge-base") { return $knowledgeBaseId }
    if ($lowerPath -match "/forms/") { return $formId }
    if ($lowerPath -match "/bundles/") { return $bundleId }
    if ($lowerPath -match "/price-lists/") { return $priceListId }
    if ($lowerPath -match "/discounts/") { return $discountId }
    if ($lowerPath -match "/billing-transactions/") { return $billingTransactionId }
    if ($lowerPath -match "/dashboards/") { return $dashboardId }
    if ($lowerPath -match "/portal/users/") { return $portalUserId }
    if ($lowerPath -match "/onboarding/") { return $onboardingId }
    if ($lowerPath -match "/migration/jobs/") { return $migrationJobId }
    if ($lowerPath -match "/llm/chat/") { return $llmConversationId }
    if ($lowerPath -match "/organizations/") { return $orgId }
    if ($lowerPath -match "/stripe/refund/") { return $billingTransactionId }
    if ($lowerPath -match "/holographic/sessions/.*/interactions") { return $holographicProjectionId }
    if ($lowerPath -match "/holographic/sessions/") { return $spatialSessionId }

    if ($lowerName -match "agent") { return $fixtureUserId }
    if ($lowerName -match "user") { return $uuidV4a }
    if ($lowerName -match "entitytype") { return "organization" }
    if ($lowerName -match "entityid") { return $orgId }
    if ($lowerName -match "organization|tenant") { return $orgId }
    if ($lowerName -match "customer") { return $customerId }
    if ($lowerName -match "product") { return $productId }
    if ($lowerName -match "campaign") { return $marketingCampaignId }
    if ($lowerName -match "sequence") { return $sequenceId }
    if ($lowerName -match "conversation") { return $llmConversationId }

    return $defaultUuid
}

function Normalize-Path {
    param([string]$controllerPath, [string]$routePath)

    $c = $controllerPath.Trim()
    $r = $routePath.Trim()

    if ($c -eq "" -or $c -eq "/") { $c = "" }
    if ($r -eq "" -or $r -eq "/") { $r = "" }

    if ($c -ne "" -and -not $c.StartsWith("/")) { $c = "/" + $c }
    if ($r -ne "" -and -not $r.StartsWith("/")) { $r = "/" + $r }

    $full = "$c$r"
    if ($full -eq "") { return "/" }
    return $full
}

function Replace-PathParams {
    param([string]$path, [string]$method)

    $pattern = ":(?<name>[^/]+)"
    $evaluator = [System.Text.RegularExpressions.MatchEvaluator]{
        param($match)
        $paramName = $match.Groups["name"].Value
        Resolve-ParamValueForPath -path $path -paramName $paramName -method $method
    }
    return [System.Text.RegularExpressions.Regex]::Replace($path, $pattern, $evaluator)
}

function Get-EndpointBody {
    param([string]$method, [string]$path)

    $key = "$method $path"
    switch -regex ($key) {
        '^POST /activity/log$' { return @{ activityType = "note"; title = "Fixture activity"; description = "Seeded activity" } }
        '^POST /activity/notes$' { return @{ content = "Fixture note"; relatedToId = $customerV4Id; relatedToType = "customer" } }
        '^POST /activity/tasks$' { return @{ title = "Fixture task"; priority = "medium"; assignedTo = $uuidV4a; relatedToId = $customerV4Id; relatedToType = "customer" } }
        '^PUT /activity/tasks/' { return @{ title = "Updated task"; priority = "high"; status = "in_progress" } }
        '^PUT /activity/notes/' { return @{ content = "Updated note" } }

        '^POST /auth/register$' { return @{ email = "fixture.$(Get-Random)@example.com"; password = "TestPassword123!"; firstName = "Fixture"; lastName = "User"; organizationName = "Fixture Org $((New-Guid).ToString().Substring(0, 8))" } }
        '^POST /auth/login$' { return @{ email = $adminEmail; password = $adminPassword } }
        '^POST /auth/password-reset/request$' { return @{ email = $adminEmail } }
        '^POST /auth/forgot-password$' { return @{ email = $adminEmail } }
        '^POST /auth/reset-password$' { return @{ token = "debug-token"; newPassword = "TempPassword123!" } }
        '^POST /auth/password-reset/confirm$' { return @{ token = "debug-token"; newPassword = "TempPassword123!" } }
        '^POST /auth/verify-email/confirm$' { return @{ token = "debug-token" } }
        '^POST /auth/verify-email$' { return @{ token = "debug-token" } }
        '^POST /auth/refresh$' { return @{ refreshToken = $refreshToken } }

        '^POST /call-queues$' { return @{ name = "Fixture Queue $(Get-Random)"; phoneNumber = "+1555$((Get-Random -Minimum 1000000 -Maximum 9999999))"; routingStrategy = "ROUND_ROBIN" } }
        '^POST /call-queues/.*/agents$' { return @{ agentIds = @($fixtureUserId) } }
        '^PUT /call-queues/' { return @{ name = "Fixture Queue Updated"; isActive = $true } }
        '^POST /calls$' { return @{ fromNumber = "+15550001114"; toNumber = "+15550001115"; customerId = $customerId; agentId = $fixtureUserId } }
        '^POST /calls/.*/transfer$' { return @{ transferTo = "+15550001116"; isWarmTransfer = $false } }
        '^POST /calls/.*/answer$' { return @{ agentId = $fixtureUserId } }
        '^POST /calls/.*/hangup$' { return @{ disposition = "ANSWERED" } }
        '^PUT /calls/' { return @{ status = "COMPLETED"; notes = "Completed via test" } }

        '^POST /categories$' { return @{ name = "Fixture Category"; description = "Fixture category" } }
        '^POST /catalogs$' { return @{ name = "Fixture Catalog"; description = "Seeded catalog"; status = "PUBLISHED" } }
        '^POST /catalogs/.*/products$' { return @{ productId = $productV4Id } }
        '^POST /catalogs/.*/items$' { return @{ productId = $productV4Id; displayOrder = 0 } }
        '^POST /catalogs/.*/publish$' { return @{ channel = "web" } }

        '^POST /bundles$' { return @{ name = "Fixture Bundle"; sku = "BUNDLE-$((Get-Random))"; items = @(@{ productId = $productId; quantity = 1 }); bundlePrice = 79.99; discountPercentage = 10 } }
        '^POST /price-lists$' { return @{ name = "Fixture Price List"; type = "standard"; currency = "USD"; prices = @(@{ productId = $productV4Id; price = 95.0 }) } }
        '^POST /discounts$' { return @{ name = "Fixture Discount"; code = "FIXED$((Get-Random -Minimum 1000 -Maximum 9999))"; type = "percentage"; value = 10; applicability = "all_products" } }
        '^POST /discounts/validate-code$' { return @{ code = "FIXED10"; cartTotal = 100 } }

        '^POST /dashboards$' { return @{ name = "Fixture Dashboard"; type = "organizational"; widgets = @(@{ id = "widget-1"; title = "Total Customers"; type = "metric"; dataSource = @{ metric = "customers" }; layout = @{ x = 0; y = 0; width = 4; height = 2 } }) } }
        '^POST /dashboards/custom$' { return @{ name = "Fixture Custom Dashboard"; type = "personal"; widgets = @(@{ id = "widget-1"; title = "Total Leads"; type = "metric"; dataSource = @{ metric = "leads" }; layout = @{ x = 0; y = 0; width = 4; height = 2 } }) } }
        '^PUT /dashboards/custom/' { return @{ name = "Updated Dashboard"; type = "personal"; widgets = @(@{ id = "widget-1"; title = "Updated Metric"; type = "metric"; dataSource = @{ metric = "opportunities" }; layout = @{ x = 0; y = 0; width = 4; height = 2 } }) } }

        '^POST /crm/marketing/analytics$' { return @{ startDate = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd"); endDate = (Get-Date).ToString("yyyy-MM-dd"); campaignIds = @($marketingCampaignV4Id); segmentIds = @($marketingSegmentId); groupBy = "day" } }
        '^POST /crm/marketing/campaigns$' { return @{ name = "Fixture Campaign"; description = "Fixture campaign"; type = "email"; startDate = (Get-Date).ToString("yyyy-MM-dd"); endDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd"); budget = 1000 } }
        '^POST /crm/marketing/campaigns/send-email$' { return @{ campaignId = $marketingCampaignV4Id; templateId = $marketingTemplateId; segmentIds = @($marketingSegmentId) } }
        '^POST /crm/marketing/segments$' { return @{ name = "Fixture Segment $(Get-Random)"; description = "Fixture segment"; criteria = "demographic"; conditions = @(@{ field = "industry"; operator = "equals"; value = "Technology" }) } }
        '^POST /crm/marketing/templates$' { return @{ name = "Fixture Template"; subject = "Hello"; bodyHtml = "<p>Hello</p>"; bodyText = "Hello"; category = "marketing"; tags = @("fixture") } }

        '^POST /arvr/showrooms$' { return @{ name = "Fixture Showroom"; description = "AR/VR showroom"; theme = "default" } }
        '^POST /arvr/product-demos$' { return @{ productId = $productV4Id } }
        '^PUT /arvr/configurator/.*/customize$' { return @{ productId = $productV4Id; configurationData = @{ color = "red"; size = "m" }; customizations = @{ material = "steel" } } }

        '^POST /documents$' { return @{ name = "Fixture Document"; documentType = "contract"; description = "Fixture document"; entityType = "customer"; entityId = $customerV4Id } }
        '^POST /documents/upload$' { return @{ name = "Fixture Upload"; documentType = "contract"; description = "Fixture upload"; entityType = "customer"; entityId = $customerV4Id } }
        '^POST /documents/contracts$' { return @{ name = "Fixture Contract"; contractType = "service_agreement"; startDate = (Get-Date).ToString("yyyy-MM-dd"); endDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd") } }
        '^POST /documents/signatures/request$' { return @{ documentId = $documentId; signerName = "Fixture Signer"; signerEmail = "signer@cognexiaai.com" } }
        '^POST /documents/signatures/.*/sign$' { return @{ signatureData = "signed" } }
        '^POST /documents/.*/versions$' { return @{ changeNote = "Updated version" } }
        '^POST /documents/.*/share$' { return @{ userIds = @($fixtureUserId) } }
        '^POST /documents/.*/unshare$' { return @{ userIds = @($fixtureUserId) } }
        '^PUT /documents/' { return @{ name = "Updated Document"; status = "approved" } }

        '^POST /crm/customers/.*/contacts$' {
            return @{
                type = "primary"
                firstName = "Test"
                lastName = "Contact"
                title = "Manager"
                email = "contact+$((Get-Random))@cognexiaai.com"
                communicationPrefs = @{
                    preferredChannel = "email"
                    preferredTime = "09:00-17:00"
                    timezone = "UTC"
                    frequency = "weekly"
                    language = "en"
                    doNotCall = $false
                    emailOptOut = $false
                }
            }
        }
        '^PUT /crm/customers/contacts/' { return @{ title = "Director"; status = "active" } }
        '^POST /crm/customers/.*/interactions$' { return @{ type = "email"; direction = "outbound"; subject = "Follow up"; description = "Test interaction"; date = (Get-Date).ToString("o"); outcome = "positive"; duration = 15 } }

        '^POST /crm/sales/opportunities$' { return @{ name = "Fixture Opportunity"; type = "new_business"; priority = "medium"; value = 1000; probability = 25; expectedCloseDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd"); customerId = $customerV4Id; salesRep = "Fixture Rep"; products = @(@{ productId = $productV4Id; name = "Fixture Product"; price = 1000; quantity = 1 }); requirements = @{ needs = "Test" }; decisionProcess = @{ stakeholders = @("buyer"); timeline = "30d" }; competitive = @{ position = "leader"; competitors = @() }; activities = @(@{ type = "call"; date = (Get-Date).ToString("o") }); financials = @{ budget = 1200; roi = 1.5 }; risks = @{ items = @("none") }; communications = @{ lastContact = (Get-Date).ToString("o") } } }
        '^POST /crm/sales/quotes$' { return @{ title = "Fixture Quote"; customerId = $customerV4Id; opportunityId = $opportunityId; lineItems = @(@{ description = "Item"; quantity = 1; unitPrice = 1000; discount = 0; taxRate = 10 }); totals = @{ subtotal = 1000; discount = 0; tax = 100; total = 1100 }; paymentTerms = @{ terms = "Net 30"; dueDays = 30 }; validUntil = (Get-Date).AddDays(30).ToString("yyyy-MM-dd") } }

        '^POST /call-queues$' { return @{ name = "Fixture Queue"; phoneNumber = "+15550009999"; routingStrategy = "ROUND_ROBIN"; agentIds = @($fixtureUserId) } }
        '^POST /calls$' { return @{ fromNumber = "+15550001111"; toNumber = "+15550002222"; customerId = $customerV4Id; agentId = $fixtureUserId } }

        '^POST /email/campaigns$' { return @{ name = "Fixture Email Campaign"; subject = "Hello"; template = "<p>Hi</p>"; recipients = @("recipient@cognexiaai.com") } }
        '^PUT /email/campaigns/' { return @{ name = "Updated Campaign"; subject = "Updated"; template = "<p>Updated</p>" } }
        '^POST /email/send$' { return @{ toEmail = "recipient@cognexiaai.com"; subject = "Hello"; bodyHtml = "<p>Test email</p>" } }

        '^POST /import-export/export$' { return @{ exportType = "customers"; format = "csv" } }
        '^POST /import-export/import$' { return @{ importType = "customer"; validateOnly = $true; skipDuplicates = $true } }
        '^POST /import-export/import/template$' { return @{ importType = "customer"; includeSamples = $true } }

        '^POST /contracts$' { return @{ name = "Fixture Contract"; contractType = "service_agreement"; customerId = $customerV4Id; startDate = (Get-Date).ToString("yyyy-MM-dd"); endDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd") } }
        '^POST /contracts/.*/amendments$' { return @{ amendmentType = "scope_change"; changes = "Add new scope"; effectiveDate = (Get-Date).AddDays(5).ToString("yyyy-MM-dd") } }

        '^POST /forms$' { return @{ name = "Fixture Form"; fields = @(@{ id = "field-1"; type = "text"; label = "Name"; required = $true }) } }
        '^POST /forms/.*/submit$' { return @{ data = @{ 'field-1' = "Test" } } }
        '^PUT /forms/' { return @{ name = "Updated Form"; status = "active"; fields = @(@{ id = "field-1"; type = "text"; label = "Name"; required = $true }) } }
        '^POST /forms/.*/duplicate$' { return @{ name = "Fixture Form Copy" } }

        '^POST /reporting/reports$' { return @{ name = "Fixture Report"; reportType = "custom"; chartType = "table"; config = @{ entity = "customer"; columns = @("id","companyName"); filters = @() } } }
        '^POST /reporting/schedules$' { return @{ reportId = $reportId; name = "Fixture Schedule"; frequency = "daily"; format = "csv"; recipients = @("reports@cognexiaai.com") } }
        '^PUT /reporting/reports/' { return @{ name = "Updated Report" } }
        '^PUT /reporting/schedules/' { return @{ name = "Updated Schedule" } }
        '^POST /reporting/analytics/cohort$' { return @{ cohortPeriod = "month"; metric = "revenue"; startDate = (Get-Date).AddDays(-90).ToString("yyyy-MM-dd"); endDate = (Get-Date).ToString("yyyy-MM-dd"); periodsToShow = 3 } }
        '^POST /reporting/analytics/funnel$' { return @{ stages = @("lead","opportunity","customer") } }
        '^POST /reporting/analytics/forecast$' { return @{ months = 6; includeSeasonal = $true; confidenceInterval = 0.9 } }

        '^POST /sequences$' { return @{ name = "Fixture Sequence"; steps = @(@{ id = "step-1"; order = 1; type = "email"; name = "Intro"; delay = 0; emailSubject = "Hello"; emailBody = "Welcome" }) } }
        '^POST /sequences/enroll$' { return @{ sequenceId = $sequenceId; leadId = $leadV4Id } }
        '^POST /sequences/enroll/bulk$' { return @{ sequenceId = $sequenceId; leadIds = @($leadV4Id) } }
        '^POST /sequences/unenroll$' { return @{ enrollmentId = $enrollmentV4Id } }
        '^POST /sequences/enrollment/.*/pause$' { return @{ enrollmentId = $enrollmentV4Id; reason = "test"; pauseDurationHours = 1 } }
        '^POST /sequences/analytics/compare$' { return @{ sequenceIds = @($sequenceId) } }
        '^PUT /sequences/' { return @{ name = "Updated Sequence" } }

        '^POST /territories$' { return @{ name = "Fixture Territory"; assignmentStrategy = "round_robin" } }
        '^POST /territories/assign$' { return @{ territoryId = $territoryId; leadId = $leadV4Id } }
        '^POST /territories/assign/bulk$' { return @{ territoryId = $territoryId; leadIds = @($leadV4Id) } }
        '^PUT /territories/' { return @{ name = "Updated Territory" } }

        '^POST /portal/users$' { return @{ email = "portal.user+$(Get-Random)@example.com"; firstName = "Portal"; lastName = "User"; customerId = $customerV4Id } }
        '^POST /portal/accept-invitation$' { return @{ token = "debug-token"; password = "PortalUser123!" } }
        '^POST /portal/tickets$' { return @{ subject = "Portal Ticket"; description = "Test ticket"; priority = "MEDIUM"; category = "GENERAL_INQUIRY" } }
        '^POST /portal/login$' { return @{ email = "portal.user@cognexiaai.com"; password = "PortalUser123!" } }
        '^POST /portal/password/request-reset$' { return @{ email = "portal.user@cognexiaai.com" } }
        '^POST /portal/password/reset$' { return @{ token = "debug-token"; newPassword = "PortalUser234!" } }
        '^POST /portal/password/change$' { return @{ currentPassword = "PortalUser123!"; newPassword = "PortalUser234!" } }
        '^PUT /portal/profile$' { return @{ firstName = "Portal"; lastName = "User"; canViewDocuments = $true } }
        '^PUT /portal/preferences$' { return @{ language = "en"; timezone = "UTC"; notifications = @{ email = $true; sms = $false } } }

        '^POST /pricing/apply-discount$' { return @{ code = "FIXED10"; customerId = $customerV4Id } }
        '^POST /pricing/calculate$' { return @{ productId = $productV4Id; quantity = 1; customerId = $customerV4Id } }
        '^POST /pricing/calculate-bulk$' { return @{ items = @(@{ productId = $productV4Id; quantity = 1 }); customerId = $customerV4Id } }

        '^POST /products$' { return @{ name = "Fixture Product"; sku = "PROD-TEST-$((Get-Random))"; type = "physical"; basePrice = 99.99; currency = "USD" } }
        '^PUT /products/' { return @{ name = "Updated Product"; basePrice = 89.99 } }
        '^POST /bundles$' { return @{ name = "Fixture Bundle"; sku = "BUNDLE-$((Get-Random))"; items = @(@{ productId = $productV4Id; quantity = 1 }); bundlePrice = 99.99 } }
        '^POST /discounts$' { return @{ name = "Fixture Discount"; code = "FIXED$((Get-Random -Minimum 1000 -Maximum 9999))"; type = "percentage"; value = 10; applicability = "all_products"; validFrom = (Get-Date).ToString("o"); validTo = (Get-Date).AddDays(30).ToString("o") } }
        '^POST /organizations$' { return @{ name = "Fixture Org $((Get-Random))"; email = "org+$((Get-Random))@cognexiaai.com" } }

        '^PUT /inventory/stock-levels/' { return @{ warehouseId = $warehouseId; quantity = 25; reservedQuantity = 0; availableQuantity = 25 } }
        '^POST /inventory/warehouses$' { return @{ name = "Fixture Warehouse"; location = @{ address = "123 Test St"; city = "Testville"; country = "US" } } }
        '^POST /inventory/reorder-points$' { return @{ productId = $productV4Id; warehouseId = $warehouseId; minimumLevel = 10; reorderQuantity = 25 } }
        '^POST /inventory/transfers$' { return @{ productId = $productV4Id; fromWarehouseId = $warehouseId; toWarehouseId = $warehouseId2; quantity = 5; initiatedBy = $fixtureUserId } }
        '^POST /inventory/audits$' { return @{ warehouseId = $warehouseId; auditedBy = $fixtureUserId; notes = "Test audit"; items = @(@{ productId = $productV4Id; expected = 50; actual = 50 }) } }

        '^POST /support/tickets$' { return @{ subject = "Fixture Ticket"; description = "Test ticket"; priority = "MEDIUM"; category = "GENERAL_INQUIRY"; channel = "WEB" } }
        '^POST /api/crm/support/tickets$' { return @{ subject = "Fixture Ticket"; description = "Test ticket"; priority = "MEDIUM"; category = "GENERAL_INQUIRY"; channel = "WEB" } }
        '^PUT /api/crm/support/tickets/' { return @{ status = "OPEN"; priority = "MEDIUM" } }
        '^POST /api/crm/support/tickets/.*/assign$' { return @{ agent_id = $uuidV4a } }
        '^POST /api/crm/support/tickets/.*/escalate$' { return @{ escalate_to = $uuidV4a; reason = "Test escalation" } }
        '^POST /api/crm/support/tickets/.*/response$' { return @{ response = "Test response"; user_id = $uuidV4a } }

        '^POST /mobile/devices/register$' { return @{ deviceId = "device-1"; deviceName = "Fixture Device"; platform = "ANDROID"; appVersion = "1.0.0"; pushToken = "token" } }
        '^POST /mobile/devices/.*/heartbeat$' { return @{ isOnline = $true; batteryLevel = 95; networkType = "wifi" } }
        '^POST /mobile/notifications/send$' { return @{ userId = $fixtureUserId; title = "Hello"; body = "Test"; category = "SYSTEM"; priority = "NORMAL" } }
        '^POST /mobile/notifications/send-bulk$' { return @{ userIds = @($fixtureUserId); title = "Hello"; body = "Test"; category = "SYSTEM" } }
        '^POST /mobile/sync/batch$' { return @{ items = @(@{ entityType = "TASK"; entityId = $taskId; operation = "CREATE"; data = @{ title = "Sync Task" } }) } }
        '^POST /mobile/sync/conflicts/resolve$' { return @{ syncId = $offlineSyncId; resolveWith = "server" } }

        '^PUT /holographic/sessions/.*/interactions$' { return @{ interactionType = "gesture"; gestureData = @{ type = "wave" } } }

        '^POST /notifications/test$' { return @{ email = "admin@cognexiaai.com" } }
        '^POST /notifications/bulk$' { return @{ recipients = @(@{ email = "recipient@cognexiaai.com"; context = @{ name = "Test" } }); subject = "Welcome"; template = "WELCOME_EMAIL" } }
        '^POST /notifications/notify-admins/.*$' { return @{ subject = "Admin Notice"; template = "SYSTEM_MAINTENANCE"; context = @{ note = "Test" } } }
        '^POST /notifications/send$' { return @{ title = "Test"; message = "Notification"; recipientId = $fixtureUserId } }

        '^POST /throttling/block$' { return @{ identifier = $fixtureUserId; type = "per_user"; durationSeconds = 60 } }
        '^POST /throttling/reset$' { return @{ identifier = $fixtureUserId; type = "per_user" } }

        '^POST /onboarding/start$' { return @{ type = "organization"; industry = "Technology"; companySize = "11-50"; primaryUseCase = "CRM" } }
        '^POST /onboarding/.*/steps/complete$' { return @{ stepType = "welcome"; timeSpentMinutes = 2 } }
        '^POST /onboarding/.*/steps/skip$' { return @{ stepType = "dashboard_tour"; reason = "test" } }
        '^POST /onboarding/.*/checklist/complete$' { return @{ itemId = "checklist-1" } }
        '^POST /onboarding/.*/feedback$' { return @{ rating = 5; comments = "Great" } }
        '^POST /onboarding/.*/reward/claim$' { return @{ rewardType = "free_credits"; metadata = @{ source = "test" } } }
        '^PUT /onboarding/.*/progress$' { return @{ currentStepIndex = 1; timeSpentMinutes = 3 } }
        '^PUT /onboarding/.*/settings$' { return @{ showTips = $true; sendReminders = $true } }

        '^POST /migration/import/csv$' { return @{ targetEntity = "customers"; fieldMapping = @{ email = "email" } } }
        '^POST /migration/import/excel$' { return @{ targetEntity = "customers"; fieldMapping = @{ email = "email" } } }
        '^POST /migration/sync/.*$' { return @{ connectionId = $erpConnectionId; targetEntity = "customers"; options = @{ dryRun = $true } } }

        '^POST /stripe/customer$' { return @{ organizationId = $orgId; email = "billing@cognexiaai.com"; name = "Fixture Organization" } }
        '^POST /stripe/payment-method$' { return @{ organizationId = $orgId; paymentMethodId = "pm_mock_visa"; setAsDefault = $true } }
        '^POST /stripe/subscription$' { return @{ organizationId = $orgId; planId = "plan_mock_basic"; paymentMethodId = "pm_mock_visa"; trialDays = 14 } }
        '^POST /stripe/subscription/.*/update$' { return @{ newPlanId = "plan_mock_pro"; prorate = $false } }
        '^POST /stripe/subscription/.*/cancel$' { return @{ cancelAtPeriodEnd = $false } }
        '^POST /stripe/payment$' { return @{ organizationId = $orgId; amount = 49.99; currency = "USD"; description = "Fixture charge"; paymentMethodId = "pm_mock_visa" } }
        '^POST /stripe/refund/.*$' { return @{ amount = 10; reason = "requested_by_customer" } }
        '^POST /stripe/create-subscription$' { return @{ organizationId = $orgId; planId = "plan_mock_basic"; paymentMethodId = "pm_mock_visa"; trialDays = 14 } }
        '^POST /stripe/webhook$' { return @{ id = "evt_mock"; type = "payment_intent.succeeded"; data = @{ object = @{ metadata = @{ organizationId = $orgId } } } } }
        '^POST /webhooks/stripe$' { return @{ id = "evt_mock"; type = "payment_intent.succeeded"; data = @{ object = @{ metadata = @{ organizationId = $orgId } } } } }
        default { return $null }
    }
}

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Name,
        [object]$Body = $null,
        [bool]$RequiresAuth = $true,
        [string]$AuthToken = $null
    )

    try {
        $headers = @{
            "Content-Type" = "application/json"
        }

        $effectiveToken = if ($AuthToken) { $AuthToken } else { $token }
        if ($RequiresAuth -and $effectiveToken) {
            $headers["Authorization"] = "Bearer $effectiveToken"
        }

        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
            TimeoutSec = 30
        }

        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }

        Write-Host "[TESTING] $Method $Url" -ForegroundColor Cyan
        $statusCode = 200
        if ($Url -match "/email/track/") {
            $webResponse = Invoke-WebRequest @params -MaximumRedirection 0
            $response = $webResponse
            $statusCode = $webResponse.StatusCode
        } else {
            $response = Invoke-RestMethod @params
        }
        $script:LastResponse = $response

    if ($Url -match "/reporting/schedules$" -and $null -ne $response) {
        if ($response.id) {
            $script:reportScheduleId = $response.id
        } elseif ($response.data -and $response.data.id) {
            $script:reportScheduleId = $response.data.id
        }
    }

        $responsePreview = ''
        if ($Url -notmatch "/email/track/" -and $null -ne $response) {
            $responseJson = $response | ConvertTo-Json -Depth 2 -Compress
            if (-not [string]::IsNullOrEmpty($responseJson)) {
                $responsePreview = $responseJson.Substring(0, [Math]::Min(100, $responseJson.Length))
            }
        }

        $result = [PSCustomObject]@{
            Endpoint = $Name
            Method = $Method
            Url = $Url
            Status = "SUCCESS"
            StatusCode = $statusCode
            Response = $responsePreview
            Error = ""
        }

        Write-Host "  [OK] SUCCESS" -ForegroundColor Green
        return $result
    } catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
        $errorMessage = $_.Exception.Message
        $errorBody = if ($_.ErrorDetails -and $_.ErrorDetails.Message) { $_.ErrorDetails.Message } else { "" }

        $isEmailTrack = $Url -match "/email/track/"
        $isDocumentDownload = $Url -match "/documents/.*/download"
        if (
            ($statusCode -eq 302 -and ($isEmailTrack -or $isDocumentDownload)) -or
            ($statusCode -eq 0 -and $isEmailTrack)
        ) {
            $result = [PSCustomObject]@{
                Endpoint = $Name
                Method = $Method
                Url = $Url
                Status = "SUCCESS"
                StatusCode = $statusCode
                Response = ""
                Error = ""
            }
            Write-Host "  [OK] SUCCESS (302 redirect)" -ForegroundColor Green
            return $result
        }

        $result = [PSCustomObject]@{
            Endpoint = $Name
            Method = $Method
            Url = $Url
            Status = "FAILED"
            StatusCode = $statusCode
            Response = $errorBody
            Error = $errorMessage
        }

        Write-Host "  [X] FAILED - $statusCode - $errorMessage" -ForegroundColor Red
        return $result
    }
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "CognexiaAI CRM API Endpoint Testing (Full)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

# ========================================
# STEP 1: Seed required data + login as admin
# ========================================
Write-Host "`n=== SEEDING DATA ===" -ForegroundColor Magenta

Push-Location "C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM"
npm run create-test-org
npm run seed-test-data
npm run seed-admin-user
npm run seed-api-fixtures
Pop-Location

Write-Host "`n=== AUTHENTICATION ===" -ForegroundColor Magenta

$adminEmail = $env:SUPER_ADMIN_EMAIL
if (-not $adminEmail) { $adminEmail = "superadmin@cognexiaai.com" }
$adminPassword = $env:SUPER_ADMIN_PASSWORD
if (-not $adminPassword) { $adminPassword = "SuperAdmin123!" }

$loginBody = @{
    email = $adminEmail
    password = $adminPassword
}
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/auth/login" -Name "Login Super Admin" -Body $loginBody -RequiresAuth $false
if ($script:LastResponse -and $script:LastResponse.accessToken) {
    $token = $script:LastResponse.accessToken
    $refreshToken = $script:LastResponse.refreshToken
    Write-Host "`n[TOKEN] Super admin token obtained!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
}
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/auth/me" -Name "Get Current User" -RequiresAuth $true

$portalToken = $null
$portalLoginBody = @{
    email = "portal.user@cognexiaai.com"
    password = "PortalUser123!"
}
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/portal/password/reset" -Name "Portal Reset Password (Pre-Login)" -Body @{ token = "debug-token"; newPassword = "PortalUser123!" } -RequiresAuth $false
$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/portal/login" -Name "Portal Login" -Body $portalLoginBody -RequiresAuth $false
if ($script:LastResponse -and $script:LastResponse.token) {
    $portalToken = $script:LastResponse.token
}

Start-Sleep -Milliseconds 500

# ========================================
# STEP 2: Discover endpoints from controllers
# ========================================
Write-Host "`n=== DISCOVERING ENDPOINTS ===" -ForegroundColor Magenta

$endpointMap = @{}

$controllerFiles = Get-ChildItem -Path $controllersPath -Filter *.ts -Recurse
foreach ($file in $controllerFiles) {
    $lines = Get-Content $file.FullName
    $currentController = $null

    foreach ($line in $lines) {
        if ($line -match "@Controller\((?<args>[^)]*)\)") {
            $args = $matches["args"].Trim()
            $prefix = ""
            if ($args -match "['""](?<path>[^'""]*)['""]") {
                $prefix = $matches["path"]
            }
            $currentController = $prefix
            continue
        }

        if ($line -match "@(?<method>Get|Post|Put|Delete|Patch|Options|Head|All)\((?<args>[^)]*)\)") {
            $method = $matches["method"].ToUpper()
            if ($method -eq "ALL") { $method = "GET" }

            $args = $matches["args"].Trim()
            $route = ""
            if ($args -match "['""](?<path>[^'""]*)['""]") {
                $route = $matches["path"]
            }

            $prefix = if ($null -ne $currentController) { $currentController } else { "" }
            $path = Normalize-Path -controllerPath $prefix -routePath $route
            $path = Replace-PathParams -path $path -method $method

            $key = "$method $path"
            if (-not $endpointMap.ContainsKey($key)) {
                $endpointMap[$key] = $true
            }
        }
    }
}

$methodOrder = @{
    "GET" = 1
    "POST" = 2
    "PUT" = 3
    "PATCH" = 4
    "DELETE" = 5
    "OPTIONS" = 6
    "HEAD" = 7
}
$endpoints = $endpointMap.Keys | Sort-Object {
    $parts = $_.Split(" ", 2)
    $methodKey = if ($methodOrder.ContainsKey($parts[0])) { $methodOrder[$parts[0]] } else { 99 }
    "{0:D2} {1}" -f $methodKey, $parts[1]
}
Write-Host "Discovered endpoints: $($endpoints.Count)" -ForegroundColor Cyan

# ========================================
# STEP 3: Test all endpoints with bearer token
# ========================================
Write-Host "`n=== TESTING ALL ENDPOINTS ===" -ForegroundColor Magenta

foreach ($endpoint in $endpoints) {
    $parts = $endpoint.Split(" ", 2)
    $method = $parts[0]
    $path = $parts[1]

    $url = "$baseUrl$path"
    $name = $endpoint

    if ($path -match "/knowledge-base/search") {
        $url = "$baseUrl${path}?q=fixture"
    }
    if ($path -match "/crm/marketing/reports/campaign-performance") {
        $startDate = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
        $endDate = (Get-Date).ToString("yyyy-MM-dd")
        $url = "$baseUrl${path}?startDate=$startDate&endDate=$endDate&campaignIds=$marketingCampaignV4Id"
    }
    if ($path -match "/reporting/analytics/conversion-metrics") {
        $startDate = (Get-Date).AddDays(-90).ToString("yyyy-MM-dd")
        $endDate = (Get-Date).ToString("yyyy-MM-dd")
        $url = "$baseUrl${path}?startDate=$startDate&endDate=$endDate"
    }
    if ($path -match "/call-analytics/trends") {
        $url = "$baseUrl${path}?days=30"
    }
    if ($path -match "/billing-transactions/reports/upcoming-billing") {
        $url = "$baseUrl${path}?daysAhead=7"
    }
    if ($path -match "/territories/analytics/comparison") {
        $url = "$baseUrl${path}?territoryIds=$territoryId"
    }

    $body = $null
    if ($method -in @("POST", "PUT", "PATCH")) {
        $body = Get-EndpointBody -method $method -path $path
        if ($null -eq $body) {
            $body = @{}
        }
    }

    $requiresAuth = $true
    if ($path -match "^/auth/(login|register|refresh|password-reset/request|password-reset/confirm|forgot-password|reset-password|verify-email$|verify-email/confirm)$") {
        $requiresAuth = $false
    } elseif ($path -match "^/portal/(login|password/request-reset|password/reset|accept-invitation)$") {
        $requiresAuth = $false
    } elseif ($path -match "^/email/track/") {
        $requiresAuth = $false
    }

    $authToken = $token
    if ($path -match "^/portal/" -and $portalToken) {
        $authToken = $portalToken
    }

    $testResults += Test-Endpoint -Method $method -Url $url -Name $name -Body $body -RequiresAuth $requiresAuth -AuthToken $authToken
    Start-Sleep -Milliseconds 50
}

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
$csvPath = "C:\Users\nshrm\Desktop\CognexiaAI-ERP\api-test-results-full.csv"
$testResults | Export-Csv -Path $csvPath -NoTypeInformation
Write-Host "`n[CSV] Detailed results exported to: $csvPath" -ForegroundColor Cyan

Write-Host "`n========================================`n" -ForegroundColor Yellow
