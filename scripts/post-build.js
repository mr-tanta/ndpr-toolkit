const fs = require('fs');
const path = require('path');

// Move .html files to index.html in directories
function reorganizeHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    // Skip if file doesn't exist (might have been moved already)
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      reorganizeHtmlFiles(filePath);
    } else if (file.endsWith('.html') && file !== 'index.html' && file !== '404.html') {
      const baseName = file.replace('.html', '');
      const newDir = path.join(dir, baseName);
      const newPath = path.join(newDir, 'index.html');
      
      // Create directory
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      
      // Move file
      fs.renameSync(filePath, newPath);
      console.log(`Moved ${filePath} to ${newPath}`);
      
      // Also move corresponding .txt file if it exists
      const txtFile = file.replace('.html', '.txt');
      const txtPath = path.join(dir, txtFile);
      if (fs.existsSync(txtPath)) {
        const newTxtPath = path.join(newDir, 'index.txt');
        fs.renameSync(txtPath, newTxtPath);
        console.log(`Moved ${txtPath} to ${newTxtPath}`);
      }
    }
  });
}

// Start from out directory
const outDir = path.join(__dirname, '..', 'out');
console.log('Reorganizing HTML files for GitHub Pages...');
reorganizeHtmlFiles(outDir);
console.log('Done!');