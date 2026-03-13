#!/bin/bash

# ===============================================================================
# EzAi-MFGNINJA Government-Grade Security Scanning Script
# AI-Powered Manufacturing Intelligence Platform
# 
# This script performs comprehensive security scanning and vulnerability
# assessment with government-grade compliance reporting
# ===============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SCAN_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="/var/log/ezai/security-scans"
LOG_FILE="$REPORT_DIR/security-scan-$SCAN_TIMESTAMP.log"

# Scanning configuration
TRIVY_VERSION="0.48.0"
NMAP_AGGRESSIVE=${NMAP_AGGRESSIVE:-false}
VULN_DB_UPDATE=${VULN_DB_UPDATE:-true}
SCAN_TIMEOUT=${SCAN_TIMEOUT:-3600}  # 1 hour timeout

# Compliance thresholds
MAX_CRITICAL_VULNS=${MAX_CRITICAL_VULNS:-0}
MAX_HIGH_VULNS=${MAX_HIGH_VULNS:-5}
MAX_MEDIUM_VULNS=${MAX_MEDIUM_VULNS:-20}

# Notification configuration
SECURITY_EMAIL="${SECURITY_EMAIL:-security@ezai-mfgninja.com}"
SLACK_WEBHOOK="${SECURITY_SLACK_WEBHOOK:-}"

# Function to log messages
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    mkdir -p "$REPORT_DIR"
    
    case $level in
        ERROR)
            echo -e "${RED}[ERROR]${NC} $message" >&2
            echo "[$timestamp] [ERROR] $message" >> "$LOG_FILE"
            ;;
        WARN)
            echo -e "${YELLOW}[WARN]${NC} $message"
            echo "[$timestamp] [WARN] $message" >> "$LOG_FILE"
            ;;
        INFO)
            echo -e "${BLUE}[INFO]${NC} $message"
            echo "[$timestamp] [INFO] $message" >> "$LOG_FILE"
            ;;
        SUCCESS)
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            echo "[$timestamp] [SUCCESS] $message" >> "$LOG_FILE"
            ;;
        CRITICAL)
            echo -e "${RED}[CRITICAL]${NC} $message" >&2
            echo "[$timestamp] [CRITICAL] $message" >> "$LOG_FILE"
            ;;
        *)
            echo "$message"
            echo "[$timestamp] $message" >> "$LOG_FILE"
            ;;
    esac
}

# Function to print banner
print_banner() {
    echo -e "${PURPLE}===============================================================================${NC}"
    echo -e "${CYAN}                EzAi-MFGNINJA Government Security Scanning${NC}"
    echo -e "${CYAN}            ISO 27001 • SOC 2 • NIST • FedRAMP Compliance${NC}"
    echo -e "${PURPLE}===============================================================================${NC}"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    log INFO "Checking security scanning prerequisites..."
    
    # Check required tools
    local required_tools=("docker" "nmap" "curl" "jq" "openssl")
    local missing_tools=()
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log ERROR "Missing required tools: ${missing_tools[*]}"
        log INFO "Installing missing tools..."
        
        # Try to install missing tools
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y nmap curl jq openssl
        elif command -v yum &> /dev/null; then
            sudo yum install -y nmap curl jq openssl
        else
            log ERROR "Unable to install missing tools automatically"
            exit 1
        fi
    fi
    
    # Install/Update Trivy if needed
    if ! command -v trivy &> /dev/null; then
        log INFO "Installing Trivy vulnerability scanner..."
        curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin v$TRIVY_VERSION
    fi
    
    # Update vulnerability database
    if [[ "$VULN_DB_UPDATE" == "true" ]]; then
        log INFO "Updating vulnerability database..."
        trivy image --download-db-only
    fi
    
    log SUCCESS "Prerequisites check completed"
}

