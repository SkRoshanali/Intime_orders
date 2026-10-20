'use client';

import { Plus, Minus, Trash2 } from 'lucide-react';
import type { CatalogItem } from '@/types/catalog';
import { useCartStore } from '@/store/cart';
import { calculateTotal, toRupees } from '@/lib/money';

interface CartItemProps {
  item: CatalogItem;
  quantity: number;
}

export function CartItem({ item, quantity }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const handleIncrement = () => {
    updateQuantity(item.id, quantity + item.step);
  };

  const handleDecrement = () => {
    updateQuantity(item.id, quantity - item.step);
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  // Use integer-safe calculation for subtotal
  const subtotalPaise = calculateTotal([{ price: item.price, quantity }]);
  const subtotal = toRupees(subtotalPaise);

  return (
    <div className="flex items-center gap-3 py-4 border-b border-gray-200">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{item.name}</h4>
        <p className="text-sm text-gray-600">{item.brand} • {item.unit}</p>
        <p className="text-sm font-semibold text-gray-900 mt-2">
          ₹{item.price} × {quantity} = ₹{subtotal.toFixed(2)}
        </p>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Stepper - matching ProductCard style */}
        <div className="flex items-center justify-between bg-page-bg rounded border border-primary-green">
          <button
            onClick={handleDecrement}
            className="text-primary-green p-2 min-h-[40px] min-w-[40px] hover:bg-gray-200 text-lg font-bold"
          >
            −
          </button>
          <span className="font-semibold text-gray-900 px-2 text-sm min-w-[35px] text-center">
            {quantity}
          </span>
          <button
            onClick={handleIncrement}
            className="text-primary-green p-2 min-h-[40px] min-w-[40px] hover:bg-gray-200 text-lg font-bold"
          >
            +
          </button>
        </div>
        
        {/* Remove button */}
        <button
          onClick={handleRemove}
          className="text-red-500 p-2 min-h-[44px] min-w-[44px] hover:bg-red-50 rounded"
          title="Remove from cart"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
