const fs = require('fs');
const path = require('path');

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        // Check for common split-comment errors
        if (trimmed.startsWith('if ') && !trimmed.includes('(') && trimmed.length > 5 && !trimmed.includes('=>')) {
           console.log(`[SYNTAX ERROR?]: ${filePath} at L${idx + 1}: ${trimmed}`);
        }
        if (trimmed.startsWith('for ') && !trimmed.includes('(') && trimmed.length > 5) {
           console.log(`[SYNTAX ERROR?]: ${filePath} at L${idx + 1}: ${trimmed}`);
        }
      });
    }
  });
}

console.log('--- Verifying Mobile App Syntax ---');
walk('src');
console.log('--- Verification Complete ---');
