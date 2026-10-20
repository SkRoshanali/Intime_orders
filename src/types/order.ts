import type { OrderStatus } from '@/lib/status';

export interface OrderItem {
  id: string;
  itemId: string;
  nameSnapshot: string;
  brandSnapshot: string | null;
  unitSnapshot: string;
  priceSnapshot: string;
  quantity: string;
  unavailable: boolean;
}

export interface Order {
  id: string;
  orderNo: number;
  userId: string;
  agentId: string | null;
  batchId: number | null;
  status: OrderStatus;
  total: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  pincode: string;
  lat: string | null;
  lng: string | null;
  deliveryPhone: string;
  notes: string | null;
  placedAt: string;
  items?: OrderItem[];
}

export interface CreateOrderRequest {
  items: Array<{ id: string; quantity: number }>;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  pincode: string;
  deliveryPhone: string;
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNo: number;
}
