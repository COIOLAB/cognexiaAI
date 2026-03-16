#!/bin/bash

# ===============================================================================
# EzAi-MFGNINJA Government Compliance Checking Script
# AI-Powered Manufacturing Intelligence Platform
# 
# This script performs comprehensive compliance auditing against government
# standards: ISO 27001, SOC 2, NIST, FedRAMP, GDPR, SOX
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
AUDIT_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
AUDIT_DIR="/var/log/ezai/compliance-audits"
LOG_FILE="$AUDIT_DIR/compliance-audit-$AUDIT_TIMESTAMP.log"

# Compliance standards configuration
FRAMEWORKS="${COMPLIANCE_FRAMEWORKS:-iso27001,soc2,nist,fedramp,gdpr,sox}"
AUDIT_RETENTION_YEARS="${AUDIT_RETENTION_YEARS:-7}"  # SOX requirement
AUDIT_DEPTH="${AUDIT_DEPTH:-full}"  # full, basic, critical

# Notification configuration
COMPLIANCE_EMAIL="${COMPLIANCE_EMAIL:-compliance@ezai-mfgninja.com}"
AUDIT_EMAIL="${AUDIT_EMAIL:-audit@ezai-mfgninja.com}"
LEGAL_EMAIL="${LEGAL_EMAIL:-legal@ezai-mfgninja.com}"

# Function to log messages
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    mkdir -p "$AUDIT_DIR"
    
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
        COMPLIANCE)
            echo -e "${PURPLE}[COMPLIANCE]${NC} $message"
            echo "[$timestamp] [COMPLIANCE] $message" >> "$LOG_FILE"
            ;;
        VIOLATION)
            echo -e "${RED}[VIOLATION]${NC} $message" >&2
            echo "[$timestamp] [VIOLATION] $message" >> "$LOG_FILE"
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
    echo -e "${CYAN}                EzAi-MFGNINJA Government Compliance Audit${NC}"
    echo -e "${CYAN}          ISO 27001 • SOC 2 • NIST • FedRAMP • GDPR • SOX${NC}"
    echo -e "${PURPLE}===============================================================================${NC}"
    echo ""
}

# Function to initialize audit report
init_audit_report() {
    local report_file="$AUDIT_DIR/compliance-report-$AUDIT_TIMESTAMP.json"
    
    cat > "$report_file" << EOF
{
    "compliance_audit": {
        "audit_id": "$AUDIT_TIMESTAMP",
        "audit_date": "$(date -Iseconds)",
        "audited_frameworks": ["$(echo $FRAMEWORKS | tr ',' '"," | sed 's/,/", "/g')"],
        "audit_depth": "$AUDIT_DEPTH",
        "system_info": {
            "platform": "EzAi-MFGNINJA Manufacturing Intelligence",
            "version": "1.0.0",
            "deployment_type": "government-grade",
            "environment": "production"
        },
        "framework_results": {},
        "overall_compliance": {
            "status": "PENDING",
            "score": 0,
            "violations": [],
            "recommendations": []
        }
    }
}
EOF
    
    echo "$report_file"
}

