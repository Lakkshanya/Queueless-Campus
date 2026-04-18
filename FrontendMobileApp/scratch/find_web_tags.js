const fs = require('fs');
const path = require('path');
const tags = ['div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', 'input', 'img', 'br', 'hr'];

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      tags.forEach(tag => {
        // Match <tag or </tag
        const regex = new RegExp('<' + tag + '\\b|</' + tag + '>', 'i');
        if (regex.test(content)) {
          console.log(`[${filePath}]: Contains HTML tag <${tag}>`);
        }
      });
    }
  });
}

walk('src');
