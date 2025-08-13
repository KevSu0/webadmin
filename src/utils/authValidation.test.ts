import { describe, it, expect } from 'vitest';
import { validateEmail, validatePasswordStrength, validatePasswordConfirmation, validateDisplayName, validatePhone } from './authValidation';

describe('Auth Validation', () => {
    describe('validateEmail', () => {
        it('should return true for valid email', () => {
            expect(validateEmail('test@test.com').isValid).toBe(true);
        });
        it('should return false for invalid email', () => {
            expect(validateEmail('test').isValid).toBe(false);
        });
    });

    describe('validatePasswordStrength', () => {
        it('should return true for strong password', () => {
            expect(validatePasswordStrength('Password123!').isValid).toBe(true);
        });
        it('should return false for weak password', () => {
            expect(validatePasswordStrength('pass').isValid).toBe(false);
        });
    });

    describe('validatePasswordConfirmation', () => {
        it('should return true if passwords match', () => {
            expect(validatePasswordConfirmation('password', 'password').isValid).toBe(true);
        });
        it('should return false if passwords do not match', () => {
            expect(validatePasswordConfirmation('password', 'wrong').isValid).toBe(false);
        });
    });

    describe('validateDisplayName', () => {
        it('should return true for valid display name', () => {
            expect(validateDisplayName('Test User').isValid).toBe(true);
        });
        it('should return false for short display name', () => {
            expect(validateDisplayName('T').isValid).toBe(false);
        });
    });

    describe('validatePhone', () => {
        it('should return true for valid phone number', () => {
            expect(validatePhone('1234567890').isValid).toBe(true);
        });
        it('should return false for invalid phone number', () => {
            expect(validatePhone('123').isValid).toBe(false);
        });
    });
});