# Function to check ISO 27001 compliance
check_iso27001_compliance() {
    log COMPLIANCE "Auditing ISO 27001 Information Security Management compliance..."
    
    local violations=()
    local score=100
    local requirements_met=0
    local total_requirements=20
    
    # A.5 Information Security Policies
    log INFO "Checking A.5 Information Security Policies..."
    if [[ -f "$DEPLOYMENT_DIR/policies/information-security-policy.md" ]]; then
        ((requirements_met++))
    else
        violations+=("A.5.1.1: Information security policy document missing")
        ((score -= 5))
    fi
    
    # A.6 Organization of Information Security
    log INFO "Checking A.6 Organization of Information Security..."
    if grep -q "SECURITY_OFFICER" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((requirements_met++))
    else
        violations+=("A.6.1.1: Information security officer not defined")
        ((score -= 5))
    fi
    
    # A.8 Asset Management
    log INFO "Checking A.8 Asset Management..."
    if [[ -f "$AUDIT_DIR/../asset-inventory.json" ]]; then
        ((requirements_met++))
    else
        violations+=("A.8.1.1: Asset inventory not maintained")
        ((score -= 5))
    fi
    
    # A.9 Access Control
    log INFO "Checking A.9 Access Control..."
    if grep -q "MFA_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((requirements_met++))
    else
        violations+=("A.9.1.2: Multi-factor authentication not enforced")
        ((score -= 10))
    fi
    
    if grep -q "RBAC_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((requirements_met++))
    else
        violations+=("A.9.1.1: Role-based access control not implemented")
        ((score -= 10))
    fi
    
    # A.10 Cryptography
    log INFO "Checking A.10 Cryptography..."
    if grep -q "ENCRYPTION_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((requirements_met++))
    else
        violations+=("A.10.1.1: Encryption not properly implemented")
        ((score -= 15))
    fi
    
    # Check SSL/TLS configuration
    if [[ -f "$DEPLOYMENT_DIR/ssl/ezai-cert.pem" ]]; then
        local key_size=$(openssl x509 -in "$DEPLOYMENT_DIR/ssl/ezai-cert.pem" -noout -text 2>/dev/null | grep -o "RSA Public-Key: ([0-9]* bit)" | grep -o "[0-9]*" || echo "0")
        if [[ $key_size -ge 2048 ]]; then
            ((requirements_met++))
        else
            violations+=("A.10.1.2: Weak cryptographic key size: $key_size bits (minimum 2048)")
            ((score -= 10))
        fi
    else
        violations+=("A.10.1.2: SSL/TLS certificates not properly configured")
        ((score -= 10))
    fi
    
    # A.12 Operations Security
    log INFO "Checking A.12 Operations Security..."
    if systemctl is-active --quiet docker 2>/dev/null; then
        ((requirements_met++))
    else
        violations+=("A.12.1.1: Critical services not properly managed")
        ((score -= 5))
    fi
    
    # Check for automated backups
    if [[ -x "$SCRIPT_DIR/backup-government.sh" ]]; then
        ((requirements_met++))
    else
        violations+=("A.12.3.1: Automated backup procedures not implemented")
        ((score -= 10))
    fi
    
    # A.13 Communications Security
    log INFO "Checking A.13 Communications Security..."
    local network_count=$(docker network ls --filter driver=bridge -q | wc -l)
    if [[ $network_count -gt 1 ]]; then
        ((requirements_met++))
    else
        violations+=("A.13.1.1: Network segregation not properly implemented")
        ((score -= 10))
    fi
    
    # A.14 System Acquisition, Development and Maintenance
    log INFO "Checking A.14 System Development Security..."
    if [[ -f "$DEPLOYMENT_DIR/../.github/workflows/security-scan.yml" ]]; then
        ((requirements_met++))
    else
        violations+=("A.14.2.1: Security testing not integrated in development lifecycle")
        ((score -= 5))
    fi
    
    # A.16 Information Security Incident Management
    log INFO "Checking A.16 Incident Management..."
    if [[ -x "$SCRIPT_DIR/disaster-recovery.sh" ]]; then
        ((requirements_met++))
    else
        violations+=("A.16.1.1: Incident response procedures not documented")
        ((score -= 10))
    fi
    
    # A.17 Business Continuity Management
    log INFO "Checking A.17 Business Continuity..."
    if grep -q "DR_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((requirements_met++))
    else
        violations+=("A.17.1.1: Business continuity planning not implemented")
        ((score -= 15))
    fi
    
    # A.18 Compliance
    log INFO "Checking A.18 Compliance Requirements..."
    if [[ -f "$LOG_FILE" ]]; then
        ((requirements_met++))
    else
        violations+=("A.18.1.1: Compliance monitoring not implemented")
        ((score -= 5))
    fi
    
    local compliance_percentage=$((requirements_met * 100 / total_requirements))
    
    if [[ $compliance_percentage -ge 95 ]]; then
        log SUCCESS "ISO 27001 compliance: FULLY COMPLIANT ($compliance_percentage%)"
    elif [[ $compliance_percentage -ge 80 ]]; then
        log WARN "ISO 27001 compliance: SUBSTANTIALLY COMPLIANT ($compliance_percentage%)"
    else
        log VIOLATION "ISO 27001 compliance: NON-COMPLIANT ($compliance_percentage%)"
    fi
    
    echo "{\"framework\": \"ISO27001\", \"score\": $score, \"requirements_met\": $requirements_met, \"total_requirements\": $total_requirements, \"violations\": $(printf '%s\n' "${violations[@]}" | jq -R . | jq -s .), \"compliance_percentage\": $compliance_percentage}"
}

