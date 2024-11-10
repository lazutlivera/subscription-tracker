import { useState, useEffect } from 'react';

export default function useCheckAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsTokenValid(false);
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsTokenValid(true);
        } else {
          // If token is invalid, remove it from localStorage
          localStorage.removeItem('token');
          setIsTokenValid(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsTokenValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  return { isLoading, isTokenValid };
}