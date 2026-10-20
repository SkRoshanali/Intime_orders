'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCatalog } from '@/hooks/useCatalog';
import { ChevronRight } from 'lucide-react';

export default function CategoriesPage() {
  const router = useRouter();
  const { data: catalog, isLoading } = useCatalog();

  const categoriesWithCount = useMemo(() => {
    if (!catalog) return [];
    
    const countMap = new Map<string, number>();
    catalog.items.forEach((item) => {
      countMap.set(item.category, (countMap.get(item.category) || 0) + 1);
    });
    
    return Array.from(countMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [catalog]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading categories...</p>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen pb-20">
        <div className="max-w-[480px] mx-auto">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          </div>

          <div className="p-4">
            {categoriesWithCount.map(({ category, count }) => (
              <button
                key={category}
                onClick={() => router.push(`/?category=${category}`)}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg mb-3 hover:bg-gray-50 min-h-[44px]"
              >
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{category}</h3>
                  <p className="text-sm text-gray-500">
                    {count} {count === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