# Function to check SOC 2 Type II compliance
check_soc2_compliance() {
    log COMPLIANCE "Auditing SOC 2 Type II compliance..."
    
    local violations=()
    local score=100
    local controls_met=0
    local total_controls=15
    
    # Security - Logical and Physical Access Controls
    log INFO "Checking Security controls..."
    if grep -q "MFA_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("SEC-01: Multi-factor authentication not enforced")
        ((score -= 10))
    fi
    
    if grep -q "SESSION_TIMEOUT_MINUTES" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("SEC-02: Session timeout controls not configured")
        ((score -= 5))
    fi
    
    # Availability - System monitoring and incident response
    log INFO "Checking Availability controls..."
    if docker ps --filter name=prometheus -q | grep -q .; then
        ((controls_met++))
    else
        violations+=("AVL-01: System monitoring not implemented")
        ((score -= 15))
    fi
    
    if [[ -x "$SCRIPT_DIR/disaster-recovery.sh" ]]; then
        ((controls_met++))
    else
        violations+=("AVL-02: Disaster recovery procedures not documented")
        ((score -= 20))
    fi
    
    # Processing Integrity - Data validation and processing controls
    log INFO "Checking Processing Integrity controls..."
    if grep -q "DATA_VALIDATION=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("PRC-01: Data validation controls not implemented")
        ((score -= 10))
    fi
    
    if grep -q "AUDIT_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("PRC-02: Audit trail not properly configured")
        ((score -= 15))
    fi
    
    # Confidentiality - Data protection and encryption
    log INFO "Checking Confidentiality controls..."
    if grep -q "ENCRYPTION_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("CON-01: Data encryption not properly implemented")
        ((score -= 20))
    fi
    
    if [[ -f "$DEPLOYMENT_DIR/ssl/ezai-cert.pem" ]]; then
        ((controls_met++))
    else
        violations+=("CON-02: Transport layer security not configured")
        ((score -= 15))
    fi
    
    # Privacy - Personal information handling (if applicable)
    log INFO "Checking Privacy controls..."
    if grep -q "GDPR_COMPLIANCE=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("PRI-01: Privacy controls not implemented")
        ((score -= 10))
    fi
    
    # Additional SOC 2 requirements
    if [[ -f "$AUDIT_DIR/../security-policies.md" ]]; then
        ((controls_met++))
    else
        violations+=("DOC-01: Security policies not documented")
        ((score -= 5))
    fi
    
    # Risk assessment procedures
    if [[ -f "$AUDIT_DIR/../risk-assessment.json" ]]; then
        ((controls_met++))
    else
        violations+=("RISK-01: Risk assessment procedures not documented")
        ((score -= 10))
    fi
    
    # Change management
    if [[ -f "$DEPLOYMENT_DIR/../.github/workflows/deploy.yml" ]]; then
        ((controls_met++))
    else
        violations+=("CHG-01: Change management procedures not implemented")
        ((score -= 5))
    fi
    
    # System boundaries documentation
    if [[ -f "$AUDIT_DIR/../system-boundaries.md" ]]; then
        ((controls_met++))
    else
        violations+=("SYS-01: System boundaries not documented")
        ((score -= 5))
    fi
    
    # Vendor management
    if [[ -f "$AUDIT_DIR/../vendor-assessments.json" ]]; then
        ((controls_met++))
    else
        violations+=("VEN-01: Third-party vendor assessments not conducted")
        ((score -= 10))
    fi
    
    # Employee access reviews
    if [[ -f "$AUDIT_DIR/../access-reviews.json" ]]; then
        ((controls_met++))
    else
        violations+=("ACC-01: Regular access reviews not conducted")
        ((score -= 10))
    fi
    
    local compliance_percentage=$((controls_met * 100 / total_controls))
    
    if [[ $compliance_percentage -ge 90 ]]; then
        log SUCCESS "SOC 2 Type II compliance: COMPLIANT ($compliance_percentage%)"
    else
        log VIOLATION "SOC 2 Type II compliance: NON-COMPLIANT ($compliance_percentage%)"
    fi
    
    echo "{\"framework\": \"SOC2_TYPE2\", \"score\": $score, \"controls_met\": $controls_met, \"total_controls\": $total_controls, \"violations\": $(printf '%s\n' "${violations[@]}" | jq -R . | jq -s .), \"compliance_percentage\": $compliance_percentage}"
}

