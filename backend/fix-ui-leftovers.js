import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDirs = [
    path.join(__dirname, '../admin-panel/src'),
    path.join(__dirname, '../FrontendMobileApp/src')
];

function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix the leftovers from the previous flawed refactor
    // These were fragments of tracking-widest, tracking-tighter, etc.
    content = content.replace(/\ber\b/g, ''); 
    content = content.replace(/\bst\b/g, '');
    
    // Also scale down the extreme text sizes I set earlier
    content = content.replace(/text-8xl/g, 'text-5xl');
    content = content.replace(/text-7xl/g, 'text-4xl');
    content = content.replace(/text-6xl/g, 'text-3xl');
    content = content.replace(/md:text-\[10rem\]/g, 'md:text-6xl');
    content = content.replace(/text-\[48px\]/g, 'text-4xl');

    // Remove negative margins that push items out of bounds
    content = content.replace(/-mt-32/g, '');
    content = content.replace(/-mr-32/g, '');
    content = content.replace(/-ml-32/g, '');

    // Standardize letter spacing to normal English
    content = content.replace(/tracking-\[.*?\]/g, '');
    content = content.replace(/tracking-widest/g, '');
    content = content.replace(/tracking-wider/g, '');
    content = content.replace(/tracking-wide/g, '');

    // Ensure className cleanup
    content = content.replace(/\s+/g, ' '); 

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Cleaned up leftovers and scaled fonts:', filePath);
    }
}

targetDirs.forEach(dir => processDirectory(dir));
console.log('Global UI Fixup Complete.');
