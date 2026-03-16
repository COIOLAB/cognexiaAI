# =========================================
# CRM MODULE - ENVIRONMENT VALIDATION SCRIPT
# =========================================
# Purpose: Validate .env configuration and security settings
# Date: January 9, 2026

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  ENVIRONMENT VALIDATION & SECURITY AUDIT" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$errorCount = 0
$warningCount = 0
$passCount = 0

# Function to check if variable exists and is not placeholder
function Test-EnvVar {
    param(
        [string]$VarName,
        [string]$EnvContent,
        [string]$Description,
        [bool]$Critical = $true
    )
    
    if ($EnvContent -match "$VarName=(.+)") {
        $value = $matches[1].Trim()
        
        # Check if it's a placeholder
        if ($value -match "\[YOUR_.*\]" -or $value -eq "") {
            if ($Critical) {
                Write-Host "❌ CRITICAL: $VarName is not set" -ForegroundColor Red
                Write-Host "   Description: $Description" -ForegroundColor Gray
                $script:errorCount++
                return $false
            } else {
                Write-Host "⚠️  WARNING: $VarName is not set" -ForegroundColor Yellow
                Write-Host "   Description: $Description" -ForegroundColor Gray
                $script:warningCount++
                return $false
            }
        } else {
            Write-Host "✅ $VarName is configured" -ForegroundColor Green
            $script:passCount++
            return $true
        }
    } else {
        if ($Critical) {
            Write-Host "❌ CRITICAL: $VarName is missing" -ForegroundColor Red
            $script:errorCount++
        } else {
            Write-Host "⚠️  WARNING: $VarName is missing" -ForegroundColor Yellow
            $script:warningCount++
        }
        return $false
    }
}

# Check if .env exists
$envPath = ".\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ CRITICAL: .env file not found!" -ForegroundColor Red
    Write-Host "   Please run setup-supabase.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green
Write-Host ""

# Load .env content
$envContent = Get-Content $envPath -Raw

Write-Host "SECTION 1: SUPABASE CONFIGURATION" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Test-EnvVar "SUPABASE_URL" $envContent "Supabase API URL" $true
Test-EnvVar "SUPABASE_ANON_KEY" $envContent "Supabase anonymous key" $true
Test-EnvVar "SUPABASE_SERVICE_ROLE_KEY" $envContent "Supabase service role key" $true
Write-Host ""

Write-Host "SECTION 2: DATABASE CONFIGURATION" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Test-EnvVar "DATABASE_URL" $envContent "PostgreSQL connection string" $true
Test-EnvVar "DATABASE_HOST" $envContent "Database host" $true
Test-EnvVar "DATABASE_PASSWORD" $envContent "Database password" $true
Test-EnvVar "DATABASE_POOL_URL" $envContent "Pooled connection string" $false
Write-Host ""

Write-Host "SECTION 3: SECURITY CONFIGURATION" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Test-EnvVar "JWT_SECRET" $envContent "JWT secret for authentication" $true
Test-EnvVar "JWT_EXPIRATION" $envContent "JWT token expiration" $false

# Check JWT secret strength
if ($envContent -match "JWT_SECRET=(.+)") {
    $jwtSecret = $matches[1].Trim()
    if ($jwtSecret.Length -lt 32) {
        Write-Host "⚠️  WARNING: JWT_SECRET is too short (< 32 characters)" -ForegroundColor Yellow
        $warningCount++
    } elseif ($jwtSecret -match "change.*production" -or $jwtSecret -match "example") {
        Write-Host "⚠️  WARNING: JWT_SECRET appears to be a placeholder" -ForegroundColor Yellow
        $warningCount++
    }
}
Write-Host ""

Write-Host "SECTION 4: AI/LLM SERVICES" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Test-EnvVar "AI_SERVICES_ENABLED" $envContent "AI services toggle" $false
Test-EnvVar "GROQ_API_KEY" $envContent "GROQ API key for LLM" $false
Test-EnvVar "OPENROUTER_API_KEY" $envContent "OpenRouter API key" $false
Write-Host ""

Write-Host "SECTION 5: FEATURE FLAGS" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Test-EnvVar "NODE_ENV" $envContent "Node environment" $true
Test-EnvVar "APP_PORT" $envContent "Application port" $false
Write-Host ""

# Security checks
Write-Host "SECTION 6: SECURITY AUDIT" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow

# Check for exposed secrets in code
Write-Host "🔍 Checking for exposed secrets in code..." -ForegroundColor Cyan
$exposedSecrets = Get-ChildItem -Path ".\src" -Recurse -Filter "*.ts" -ErrorAction SilentlyContinue | 
    Select-String -Pattern "(password|secret|key|token)\s*=\s*['\"](?!.*process\.env)" | 
    Select-Object -First 5

if ($exposedSecrets) {
    Write-Host "⚠️  WARNING: Potential hardcoded secrets found:" -ForegroundColor Yellow
    $exposedSecrets | ForEach-Object { Write-Host "   $($_.Filename):$($_.LineNumber)" -ForegroundColor Gray }
    $warningCount++
} else {
    Write-Host "✅ No obvious hardcoded secrets found" -ForegroundColor Green
    $passCount++
}

