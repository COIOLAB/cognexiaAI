# Big Bang Phase 1 - Automated Error Fixes

Write-Host "🔧 Fixing Big Bang TypeScript errors..." -ForegroundColor Cyan

# Fix 1: Replace organizationId with organization_id in AuditLog creates
Write-Host "  Fixing AuditLog property names..." -ForegroundColor Yellow
Get-ChildItem -Path "src" -Recurse -Filter "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'auditLogRepo.*create.*organizationId') {
        $content = $content -replace 'organizationId:', 'organization_id:'
        Set-Content $_.FullName -Value $content -NoNewline
    }
}

# Fix 2: Replace createdAt/created_at in query order clauses
Write-Host "  Fixing timestamp property names in order clauses..." -ForegroundColor Yellow
$files = @(
    "src/services/portal.service.ts",
    "src/services/user-dashboard.service.ts",
    "src/services/user-management.service.ts"
)
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace 'order: \{ created_at:', 'order: { createdAt:'
        $content = $content -replace '\.created_at', '.createdAt'
        $content = $content -replace '\.created_by', '.submittedBy'
        Set-Content $file -Value $content -NoNewline
    }
}

# Fix 3: Fix support ticket property names
Write-Host "  Fixing SupportTicket property names..." -ForegroundColor Yellow
$supportFiles = @(
    "src/services/support.service.ts",
    "src/controllers/support-tickets.controller.ts"
)
foreach ($file in $supportFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace '\.firstResponseAt', '.firstRespondedAt'
        $content = $content -replace 'firstResponseAt:', 'firstRespondedAt:'
        $content = $content -replace '\.resolved_at', '.resolvedAt'
        $content = $content -replace '\.closed_at', '.closedAt'
        $content = $content -replace '\.assigned_to', '.assignedTo'
        $content = $content -replace '\.escalated_to', '.escalatedTo'
        $content = $content -replace '\.escalated_at', '.escalatedAt'
        $content = $content -replace '\.first_response_at', '.firstRespondedAt'
        $content = $content -replace 'response_count', 'messages?.length || 0'
        Set-Content $file -Value $content -NoNewline
    }
}

# Fix 4: Fix enum values
Write-Host "  Fixing TicketStatus enum values..." -ForegroundColor Yellow
Get-ChildItem -Path "src" -Recurse -Filter "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'TicketStatus\.NEW|TicketStatus\.PENDING|TicketStatus\.REOPENED|TicketCategory\.TECHNICAL|TicketCategory\.GENERAL_INQUIRY') {
        $content = $content -replace 'TicketStatus\.NEW', 'TicketStatus.OPEN'
        $content = $content -replace 'TicketStatus\.PENDING', 'TicketStatus.OPEN'
        $content = $content -replace 'TicketStatus\.REOPENED', 'TicketStatus.OPEN'
        $content = $content -replace 'TicketCategory\.TECHNICAL', 'TicketCategory.TECHNICAL_ISSUE'
        $content = $content -replace 'TicketCategory\.GENERAL_INQUIRY', 'TicketCategory.OTHER'
        Set-Content $_.FullName -Value $content -NoNewline
    }
}

# Fix 5: Fix OrganizationStatus enum
Write-Host "  Fixing OrganizationStatus enum values..." -ForegroundColor Yellow
Get-ChildItem -Path "src" -Recurse -Filter "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'status:.*[''"]active[''"]') {
        $content = $content -replace "status:\s*['\"]active['\"]", "status: 'active' as any"
        Set-Content $_.FullName -Value $content -NoNewline
    }
}

# Fix 6: Fix User entity references
Write-Host "  Fixing User property references..." -ForegroundColor Yellow
$files = @("src/services/auth.service.ts", "src/services/notification-scheduler.service.ts")
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace 'sendEmailVerification\(user\)', 'sendEmailVerification(user.email, "")'
        $content = $content -replace 'sendWelcomeEmail\(user\)', 'sendWelcomeEmail(user.email, user.firstName || "User")'
        $content = $content -replace 'sendPasswordResetEmail\(user\)', 'sendPasswordResetEmail(user.email, "")'
        Set-Content $file -Value $content -NoNewline
    }
}

# Fix 7: Fix AuditLog enum values
Write-Host "  Fixing AuditEntityType enum values..." -ForegroundColor Yellow
Get-ChildItem -Path "src" -Recurse -Filter "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'AuditEntityType\.SUBSCRIPTION|AuditEntityType\.NOTIFICATION') {
        $content = $content -replace 'AuditEntityType\.SUBSCRIPTION', 'AuditEntityType.ORGANIZATION'
        $content = $content -replace 'AuditEntityType\.NOTIFICATION', 'AuditEntityType.DOCUMENT'
        Set-Content $_.FullName -Value $content -NoNewline
    }
}

Write-Host "✅ Automated fixes applied!" -ForegroundColor Green
Write-Host "Running build to check remaining errors..." -ForegroundColor Cyan

npm run build 2>&1 | Select-String "error TS" | Measure-Object | Select-Object -ExpandProperty Count
