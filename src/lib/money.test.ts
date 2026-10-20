import { describe, it, expect } from 'vitest';
import { toPaise, calculateTotal, toRupees } from './money';

describe('toPaise', () => {
  it('should convert rupees to paise', () => {
    expect(toPaise(1)).toBe(100);
    expect(toPaise(10)).toBe(1000);
    expect(toPaise(60)).toBe(6000);
  });

  it('should handle decimal rupees', () => {
    expect(toPaise(1.5)).toBe(150);
    expect(toPaise(10.25)).toBe(1025);
    expect(toPaise(60.5)).toBe(6050);
  });

  it('should round to nearest paise', () => {
    expect(toPaise(1.505)).toBe(151); // rounds up
    expect(toPaise(1.504)).toBe(150); // rounds down
  });
});

describe('toRupees', () => {
  it('should convert paise to rupees', () => {
    expect(toRupees(100)).toBe(1);
    expect(toRupees(1000)).toBe(10);
    expect(toRupees(6000)).toBe(60);
  });

  it('should handle fractional rupees', () => {
    expect(toRupees(150)).toBe(1.5);
    expect(toRupees(1025)).toBe(10.25);
  });
});

describe('calculateTotal', () => {
  it('should calculate total for single item', () => {
    const items = [{ price: 60, quantity: 2 }];
    const total = calculateTotal(items);
    expect(total).toBe(12000); // 60 * 2 * 100 = 12000 paise
  });

  it('should calculate total for multiple items', () => {
    const items = [
      { price: 60, quantity: 2 }, // 120 rupees
      { price: 120, quantity: 0.5 }, // 60 rupees
    ];
    const total = calculateTotal(items);
    expect(total).toBe(18000); // 180 rupees = 18000 paise
  });

  it('should handle decimal quantities using integer math', () => {
    const items = [
      { price: 120, quantity: 0.5 }, // 60 rupees
      { price: 40, quantity: 1.5 }, // 60 rupees
    ];
    const total = calculateTotal(items);
    expect(total).toBe(12000); // 120 rupees = 12000 paise
  });

  it('should handle zero items', () => {
    const items: Array<{ price: number; quantity: number }> = [];
    const total = calculateTotal(items);
    expect(total).toBe(0);
  });

  it('should use integer math to avoid floating point errors', () => {
    // This would fail with pure floating point arithmetic
    const items = [
      { price: 85, quantity: 1 },
      { price: 45, quantity: 2 },
      { price: 35, quantity: 3 },
    ];
    const total = calculateTotal(items);
    // 85 + 90 + 105 = 280 rupees = 28000 paise
    expect(total).toBe(28000);
  });

  it('should handle small decimal prices', () => {
    const items = [{ price: 10.5, quantity: 3 }];
    const total = calculateTotal(items);
    // 10.5 * 3 = 31.5 rupees = 3150 paise
    expect(total).toBe(3150);
  });
});