# Function to check NIST Cybersecurity Framework compliance
check_nist_compliance() {
    log COMPLIANCE "Auditing NIST Cybersecurity Framework compliance..."
    
    local violations=()
    local score=100
    local functions_implemented=0
    local total_functions=5
    
    # IDENTIFY (ID) - Asset Management, Business Environment, Governance, Risk Assessment
    log INFO "Checking IDENTIFY function..."
    local identify_score=20
    if [[ ! -f "$AUDIT_DIR/../asset-inventory.json" ]]; then
        violations+=("ID.AM-1: Asset inventory not maintained")
        identify_score=$((identify_score - 5))
    fi
    if [[ ! -f "$AUDIT_DIR/../risk-assessment.json" ]]; then
        violations+=("ID.RA-1: Risk assessment not conducted")
        identify_score=$((identify_score - 5))
    fi
    if [[ identify_score -ge 15 ]]; then ((functions_implemented++)); fi
    
    # PROTECT (PR) - Identity Management, Data Security, Protective Technology
    log INFO "Checking PROTECT function..."
    local protect_score=20
    if ! grep -q "MFA_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        violations+=("PR.AC-1: Multi-factor authentication not implemented")
        protect_score=$((protect_score - 7))
    fi
    if ! grep -q "ENCRYPTION_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        violations+=("PR.DS-1: Data encryption not properly implemented")
        protect_score=$((protect_score - 8))
    fi
    if [[ protect_score -ge 15 ]]; then ((functions_implemented++)); fi
    
    # DETECT (DE) - Continuous Monitoring, Detection Processes
    log INFO "Checking DETECT function..."
    local detect_score=20
    if ! docker ps --filter name=prometheus -q | grep -q .; then
        violations+=("DE.CM-1: Continuous monitoring not implemented")
        detect_score=$((detect_score - 10))
    fi
    if [[ ! -x "$SCRIPT_DIR/security-scan.sh" ]]; then
        violations+=("DE.DP-1: Security scanning not automated")
        detect_score=$((detect_score - 5))
    fi
    if [[ detect_score -ge 15 ]]; then ((functions_implemented++)); fi
    
    # RESPOND (RS) - Incident Response Planning, Communications, Analysis
    log INFO "Checking RESPOND function..."
    local respond_score=20
    if [[ ! -x "$SCRIPT_DIR/disaster-recovery.sh" ]]; then
        violations+=("RS.RP-1: Incident response procedures not documented")
        respond_score=$((respond_score - 10))
    fi
    if [[ ! -f "$AUDIT_DIR/../incident-response-plan.md" ]]; then
        violations+=("RS.CO-1: Incident communication plan not documented")
        respond_score=$((respond_score - 5))
    fi
    if [[ respond_score -ge 15 ]]; then ((functions_implemented++)); fi
    
    # RECOVER (RC) - Recovery Planning, Recovery Implementation
    log INFO "Checking RECOVER function..."
    local recover_score=20
    if ! grep -q "DR_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        violations+=("RC.RP-1: Recovery planning not implemented")
        recover_score=$((recover_score - 10))
    fi
    if [[ ! -x "$SCRIPT_DIR/backup-government.sh" ]]; then
        violations+=("RC.IM-1: Recovery implementation procedures not automated")
        recover_score=$((recover_score - 5))
    fi
    if [[ recover_score -ge 15 ]]; then ((functions_implemented++)); fi
    
    score=$((identify_score + protect_score + detect_score + respond_score + recover_score))
    local compliance_percentage=$((functions_implemented * 100 / total_functions))
    
    if [[ $compliance_percentage -ge 80 ]]; then
        log SUCCESS "NIST Framework compliance: COMPLIANT ($compliance_percentage%)"
    else
        log VIOLATION "NIST Framework compliance: NON-COMPLIANT ($compliance_percentage%)"
    fi
    
    echo "{\"framework\": \"NIST_CSF\", \"score\": $score, \"functions_implemented\": $functions_implemented, \"total_functions\": $total_functions, \"violations\": $(printf '%s\n' "${violations[@]}" | jq -R . | jq -s .), \"compliance_percentage\": $compliance_percentage}"
}

