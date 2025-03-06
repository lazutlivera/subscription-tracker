'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Add array of protected routes that require authentication
const PROTECTED_ROUTES = ['/report', '/settings', '/analytics'];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirectAttempted = useRef(false);

  useEffect(() => {
    // Only check auth once per path
    if (redirectAttempted.current) return;
    
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));
    
    if (!isLoading && !user && isProtectedRoute) {
      // Prevent multiple redirects
      redirectAttempted.current = true;
      router.replace('/signin');
    }
  }, [user, isLoading, router, pathname]);

  // Reset the redirect flag when pathname changes
  useEffect(() => {
    redirectAttempted.current = false;
  }, [pathname]);

  // Don't render protected routes content during the auth check
  if (PROTECTED_ROUTES.some(route => pathname?.startsWith(route)) && (isLoading || !user)) {
    return null;
  }

  return <>{children}</>;
} 