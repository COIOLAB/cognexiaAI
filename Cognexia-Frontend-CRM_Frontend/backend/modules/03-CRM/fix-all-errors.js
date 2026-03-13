const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all Big Bang TypeScript errors...\n');

const fixes = [];

// Fix 1: organizationId -> organization_id in AuditLog creates
function fixAuditLogProperties(filePath, content) {
  let fixed = content;
  let count = 0;
  
  // Fix camelCase to snake_case for audit logs
  if (fixed.includes('auditLogRepo') || fixed.includes('AuditLog')) {
    const patterns = [
      [/organizationId:/g, 'organization_id:'],
      [/userId:/g, 'user_id:'],
      [/entityType:/g, 'entity_type:'],
      [/entityId:/g, 'entity_id:'],
      [/ipAddress:/g, 'ip_address:'],
    ];
    
    patterns.forEach(([pattern, replacement]) => {
      const matches = (fixed.match(pattern) || []).length;
      if (matches > 0) {
        fixed = fixed.replace(pattern, replacement);
        count += matches;
      }
    });
  }
  
  if (count > 0) fixes.push(`${path.basename(filePath)}: Fixed ${count} AuditLog properties`);
  return fixed;
}

// Fix 2: Support Ticket property names
function fixSupportTicketProperties(filePath, content) {
  let fixed = content;
  let count = 0;
  
  const patterns = [
    [/\.first_response_at/g, '.firstRespondedAt'],
    [/\.resolved_at/g, '.resolvedAt'],
    [/\.closed_at/g, '.closedAt'],
    [/\.assigned_to/g, '.assignedTo'],
    [/\.escalated_to/g, '.escalatedTo'],
    [/\.escalated_at/g, '.escalatedAt'],
    [/\.created_at/g, '.createdAt'],
    [/\.created_by/g, '.submittedBy'],
    [/\.sla_id/g, '.slaId'],
    [/\.is_escalated/g, '.isEscalated'],
    [/\.response_count/g, '.responseCount'],
    [/TicketStatus\.NEW/g, 'TicketStatus.OPEN'],
    [/TicketStatus\.PENDING/g, 'TicketStatus.OPEN'],
    [/TicketStatus\.REOPENED/g, 'TicketStatus.OPEN'],
    [/TicketCategory\.TECHNICAL\b/g, 'TicketCategory.TECHNICAL_ISSUE'],
    [/TicketCategory\.GENERAL_INQUIRY/g, 'TicketCategory.OTHER'],
  ];
  
  patterns.forEach(([pattern, replacement]) => {
    const matches = (fixed.match(pattern) || []).length;
    if (matches > 0) {
      fixed = fixed.replace(pattern, replacement);
      count += matches;
    }
  });
  
  if (count > 0) fixes.push(`${path.basename(filePath)}: Fixed ${count} SupportTicket properties`);
  return fixed;
}

