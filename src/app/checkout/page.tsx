'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCatalog } from '@/hooks/useCatalog';
import { useCartStore } from '@/store/cart';
import { AddressForm } from '@/components/checkout/AddressForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { isValidQuantity } from '@/lib/validation';
import { MAX_QTY_PER_LINE } from '@/lib/constants';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { data: catalog } = useCatalog();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/checkout');
    }
  }, [authLoading, isAuthenticated, router]);

  // Address form state
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill phone from user
  useEffect(() => {
    if (user?.phone) {
      setDeliveryPhone(user.phone);
    }
  }, [user]);

  // Cart items with catalog data
  const cartItemsWithData = useMemo(() => {
    if (!catalog) return [];
    return Object.entries(cartItems)
      .map(([itemId, quantity]) => {
        const item = catalog.items.find((i) => i.id === itemId);
        return item ? { item, quantity } : null;
      })
      .filter((entry): entry is { item: NonNullable<typeof catalog>['items'][0]; quantity: number } => entry !== null);
  }, [catalog, cartItems]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!authLoading && isAuthenticated && cartItemsWithData.length === 0) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, cartItemsWithData.length, router]);

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setError('');
      },
      (err) => {
        setError('Failed to get location: ' + err.message);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Refetch latest catalog prices before submission to ensure accuracy
      const catalogResponse = await fetch('/catalog.json');
      if (!catalogResponse.ok) {
        throw new Error('Failed to fetch latest prices');
      }
      const latestCatalog: typeof catalog = await catalogResponse.json();
      
      // Validate quantities against latest catalog
      const itemsToOrder = cartItemsWithData
        .map(({ item, quantity }) => {
          const latestItem = latestCatalog?.items.find((i) => i.id === item.id);
          if (!latestItem) {
            throw new Error(`Item ${item.name} is no longer available`);
          }
          if (!isValidQuantity(quantity, latestItem.step)) {
            throw new Error(
              `Invalid quantity for ${latestItem.name}. Must be a multiple of ${latestItem.step}`
            );
          }
          if (quantity > MAX_QTY_PER_LINE) {
            throw new Error(
              `Quantity for ${latestItem.name} exceeds maximum of ${MAX_QTY_PER_LINE}`
            );
          }
          return {
            id: latestItem.id,
            quantity,
          };
        });

      setIsSubmitting(true);

      // Generate idempotency key
      const idempotencyKey = crypto.randomUUID();

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          items: itemsToOrder,
          addressLine1,
          addressLine2: addressLine2 || undefined,
          city,
          pincode,
          deliveryPhone,
          notes: notes || undefined,
          lat: lat || undefined,
          lng: lng || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Clear cart
      clearCart();

      // Redirect to confirmation
      router.push(`/order-confirmed/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      setIsSubmitting(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (cartItemsWithData.length === 0) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen pb-24 bg-gray-50">
      <div className="max-w-[480px] mx-auto">
        <div className="bg-white p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Delivery Address
            </h2>
            <AddressForm
              addressLine1={addressLine1}
              addressLine2={addressLine2}
              city={city}
              pincode={pincode}
              deliveryPhone={deliveryPhone}
              notes={notes}
              lat={lat}
              lng={lng}
              onAddressLine1Change={setAddressLine1}
              onAddressLine2Change={setAddressLine2}
              onCityChange={setCity}
              onPincodeChange={setPincode}
              onDeliveryPhoneChange={setDeliveryPhone}
              onNotesChange={setNotes}
              onLocationClick={handleLocationClick}
            />
          </div>

          <OrderSummary items={cartItemsWithData} />

          <div className="sticky bottom-0 bg-white p-4 -mx-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 min-h-[44px]"
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
