'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Add array of protected routes that require authentication
const PROTECTED_ROUTES = ['/report', '/settings', '/analytics'];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));
    const isAuthPage = pathname === '/signin';

    if (!isLoading && !user && isProtectedRoute) {
      // Prevent the protected page from mounting at all
      router.replace('/signin');
      return;
    }
  }, [user, isLoading, router, pathname]);

  // Don't render protected routes content during the auth check
  if (PROTECTED_ROUTES.some(route => pathname?.startsWith(route)) && (isLoading || !user)) {
    return null;
  }

  return <>{children}</>;
} 