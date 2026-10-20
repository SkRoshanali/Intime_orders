'use client';

import { useQuery } from '@tanstack/react-query';
import type { Catalog } from '@/types/catalog';

async function fetchCatalog(): Promise<Catalog> {
  const response = await fetch('/catalog.json');
  if (!response.ok) {
    throw new Error('Failed to fetch catalog');
  }
  return response.json();
}

export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: fetchCatalog,
    staleTime: 0, // Always consider catalog stale, force fresh fetch on mount
    gcTime: 1000 * 60 * 5, // Keep in garbage collection for 5 minutes
  });
}
