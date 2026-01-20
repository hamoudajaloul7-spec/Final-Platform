import { describe, it, expect } from 'vitest';
import { normalizeApiProduct } from '../src/utils/storeConfigLoader';

describe('normalizeApiProduct', () => {
  it('uses quantity when provided and marks inStock accordingly', () => {
    const apiProduct: any = {
      id: 1,
      name: 'Test',
      quantity: 5,
    };
    const p = normalizeApiProduct(apiProduct);
    expect(p.quantity).toBe(5);
    expect(p.inStock).toBe(true);
  });

  it('respects explicit inStock flag when provided', () => {
    const apiProduct: any = {
      id: 2,
      name: 'Test 2',
      quantity: 0,
      inStock: false,
    };
    const p = normalizeApiProduct(apiProduct);
    expect(p.inStock).toBe(false);
    expect(p.quantity).toBe(0);
  });
});
