/**
 * Validate quantity is an exact multiple of step using integer math
 * Converts to millis (x1000) to avoid floating point errors
 */
export function isValidQuantity(quantity: number, step: number): boolean {
  if (quantity <= 0) return false;
  
  const qtyMillis = Math.round(quantity * 1000);
  const stepMillis = Math.round(step * 1000);
  
  return qtyMillis % stepMillis === 0;
}

/**
 * Phone validation: Indian 10-digit starting with 6-9
 */
export const PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * Pincode validation: 6-digit
 */
export const PINCODE_REGEX = /^\d{6}$/;
