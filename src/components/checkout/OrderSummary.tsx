'use client';

import type { CatalogItem } from '@/types/catalog';

interface OrderSummaryProps {
  items: Array<{ item: CatalogItem; quantity: number }>;
}

export function OrderSummary({ items }: OrderSummaryProps) {
  const total = items.reduce((sum, { item, quantity }) => {
    return sum + item.price * quantity;
  }, 0);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
      
      <div className="space-y-2 mb-4">
        {items.map(({ item, quantity }) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="text-gray-900">{item.name}</p>
              <p className="text-gray-500 text-xs">
                {item.brand} • {item.unit} × {quantity}
              </p>
            </div>
            <p className="font-medium text-gray-900">
              ₹{(item.price * quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">
            ₹{total.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Cash on delivery</p>
      </div>
    </div>
  );
}
