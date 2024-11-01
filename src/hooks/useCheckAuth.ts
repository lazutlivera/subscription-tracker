import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import endpoints from '@/utils/endpoints';

const useCheckAuth = () => {
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(endpoints.auth.verify, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({token: token}),
          });

          const data = await response.json();

          if (data.valid) {
            setIsTokenValid(true);
            router.push('/');
            return;
          }
        } catch (error) {
          console.error("Token verification failed:", error);
        }
      }
      setIsTokenValid(false);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return { isLoading, isTokenValid };
};

export default useCheckAuth;