# Function to scan Docker images
scan_docker_images() {
    log INFO "Starting Docker image vulnerability scanning..."
    
    local scan_report="$REPORT_DIR/docker-scan-$SCAN_TIMESTAMP.json"
    local summary_report="$REPORT_DIR/docker-summary-$SCAN_TIMESTAMP.json"
    
    # Get list of running containers
    local containers=$(docker ps --format "{{.Image}}" | sort -u)
    
    echo '{"scans": []}' > "$scan_report"
    
    local total_critical=0
    local total_high=0
    local total_medium=0
    local total_low=0
    local scanned_images=0
    
    for image in $containers; do
        log INFO "Scanning Docker image: $image"
        
        local image_report="/tmp/trivy-$SCAN_TIMESTAMP-$(echo "$image" | tr '/' '-' | tr ':' '-').json"
        
        if timeout "$SCAN_TIMEOUT" trivy image --format json --output "$image_report" "$image" &>/dev/null; then
            # Extract vulnerability counts
            local critical=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity=="CRITICAL")] | length' "$image_report" 2>/dev/null || echo 0)
            local high=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity=="HIGH")] | length' "$image_report" 2>/dev/null || echo 0)
            local medium=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity=="MEDIUM")] | length' "$image_report" 2>/dev/null || echo 0)
            local low=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity=="LOW")] | length' "$image_report" 2>/dev/null || echo 0)
            
            # Add to totals
            ((total_critical += critical))
            ((total_high += high))
            ((total_medium += medium))
            ((total_low += low))
            ((scanned_images++))
            
            # Add to report
            jq --argjson scan_result "$(cat "$image_report")" \
               --arg image_name "$image" \
               --argjson critical "$critical" \
               --argjson high "$high" \
               --argjson medium "$medium" \
               --argjson low "$low" \
               '.scans += [{
                   "image": $image_name,
                   "scan_time": (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
                   "vulnerabilities": {
                       "critical": $critical,
                       "high": $high,
                       "medium": $medium,
                       "low": $low
                   },
                   "details": $scan_result
               }]' "$scan_report" > "$scan_report.tmp" && mv "$scan_report.tmp" "$scan_report"
            
            # Clean up temp file
            rm -f "$image_report"
            
            log INFO "Image $image: CRITICAL=$critical, HIGH=$high, MEDIUM=$medium, LOW=$low"
        else
            log ERROR "Failed to scan image: $image"
        fi
    done
    
    # Create summary report
    cat > "$summary_report" << EOF
{
    "scan_summary": {
        "scan_time": "$(date -Iseconds)",
        "scanned_images": $scanned_images,
        "total_vulnerabilities": {
            "critical": $total_critical,
            "high": $total_high,
            "medium": $total_medium,
            "low": $total_low
        },
        "compliance_status": {
            "critical_threshold": $MAX_CRITICAL_VULNS,
            "high_threshold": $MAX_HIGH_VULNS,
            "medium_threshold": $MAX_MEDIUM_VULNS,
            "critical_passed": $([ $total_critical -le $MAX_CRITICAL_VULNS ] && echo "true" || echo "false"),
            "high_passed": $([ $total_high -le $MAX_HIGH_VULNS ] && echo "true" || echo "false"),
            "medium_passed": $([ $total_medium -le $MAX_MEDIUM_VULNS ] && echo "true" || echo "false")
        }
    }
}
EOF
    
    # Check compliance thresholds
    if [[ $total_critical -gt $MAX_CRITICAL_VULNS ]]; then
        log CRITICAL "CRITICAL vulnerability threshold exceeded: $total_critical > $MAX_CRITICAL_VULNS"
    fi
    
    if [[ $total_high -gt $MAX_HIGH_VULNS ]]; then
        log CRITICAL "HIGH vulnerability threshold exceeded: $total_high > $MAX_HIGH_VULNS"
    fi
    
    if [[ $total_medium -gt $MAX_MEDIUM_VULNS ]]; then
        log WARN "MEDIUM vulnerability threshold exceeded: $total_medium > $MAX_MEDIUM_VULNS"
    fi
    
    log SUCCESS "Docker image scanning completed. Total vulnerabilities: C=$total_critical H=$total_high M=$total_medium L=$total_low"
}