# Function to check FedRAMP compliance
check_fedramp_compliance() {
    log COMPLIANCE "Auditing FedRAMP compliance..."
    
    local violations=()
    local score=100
    local controls_met=0
    local total_controls=12
    
    # AC (Access Control) Family
    log INFO "Checking AC - Access Control..."
    if grep -q "MFA_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("AC-2: Account Management - MFA not enforced")
        ((score -= 15))
    fi
    
    # AU (Audit and Accountability) Family
    log INFO "Checking AU - Audit and Accountability..."
    if grep -q "AUDIT_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("AU-2: Audit Events - Comprehensive auditing not enabled")
        ((score -= 20))
    fi
    
    # CA (Security Assessment and Authorization) Family
    log INFO "Checking CA - Security Assessment..."
    if [[ -x "$SCRIPT_DIR/security-scan.sh" ]]; then
        ((controls_met++))
    else
        violations+=("CA-2: Security Assessments - Automated security testing not implemented")
        ((score -= 10))
    fi
    
    # CM (Configuration Management) Family
    log INFO "Checking CM - Configuration Management..."
    if [[ -f "$DEPLOYMENT_DIR/docker-compose-government.yml" ]]; then
        ((controls_met++))
    else
        violations+=("CM-2: Baseline Configuration - Infrastructure as Code not implemented")
        ((score -= 10))
    fi
    
    # CP (Contingency Planning) Family
    log INFO "Checking CP - Contingency Planning..."
    if [[ -x "$SCRIPT_DIR/disaster-recovery.sh" ]] && [[ -x "$SCRIPT_DIR/backup-government.sh" ]]; then
        ((controls_met++))
    else
        violations+=("CP-1: Contingency Planning Policy - DR/BCP procedures not implemented")
        ((score -= 25))
    fi
    
    # IA (Identification and Authentication) Family
    log INFO "Checking IA - Identification and Authentication..."
    if grep -q "STRONG_PASSWORD_POLICY=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("IA-5: Authenticator Management - Strong password policies not enforced")
        ((score -= 10))
    fi
    
    # IR (Incident Response) Family
    log INFO "Checking IR - Incident Response..."
    if grep -q "INCIDENT_EMAIL" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("IR-1: Incident Response Policy - Incident response not configured")
        ((score -= 15))
    fi
    
    # SC (System and Communications Protection) Family
    log INFO "Checking SC - System and Communications Protection..."
    if [[ -f "$DEPLOYMENT_DIR/ssl/ezai-cert.pem" ]] && grep -q "ENCRYPTION_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("SC-8: Transmission Confidentiality - Encryption not properly implemented")
        ((score -= 20))
    fi
    
    # SI (System and Information Integrity) Family
    log INFO "Checking SI - System and Information Integrity..."
    if docker ps --filter name=prometheus -q | grep -q .; then
        ((controls_met++))
    else
        violations+=("SI-4: Information System Monitoring - Continuous monitoring not implemented")
        ((score -= 15))
    fi
    
    # Additional FedRAMP-specific requirements
    if grep -q "GOVERNMENT_CERTIFICATION=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("FedRAMP-1: Government certification mode not enabled")
        ((score -= 10))
    fi
    
    if grep -q "FEDRAMP_COMPLIANCE=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("FedRAMP-2: FedRAMP compliance monitoring not enabled")
        ((score -= 5))
    fi
    
    # Check for continuous monitoring
    if [[ -f "$AUDIT_DIR/../continuous-monitoring-plan.md" ]]; then
        ((controls_met++))
    else
        violations+=("FedRAMP-3: Continuous monitoring plan not documented")
        ((score -= 10))
    fi
    
    local compliance_percentage=$((controls_met * 100 / total_controls))
    
    if [[ $compliance_percentage -ge 95 ]]; then
        log SUCCESS "FedRAMP compliance: AUTHORIZED ($compliance_percentage%)"
    elif [[ $compliance_percentage -ge 80 ]]; then
        log WARN "FedRAMP compliance: CONDITIONAL AUTHORIZATION ($compliance_percentage%)"
    else
        log VIOLATION "FedRAMP compliance: NOT AUTHORIZED ($compliance_percentage%)"
    fi
    
    echo "{\"framework\": \"FEDRAMP\", \"score\": $score, \"controls_met\": $controls_met, \"total_controls\": $total_controls, \"violations\": $(printf '%s\n' "${violations[@]}" | jq -R . | jq -s .), \"compliance_percentage\": $compliance_percentage}"
}

