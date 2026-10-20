'use client';

import { ShoppingCart } from 'lucide-react';
import type { CartState } from '@/store/cart';
import { useCartStore } from '@/store/cart';
import { useCatalog } from '@/hooks/useCatalog';
import { calculateTotal, toRupees } from '@/lib/money';
import { useCartModal } from '@/components/cart/CartModal';

export function CartBar(): React.ReactNode {
  const cartItems = useCartStore((state: CartState) => state.items);
  const { data: catalog } = useCatalog();
  const { openCart } = useCartModal();
  
  const itemCount = Object.keys(cartItems).length;
  
  // Calculate total using integer-safe math
  const itemsData = Object.entries(cartItems)
    .map(([itemId, quantity]) => {
      const item = catalog?.items.find((i) => i.id === itemId);
      return item ? { price: item.price, quantity } : null;
    })
    .filter((item): item is { price: number; quantity: number } => item !== null);
  
  const totalPaise = calculateTotal(itemsData);
  const total = toRupees(totalPaise);

  if (itemCount === 0) {
    return null;
  }

  return (
    <button
      onClick={openCart}
      className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-emerald-600 text-white py-3 px-6 rounded-xl shadow-lg flex items-center justify-between z-30 hover:bg-emerald-700"
    >
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-5 h-5" />
        <span className="font-medium">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>
      <span className="font-bold">₹{total.toFixed(2)}</span>
    </button>
  );
}
