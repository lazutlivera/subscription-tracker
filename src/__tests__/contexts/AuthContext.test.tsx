import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase, signInWithEmail, signUpWithEmail } from '@/utils/supabase';

// Mock the supabase module
jest.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    },
  },
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
}));

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Test component that uses the auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user">{auth.user ? JSON.stringify(auth.user) : 'no user'}</div>
      <div data-testid="loading">{auth.isLoading.toString()}</div>
      <button onClick={() => auth.signIn('test@example.com', 'password123')}>Sign In</button>
      <button onClick={() => auth.signUp('Test User', 'test@example.com', 'password123')}>Sign Up</button>
      <button onClick={() => auth.signOut()}>Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the auth state change subscription
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    });
    
    // Default session state
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    // Default window location mock
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  test('provides initial auth state with loading=true', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(getByTestId('user').textContent).toBe('no user');
    expect(getByTestId('loading').textContent).toBe('true');
  });

  test('updates auth state when session changes', async () => {
    // Mock auth state change callback
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      // Call the callback with a session
      callback('SIGNED_IN', {
        user: {
          id: '123',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' }
        }
      });
      
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      };
    });
    
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(getByTestId('loading').textContent).toBe('false');
      expect(getByTestId('user').textContent).toContain('test@example.com');
    });
  });

  test('calls signInWithEmail when signIn is called', async () => {
    // Mock successful sign in
    (signInWithEmail as jest.Mock).mockResolvedValue({
      user: { id: '123' },
      session: { access_token: 'token' },
    });
    
    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await act(async () => {
      getByText('Sign In').click();
    });
    
    expect(signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  test('calls signUpWithEmail when signUp is called', async () => {
    // Mock successful sign up
    (signUpWithEmail as jest.Mock).mockResolvedValue({
      user: { id: '123' },
    });
    
    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await act(async () => {
      getByText('Sign Up').click();
    });
    
    expect(signUpWithEmail).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
  });

  test('calls supabase.auth.signOut when signOut is called', async () => {
    // Mock successful sign out
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({
      error: null,
    });
    
    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await act(async () => {
      getByText('Sign Out').click();
    });
    
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(window.location.href).toBe('/signin');
  });

  test('clears localStorage and sessionStorage on sign out', async () => {
    // Mock localStorage and sessionStorage
    const clearLocalStorage = jest.spyOn(Storage.prototype, 'clear');
    
    // Mock successful sign out
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({
      error: null,
    });
    
    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await act(async () => {
      getByText('Sign Out').click();
    });
    
    expect(clearLocalStorage).toHaveBeenCalledTimes(2); // Once for localStorage, once for sessionStorage
  });
}); 