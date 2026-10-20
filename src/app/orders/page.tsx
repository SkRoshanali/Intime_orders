'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from '@/components/orders/OrderCard';
import { ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { data: ordersData, isLoading: ordersLoading } = useOrders();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/orders');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen pb-20 bg-gray-50">
        <div className="max-w-[480px] mx-auto">
          <div className="bg-white p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          </div>

          <div className="p-4">
            {ordersLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading orders...</p>
              </div>
            ) : !ordersData || ordersData.orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start shopping to place your first order
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 min-h-[44px]"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {ordersData.orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
