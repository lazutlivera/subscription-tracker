'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
     
    const isAuthPage = window.location.pathname === '/signin';
    
    if (!isLoading && !user && !isAuthPage) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  return <>{children}</>;
} 