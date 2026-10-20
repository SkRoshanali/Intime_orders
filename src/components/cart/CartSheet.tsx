'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { useCatalog } from '@/hooks/useCatalog';
import { CartItem } from './CartItem';
import { calculateTotal, toRupees } from '@/lib/money';
import { useEffect } from 'react';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const syncWithCatalog = useCartStore((state) => state.syncWithCatalog);
  const { data: catalog } = useCatalog();

  // Sync cart with catalog on mount
  useEffect(() => {
    if (catalog) {
      const validItemIds = catalog.items.map((item) => item.id);
      const removedItems = syncWithCatalog(validItemIds);
      
      if (removedItems.length > 0) {
        // Show toast notification
        console.log(`Removed ${removedItems.length} unavailable items from cart`);
      }
    }
  }, [catalog, syncWithCatalog]);

  if (!isOpen) return null;

  const itemsInCart = Object.entries(cartItems)
    .map(([itemId, quantity]) => {
      const item = catalog?.items.find((i) => i.id === itemId);
      return item ? { item, quantity } : null;
    })
    .filter((entry): entry is { item: NonNullable<typeof catalog>['items'][0]; quantity: number } => entry !== null);

  // Calculate total using integer-safe math
  const totalPaise = calculateTotal(
    itemsInCart.map(({ item, quantity }) => ({
      price: item.price,
      quantity,
    }))
  );
  const total = toRupees(totalPaise);

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 min-h-[44px] min-w-[44px]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {itemsInCart.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Your cart is empty</p>
          ) : (
            itemsInCart.map(({ item, quantity }) => (
              <CartItem key={item.id} item={item} quantity={quantity} />
            ))
          )}
        </div>

        {itemsInCart.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                ₹{total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 min-h-[44px]"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
