const fs = require('fs');
const path = require('path');

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes("{' '}")) {
        // Replace {' '} with a single space if it's potentially between components,
        // or just remove it if it's at the end/start of a line.
        // Actually, the safest thing is to replace it with nothing if it's just a space artifact.
        content = content.replace(/\{\s*' '\s*\}/g, '');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
      }
    }
  });
}

walk('src');
