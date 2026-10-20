'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CartSheet } from './CartSheet';

interface CartModalContextType {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartModalContext = createContext<CartModalContextType | undefined>(undefined);

export function CartModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CartModalContext.Provider
      value={{
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
      <CartSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </CartModalContext.Provider>
  );
}

export function useCartModal() {
  const context = useContext(CartModalContext);
  if (!context) {
    throw new Error('useCartModal must be used within CartModalProvider');
  }
  return context;
}
