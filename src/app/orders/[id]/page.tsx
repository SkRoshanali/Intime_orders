'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOrderPolling } from '@/hooks/useOrderPolling';
import { StatusBadge } from '@/components/orders/StatusBadge';
import { ChevronLeft } from 'lucide-react';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  
  // Unwrap async params
  const [orderId, setOrderId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);
  
  const { data: order, isLoading: orderLoading, error } = useOrderPolling(orderId || '');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/orders');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      router.push('/orders');
    }
  }, [error, router]);

  if (authLoading || !isAuthenticated || orderLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const placedDate = new Date(order.placedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <main className="min-h-screen pb-20 bg-gray-50">
        <div className="max-w-[480px] mx-auto">
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNo}
              </h1>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Status Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Status</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Placed on</span>
                <span className="text-sm font-medium text-gray-900">
                  {placedDate}
                </span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">
                Delivery Address
              </h2>
              <div className="text-sm text-gray-700">
                <p>{order.addressLine1}</p>
                {order.addressLine2 && <p>{order.addressLine2}</p>}
                <p>
                  {order.city}, {order.pincode}
                </p>
                <p className="mt-2 text-gray-600">
                  Phone: {order.deliveryPhone}
                </p>
                {order.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-gray-600 text-xs mb-1">Delivery Notes:</p>
                    <p className="text-gray-900">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Order Items</h2>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.nameSnapshot}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.brandSnapshot && `${item.brandSnapshot} • `}
                        {item.unitSnapshot}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        ₹{item.priceSnapshot} × {parseFloat(item.quantity)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{(parseFloat(item.priceSnapshot) * parseFloat(item.quantity)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{order.total}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Cash on delivery</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
