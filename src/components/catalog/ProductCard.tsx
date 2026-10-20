'use client';

import Image from 'next/image';
import type { CatalogItem } from '@/types/catalog';
import { useCartStore } from '@/store/cart';

interface ProductCardProps {
  item: CatalogItem;
}

export function ProductCard({ item }: ProductCardProps) {
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  
  const quantity = cartItems[item.id] || 0;
  const inCart = quantity > 0;

  const handleAdd = () => {
    addItem(item.id, item.step);
  };

  const handleIncrement = () => {
    updateQuantity(item.id, quantity + item.step);
  };

  const handleDecrement = () => {
    const newQuantity = quantity - item.step;
    updateQuantity(item.id, newQuantity);
  };

  return (
    <div className="flex-shrink-0 w-48 bg-card-bg rounded-lg overflow-hidden">
      {/* Image container - square tile */}
      <div className="relative w-full aspect-square bg-sage-light overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
        
        {/* Unit badge - bottom left */}
        <div className="absolute bottom-2 left-2 bg-primary-green text-white px-2 py-1 rounded-full text-xs font-semibold uppercase">
          {item.unit}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm mb-0.5">{item.name}</h3>
        <p className="text-xs text-gray-600 mb-3">{item.brand}</p>
        
        <p className="text-lg font-bold text-black mb-3">₹{item.price}</p>
        
        {!inCart ? (
          <button
            onClick={handleAdd}
            className="w-full bg-primary-green text-white py-2.5 rounded font-semibold hover:bg-primary-green-dark min-h-[44px] text-sm"
          >
            Add +
          </button>
        ) : (
          <div className="flex items-center justify-between bg-page-bg rounded border border-primary-green">
            <button
              onClick={handleDecrement}
              className="text-primary-green p-2 min-h-[40px] min-w-[40px] hover:bg-gray-200 text-lg font-bold"
            >
              −
            </button>
            <span className="font-semibold text-gray-900 px-2 text-sm">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              className="text-primary-green p-2 min-h-[40px] min-w-[40px] hover:bg-gray-200 text-lg font-bold"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
