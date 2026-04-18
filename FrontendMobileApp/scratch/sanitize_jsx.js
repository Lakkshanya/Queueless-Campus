const fs = require('fs');
const path = require('path');

function sanitizeJSX(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Remove all whitespace between tags
  // This handles > \n < and >   <
  // We use a regex that looks for whitespace between a closing tag or self-closing tag and an opening tag
  // Pattern: > followed by whitespace followed by <
  content = content.replace(/>\s+</g, '><');

  // 2. Remove all {' '} and {''} artifacts again just in case
  content = content.replace(/\{\s*' '\s*\}/g, '');
  content = content.replace(/\{\s*''\s*\}/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[SANITIZED]: ${filePath}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      sanitizeJSX(filePath);
    }
  });
}

console.log('--- Starting Ultimate JSX Sanitization ---');
walk('src');
console.log('--- Sanitization Complete ---');
