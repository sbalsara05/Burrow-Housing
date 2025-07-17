const fs = require('fs');
const path = require('path');

const fixImports = (filePath) => {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Fix ES6 imports to CommonJS
        content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, (match, defaultImport, module) => {
            modified = true;
            return `const ${defaultImport} = require('${module}')`;
        });
        
        content = content.replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g, (match, imports, module) => {
            modified = true;
            return `const { ${imports} } = require('${module}')`;
        });
        
        content = content.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, (match, alias, module) => {
            modified = true;
            return `const ${alias} = require('${module}')`;
        });
        
        // Fix ES6 exports to CommonJS
        content = content.replace(/export\s+default\s+/, 'module.exports = ');
        content = content.replace(/export\s+\{([^}]+)\}/, (match, exports) => {
            modified = true;
            const exportList = exports.split(',').map(e => e.trim()).map(e => `  ${e}: ${e}`).join(',\n');
            return `module.exports = {\n${exportList}\n}`;
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`✓ Fixed imports in ${filePath}`);
        }
        
        return modified;
    } catch (error) {
        console.error(`Error fixing ${filePath}:`, error.message);
        return false;
    }
};

const scanAndFix = (dirPath) => {
    try {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && item !== 'node_modules') {
                scanAndFix(fullPath);
            } else if (stat.isFile() && item.endsWith('.js')) {
                fixImports(fullPath);
            }
        });
    } catch (error) {
        console.error(`Error scanning ${dirPath}:`, error.message);
    }
};

console.log('Starting ES6 to CommonJS conversion...');
scanAndFix('./');
console.log('Conversion complete!');
