import { describe, it, expect, vi } from 'vitest';
import { searchProducts } from './products';

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: [{ id: '1', name: 'Test Product' }] }),
  } as Response)
);

describe('searchProducts', () => {
  it('should call the search endpoint and return the data', async () => {
    const products = await searchProducts('test');
    expect(global.fetch).toHaveBeenCalledWith('/api/products/search?term=test');
    expect(products).toEqual([{ id: '1', name: 'Test Product' }]);
  });
});
