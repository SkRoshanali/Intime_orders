'use client';

import { statusLabel, type OrderStatus } from '@/lib/status';

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = statusLabel(status);
  
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-700';

  switch (status) {
    case 'PLACED':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      break;
    case 'IN_TRIP':
    case 'OUT_FOR_DELIVERY':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-700';
      break;
    case 'DELIVERED':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      break;
    case 'CANCELLED':
    case 'FAILED':
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      break;
  }

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}
    >
      {label}
    </span>
  );
}
