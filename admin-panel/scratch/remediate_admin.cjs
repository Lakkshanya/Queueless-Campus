const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let lines = content.split('\n');

  // Fix Swallowed Code (e.g. // comment code();)
  let newLines = lines.flatMap(line => {
    const commentIdx = line.indexOf('//');
    if (commentIdx !== -1 && !line.trim().startsWith('//')) {
      const beforeComment = line.substring(0, commentIdx);
      const afterComment = line.substring(commentIdx);
      const splitIdx = afterComment.search(/\s+(const|let|var|export|return|if|for|while|api|this|dispatch|set[A-Z]|use[A-Z]|<)/);
      if (splitIdx !== -1) {
        return [beforeComment + afterComment.substring(0, splitIdx + 1), afterComment.substring(splitIdx + 1).trim()];
      }
    }
    return [line];
  });

  // Handle cases where the whole line starts with a comment but has code after it
  newLines = newLines.flatMap(line => {
    if (line.trim().startsWith('//')) {
        const splitIdx = line.search(/\s+(const|let|var|export|return|if|for|while|api|this|dispatch|set[A-Z]|use[A-Z]|<)/);
        if (splitIdx !== -1) {
            return [line.substring(0, splitIdx), line.substring(splitIdx).trim()];
        }
    }
    return [line];
  });

  content = newLines.join('\n');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[FIXED]: ${filePath}`);
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
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      processFile(filePath);
    }
  });
}

console.log('--- Starting Admin Panel Remediation ---');
walk('src');
console.log('--- Remediation Complete ---');
