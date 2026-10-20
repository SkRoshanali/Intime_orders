// Placeholder script to generate PWA icons
// In production, replace with actual icon files

import * as fs from 'fs';
import * as path from 'path';

const iconsDir = path.join(process.cwd(), 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG placeholders
const createSvgIcon = (size: number) => {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#10b981"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.3}" fill="white" text-anchor="middle" dominant-baseline="middle">
    LG
  </text>
</svg>`;
};

// Note: In production, replace these SVG placeholders with proper PNG icons
fs.writeFileSync(
  path.join(iconsDir, 'icon-192.svg'),
  createSvgIcon(192)
);

fs.writeFileSync(
  path.join(iconsDir, 'icon-512.svg'),
  createSvgIcon(512)
);

console.log('✓ Created placeholder icon files');
console.log('⚠ Replace public/icons/*.svg with proper PNG icons for production');
