import type { CatalogItem } from '@/types/catalog';

/**
 * Calculate search relevance score for an item
 * Higher scores = more relevant matches
 */
function calculateSearchScore(item: CatalogItem, query: string): number {
  const queryLower = query.toLowerCase().trim();
  if (!queryLower) return 0;

  let score = 0;

  // Name matching (highest priority)
  const nameLower = item.name.toLowerCase();
  if (nameLower === queryLower) {
    score += 1000; // Exact match
  } else if (nameLower.startsWith(queryLower)) {
    score += 500; // Starts with query
  } else if (nameLower.includes(queryLower)) {
    score += 300; // Contains query
  }

  // Aliases matching (medium priority)
  if (item.aliases) {
    const aliases = item.aliases
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter((a) => a);

    if (aliases.some((a) => a === queryLower)) {
      score += 400; // Exact alias match
    } else if (aliases.some((a) => a.startsWith(queryLower))) {
      score += 250; // Alias starts with
    } else if (aliases.some((a) => a.includes(queryLower))) {
      score += 200; // Alias contains
    }
  }

  // Brand matching (lower priority)
  const brandLower = item.brand.toLowerCase();
  if (brandLower === queryLower) {
    score += 100;
  } else if (brandLower.includes(queryLower)) {
    score += 50;
  }

  // Category matching (lowest priority)
  const categoryLower = item.category.toLowerCase();
  if (categoryLower.includes(queryLower)) {
    score += 25;
  }

  return score;
}

/**
 * Search items by query string across name, brand, category, and aliases
 * Returns results sorted by relevance (highest first)
 */
export function searchItems(items: CatalogItem[], query: string): CatalogItem[] {
  if (!query.trim()) {
    return [];
  }

  return items
    .filter((item) => calculateSearchScore(item, query) > 0)
    .sort((a, b) => calculateSearchScore(b, query) - calculateSearchScore(a, query));
}
