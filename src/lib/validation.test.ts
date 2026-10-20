import { describe, it, expect } from 'vitest';
import { isValidQuantity, PHONE_REGEX, PINCODE_REGEX } from './validation';

describe('isValidQuantity', () => {
  it('should validate exact multiples of step', () => {
    expect(isValidQuantity(1, 1)).toBe(true);
    expect(isValidQuantity(2, 1)).toBe(true);
    expect(isValidQuantity(0.5, 0.5)).toBe(true);
    expect(isValidQuantity(1.5, 0.5)).toBe(true);
    expect(isValidQuantity(2.5, 0.5)).toBe(true);
  });

  it('should reject non-multiples of step', () => {
    expect(isValidQuantity(1.5, 1)).toBe(false);
    expect(isValidQuantity(0.3, 0.5)).toBe(false);
    expect(isValidQuantity(1.7, 0.5)).toBe(false);
  });

  it('should handle step of 0.25', () => {
    expect(isValidQuantity(0.25, 0.25)).toBe(true);
    expect(isValidQuantity(0.5, 0.25)).toBe(true);
    expect(isValidQuantity(0.75, 0.25)).toBe(true);
    expect(isValidQuantity(1, 0.25)).toBe(true);
    expect(isValidQuantity(0.3, 0.25)).toBe(false);
  });

  it('should reject zero quantity', () => {
    expect(isValidQuantity(0, 1)).toBe(false);
    expect(isValidQuantity(0, 0.5)).toBe(false);
  });

  it('should reject negative quantity', () => {
    expect(isValidQuantity(-1, 1)).toBe(false);
    expect(isValidQuantity(-0.5, 0.5)).toBe(false);
  });

  it('should handle floating point edge cases', () => {
    // 1.5 / 0.5 = 3 exactly (no floating point error)
    expect(isValidQuantity(1.5, 0.5)).toBe(true);
    // Using integer math (millis) avoids issues
    expect(isValidQuantity(2.5, 0.5)).toBe(true);
  });
});

describe('PHONE_REGEX', () => {
  it('should validate correct Indian phone numbers', () => {
    expect(PHONE_REGEX.test('9876543210')).toBe(true);
    expect(PHONE_REGEX.test('8765432109')).toBe(true);
    expect(PHONE_REGEX.test('7654321098')).toBe(true);
    expect(PHONE_REGEX.test('6543210987')).toBe(true);
  });

  it('should reject phone numbers starting with invalid digits', () => {
    expect(PHONE_REGEX.test('5432109876')).toBe(false);
    expect(PHONE_REGEX.test('1234567890')).toBe(false);
    expect(PHONE_REGEX.test('0987654321')).toBe(false);
  });

  it('should reject wrong length', () => {
    expect(PHONE_REGEX.test('987654321')).toBe(false); // 9 digits
    expect(PHONE_REGEX.test('98765432109')).toBe(false); // 11 digits
  });

  it('should reject non-numeric', () => {
    expect(PHONE_REGEX.test('987654321a')).toBe(false);
    expect(PHONE_REGEX.test('98765-4321')).toBe(false);
  });
});

describe('PINCODE_REGEX', () => {
  it('should validate correct pincodes', () => {
    expect(PINCODE_REGEX.test('400001')).toBe(true);
    expect(PINCODE_REGEX.test('110001')).toBe(true);
    expect(PINCODE_REGEX.test('560001')).toBe(true);
  });

  it('should reject wrong length', () => {
    expect(PINCODE_REGEX.test('40000')).toBe(false); // 5 digits
    expect(PINCODE_REGEX.test('4000011')).toBe(false); // 7 digits
  });

  it('should reject non-numeric', () => {
    expect(PINCODE_REGEX.test('40000a')).toBe(false);
    expect(PINCODE_REGEX.test('400-001')).toBe(false);
  });
});
