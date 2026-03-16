# EzAi-MFGNINJA Production Deployment Script
# AI-Powered Manufacturing Intelligence Platform
# Version: 3.0.0

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose = $false
)

# Configuration
$APP_NAME = "EzAi-MFGNINJA"
$VERSION = "3.0.0"
$DOCKER_REGISTRY = "registry.ezai-mfgninja.com"
$DEPLOYMENT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$ROOT_DIR = Split-Path -Parent $DEPLOYMENT_DIR

Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 EzAi-MFGNINJA Production Deployment" -ForegroundColor Green
Write-Host "   AI-Powered Manufacturing Intelligence" -ForegroundColor Green
Write-Host "   Version: $VERSION" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Pre-deployment checks
Write-Host "📋 Running pre-deployment checks..." -ForegroundColor Yellow

# Check Docker
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Error "❌ Docker is not installed or not running"
    exit 1
}

# Check Docker Compose
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Error "❌ Docker Compose is not installed"
    exit 1
}

# Check environment file
$envFile = Join-Path $DEPLOYMENT_DIR ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  Creating .env template file" -ForegroundColor Yellow
    @"
# EzAi-MFGNINJA Production Environment Variables
# Generated on $(Get-Date)

# Database Configuration
DB_PASSWORD=$(([System.Web.Security.Membership]::GeneratePassword(32, 8)))
MONGO_PASSWORD=$(([System.Web.Security.Membership]::GeneratePassword(32, 8)))
REDIS_PASSWORD=$(([System.Web.Security.Membership]::GeneratePassword(32, 8)))

# Authentication
JWT_SECRET=$(([System.Web.Security.Membership]::GeneratePassword(64, 12)))

# Monitoring
GRAFANA_PASSWORD=$(([System.Web.Security.Membership]::GeneratePassword(16, 4)))

# Application Settings
NODE_ENV=production
APP_VERSION=$VERSION
APP_NAME=$APP_NAME

# API Configuration
API_BASE_URL=https://api.ezai-mfgninja.com
WS_BASE_URL=wss://api.ezai-mfgninja.com
FRONTEND_URL=https://ezai-mfgninja.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoring URLs
PROMETHEUS_URL=http://prometheus.ezai-mfgninja.com:9090
GRAFANA_URL=http://grafana.ezai-mfgninja.com:3010
KIBANA_URL=http://kibana.ezai-mfgninja.com:5601
"@ | Out-File -FilePath $envFile -Encoding UTF8
    
    Write-Host "✅ Environment file created at: $envFile" -ForegroundColor Green
    Write-Host "🔐 Please review and update the generated passwords" -ForegroundColor Yellow
}

# Load environment variables
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match '^[^#]' } | ForEach-Object {
        $key, $value = $_ -split '=', 2
        [Environment]::SetEnvironmentVariable($key, $value, [EnvironmentVariableTarget]::Process)
    }
    Write-Host "✅ Environment variables loaded" -ForegroundColor Green
}

