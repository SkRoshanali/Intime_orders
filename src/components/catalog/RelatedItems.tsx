'use client';

import { useMemo } from 'react';
import { ProductCard } from './ProductCard';
import type { CatalogItem } from '@/types/catalog';

interface RelatedItemsProps {
  category: string;
  allItems: CatalogItem[];
  excludeItemId?: string;
}

export function RelatedItems({
  category,
  allItems,
  excludeItemId,
}: RelatedItemsProps) {
  const relatedItems = useMemo(() => {
    return allItems
      .filter(
        (item) =>
          item.category === category &&
          (!excludeItemId || item.id !== excludeItemId)
      )
      .slice(0, 6); // Limit to 6 items for horizontal scroll
  }, [category, allItems, excludeItemId]);

  if (relatedItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 px-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        You might also need
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {relatedItems.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