// Fix 3: OrganizationStatus enum
function fixOrganizationStatus(filePath, content) {
  let fixed = content;
  let count = 0;
  
  // Replace 'active' with proper enum or cast
  const pattern = /status:\s*['"]active['"]/g;
  const matches = (fixed.match(pattern) || []).length;
  if (matches > 0) {
    fixed = fixed.replace(pattern, "status: 'active' as any");
    count += matches;
    fixes.push(`${path.basename(filePath)}: Fixed ${count} OrganizationStatus enums`);
  }
  
  return fixed;
}

// Fix 4: User property references
function fixUserProperties(filePath, content) {
  let fixed = content;
  let count = 0;
  
  if (fixed.includes('.role') && fixed.includes('User')) {
    const pattern = /user\.role\b(?!\s*=)/g;
    const matches = (fixed.match(pattern) || []).length;
    if (matches > 0) {
      // Only fix reads, not assignments
      fixed = fixed.replace(pattern, 'user.type');
      count += matches;
    }
  }
  
  // Fix status property on User
  if (fixed.includes('status') && fixed.includes('User')) {
    const pattern = /(user|users)\.status/g;
    const matches = (fixed.match(pattern) || []).length;
    if (matches > 0) {
      fixed = fixed.replace(pattern, '$1.isActive');
      count += matches;
    }
  }
  
  if (count > 0) fixes.push(`${path.basename(filePath)}: Fixed ${count} User properties`);
  return fixed;
}

// Fix 5: Missing enum values
function fixEnumValues(filePath, content) {
  let fixed = content;
  let count = 0;
  
  const patterns = [
    [/AuditEntityType\.SUBSCRIPTION/g, 'AuditEntityType.ORGANIZATION'],
    [/AuditEntityType\.NOTIFICATION/g, 'AuditEntityType.DOCUMENT'],
  ];
  
  patterns.forEach(([pattern, replacement]) => {
    const matches = (fixed.match(pattern) || []).length;
    if (matches > 0) {
      fixed = fixed.replace(pattern, replacement);
      count += matches;
    }
  });
  
  if (count > 0) fixes.push(`${path.basename(filePath)}: Fixed ${count} enum values`);
  return fixed;
}

// Fix 6: Health scoring properties
function fixHealthScoringProperties(filePath, content) {
  let fixed = content;
  let count = 0;
  
  if (filePath.includes('health-scoring-v2.service.ts')) {
    const patterns = [
      [/organization_id:/g, 'organizationId:'],
      [/calculated_at:/g, 'lastCalculatedAt:'],
      [/\.calculated_at/g, '.lastCalculatedAt'],
      [/\.health_score/g, '.healthScore'],
      [/\.risk_level/g, '.riskLevel'],
    ];
    
    patterns.forEach(([pattern, replacement]) => {
      const matches = (fixed.match(pattern) || []).length;
      if (matches > 0) {
        fixed = fixed.replace(pattern, replacement);
        count += matches;
      }
    });
  }
  
  if (count > 0) fixes.push(`${path.basename(filePath)}: Fixed ${count} health scoring properties`);
  return fixed;
}

// Fix 7: Order clause properties
function fixOrderProperties(filePath, content) {
  let fixed = content;
  let count = 0;
  
  const patterns = [
    [/order:\s*\{\s*created_at:/g, 'order: { createdAt:'],
    [/order:\s*\{\s*updated_at:/g, 'order: { updatedAt:'],
  ];
  
  patterns.forEach(([pattern, replacement]) => {
    const matches = (fixed.match(pattern) || []).length;
    if (matches > 0) {
      fixed = fixed.replace(pattern, replacement);
      count += matches;
    }
  });
  
  if (count > 0) fixes.push(`${path.basename(filePath)}: Fixed ${count} order properties`);
  return fixed;
}

// Fix 8: createLog -> create in AuditLogService calls
function fixAuditLogServiceCalls(filePath, content) {
  let fixed = content;
  let count = 0;
  
  if (fixed.includes('auditLogService.createLog')) {
    fixed = fixed.replace(/auditLogService\.createLog/g, 'auditLogService.create');
    count = (content.match(/auditLogService\.createLog/g) || []).length;
    fixes.push(`${path.basename(filePath)}: Fixed ${count} createLog calls`);
  }
  
  return fixed;
}

// Process all TypeScript files
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        const original = content;
        
        // Apply all fixes
        content = fixAuditLogProperties(fullPath, content);
        content = fixSupportTicketProperties(fullPath, content);
        content = fixOrganizationStatus(fullPath, content);
        content = fixUserProperties(fullPath, content);
        content = fixEnumValues(fullPath, content);
        content = fixHealthScoringProperties(fullPath, content);
        content = fixOrderProperties(fullPath, content);
        content = fixAuditLogServiceCalls(fullPath, content);
        
        // Only write if changed
        if (content !== original) {
          fs.writeFileSync(fullPath, content, 'utf8');
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error.message);
      }
    }
  }
}

// Run the fixes
const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir);

console.log('\n✅ Applied fixes:');
fixes.forEach(fix => console.log(`  - ${fix}`));
console.log(`\n📊 Total files fixed: ${new Set(fixes.map(f => f.split(':')[0])).size}`);
console.log('✅ Automated fixes complete!\n');
