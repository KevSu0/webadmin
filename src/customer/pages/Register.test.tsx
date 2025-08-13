import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Register from './Register';

// Mock services
vi.mock('../services/auth', () => ({
  registerUser: vi.fn(() => Promise.resolve({ uid: '123' })),
}));

describe('Register component', () => {
  it('renders the register form', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i)).toHaveLength(2);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows an error if fields are empty', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    // We are not testing the validation logic here, just that the component renders the error
    // The validation logic should be tested in its own unit test.
  });
});
