const fs = require('fs');
const path = require('path');

const WEB_TAGS = {
  'div': 'View',
  'span': 'Text',
  'h1': 'Text',
  'h2': 'Text',
  'h3': 'Text',
  'h4': 'Text',
  'h5': 'Text',
  'h6': 'Text',
  'p': 'Text',
  'a': 'TouchableOpacity',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let lines = content.split('\n');

  // 1. Fix Swallowed Code (e.g. // comment code();)
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

  // 2. Fix Web Tags (div, span, etc.)
  for (const [web, rn] of Object.entries(WEB_TAGS)) {
    const startTag = new RegExp('<' + web + '\\b', 'g');
    const endTag = new RegExp('</' + web + '>', 'g');
    content = content.replace(startTag, '<' + rn);
    content = content.replace(endTag, '</' + rn + '>');
  }

  // 3. Remove {' '} artifacts
  content = content.replace(/\{\s*' '\s*\}/g, '');
  content = content.replace(/\{\s*''\s*\}/g, '');

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
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      processFile(filePath);
    }
  });
}

console.log('--- Starting Mobile Codebase Remediation ---');
walk('src');
console.log('--- Remediation Complete ---');