# Function to check GDPR compliance
check_gdpr_compliance() {
    log COMPLIANCE "Auditing GDPR compliance..."
    
    local violations=()
    local score=100
    local requirements_met=0
    local total_requirements=10
    
    # Article 25 - Data Protection by Design and by Default
    log INFO "Checking Article 25 - Data Protection by Design..."
    if grep -q "GDPR_COMPLIANCE=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((requirements_met++))
    else
        violations+=("Art.25: Data protection by design not implemented")
        ((score -= 15))
    fi
    
    # Article 30 - Records of Processing Activities
    log INFO "Checking Article 30 - Records of Processing..."
    if [[ -f "$AUDIT_DIR/../gdpr-processing-records.json" ]]; then
        ((requirements_met++))
    else
        violations+=("Art.30: Processing activity records not maintained")
        ((score -= 10))
    fi
    
    # Article 32 - Security of Processing
    log INFO "Checking Article 32 - Security of Processing..."
    if grep -q "ENCRYPTION_ENABLED=true" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((requirements_met++))
    else
        violations+=("Art.32: Encryption of personal data not implemented")
        ((score -= 20))
    fi
    
    # Article 33 - Notification of Personal Data Breach
    log INFO "Checking Article 33 - Breach Notification..."
    if grep -q "GDPR_BREACH_NOTIFICATION=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((requirements_met++))
    else
        violations+=("Art.33: Data breach notification procedures not implemented")
        ((score -= 15))
    fi
    
    # Article 35 - Data Protection Impact Assessment
    log INFO "Checking Article 35 - DPIA..."
    if [[ -f "$AUDIT_DIR/../gdpr-dpia.json" ]]; then
        ((requirements_met++))
    else
        violations+=("Art.35: Data Protection Impact Assessment not conducted")
        ((score -= 10))
    fi
    
    # Data Subject Rights (Articles 15-22)
    log INFO "Checking Data Subject Rights..."
    if grep -q "GDPR_RIGHT_TO_DELETE=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((requirements_met++))
    else
        violations+=("Art.17: Right to erasure not implemented")
        ((score -= 10))
    fi
    
    if grep -q "GDPR_DATA_PORTABILITY=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((requirements_met++))
    else
        violations+=("Art.20: Data portability not implemented")
        ((score -= 5))
    fi
    
    # Data retention policies
    log INFO "Checking data retention policies..."
    if grep -q "DATA_RETENTION_POLICY=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((requirements_met++))
    else
        violations+=("Art.5: Data retention limits not enforced")
        ((score -= 10))
    fi
    
    # Consent management
    log INFO "Checking consent management..."
    if grep -q "CONSENT_MANAGEMENT=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((requirements_met++))
    else
        violations+=("Art.7: Consent management not implemented")
        ((score -= 10))
    fi
    
    # Privacy by design implementation
    log INFO "Checking privacy by design implementation..."
    if [[ -f "$AUDIT_DIR/../privacy-impact-assessment.json" ]]; then
        ((requirements_met++))
    else
        violations+=("Art.25: Privacy by design assessment not conducted")
        ((score -= 5))
    fi
    
    local compliance_percentage=$((requirements_met * 100 / total_requirements))
    
    if [[ $compliance_percentage -ge 90 ]]; then
        log SUCCESS "GDPR compliance: COMPLIANT ($compliance_percentage%)"
    else
        log VIOLATION "GDPR compliance: NON-COMPLIANT ($compliance_percentage%)"
    fi
    
    echo "{\"framework\": \"GDPR\", \"score\": $score, \"requirements_met\": $requirements_met, \"total_requirements\": $total_requirements, \"violations\": $(printf '%s\n' "${violations[@]}" | jq -R . | jq -s .), \"compliance_percentage\": $compliance_percentage}"
}

