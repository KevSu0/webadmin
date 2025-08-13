import { describe, it, expect, vi } from 'vitest';
import { searchOrders, getOrderStatistics } from './orders';

// Mock fetch
global.fetch = vi.fn((url) =>
  Promise.resolve({
    ok: true,
    json: () => {
        if (url === '/api/orders/statistics') {
            return Promise.resolve({ success: true, data: { totalOrders: 1 } });
        }
        return Promise.resolve({ success: true, data: [{ id: '1', total: 100 }] });
    },
  } as Response)
);

describe('searchOrders', () => {
  it('should call the search endpoint and return the data', async () => {
    const orders = await searchOrders('test');
    expect(global.fetch).toHaveBeenCalledWith('/api/orders/search?term=test');
    expect(orders).toEqual([{ id: '1', total: 100 }]);
  });
});

describe('getOrderStatistics', () => {
    it('should call the statistics endpoint and return the data', async () => {
        const stats = await getOrderStatistics();
        expect(global.fetch).toHaveBeenCalledWith('/api/orders/statistics');
        expect(stats).toEqual({ totalOrders: 1 });
    });
});
