'use client';

import { useQuery } from '@tanstack/react-query';
import type { Order } from '@/types/order';

interface OrdersResponse {
  orders: Order[];
  total: number;
}

async function fetchOrders(): Promise<OrdersResponse> {
  const response = await fetch('/api/orders');
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    staleTime: 30 * 1000, // 30 seconds
  });
}
