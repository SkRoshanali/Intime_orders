'use client';

import { MapPin } from 'lucide-react';
import { PINCODE_REGEX } from '@/lib/validation';

interface AddressFormProps {
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  deliveryPhone: string;
  notes: string;
  lat: number | null;
  lng: number | null;
  onAddressLine1Change: (value: string) => void;
  onAddressLine2Change: (value: string) => void;
  onCityChange: (value: string) => void;
  onPincodeChange: (value: string) => void;
  onDeliveryPhoneChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onLocationClick: () => void;
}

export function AddressForm({
  addressLine1,
  addressLine2,
  city,
  pincode,
  deliveryPhone,
  notes,
  lat,
  lng,
  onAddressLine1Change,
  onAddressLine2Change,
  onCityChange,
  onPincodeChange,
  onDeliveryPhoneChange,
  onNotesChange,
  onLocationClick,
}: AddressFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="addressLine1"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Address Line 1 *
        </label>
        <input
          id="addressLine1"
          type="text"
          value={addressLine1}
          onChange={(e) => onAddressLine1Change(e.target.value)}
          required
          autoComplete="address-line1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
        />
      </div>

      <div>
        <label
          htmlFor="addressLine2"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Address Line 2
        </label>
        <input
          id="addressLine2"
          type="text"
          value={addressLine2}
          onChange={(e) => onAddressLine2Change(e.target.value)}
          autoComplete="address-line2"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            City *
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            required
            autoComplete="address-level2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
          />
        </div>

        <div>
          <label
            htmlFor="pincode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Pincode *
          </label>
          <input
            id="pincode"
            type="tel"
            inputMode="numeric"
            value={pincode}
            onChange={(e) => onPincodeChange(e.target.value)}
            required
            pattern={PINCODE_REGEX.source}
            maxLength={6}
            autoComplete="postal-code"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="deliveryPhone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Delivery Phone *
        </label>
        <input
          id="deliveryPhone"
          type="tel"
          inputMode="numeric"
          value={deliveryPhone}
          onChange={(e) => onDeliveryPhoneChange(e.target.value)}
          required
          pattern="[6-9]\d{9}"
          maxLength={10}
          autoComplete="tel"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
        />
      </div>

      <div>
        <button
          type="button"
          onClick={onLocationClick}
          className="flex items-center gap-2 px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 min-h-[44px]"
        >
          <MapPin className="w-5 h-5" />
          Use current location
        </button>
        {lat && lng && (
          <p className="text-xs text-gray-500 mt-1">
            Location captured: {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Delivery Notes (Optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          placeholder="Any special instructions for delivery"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
        />
      </div>
    </div>
  );
}
