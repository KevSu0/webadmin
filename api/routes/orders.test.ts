import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';

// Mock firebase-admin
vi.mock('firebase-admin', () => ({
  default: {
    apps: [],
    initializeApp: vi.fn(),
    firestore: vi.fn(() => ({
      collection: vi.fn(() => ({
        where: vi.fn(() => ({
          get: vi.fn(() => ({
            empty: false,
            forEach: (callback: (doc: any) => void) => {
              callback({ id: '1', data: () => ({ total: 100, status: 'delivered' }) });
            },
          })),
        })),
        get: vi.fn(() => ({
          empty: false,
          forEach: (callback: (doc: any) => void) => {
            callback({ id: '1', data: () => ({ total: 100, status: 'delivered' }) });
          },
        })),
      })),
    })),
  }
}));

describe('GET /api/orders/search', () => {
  it('should return 200 with search results', async () => {
    const response = await request(app).get('/api/orders/search?term=test');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([{ id: '1', total: 100, status: 'delivered' }]);
  });

  it('should return 400 if search term is missing', async () => {
    const response = await request(app).get('/api/orders/search');
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Search term is required');
  });
});

describe('GET /api/orders/statistics', () => {
    it('should return 200 with order statistics', async () => {
        const response = await request(app).get('/api/orders/statistics');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual({
            totalOrders: 1,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 1,
            cancelledOrders: 0,
            totalRevenue: 100,
        });
    });
});
