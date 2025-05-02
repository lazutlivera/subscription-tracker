'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const PROTECTED_ROUTES = ['/report', '/settings', '/analytics'];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirectAttempted = useRef(false);

  useEffect(() => {
    if (redirectAttempted.current) return;
    
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));
    
    if (!isLoading && !user && isProtectedRoute) {
      redirectAttempted.current = true;
      router.replace('/signin');
    }
  }, [user, isLoading, router, pathname]);

  useEffect(() => {
    redirectAttempted.current = false;
  }, [pathname]);

  if (PROTECTED_ROUTES.some(route => pathname?.startsWith(route)) && (isLoading || !user)) {
    return null;
  }

  return <>{children}</>;
} 