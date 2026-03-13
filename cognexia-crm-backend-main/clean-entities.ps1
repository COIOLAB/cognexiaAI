# Script to clean corrupted entity files
# This script extracts only the first complete entity definition from concatenated files

$ErrorActionPreference = "Stop"

# List of corrupted entity files
$corruptedFiles = @(
    "src/entities/data-migration-job.entity.ts",
    "src/entities/erp-connection.entity.ts",
    "src/entities/subscription-plan.entity.ts",
    "src/entities/sla.entity.ts",
    "src/entities/erp-field-mapping.entity.ts",
    "src/entities/audit-log.entity.ts",
    "src/entities/onboarding-session.entity.ts",
    "src/entities/webhook.entity.ts",
    "src/entities/webhook-delivery.entity.ts",
    "src/entities/usage-metric.entity.ts",
    "src/entities/billing-transaction.entity.ts",
    "src/entities/organization.entity.ts",
    "src/entities/master-organization.entity.ts"
)

function Extract-FirstEntity {
    param(
        [string]$filePath
    )
    
    if (-not (Test-Path $filePath)) {
        Write-Host "File not found: $filePath" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Processing: $filePath" -ForegroundColor Cyan
    
    $content = Get-Content $filePath -Raw
    $lines = Get-Content $filePath
    
    # Find the first export class or export enum
    $firstExportIndex = -1
    $exportCount = 0
    $braceCount = 0
    $inClass = $false
    $endIndex = -1
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # Track export class/enum
        if ($line -match '^\s*export\s+(class|enum|interface)') {
            $exportCount++
            if ($exportCount -eq 1) {
                $firstExportIndex = $i
                $inClass = $true
            }
            elseif ($exportCount -eq 2) {
                # Found second export, stop before it
                $endIndex = $i - 1
                break
            }
        }
        
        # Count braces when inside first class
        if ($inClass -and $firstExportIndex -ge 0) {
            $openBraces = ([regex]::Matches($line, '\{')).Count
            $closeBraces = ([regex]::Matches($line, '\}')).Count
            $braceCount += ($openBraces - $closeBraces)
            
            # If braces balanced and we've started, this might be the end
            if ($braceCount -eq 0 -and $line -match '\}') {
                $endIndex = $i
                break
            }
        }
    }
    
    if ($firstExportIndex -ge 0 -and $endIndex -ge 0) {
        # Extract imports (all lines before first export)
        $imports = $lines[0..($firstExportIndex - 1)]
        
        # Extract the first entity
        $entity = $lines[$firstExportIndex..$endIndex]
        
        # Combine imports and entity
        $cleanContent = ($imports + $entity) -join "`r`n"
        
        # Backup original file
        $backupPath = $filePath + ".corrupted.bak"
        Copy-Item $filePath $backupPath -Force
        Write-Host "  Backup created: $backupPath" -ForegroundColor Green
        
        # Write clean content
        Set-Content -Path $filePath -Value $cleanContent -NoNewline
        Write-Host "  Cleaned: $filePath" -ForegroundColor Green
        Write-Host "  Kept lines: 1-$($firstExportIndex) (imports) + $($firstExportIndex+1)-$($endIndex+1) (entity)" -ForegroundColor Gray
    }
    else {
        Write-Host "  Could not determine entity boundaries, skipping" -ForegroundColor Yellow
    }
}

# Main execution
Write-Host "`n=== Entity File Cleaner ===" -ForegroundColor Magenta
Write-Host "This script will clean corrupted entity files by keeping only the first entity definition`n" -ForegroundColor White

$cleanedCount = 0
$skippedCount = 0

foreach ($file in $corruptedFiles) {
    try {
        Extract-FirstEntity -filePath $file
        $cleanedCount++
    }
    catch {
        Write-Host "  Error processing $file : $_" -ForegroundColor Red
        $skippedCount++
    }
    Write-Host ""
}

Write-Host "`n=== Summary ===" -ForegroundColor Magenta
Write-Host "Cleaned: $cleanedCount files" -ForegroundColor Green
Write-Host "Skipped: $skippedCount files" -ForegroundColor Yellow
Write-Host "`nBackup files created with .corrupted.bak extension" -ForegroundColor Cyan
Write-Host "If something goes wrong, you can restore from these backups`n" -ForegroundColor Cyan
