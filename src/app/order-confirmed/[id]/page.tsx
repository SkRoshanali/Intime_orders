'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { statusLabel } from '@/lib/status';
import type { Order } from '@/types/order';

async function fetchOrder(orderId: string): Promise<Order> {
  const response = await fetch(`/api/orders/${orderId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }
  return response.json();
}

export default function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [orderId, setOrderId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);
  
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId!),
    enabled: !!orderId,
  });

  useEffect(() => {
    if (error) {
      router.push('/');
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[480px] mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>

          <p className="text-gray-600 mb-6">
            Your order has been placed successfully
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Order Number</div>
            <div className="text-3xl font-bold text-gray-900">
              #{order.orderNo}
            </div>
          </div>

          <div className="text-left space-y-3 mb-6">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Status</span>
              <span className="font-medium text-gray-900">
                {statusLabel(order.status)}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-bold text-gray-900">₹{order.total}</span>
            </div>

            <div className="py-2">
              <div className="text-gray-600 mb-1">Delivery Address</div>
              <div className="text-gray-900">
                {order.addressLine1}
                {order.addressLine2 && <>, {order.addressLine2}</>}
                <br />
                {order.city}, {order.pincode}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href={`/orders/${order.id}`}
              className="block w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 min-h-[44px] flex items-center justify-center"
            >
              View Order Details
            </Link>

            <Link
              href="/"
              className="block w-full bg-white text-emerald-600 py-3 rounded-lg font-semibold border border-emerald-600 hover:bg-emerald-50 min-h-[44px] flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
