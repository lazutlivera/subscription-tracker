'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Add array of protected routes that require authentication
const PROTECTED_ROUTES = ['/report', '/settings', '/analytics'];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const isAuthPage = window.location.pathname === '/signin';
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      window.location.pathname.startsWith(route)
    );

    // Only redirect if:
    // 1. Not on auth page
    // 2. Not loading
    // 3. No user
    // 4. On a protected route
    if (!isLoading && !user && !isAuthPage && isProtectedRoute) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  return <>{children}</>;
} 