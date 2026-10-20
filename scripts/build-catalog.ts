import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const dataPath = path.join(process.cwd(), 'data', 'catalog.xlsx');
const outputPath = path.join(process.cwd(), 'public', 'catalog.json');
const productImagesDir = path.join(process.cwd(), 'public', 'product-images');

if (!fs.existsSync(dataPath)) {
  console.error('Error: data/catalog.xlsx not found');
  process.exit(1);
}

// Function to find image file for an item
function findImagePath(itemId: string): string | null {
  const extensions = ['jpg', 'jpeg', 'png', 'webp'];
  
  for (const ext of extensions) {
    const filePath = path.join(productImagesDir, `${itemId}.${ext}`);
    if (fs.existsSync(filePath)) {
      return `/product-images/${itemId}.${ext}`;
    }
  }
  
  return null;
}

// Read Excel file
const workbook = XLSX.readFile(dataPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const items = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

// Validate required columns
const requiredColumns = ['id', 'name', 'brand', 'category', 'unit', 'price', 'step'];
if (items.length > 0) {
  const firstItem = items[0];
  const missingColumns = requiredColumns.filter(col => !(col in firstItem));
  if (missingColumns.length > 0) {
    console.error(`Error: Missing required columns: ${missingColumns.join(', ')}`);
    process.exit(1);
  }
}

// Process items: derive image from local files, keep aliases if present
const processedItems = items.map((item) => {
  const processed: Record<string, unknown> = {
    id: item.id,
    name: item.name,
    brand: item.brand,
    category: item.category,
    unit: item.unit,
    price: item.price,
    step: item.step,
  };
  
  // Try to find local image file first
  const localImage = findImagePath(String(item.id));
  if (localImage) {
    processed.image_url = localImage;
  } else if (item.image_url) {
    // Fall back to Excel column if local file not found
    processed.image_url = item.image_url;
  }
  // If neither exists, image_url is not set (stays null/undefined)
  
  if (item.aliases && String(item.aliases).trim()) {
    processed.aliases = String(item.aliases).trim();
  }
  
  return processed;
});

// Calculate content-based version hash (SHA-256)
const itemsJson = JSON.stringify(processedItems);
const hash = crypto.createHash('sha256').update(itemsJson).digest('hex');
const version = hash.substring(0, 16);

// Create catalog with version
const catalog = {
  version,
  items: processedItems,
};

// Ensure public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write catalog.json
fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2));

console.log(`✓ Generated catalog.json with ${items.length} items`);
console.log(`✓ Version: ${version}`);

// Report on missing images
const itemsWithoutImages = processedItems.filter(item => !item.image_url);
if (itemsWithoutImages.length > 0) {
  console.log(`⚠ ${itemsWithoutImages.length} item(s) without local or Excel image:`);
  itemsWithoutImages.forEach(item => {
    console.log(`  - ${item.id}`);
  });
}
