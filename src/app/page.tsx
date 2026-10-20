'use client';

import { useMemo } from 'react';
import { useCatalog } from '@/hooks/useCatalog';
import { CategorySection } from '@/components/catalog/CategorySection';
import { CATEGORY_ORDER } from '@/lib/constants';
import type { CatalogItem } from '@/types/catalog';

export default function Home() {
  const { data: catalog, isLoading } = useCatalog();

  const groupedByCategory = useMemo(() => {
    if (!catalog) return new Map<string, CatalogItem[]>();
    
    const groups = new Map<string, CatalogItem[]>();
    
    // Group items by category
    catalog.items.forEach((item) => {
      if (!groups.has(item.category)) {
        groups.set(item.category, []);
      }
      groups.get(item.category)!.push(item);
    });

    // Sort categories: fixed order first, then alphabetical for others
    const sorted = new Map(
      Array.from(groups.entries()).sort(([categoryA], [categoryB]) => {
        // Get indices (case-insensitive matching)
        const indexA = CATEGORY_ORDER.findIndex(
          (cat) => cat.toLowerCase() === categoryA.toLowerCase()
        );
        const indexB = CATEGORY_ORDER.findIndex(
          (cat) => cat.toLowerCase() === categoryB.toLowerCase()
        );

        // If both are in the order list, sort by index
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }

        // If only A is in the list, A comes first
        if (indexA !== -1) return -1;

        // If only B is in the list, B comes first
        if (indexB !== -1) return 1;

        // Both are not in the list, sort alphabetically
        return categoryA.localeCompare(categoryB);
      })
    );

    return sorted;
  }, [catalog]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading catalog...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-8 pt-4">
      <div className="max-w-full">
        {groupedByCategory.size === 0 ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-gray-500">No products available</p>
          </div>
        ) : (
          Array.from(groupedByCategory.entries()).map(([category, items]) => (
            <CategorySection
              key={category}
              category={category}
              items={items}
            />
          ))
        )}
      </div>
    </main>
  );
}
