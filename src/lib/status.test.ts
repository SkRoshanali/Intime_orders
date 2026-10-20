import { describe, it, expect } from 'vitest';
import { statusLabel, isActiveStatus, type OrderStatus } from './status';

describe('statusLabel', () => {
  it('should return correct label for PLACED', () => {
    expect(statusLabel('PLACED')).toBe('Order is placed');
  });

  it('should return correct label for IN_TRIP', () => {
    expect(statusLabel('IN_TRIP')).toBe('Out for delivery');
  });

  it('should return correct label for OUT_FOR_DELIVERY', () => {
    expect(statusLabel('OUT_FOR_DELIVERY')).toBe('Out for delivery');
  });

  it('should return correct label for DELIVERED', () => {
    expect(statusLabel('DELIVERED')).toBe('Delivered');
  });

  it('should return correct label for CANCELLED', () => {
    expect(statusLabel('CANCELLED')).toBe('Cancelled');
  });

  it('should return correct label for FAILED', () => {
    expect(statusLabel('FAILED')).toBe('Delivery failed');
  });
});

describe('isActiveStatus', () => {
  it('should return true for active statuses', () => {
    expect(isActiveStatus('PLACED')).toBe(true);
    expect(isActiveStatus('IN_TRIP')).toBe(true);
    expect(isActiveStatus('OUT_FOR_DELIVERY')).toBe(true);
  });

  it('should return false for terminal statuses', () => {
    expect(isActiveStatus('DELIVERED')).toBe(false);
    expect(isActiveStatus('CANCELLED')).toBe(false);
    expect(isActiveStatus('FAILED')).toBe(false);
  });
});
