'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCatalog } from '@/hooks/useCatalog';
import { ProductCard } from '@/components/catalog/ProductCard';
import { RelatedItems } from '@/components/catalog/RelatedItems';
import { SearchBar } from '@/components/catalog/SearchBar';
import { searchItems } from '@/lib/search';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const { data: catalog, isLoading } = useCatalog();

  const searchResults = useMemo(() => {
    if (!catalog) return [];
    return searchItems(catalog.items, query);
  }, [catalog, query]);

  const topResult = searchResults[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading catalog...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-8 pt-4">
      <div className="px-4 mb-6">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {query.trim() ? (
        // Search results view
        searchResults.length === 0 ? (
          <div className="flex items-center justify-center min-h-[50vh] px-4">
            <div className="text-center">
              <p className="text-gray-500 text-lg">
                No items found for &quot;{query}&quot;
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Try searching with different keywords or browse categories
              </p>
            </div>
          </div>
        ) : (
          <div className="px-4">
            {/* Results header */}
            <div className="mb-6">
              <h2 className="text-sm text-gray-600 mb-4">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}{' '}
                for &quot;{query}&quot;
              </h2>

              {/* Results grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {searchResults.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Related items from top result category */}
            {topResult && catalog && (
              <RelatedItems
                category={topResult.category}
                allItems={catalog.items}
                excludeItemId={topResult.id}
              />
            )}
          </div>
        )
      ) : (
        // Empty search state
        <div className="flex items-center justify-center min-h-[50vh] px-4">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Start typing to search</p>
            <p className="text-gray-400 text-sm mt-2">
              Search by product name, brand, category, or aliases
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