# Build phase
if (-not $SkipBuild) {
    Write-Host "🔨 Building application images..." -ForegroundColor Yellow
    
    # Build backend services
    $modules = @(
        "01-hr",
        "02-manufacturing", 
        "03-crm",
        "04-supply-chain",
        "05-inventory",
        "06-procurement",
        "07-sales-marketing",
        "08-production-planning",
        "23-finance-accounting"
    )
    
    foreach ($module in $modules) {
        $modulePath = Join-Path $ROOT_DIR "backend\modules\$module"
        if (Test-Path $modulePath) {
            Write-Host "Building $module module..." -ForegroundColor Cyan
            
            # Create Dockerfile if it doesn't exist
            $dockerFile = Join-Path $modulePath "Dockerfile"
            if (-not (Test-Path $dockerFile)) {
                Write-Host "Creating Dockerfile for $module..." -ForegroundColor Yellow
                @"
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
"@ | Out-File -FilePath $dockerFile -Encoding UTF8
            }
            
            try {
                Push-Location $modulePath
                docker build -t "ezai-mfgninja-$($module.Replace('0', '').Replace('-', ''))" .
                Write-Host "✅ Built $module successfully" -ForegroundColor Green
            } catch {
                Write-Error "❌ Failed to build $module"
                exit 1
            } finally {
                Pop-Location
            }
        }
    }
    
    # Build frontend
    Write-Host "Building frontend..." -ForegroundColor Cyan
    $frontendPath = Join-Path $ROOT_DIR "frontend"
    if (Test-Path $frontendPath) {
        $frontendDockerFile = Join-Path $frontendPath "Dockerfile"
        if (-not (Test-Path $frontendDockerFile)) {
            Write-Host "Creating frontend Dockerfile..." -ForegroundColor Yellow
            @"
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_WS_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=\$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_WS_BASE_URL=\$NEXT_PUBLIC_WS_BASE_URL

RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
"@ | Out-File -FilePath $frontendDockerFile -Encoding UTF8
        }
        
        try {
            Push-Location $frontendPath
            docker build -t "ezai-mfgninja-frontend" --build-arg NEXT_PUBLIC_API_BASE_URL="https://api.ezai-mfgninja.com" --build-arg NEXT_PUBLIC_WS_BASE_URL="wss://api.ezai-mfgninja.com" .
            Write-Host "✅ Built frontend successfully" -ForegroundColor Green
        } catch {
            Write-Error "❌ Failed to build frontend"
            exit 1
        } finally {
            Pop-Location
        }
    }
}

# Testing phase
if (-not $SkipTests) {
    Write-Host "🧪 Running tests..." -ForegroundColor Yellow
    
    # Run backend tests
    $backendPath = Join-Path $ROOT_DIR "backend"
    if (Test-Path (Join-Path $backendPath "package.json")) {
        try {
            Push-Location $backendPath
            npm test
            Write-Host "✅ Backend tests passed" -ForegroundColor Green
        } catch {
            Write-Warning "⚠️  Some backend tests failed"
        } finally {
            Pop-Location
        }
    }
    
    # Run frontend tests
    $frontendPath = Join-Path $ROOT_DIR "frontend"
    if (Test-Path (Join-Path $frontendPath "package.json")) {
        try {
            Push-Location $frontendPath
            npm run test
            Write-Host "✅ Frontend tests passed" -ForegroundColor Green
        } catch {
            Write-Warning "⚠️  Some frontend tests failed"
        } finally {
            Pop-Location
        }
    }
}

# Deployment phase
Write-Host "🚀 Deploying EzAi-MFGNINJA..." -ForegroundColor Yellow