# Function to check SOX compliance
check_sox_compliance() {
    log COMPLIANCE "Auditing SOX compliance..."
    
    local violations=()
    local score=100
    local controls_met=0
    local total_controls=8
    
    # Section 302 - Corporate Responsibility for Financial Reports
    log INFO "Checking Section 302 - Corporate Responsibility..."
    if grep -q "SOX_COMPLIANCE=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("SOX-302: Corporate responsibility controls not enabled")
        ((score -= 15))
    fi
    
    # Section 404 - Management Assessment of Internal Controls
    log INFO "Checking Section 404 - Internal Controls..."
    if grep -q "FINANCIAL_AUDIT=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("SOX-404: Financial audit controls not implemented")
        ((score -= 20))
    fi
    
    # Audit trail requirements (7-year retention)
    log INFO "Checking audit trail retention..."
    local retention_days=$(grep "AUDIT_LOG_RETENTION_DAYS" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null | cut -d= -f2 || echo "0")
    if [[ $retention_days -ge 2557 ]]; then  # 7 years
        ((controls_met++))
    else
        violations+=("SOX-RETENTION: Audit log retention not compliant ($retention_days days, required: 2557)")
        ((score -= 25))
    fi
    
    # Financial data encryption
    log INFO "Checking financial data protection..."
    if grep -q "FINANCIAL_DATA_ENCRYPTION=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("SOX-ENCRYPT: Financial data encryption not implemented")
        ((score -= 20))
    fi
    
    # Change management for financial systems
    log INFO "Checking change management..."
    if [[ -f "$AUDIT_DIR/../financial-change-log.json" ]]; then
        ((controls_met++))
    else
        violations+=("SOX-CHANGE: Financial system change management not documented")
        ((score -= 10))
    fi
    
    # Access controls for financial data
    log INFO "Checking financial data access controls..."
    if grep -q "FINANCIAL_ACCESS_CONTROL=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("SOX-ACCESS: Financial data access controls not implemented")
        ((score -= 15))
    fi
    
    # Backup and recovery for financial systems
    log INFO "Checking financial data backup..."
    if [[ -x "$SCRIPT_DIR/backup-government.sh" ]] && grep -q "FINANCIAL_BACKUP=enabled" "$DEPLOYMENT_DIR/.env.government" 2>/dev/null; then
        ((controls_met++))
    else
        violations+=("SOX-BACKUP: Financial data backup procedures not implemented")
        ((score -= 10))
    fi
    
    # Segregation of duties
    log INFO "Checking segregation of duties..."
    if [[ -f "$AUDIT_DIR/../segregation-of-duties-matrix.json" ]]; then
        ((controls_met++))
    else
        violations+=("SOX-SEGREGATION: Segregation of duties not properly documented")
        ((score -= 5))
    fi
    
    local compliance_percentage=$((controls_met * 100 / total_controls))
    
    if [[ $compliance_percentage -ge 95 ]]; then
        log SUCCESS "SOX compliance: COMPLIANT ($compliance_percentage%)"
    else
        log VIOLATION "SOX compliance: NON-COMPLIANT ($compliance_percentage%)"
    fi
    
    echo "{\"framework\": \"SOX\", \"score\": $score, \"controls_met\": $controls_met, \"total_controls\": $total_controls, \"violations\": $(printf '%s\n' "${violations[@]}" | jq -R . | jq -s .), \"compliance_percentage\": $compliance_percentage}"
}

# Function to generate comprehensive compliance report
generate_compliance_report() {
    local report_file="$1"
    local framework_results=("${@:2}")
    
    log INFO "Generating comprehensive compliance report..."
    
    # Calculate overall compliance metrics
    local total_violations=0
    local total_score=0
    local frameworks_count=0
    local compliant_frameworks=0
    
    for result in "${framework_results[@]}"; do
        local framework_score=$(echo "$result" | jq -r '.score')
        local framework_violations=$(echo "$result" | jq -r '.violations | length')
        local compliance_pct=$(echo "$result" | jq -r '.compliance_percentage')
        
        total_score=$((total_score + framework_score))
        total_violations=$((total_violations + framework_violations))
        ((frameworks_count++))
        
        if [[ $compliance_pct -ge 90 ]]; then
            ((compliant_frameworks++))
        fi
    done
    
    local average_score=$((total_score / frameworks_count))
    local overall_status="NON_COMPLIANT"
    
    if [[ $compliant_frameworks -eq $frameworks_count ]]; then
        overall_status="FULLY_COMPLIANT"
    elif [[ $compliant_frameworks -ge $((frameworks_count * 80 / 100)) ]]; then
        overall_status="SUBSTANTIALLY_COMPLIANT"
    fi
    
    # Update report with results
    local temp_file=$(mktemp)
    jq --argjson results "$(printf '%s\n' "${framework_results[@]}" | jq -s .)" \
       --arg overall_status "$overall_status" \
       --argjson average_score "$average_score" \
       --argjson total_violations "$total_violations" \
       --argjson compliant_count "$compliant_frameworks" \
       --argjson total_count "$frameworks_count" \
       '.compliance_audit.framework_results = ($results | map({(.framework): .}) | add) |
        .compliance_audit.overall_compliance = {
            "status": $overall_status,
            "average_score": $average_score,
            "total_violations": $total_violations,
            "compliant_frameworks": $compliant_count,
            "total_frameworks": $total_count,
            "compliance_percentage": (($compliant_count * 100) / $total_count)
        }' "$report_file" > "$temp_file" && mv "$temp_file" "$report_file"
    
    # Add recommendations
    local recommendations=(
        "Address all critical compliance violations immediately"
        "Implement comprehensive audit logging with 7-year retention"
        "Enforce multi-factor authentication across all systems"
        "Conduct regular compliance assessments and audits"
        "Maintain up-to-date documentation for all compliance frameworks"
        "Implement automated compliance monitoring and reporting"
        "Ensure regular staff training on compliance requirements"
        "Establish incident response procedures for compliance violations"
    )
    
    jq --argjson recommendations "$(printf '%s\n' "${recommendations[@]}" | jq -R . | jq -s .)" \
       '.compliance_audit.overall_compliance.recommendations = $recommendations' \
       "$report_file" > "$temp_file" && mv "$temp_file" "$report_file"
    
    log SUCCESS "Comprehensive compliance report generated: $report_file"
    
    # Send compliance report
    send_compliance_report "$report_file"
}

