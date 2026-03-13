# Fix all TypeORM field naming from snake_case to camelCase
# This script recursively fixes common field naming issues

$files = Get-ChildItem -Path "src" -Include "*.ts" -Recurse

$replacements = @{
    "created_at" = "createdAt"
    "updated_at" = "updatedAt"
    "deleted_at" = "deletedAt"
    "is_active" = "isActive"
    "is_deleted" = "isDeleted"
    "tenant_id" = "tenantId"
    "user_id" = "userId"
    "customer_id" = "customerId"
    "product_id" = "productId"
    "order_id" = "orderId"
    "assigned_agent" = "assignedAgent"
    "assigned_to" = "assignedTo"
    "created_by" = "createdBy"
    "updated_by" = "updatedBy"
    "last_login" = "lastLogin"
    "first_name" = "firstName"
    "last_name" = "lastName"
    "phone_number" = "phoneNumber"
    "email_address" = "emailAddress"
}

$totalChanges = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($key in $replacements.Keys) {
        # Replace in TypeORM query contexts (where, order, select, relations)
        $content = $content -replace "(['\`""]|\s)$key(['\`""]|\s|:)", "`$1$($replacements[$key])`$2"
        # Replace in object literals
        $content = $content -replace "\{\s*$key\s*:", "{ $($replacements[$key]):"
        # Replace in where clauses
        $content = $content -replace "where:\s*\{\s*$key", "where: { $($replacements[$key])"
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $totalChanges++
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "`nTotal files modified: $totalChanges"
