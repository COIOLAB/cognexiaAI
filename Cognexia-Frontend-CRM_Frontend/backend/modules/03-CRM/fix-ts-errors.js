/**
 * Script to fix common TypeScript compilation errors
 * Run with: node fix-ts-errors.js
 */

const fs = require('fs');
const path = require('path');

// Common fixes
const fixes = [
  // Fix: roles.map is not a function (roles is string[], should be Role[])
  {
    pattern: /roles: user\.roles\.map\(role => role\.name\),/g,
    replacement: 'roles: user.roles || [],',
  },
  {
    pattern: /permissions: user\.roles\.map\(role => role\.permissions\)\.flat\(\),/g,
    replacement: 'permissions: user.permissions || [],',
  },
  // Fix: Property 'phone' does not exist - should be 'phoneNumber'
  {
    pattern: /phone: dto\.phone,/g,
    replacement: 'phoneNumber: dto.phone,',
  },
  // Fix: Property 'name' does not exist on Role (it's a string)
  {
    pattern: /role\.name/g,
    replacement: 'role',
  },
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  fixes.forEach(fix => {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fixFile(fullPath);
    }
  });
}

// Run fixes
const srcDir = path.join(__dirname, 'src');
console.log('Starting TypeScript error fixes...\n');
processDirectory(srcDir);
console.log('\nDone! Run npm run build to verify.');
