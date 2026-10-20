import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const sampleData = [
  { id: 'item-001', name: 'Milk Packet', brand: 'Amul', category: 'Dairy', unit: '1L', price: 60, step: 1, image_url: '' },
  { id: 'item-002', name: 'Garlic', brand: 'Fresh', category: 'Vegetables', unit: '1kg', price: 120, step: 0.5, image_url: '' },
  { id: 'item-003', name: 'Garam Masala', brand: 'MDH', category: 'Spices', unit: '100g', price: 85, step: 1, image_url: '' },
  { id: 'item-004', name: 'Biryani Masala', brand: 'Everest', category: 'Spices', unit: '50g', price: 45, step: 1, image_url: '' },
  { id: 'item-005', name: 'Vinegar', brand: 'Tops', category: 'Condiments', unit: '500ml', price: 35, step: 1, image_url: '' },
  { id: 'item-006', name: 'Ketchup', brand: 'Kissan', category: 'Condiments', unit: '1kg', price: 110, step: 1, image_url: '' },
  { id: 'item-007', name: 'Bay Leaf', brand: 'Catch', category: 'Spices', unit: '10g', price: 25, step: 1, image_url: '' },
  { id: 'item-008', name: 'Cumin Seeds', brand: 'Everest', category: 'Spices', unit: '100g', price: 90, step: 1, image_url: '' },
  { id: 'item-009', name: 'Turmeric Powder', brand: 'MDH', category: 'Spices', unit: '200g', price: 75, step: 1, image_url: '' },
  { id: 'item-010', name: 'Basmati Rice', brand: 'India Gate', category: 'Grains', unit: '5kg', price: 450, step: 1, image_url: '' },
  { id: 'item-011', name: 'Cooking Oil', brand: 'Fortune', category: 'Oil', unit: '1L', price: 180, step: 1, image_url: '' },
  { id: 'item-012', name: 'Onions', brand: 'Fresh', category: 'Vegetables', unit: '1kg', price: 40, step: 0.5, image_url: '' },
];

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const worksheet = XLSX.utils.json_to_sheet(sampleData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Catalog');

const filePath = path.join(dataDir, 'catalog.xlsx');
XLSX.writeFile(workbook, filePath);

console.log(`✓ Created sample catalog at ${filePath}`);