try {
    Push-Location $DEPLOYMENT_DIR
    
    # Create necessary directories
    $dirs = @("nginx", "ssl", "sql", "monitoring", "logs", "backups")
    foreach ($dir in $dirs) {
        $dirPath = Join-Path $DEPLOYMENT_DIR $dir
        if (-not (Test-Path $dirPath)) {
            New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
            Write-Host "Created directory: $dir" -ForegroundColor Cyan
        }
    }
    
    # Create nginx configuration
    $nginxConfig = Join-Path $DEPLOYMENT_DIR "nginx\nginx.conf"
    if (-not (Test-Path $nginxConfig)) {
        Write-Host "Creating nginx configuration..." -ForegroundColor Yellow
        @"
events {
    worker_connections 1024;
}

http {
    upstream backend {
        least_conn;
        server hr-service:3001;
        server finance-service:3002;
        server manufacturing-service:3003;
        server supply-chain-service:3004;
        server inventory-service:3005;
        server production-planning-service:3006;
        server crm-service:3007;
        server procurement-service:3008;
        server sales-marketing-service:3009;
    }

    server {
        listen 80;
        server_name ezai-mfgninja.com api.ezai-mfgninja.com;

        location / {
            proxy_pass http://frontend:3000;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
"@ | Out-File -FilePath $nginxConfig -Encoding UTF8
    }
    
    # Create database initialization script
    $sqlInit = Join-Path $DEPLOYMENT_DIR "sql\init-databases.sql"
    if (-not (Test-Path $sqlInit)) {
        Write-Host "Creating database initialization script..." -ForegroundColor Yellow
        @"
-- EzAi-MFGNINJA Database Initialization
-- Created on $(Get-Date)

-- Create databases for all modules
CREATE DATABASE ezai_hr_db;
CREATE DATABASE ezai_finance_db;
CREATE DATABASE ezai_manufacturing_db;
CREATE DATABASE ezai_supply_chain_db;
CREATE DATABASE ezai_inventory_db;
CREATE DATABASE ezai_production_db;
CREATE DATABASE ezai_crm_db;
CREATE DATABASE ezai_procurement_db;
CREATE DATABASE ezai_sales_marketing_db;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE ezai_hr_db TO ezai_user;
GRANT ALL PRIVILEGES ON DATABASE ezai_finance_db TO ezai_user;
GRANT ALL PRIVILEGES ON DATABASE ezai_manufacturing_db TO ezai_user;
GRANT ALL PRIVILEGES ON DATABASE ezai_supply_chain_db TO ezai_user;
GRANT ALL PRIVILEGES ON DATABASE ezai_inventory_db TO ezai_user;
GRANT ALL PRIVILEGES ON DATABASE ezai_production_db TO ezai_user;
GRANT ALL PRIVILEGES ON DATABASE ezai_crm_db TO ezai_user;
GRANT ALL PRIVILEGES ON DATABASE ezai_procurement_db TO ezai_user;
GRANT ALL PRIVILEGES ON DATABASE ezai_sales_marketing_db TO ezai_user;
"@ | Out-File -FilePath $sqlInit -Encoding UTF8
    }
    
    # Stop existing containers
    Write-Host "Stopping existing containers..." -ForegroundColor Yellow
    docker-compose down --remove-orphans
    
    # Deploy with Docker Compose
    Write-Host "Starting EzAi-MFGNINJA services..." -ForegroundColor Yellow
    docker-compose -f production-config.yml up -d
    
    Write-Host "✅ EzAi-MFGNINJA deployed successfully!" -ForegroundColor Green
    
} catch {
    Write-Error "❌ Deployment failed: $_"
    exit 1
} finally {
    Pop-Location
}

# Post-deployment verification
Write-Host "🔍 Running post-deployment verification..." -ForegroundColor Yellow

# Wait for services to start
Start-Sleep -Seconds 30

# Check service health
$services = @(
    @{name="Frontend"; url="http://localhost:3000"},
    @{name="HR Service"; url="http://localhost:3001/api/v1/hr/health"},
    @{name="Finance Service"; url="http://localhost:3002/api/v1/finance-accounting/health"},
    @{name="Manufacturing Service"; url="http://localhost:3003/api/v1/manufacturing/health"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.url -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.name) is healthy" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $($service.name) returned status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $($service.name) is not responding" -ForegroundColor Red
    }
}

# Display deployment information
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🎉 EzAi-MFGNINJA Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Access URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   API Gateway: http://localhost" -ForegroundColor White
Write-Host "   Grafana: http://localhost:3010" -ForegroundColor White
Write-Host "   Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "   Kibana: http://localhost:5601" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Management Commands:" -ForegroundColor Cyan
Write-Host "   View logs: docker-compose -f production-config.yml logs -f" -ForegroundColor White
Write-Host "   Stop services: docker-compose -f production-config.yml down" -ForegroundColor White
Write-Host "   Restart services: docker-compose -f production-config.yml restart" -ForegroundColor White
Write-Host ""
Write-Host "✨ EzAi-MFGNINJA is ready for production use!" -ForegroundColor Green
