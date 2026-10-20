'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useCartModal } from '@/components/cart/CartModal';
import { HamburgerMenu } from './HamburgerMenu';

export function TopNav() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const itemCount = Object.values(items).length;
  const { openCart } = useCartModal();

  const handleSearchClick = () => {
    router.push('/search');
  };

  const handleCartClick = () => {
    openCart();
  };

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between max-w-full">
        {/* Left: App name */}
        <Link href="/" className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-primary-green">Intime</h1>
        </Link>

        {/* Right: Icons */}
        <div className="flex items-center gap-4">
          {/* Search icon */}
          <button 
            onClick={handleSearchClick}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Search size={20} className="text-primary-green" />
          </button>

          {/* Cart icon with badge */}
          <button
            onClick={handleCartClick}
            className="p-2 hover:bg-gray-100 rounded relative"
          >
            <ShoppingCart size={20} className="text-primary-green" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {/* Hamburger menu */}
          <HamburgerMenu />
        </div>
      </div>
    </nav>
  );
}
