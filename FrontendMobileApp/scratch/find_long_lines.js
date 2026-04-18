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
      if (lines.some(l => l.length > 500)) {
        console.log(`[LONG LINE DETECTED]: ${filePath}`);
      }
    }
  });
}

console.log('--- Auditing for Long Lines (Correlation with Corruption) ---');
walk('src');
console.log('--- Audit Complete ---');
