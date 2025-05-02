import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignIn from '@/components/auth/Signin';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';

// Mock the modules
jest.mock('@/contexts/AuthContext');
jest.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      resend: jest.fn(),
    },
  },
}));

// Mock useSearchParams hook
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: jest.fn((param) => {
      if (param === 'message') return null;
      return null;
    }),
  }),
}));

describe('SignIn Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default mock implementation for useAuth
    (useAuth as jest.Mock).mockReturnValue({
      signIn: jest.fn(),
      isLoading: false,
    });
  });

  test('renders sign in form', () => {
    render(<SignIn />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('handles form input changes', () => {
    render(<SignIn />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('shows loading state when auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      signIn: jest.fn(),
      isLoading: true,
    });
    
    render(<SignIn />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('shows submitting state during sign in', async () => {
    // Mock the auth response to simulate loading
    (supabase.auth.signInWithPassword as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ data: {}, error: null });
        }, 100);
      });
    });
    
    render(<SignIn />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // This test may be flaky due to timing issues, but should ideally work
    expect(await screen.findByText(/signing in/i)).toBeInTheDocument();
  });

  test('redirects to home on successful sign in', async () => {
    // Mock successful sign in
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    });
    
    render(<SignIn />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  test('shows error message on failed sign in', async () => {
    // Mock failed sign in
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    });
    
    render(<SignIn />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to sign in/i)).toBeInTheDocument();
    });
  });

  test('handles email not confirmed error', async () => {
    // Mock email not confirmed error
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Email not confirmed' },
    });
    
    // Mock resend confirmation email
    (supabase.auth.resend as jest.Mock).mockResolvedValue({
      error: null,
    });
    
    render(<SignIn />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please check your email to verify your account/i)).toBeInTheDocument();
      expect(supabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
      });
    });
  });
}); 