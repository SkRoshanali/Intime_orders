'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Order } from '@/types/order';
import { isActiveStatus } from '@/lib/status';

async function fetchOrder(orderId: string): Promise<Order> {
  const response = await fetch(`/api/orders/${orderId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }
  return response.json();
}

export function useOrderPolling(orderId: string) {
  const query = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId),
    staleTime: 0, // Always consider stale to enable refetch
    refetchInterval: (query) => {
      // Poll every 30 seconds if status is active, otherwise stop
      const order = query.state.data;
      return order?.status && isActiveStatus(order.status) ? 30000 : false;
    },
    refetchIntervalInBackground: false, // Only poll when tab is visible
  });

  // Refetch on window focus if status is still active
  useEffect(() => {
    const handleFocus = () => {
      if (query.data?.status && isActiveStatus(query.data.status)) {
        query.refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [query]);

  return query;
}
