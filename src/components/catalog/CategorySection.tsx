'use client';

import Link from 'next/link';
import type { CatalogItem } from '@/types/catalog';
import { ProductCard } from './ProductCard';

interface CategorySectionProps {
  category: string;
  items: CatalogItem[];
}

export function CategorySection({ category, items }: CategorySectionProps) {
  return (
    <div className="mb-8">
      {/* Category header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-xl font-bold text-gray-900">{category}</h2>
        <Link
          href={`/categories?category=${encodeURIComponent(category)}`}
          className="text-sm font-semibold text-primary-green hover:text-primary-green-dark"
        >
          See All
        </Link>
      </div>

      {/* Horizontal scrolling cards */}
      <div className="horizontal-scroll px-4">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