# Function to send compliance report
send_compliance_report() {
    local report_file="$1"
    local overall_status=$(jq -r '.compliance_audit.overall_compliance.status' "$report_file")
    local total_violations=$(jq -r '.compliance_audit.overall_compliance.total_violations' "$report_file")
    local compliance_pct=$(jq -r '.compliance_audit.overall_compliance.compliance_percentage' "$report_file")
    
    # Email to compliance team
    if [[ -n "$COMPLIANCE_EMAIL" ]]; then
        local subject="EzAi-MFGNINJA Compliance Audit Report - $overall_status"
        [[ "$overall_status" != "FULLY_COMPLIANT" ]] && subject="🚨 $subject"
        
        mail -s "$subject" "$COMPLIANCE_EMAIL" << EOF
EzAi-MFGNINJA Government Compliance Audit Report

Audit ID: $AUDIT_TIMESTAMP
Audit Date: $(date)
Overall Status: $overall_status
Compliance Percentage: ${compliance_pct}%
Total Violations: $total_violations

Framework Status:
$(for fw in iso27001 soc2 nist fedramp gdpr sox; do
    if jq -e ".compliance_audit.framework_results.$fw" "$report_file" >/dev/null 2>&1; then
        local fw_status=$(jq -r ".compliance_audit.framework_results.$fw.compliance_percentage" "$report_file")
        echo "- $(echo $fw | tr '[:lower:]' '[:upper:]'): ${fw_status}%"
    fi
done)

Detailed Report: $report_file

This automated report was generated by EzAi-MFGNINJA Compliance System.
For questions, contact: compliance@ezai-mfgninja.com
EOF
        
        log SUCCESS "Compliance report emailed to: $COMPLIANCE_EMAIL"
    fi
    
    # Critical notification to legal team if non-compliant
    if [[ "$overall_status" == "NON_COMPLIANT" ]] && [[ -n "$LEGAL_EMAIL" ]]; then
        mail -s "🚨 URGENT: EzAi-MFGNINJA Compliance Violations Detected" "$LEGAL_EMAIL" << EOF
URGENT COMPLIANCE NOTIFICATION

System: EzAi-MFGNINJA Manufacturing Intelligence Platform
Audit Date: $(date)
Status: NON-COMPLIANT
Violations: $total_violations

This requires immediate legal review and remediation.
Detailed report: $report_file

Contact compliance team immediately: $COMPLIANCE_EMAIL
EOF
        
        log VIOLATION "Critical compliance notification sent to legal team"
    fi
}

# Main compliance checking function
main() {
    local frameworks_to_check="${1:-$FRAMEWORKS}"
    
    print_banner
    log COMPLIANCE "Starting EzAi-MFGNINJA Government Compliance Audit"
    
    local report_file=$(init_audit_report)
    local framework_results=()
    
    IFS=',' read -ra FRAMEWORK_LIST <<< "$frameworks_to_check"
    for framework in "${FRAMEWORK_LIST[@]}"; do
        case "$framework" in
            "iso27001")
                result=$(check_iso27001_compliance)
                framework_results+=("$result")
                ;;
            "soc2")
                result=$(check_soc2_compliance)
                framework_results+=("$result")
                ;;
            "nist")
                result=$(check_nist_compliance)
                framework_results+=("$result")
                ;;
            "fedramp")
                result=$(check_fedramp_compliance)
                framework_results+=("$result")
                ;;
            "gdpr")
                result=$(check_gdpr_compliance)
                framework_results+=("$result")
                ;;
            "sox")
                result=$(check_sox_compliance)
                framework_results+=("$result")
                ;;
            *)
                log WARN "Unknown compliance framework: $framework"
                ;;
        esac
    done
    
    generate_compliance_report "$report_file" "${framework_results[@]}"
    
    log SUCCESS "Compliance audit completed successfully"
}

# Error handling
trap 'log ERROR "Compliance check failed at line $LINENO"; exit 1' ERR

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
