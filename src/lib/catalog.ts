import { readFileSync } from 'fs';
import { join } from 'path';
import type { Catalog } from '@/types/catalog';

export function loadCatalog(): Catalog {
  const catalogPath = join(process.cwd(), 'public', 'catalog.json');
  const catalogData = readFileSync(catalogPath, 'utf-8');
  return JSON.parse(catalogData);
}
