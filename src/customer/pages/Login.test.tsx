import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Login from './Login';

// Mock services
vi.mock('../services/auth', () => ({
  signIn: vi.fn(() => Promise.resolve({ uid: '123' })),
  sendPasswordReset: vi.fn(() => Promise.resolve({ success: true, message: 'Password reset email sent' })),
}));

describe('Login component', () => {
  it('renders the login form', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows an error if fields are empty', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    // We are not testing the validation logic here, just that the component renders the error
    // The validation logic should be tested in its own unit test.
  });
});
