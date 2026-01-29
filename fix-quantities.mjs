import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  'src/data/allStoreProducts.ts',
  'src/data/deltaProducts.ts',
  'src/data/sheirineScraper.ts',
  'src/data/stores/delta-store/products.ts',
  'src/data/stores/nawaem/products.ts',
  'src/data/stores/sheirine/products.ts'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('inStock:')) {
      if (!line.includes('quantity:') && !lines[i - 1].includes('quantity:')) {
        const match = line.match(/^(\s*)(.*)inStock:/);
        if (match) {
          lines[i] = match[1] + match[2] + 'quantity: 10, inStock:';
          modified = true;
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`✓ Fixed ${file}`);
  }
}
