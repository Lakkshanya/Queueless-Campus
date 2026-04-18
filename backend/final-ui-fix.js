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
    
    // 1. Fix leftover fragments
    content = content.replace(/\ber\b/g, ''); 
    content = content.replace(/\bst\b/g, '');
    
    // 2. Scale down extreme fonts
    content = content.replace(/text-8xl/g, 'text-6xl');
    content = content.replace(/text-7xl/g, 'text-5xl');
    content = content.replace(/text-\[120px\]/g, 'text-7xl');
    content = content.replace(/text-\[10rem\]/g, 'text-7xl');
    content = content.replace(/md:text-\[10rem\]/g, 'md:text-7xl');
    content = content.replace(/text-\[80px\]/g, 'text-6xl');
    content = content.replace(/text-\[48px\]/g, 'text-4xl');

    // 3. Normalize extreme rounding and padding
    content = content.replace(/rounded-\[72px\]/g, 'rounded-[40px]');
    content = content.replace(/rounded-\[60px\]/g, 'rounded-[32px]');
    content = content.replace(/rounded-\[56px\]/g, 'rounded-[32px]');
    content = content.replace(/p-20/g, 'p-12');
    content = content.replace(/p-16/g, 'p-10');

    // 4. Remove aggressive negative margins
    content = content.replace(/-mt-32/g, '');
    content = content.replace(/-mt-40/g, '');
    content = content.replace(/-mr-32/g, '');
    content = content.replace(/-mr-40/g, '');
    content = content.replace(/-ml-32/g, '');
    content = content.replace(/-ml-40/g, '');

    // 5. Fix alignment safety
    // For any text heavy component, add tracking-tight to improve appearance
    content = content.replace(/font-bold/g, 'font-bold tracking-tight');
    // But remove duplicate tracking-tight
    content = content.replace(/tracking-tight tracking-tight/g, 'tracking-tight');

    // 6. Fix specific bugs like UserIcon in imports or components
    if (content.includes('UserIcon') && !content.includes('import { UserIcon')) {
        content = content.replace(/UserIcon/g, 'User');
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Cleaned and Normalized:', filePath);
    }
}

targetDirs.forEach(dir => processDirectory(dir));
console.log('Final Global UI Normalization Complete.');