# Function to scan network services
scan_network_services() {
    log INFO "Starting network service scanning..."
    
    local network_report="$REPORT_DIR/network-scan-$SCAN_TIMESTAMP.json"
    
    # Define service ports to scan
    local services=(
        "localhost:3000:Frontend"
        "localhost:3001:HR-Service"
        "localhost:3002:Finance-Service"
        "localhost:3003:Manufacturing-Service"
        "localhost:3004:Supply-Chain-Service"
        "localhost:3005:Inventory-Service"
        "localhost:3006:Production-Planning-Service"
        "localhost:3007:CRM-Service"
        "localhost:3008:Procurement-Service"
        "localhost:3009:Sales-Marketing-Service"
        "localhost:9090:Prometheus"
        "localhost:3010:Grafana"
        "localhost:9200:Elasticsearch"
        "localhost:5601:Kibana"
        "localhost:6379:Redis"
        "localhost:80:HTTP-Gateway"
        "localhost:443:HTTPS-Gateway"
    )
    
    echo '{"network_scan": {"services": []}}' > "$network_report"
    
    for service_info in "${services[@]}"; do
        local host="${service_info%%:*}"
        local port_service="${service_info#*:}"
        local port="${port_service%%:*}"
        local service_name="${port_service#*:}"
        
        log INFO "Scanning service: $service_name on $host:$port"
        
        # Basic port scan
        local port_open="false"
        local ssl_enabled="false"
        local service_version=""
        local security_headers=()
        
        if timeout 5 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null; then
            port_open="true"
            
            # Check for SSL/TLS
            if [[ "$port" == "443" ]] || timeout 5 openssl s_client -connect "$host:$port" -verify_return_error < /dev/null &>/dev/null; then
                ssl_enabled="true"
                
                # Get SSL certificate info
                local cert_info=$(timeout 5 openssl s_client -connect "$host:$port" -servername "$host" < /dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")
                
                # Check certificate expiry
                if [[ -n "$cert_info" ]]; then
                    local not_after=$(echo "$cert_info" | grep notAfter | cut -d= -f2)
                    local expiry_epoch=$(date -d "$not_after" +%s 2>/dev/null || echo 0)
                    local current_epoch=$(date +%s)
                    local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
                    
                    if [[ $days_until_expiry -lt 30 ]]; then
                        log WARN "SSL certificate for $service_name expires in $days_until_expiry days"
                    fi
                fi
            fi
            
            # HTTP security headers check
            if [[ "$port" == "80" ]] || [[ "$port" == "443" ]] || [[ "$port" =~ ^30[0-9][0-9]$ ]]; then
                local protocol="http"
                [[ "$ssl_enabled" == "true" ]] && protocol="https"
                
                local headers=$(curl -s -I "$protocol://$host:$port" 2>/dev/null || echo "")
                
                # Check for security headers
                local security_checks=(
                    "X-Frame-Options"
                    "X-XSS-Protection"
                    "X-Content-Type-Options"
                    "Strict-Transport-Security"
                    "Content-Security-Policy"
                    "Referrer-Policy"
                )
                
                for header in "${security_checks[@]}"; do
                    if echo "$headers" | grep -qi "$header"; then
                        security_headers+=("$header")
                    fi
                done
            fi
        fi
        
        # Add to report
        jq --arg service_name "$service_name" \
           --arg host "$host" \
           --argjson port "$port" \
           --argjson port_open "$port_open" \
           --argjson ssl_enabled "$ssl_enabled" \
           --argjson security_headers "$(printf '%s\n' "${security_headers[@]}" | jq -R . | jq -s .)" \
           '.network_scan.services += [{
               "service": $service_name,
               "host": $host,
               "port": $port,
               "port_open": $port_open,
               "ssl_enabled": $ssl_enabled,
               "security_headers": $security_headers,
               "scan_time": (now | strftime("%Y-%m-%dT%H:%M:%SZ"))
           }]' "$network_report" > "$network_report.tmp" && mv "$network_report.tmp" "$network_report"
        
        log INFO "Service $service_name: PORT_OPEN=$port_open, SSL=$ssl_enabled, HEADERS=${#security_headers[@]}"
    done
    
    log SUCCESS "Network service scanning completed"
}

