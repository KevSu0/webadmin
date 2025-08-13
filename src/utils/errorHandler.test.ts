import { describe, it, expect } from 'vitest';
import { getErrorMessage, isNetworkError } from './errorHandler';

describe('Error Handler', () => {
    describe('getErrorMessage', () => {
        it('should return a user-friendly message for a known Firebase error', () => {
            const error = { code: 'auth/user-not-found' };
            expect(getErrorMessage(error)).toBe('No account found with this email address.');
        });

        it('should return a generic message for an unknown error', () => {
            const error = { code: 'unknown-error' };
            expect(getErrorMessage(error)).toBe('An unexpected error occurred. Please try again.');
        });
    });

    describe('isNetworkError', () => {
        it('should return true for a network error', () => {
            const error = { code: 'auth/network-request-failed' };
            expect(isNetworkError(error)).toBe(true);
        });

        it('should return false for a non-network error', () => {
            const error = { code: 'auth/user-not-found' };
            expect(isNetworkError(error)).toBe(false);
        });
    });
});
