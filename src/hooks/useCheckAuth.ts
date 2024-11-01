import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import endpoints from '@/utils/endpoints';

const useCheckAuth = () => {
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Call verifyToken API to validate the token
          const response = await fetch(endpoints.auth.verify, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({token: token}),
          });

          const data = await response.json();

          if (data.valid) {
            // Token is valid, redirect to homepage
            router.push('/');
            return;
          }
        } catch (error) {
          console.error("Token verification failed:", error);
        }
      }
      setIsTokenValid(false);
    };

    checkAuth();
  }, [router]);

  return { isTokenValid };
};

export default useCheckAuth;