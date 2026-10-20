'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartState {
  items: Record<string, number>; // itemId -> quantity
  addItem: (itemId: string, quantity: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  syncWithCatalog: (validItemIds: string[]) => string[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      
      addItem: (itemId, quantity) => {
        set((state) => ({
          items: { ...state.items, [itemId]: quantity },
        }));
      },
      
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          const { [itemId]: _, ...rest } = get().items;
          set({ items: rest });
        } else {
          set((state) => ({
            items: { ...state.items, [itemId]: quantity },
          }));
        }
      },
      
      removeItem: (itemId) => {
        const { [itemId]: _, ...rest } = get().items;
        set({ items: rest });
      },
      
      clearCart: () => {
        set({ items: {} });
      },
      
      syncWithCatalog: (validItemIds) => {
        const currentItems = get().items;
        const removedItems: string[] = [];
        const validItems: Record<string, number> = {};
        
        Object.entries(currentItems).forEach(([itemId, quantity]) => {
          if (validItemIds.includes(itemId)) {
            validItems[itemId] = quantity;
          } else {
            removedItems.push(itemId);
          }
        });
        
        if (removedItems.length > 0) {
          set({ items: validItems });
        }
        
        return removedItems;
      },
    }),
    {
      name: 'cart-v1',
    }
  )
);
