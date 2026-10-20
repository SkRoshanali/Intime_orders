/**
 * Convert rupees to paise (integer math)
 */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Calculate total in paise using integer math
 * Avoids floating point errors by converting to millis and paise
 */
export function calculateTotal(
  items: Array<{ price: number; quantity: number }>
): number {
  return items.reduce((sum, item) => {
    const pricePaise = toPaise(item.price);
    const qtyMillis = Math.round(item.quantity * 1000);
    const lineTotalPaise = Math.round((pricePaise * qtyMillis) / 1000);
    return sum + lineTotalPaise;
  }, 0);
}

/**
 * Convert paise to rupees
 */
export function toRupees(paise: number): number {
  return paise / 100;
}
