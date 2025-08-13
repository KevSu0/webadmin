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
          where: vi.fn(() => ({
            get: vi.fn(() => ({
              empty: false,
              forEach: (callback: (doc: any) => void) => {
                callback({ id: '1', data: () => ({ name: 'Test Product' }) });
              },
            })),
          })),
        })),
      })),
    })),
  }
}));

describe('GET /api/products/search', () => {
  it('should return 200 with search results', async () => {
    const response = await request(app).get('/api/products/search?term=test');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([{ id: '1', name: 'Test Product' }]);
  });

  it('should return 400 if search term is missing', async () => {
    const response = await request(app).get('/api/products/search');
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Search term is required');
  });
});
