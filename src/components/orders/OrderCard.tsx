'use client';

import Link from 'next/link';
import { StatusBadge } from './StatusBadge';
import type { Order } from '@/types/order';

interface OrderCardProps {
  order: Order;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return diffMins === 0 ? 'Just now' : `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 min-h-[44px]"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">Order #{order.orderNo}</h3>
          <p className="text-sm text-gray-500">{formatDate(order.placedAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-sm text-gray-600">Total Amount</span>
        <span className="font-bold text-gray-900">₹{order.total}</span>
      </div>
    </Link>
  );
}
