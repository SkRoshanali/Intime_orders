'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsOpen(false);
    router.push('/');
  };

  return (
    <>
      {/* Menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2"
          >
            <X size={24} className="text-primary-green" />
          </button>

          <nav className="mt-8 space-y-6">
            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="block text-lg font-medium text-gray-900 hover:text-primary-green"
            >
              Orders
            </Link>

            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="block text-lg font-medium text-gray-900 hover:text-primary-green"
            >
              Account
            </Link>

            <Link
              href="#about"
              onClick={() => setIsOpen(false)}
              className="block text-lg font-medium text-gray-900 hover:text-primary-green"
            >
              About
            </Link>

            <Link
              href="#help"
              onClick={() => setIsOpen(false)}
              className="block text-lg font-medium text-gray-900 hover:text-primary-green"
            >
              Help
            </Link>

            {user && (
              <button
                onClick={handleLogout}
                className="block w-full text-left text-lg font-medium text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Hamburger icon button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded"
      >
        <svg
          className="w-6 h-6 text-primary-green"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </>
  );
}
