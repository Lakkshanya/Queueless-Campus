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
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let issues = [];

      // Check for missing export default
      if (!content.includes('export default')) {
        issues.push('Missing export default');
      }

      // Check for swallowed code by comments
      lines.forEach((line, idx) => {
        const commentIdx = line.indexOf('//');
        if (commentIdx !== -1) {
          const afterComment = line.substring(commentIdx + 2).trim();
          // Heuristic: if there's something that looks like code after a comment on the same line
          // e.g. // some comment code()
          if (afterComment.includes(';') || afterComment.includes('const') || afterComment.includes('export') || afterComment.includes('return')) {
             issues.push(`Possible swallowed code at L${idx + 1}`);
          }
        }
      });

      // Check for illegal text between components in JSX
      // This is harder to do with regex but we can look for strings like "> <" or ">  <" or "> \n <"
      // or things like "/> <" or "/>  <"
      // Actually, React Native is sensitive to ANY text between tags.
      
      if (issues.length > 0) {
        console.log(`[${filePath}]: ${issues.join(', ')}`);
      }
    }
  });
}

console.log('--- Auditing src directory ---');
walk('src');
console.log('--- Auditing root directory ---');
const rootFiles = ['App.tsx'];
rootFiles.forEach(file => {
  if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (!content.includes('export default')) {
        console.log(`[${file}]: Missing export default`);
      }
  }
});
