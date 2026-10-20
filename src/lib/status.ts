export type OrderStatus =
  | 'PLACED'
  | 'IN_TRIP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';

/**
 * Convert order status to customer-friendly label
 */
export function statusLabel(status: OrderStatus): string {
  switch (status) {
    case 'PLACED':
      return 'Order is placed';
    case 'IN_TRIP':
    case 'OUT_FOR_DELIVERY':
      return 'Out for delivery';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    case 'FAILED':
      return 'Delivery failed';
  }
}

/**
 * Check if order status is active (should poll for updates)
 */
export function isActiveStatus(status: OrderStatus): boolean {
  return (
    status === 'PLACED' ||
    status === 'IN_TRIP' ||
    status === 'OUT_FOR_DELIVERY'
  );
}
