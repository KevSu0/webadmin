import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app';

describe('App', () => {
    it('should return 404 for unknown routes', async () => {
        const response = await request(app).get('/unknown-route');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('API not found');
    });

    it('should return 500 for errors', async () => {
        const response = await request(app).get('/error');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Server internal error');
    });
});