# Function to scan for configuration issues
scan_configurations() {
    log INFO "Starting configuration security scanning..."
    
    local config_report="$REPORT_DIR/config-scan-$SCAN_TIMESTAMP.json"
    local issues=()
    
    echo '{"configuration_scan": {"issues": []}}' > "$config_report"
    
    # Check Docker daemon configuration
    log INFO "Checking Docker daemon security..."
    
    # Check if Docker is running as root
    if docker info 2>/dev/null | grep -q "Server Version"; then
        if [[ $(id -u) -eq 0 ]]; then
            issues+=("Docker daemon running as root user")
        fi
        
        # Check for insecure registries
        local insecure_registries=$(docker info 2>/dev/null | grep -A 10 "Insecure Registries:" | grep -v "127.0.0.0/8" | grep -v "Insecure Registries:" || true)
        if [[ -n "$insecure_registries" ]]; then
            issues+=("Insecure Docker registries configured: $insecure_registries")
        fi
    fi
    
    # Check file permissions
    log INFO "Checking file permissions..."
    
    local sensitive_files=(
        "$DEPLOYMENT_DIR/.env.government"
        "$DEPLOYMENT_DIR/ssl/ezai-key.pem"
        "/etc/docker/daemon.json"
    )
    
    for file in "${sensitive_files[@]}"; do
        if [[ -f "$file" ]]; then
            local perms=$(stat -c "%a" "$file" 2>/dev/null || echo "unknown")
            if [[ "$perms" != "600" ]] && [[ "$perms" != "0600" ]]; then
                issues+=("Insecure file permissions on $file: $perms (should be 600)")
            fi
        fi
    done
    
    # Check for default passwords
    log INFO "Checking for default credentials..."
    
    if [[ -f "$DEPLOYMENT_DIR/.env.government" ]]; then
        if grep -q "change-this\|your-\|default\|password123\|admin123" "$DEPLOYMENT_DIR/.env.government"; then
            issues+=("Default or weak credentials detected in environment file")
        fi
    fi
    
    # Check SSL/TLS configuration
    log INFO "Checking SSL/TLS configuration..."
    
    if [[ -f "$DEPLOYMENT_DIR/ssl/ezai-cert.pem" ]]; then
        local cert_info=$(openssl x509 -in "$DEPLOYMENT_DIR/ssl/ezai-cert.pem" -noout -text 2>/dev/null || echo "")
        
        if echo "$cert_info" | grep -q "CN=localhost"; then
            issues+=("Self-signed certificate detected (CN=localhost) - not suitable for production")
        fi
        
        # Check certificate expiry
        local not_after=$(openssl x509 -in "$DEPLOYMENT_DIR/ssl/ezai-cert.pem" -noout -enddate 2>/dev/null | cut -d= -f2)
        if [[ -n "$not_after" ]]; then
            local expiry_epoch=$(date -d "$not_after" +%s 2>/dev/null || echo 0)
            local current_epoch=$(date +%s)
            local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
            
            if [[ $days_until_expiry -lt 30 ]]; then
                issues+=("SSL certificate expires in $days_until_expiry days")
            fi
        fi
    fi
    
    # Check container security
    log INFO "Checking container security configurations..."
    
    local containers=$(docker ps --format "{{.Names}}")
    for container in $containers; do
        # Check if container is running as root
        local user_id=$(docker exec "$container" id -u 2>/dev/null || echo "unknown")
        if [[ "$user_id" == "0" ]]; then
            issues+=("Container $container running as root user")
        fi
        
        # Check for privileged containers
        local privileged=$(docker inspect "$container" --format='{{.HostConfig.Privileged}}' 2>/dev/null || echo "false")
        if [[ "$privileged" == "true" ]]; then
            issues+=("Container $container running in privileged mode")
        fi
    done
    
    # Add issues to report
    for issue in "${issues[@]}"; do
        jq --arg issue "$issue" \
           '.configuration_scan.issues += [{
               "issue": $issue,
               "severity": "medium",
               "scan_time": (now | strftime("%Y-%m-%dT%H:%M:%SZ"))
           }]' "$config_report" > "$config_report.tmp" && mv "$config_report.tmp" "$config_report"
    done
    
    # Add summary
    jq --argjson issue_count "${#issues[@]}" \
       '.configuration_scan.summary = {
           "total_issues": $issue_count,
           "scan_time": (now | strftime("%Y-%m-%dT%H:%M:%SZ"))
       }' "$config_report" > "$config_report.tmp" && mv "$config_report.tmp" "$config_report"
    
    if [[ ${#issues[@]} -gt 0 ]]; then
        log WARN "Configuration scanning found ${#issues[@]} security issues"
    else
        log SUCCESS "Configuration scanning completed - no issues found"
    fi
}

# Function to generate compliance report
generate_compliance_report() {
    log INFO "Generating compliance security report..."
    
    local compliance_report="$REPORT_DIR/compliance-report-$SCAN_TIMESTAMP.json"
    local docker_summary="$REPORT_DIR/docker-summary-$SCAN_TIMESTAMP.json"
    local network_report="$REPORT_DIR/network-scan-$SCAN_TIMESTAMP.json"
    local config_report="$REPORT_DIR/config-scan-$SCAN_TIMESTAMP.json"
    
    # Read scan results
    local critical_vulns=0
    local high_vulns=0
    local medium_vulns=0
    local network_issues=0
    local config_issues=0
    
    if [[ -f "$docker_summary" ]]; then
        critical_vulns=$(jq -r '.scan_summary.total_vulnerabilities.critical // 0' "$docker_summary")
        high_vulns=$(jq -r '.scan_summary.total_vulnerabilities.high // 0' "$docker_summary")
        medium_vulns=$(jq -r '.scan_summary.total_vulnerabilities.medium // 0' "$docker_summary")
    fi
    
    if [[ -f "$config_report" ]]; then
        config_issues=$(jq -r '.configuration_scan.summary.total_issues // 0' "$config_report")
    fi
    
    # Determine overall compliance status
    local overall_status="COMPLIANT"
    local compliance_issues=()
    
    if [[ $critical_vulns -gt $MAX_CRITICAL_VULNS ]]; then
        overall_status="NON_COMPLIANT"
        compliance_issues+=("Critical vulnerabilities exceed threshold: $critical_vulns > $MAX_CRITICAL_VULNS")
    fi
    
    if [[ $high_vulns -gt $MAX_HIGH_VULNS ]]; then
        overall_status="NON_COMPLIANT"
        compliance_issues+=("High vulnerabilities exceed threshold: $high_vulns > $MAX_HIGH_VULNS")
    fi
    
    if [[ $config_issues -gt 0 ]]; then
        if [[ "$overall_status" == "COMPLIANT" ]]; then
            overall_status="CONDITIONALLY_COMPLIANT"
        fi
        compliance_issues+=("$config_issues configuration security issues found")
    fi
    
    # Generate comprehensive compliance report
    cat > "$compliance_report" << EOF
{
    "compliance_report": {
        "scan_id": "$SCAN_TIMESTAMP",
        "scan_time": "$(date -Iseconds)",
        "overall_status": "$overall_status",
        "compliance_frameworks": {
            "iso27001": {
                "status": "$([ $critical_vulns -eq 0 ] && echo "COMPLIANT" || echo "NON_COMPLIANT")",
                "requirements_met": $([ $critical_vulns -eq 0 ] && echo "true" || echo "false")
            },
            "soc2_type2": {
                "status": "$([ $critical_vulns -eq 0 ] && [ $high_vulns -le 5 ] && echo "COMPLIANT" || echo "NON_COMPLIANT")",
                "requirements_met": $([ $critical_vulns -eq 0 ] && [ $high_vulns -le 5 ] && echo "true" || echo "false")
            },
            "nist": {
                "status": "$([ $critical_vulns -eq 0 ] && [ $config_issues -eq 0 ] && echo "COMPLIANT" || echo "CONDITIONALLY_COMPLIANT")",
                "requirements_met": $([ $critical_vulns -eq 0 ] && [ $config_issues -eq 0 ] && echo "true" || echo "false")
            },
            "fedramp": {
                "status": "$([ $critical_vulns -eq 0 ] && [ $high_vulns -eq 0 ] && echo "COMPLIANT" || echo "NON_COMPLIANT")",
                "requirements_met": $([ $critical_vulns -eq 0 ] && [ $high_vulns -eq 0 ] && echo "true" || echo "false")
            }
        },
        "vulnerability_summary": {
            "critical": $critical_vulns,
            "high": $high_vulns,
            "medium": $medium_vulns,
            "configuration_issues": $config_issues
        },
        "thresholds": {
            "max_critical": $MAX_CRITICAL_VULNS,
            "max_high": $MAX_HIGH_VULNS,
            "max_medium": $MAX_MEDIUM_VULNS
        },
        "compliance_issues": $(printf '%s\n' "${compliance_issues[@]}" | jq -R . | jq -s .),
        "recommendations": [
            "Address all critical and high severity vulnerabilities immediately",
            "Implement automated vulnerability scanning in CI/CD pipeline",
            "Regular security configuration reviews",
            "Ensure all containers run as non-root users",
            "Implement proper SSL certificate management",
            "Enable comprehensive security logging and monitoring"
        ],
        "next_scan_recommended": "$(date -d '+1 week' -Iseconds)"
    }
}
EOF
    
    log SUCCESS "Compliance report generated: $compliance_report"
    
    # Send security report if configured
    send_security_report "$compliance_report"
}

# Function to send security report
send_security_report() {
    local report_file="$1"
    local overall_status=$(jq -r '.compliance_report.overall_status' "$report_file")
    local critical_vulns=$(jq -r '.compliance_report.vulnerability_summary.critical' "$report_file")
    local high_vulns=$(jq -r '.compliance_report.vulnerability_summary.high' "$report_file")
    
    # Email notification
    if [[ -n "$SECURITY_EMAIL" ]]; then
        local subject="EzAi-MFGNINJA Security Scan Report - $overall_status"
        [[ "$overall_status" != "COMPLIANT" ]] && subject="🚨 $subject"
        
        mail -s "$subject" "$SECURITY_EMAIL" << EOF
EzAi-MFGNINJA Government-Grade Security Scan Report

Scan ID: $SCAN_TIMESTAMP
Scan Time: $(date)
Overall Status: $overall_status

Vulnerability Summary:
- Critical: $critical_vulns
- High: $high_vulns
- Medium: $(jq -r '.compliance_report.vulnerability_summary.medium' "$report_file")

Compliance Framework Status:
- ISO 27001: $(jq -r '.compliance_report.compliance_frameworks.iso27001.status' "$report_file")
- SOC 2 Type II: $(jq -r '.compliance_report.compliance_frameworks.soc2_type2.status' "$report_file")
- NIST: $(jq -r '.compliance_report.compliance_frameworks.nist.status' "$report_file")
- FedRAMP: $(jq -r '.compliance_report.compliance_frameworks.fedramp.status' "$report_file")

Detailed Report: $report_file

EzAi-MFGNINJA Security Scanning System
EOF
        
        log SUCCESS "Security report emailed to: $SECURITY_EMAIL"
    fi
    
    # Slack notification for critical issues
    if [[ -n "$SLACK_WEBHOOK" ]] && [[ "$overall_status" != "COMPLIANT" ]]; then
        curl -X POST "$SLACK_WEBHOOK" \
            -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 SECURITY ALERT: EzAi-MFGNINJA Security Scan\\nStatus: $overall_status\\nCritical: $critical_vulns, High: $high_vulns\\nScan ID: $SCAN_TIMESTAMP\"}" \
            2>/dev/null || true
    fi
}

# Main security scanning function
main() {
    local scan_type="${1:-full}"
    
    print_banner
    log INFO "Starting EzAi-MFGNINJA Government Security Scan - Type: $scan_type"
    
    check_prerequisites
    
    case $scan_type in
        "docker"|"images")
            scan_docker_images
            ;;
        "network"|"services")
            scan_network_services
            ;;
        "config"|"configuration")
            scan_configurations
            ;;
        "full"|*)
            scan_docker_images
            scan_network_services
            scan_configurations
            generate_compliance_report
            ;;
    esac
    
    log SUCCESS "Security scanning completed successfully"
}

# Error handling
trap 'log ERROR "Security scan failed at line $LINENO"; exit 1' ERR

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
