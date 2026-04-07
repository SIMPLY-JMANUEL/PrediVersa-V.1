const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '..', 'frontend', 'src', 'components');

// Recursively get all .jsx files
function getJsxFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getJsxFiles(fullPath, filesList);
    } else if (file.endsWith('.jsx')) {
      filesList.push(fullPath);
    }
  }
  return filesList;
}

const allJsxFiles = getJsxFiles(COMPONENTS_DIR);
console.log(`\n🎨 Processando ${allJsxFiles.length} componentes .jsx...`);

let updatedCount = 0;

allJsxFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Reemplazar: import './MyComp.css' -> import '../styles/components/MyComp.css'
  // Reemplazar: import '../MyComp.css' -> import '../../styles/components/MyComp.css'
  
  // Calculate relative depth from components folder
  const relativePath = path.relative(COMPONENTS_DIR, filePath);
  const depth = relativePath.split(path.sep).length - 1;
  const prefix = depth === 0 ? '../styles/components/' : '../../styles/components/';

  // Regex para encontrar imports de CSS
  const regex = /import\s+['"](?:\.\/|\.\.\/)([\w\-]+\.css)['"]/g;
  
  const newContent = content.replace(regex, (match, cssFile) => {
    changed = true;
    return `import '${prefix}${cssFile}'`;
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`   🔁 Actualizado: ${relativePath}`);
    updatedCount++;
  }
});

console.log(`✅ Refactorización completada: ${updatedCount} archivos actualizados.\n`);