# Check .env is in .gitignore
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\.env") {
        Write-Host "✅ .env is in .gitignore" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "❌ CRITICAL: .env is NOT in .gitignore!" -ForegroundColor Red
        Write-Host "   Your secrets could be committed to Git!" -ForegroundColor Yellow
        $errorCount++
    }
} else {
    Write-Host "⚠️  WARNING: No .gitignore file found" -ForegroundColor Yellow
    $warningCount++
}

# Check for .env.example
if (Test-Path ".env.example") {
    Write-Host "✅ .env.example exists (good practice)" -ForegroundColor Green
    $passCount++
} else {
    Write-Host "ℹ️  INFO: .env.example not found (optional)" -ForegroundColor Cyan
}

Write-Host ""

# Dependency audit
Write-Host "SECTION 7: DEPENDENCY SECURITY" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Write-Host "🔍 Running npm audit..." -ForegroundColor Cyan

if (Test-Path "node_modules") {
    $auditResult = npm audit --json 2>&1 | ConvertFrom-Json -ErrorAction SilentlyContinue
    
    if ($auditResult) {
        $critical = if ($auditResult.metadata.vulnerabilities.critical) { $auditResult.metadata.vulnerabilities.critical } else { 0 }
        $high = if ($auditResult.metadata.vulnerabilities.high) { $auditResult.metadata.vulnerabilities.high } else { 0 }
        $moderate = if ($auditResult.metadata.vulnerabilities.moderate) { $auditResult.metadata.vulnerabilities.moderate } else { 0 }
        $low = if ($auditResult.metadata.vulnerabilities.low) { $auditResult.metadata.vulnerabilities.low } else { 0 }
        
        if ($critical -gt 0) {
            Write-Host "❌ CRITICAL: $critical critical vulnerabilities found" -ForegroundColor Red
            $errorCount += $critical
        }
        if ($high -gt 0) {
            Write-Host "⚠️  WARNING: $high high vulnerabilities found" -ForegroundColor Yellow
            $warningCount += $high
        }
        if ($moderate -gt 0) {
            Write-Host "ℹ️  INFO: $moderate moderate vulnerabilities found" -ForegroundColor Cyan
        }
        if ($low -gt 0) {
            Write-Host "ℹ️  INFO: $low low vulnerabilities found" -ForegroundColor Cyan
        }
        
        if ($critical -eq 0 -and $high -eq 0 -and $moderate -eq 0 -and $low -eq 0) {
            Write-Host "✅ No vulnerabilities found" -ForegroundColor Green
            $passCount++
        }
        
        Write-Host ""
        Write-Host "Run 'npm audit fix' to automatically fix some issues" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️  WARNING: node_modules not found. Run 'npm install' first" -ForegroundColor Yellow
    $warningCount++
}

Write-Host ""

# Database connection test
Write-Host "SECTION 8: DATABASE CONNECTION TEST" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow

if (Test-Path "node_modules/@supabase/supabase-js") {
    Write-Host "🔍 Testing Supabase connection..." -ForegroundColor Cyan
    
    $testScript = @'
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

async function testConnection() {
    try {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.log("ERROR: Missing Supabase credentials");
            process.exit(1);
        }
        
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        const { data, error } = await supabase.from("_test").select("*").limit(1);
        
        if (error && error.code !== "42P01") {
            console.log("ERROR: " + error.message);
            process.exit(1);
        }
        
        console.log("SUCCESS");
        process.exit(0);
    } catch (error) {
        console.log("ERROR: " + error.message);
        process.exit(1);
    }
}

testConnection();
'@
    
    Set-Content -Path "test-db-connection.js" -Value $testScript
    $connectionTest = node test-db-connection.js 2>&1
    Remove-Item "test-db-connection.js" -ErrorAction SilentlyContinue
    
    if ($connectionTest -match "SUCCESS") {
        Write-Host "✅ Database connection successful" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "❌ CRITICAL: Database connection failed" -ForegroundColor Red
        Write-Host "   Error: $connectionTest" -ForegroundColor Gray
        $errorCount++
    }
} else {
    Write-Host "⚠️  WARNING: Cannot test connection - dependencies not installed" -ForegroundColor Yellow
    $warningCount++
}

Write-Host ""

# Final summary
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Passed:   $passCount" -ForegroundColor Green
Write-Host "⚠️  Warnings: $warningCount" -ForegroundColor Yellow
Write-Host "❌ Errors:   $errorCount" -ForegroundColor Red
Write-Host ""

# Overall status
if ($errorCount -eq 0 -and $warningCount -eq 0) {
    Write-Host "🎉 EXCELLENT! All checks passed!" -ForegroundColor Green
    Write-Host "   Your environment is properly configured." -ForegroundColor Green
    exit 0
} elseif ($errorCount -eq 0) {
    Write-Host "✅ GOOD! No critical issues found." -ForegroundColor Green
    Write-Host "   $warningCount warning(s) should be addressed." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "❌ FAILED! $errorCount critical issue(s) found." -ForegroundColor Red
    Write-Host "   Please fix the errors above before proceeding." -ForegroundColor Yellow
    exit 1
}
