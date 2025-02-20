'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut } from '@/utils/supabase';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
     
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {   
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

     
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user, session } = await signInWithEmail(email, password);
    if (user) {
      router.push('/');   
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { user: authUser } = await signUpWithEmail(email, password, name);
    if (!authUser) throw new Error('Failed to sign up');
  };

  const signOut = async () => {
    try {
       
      await supabase.auth.signOut();
      
       
      setUser(null);

       
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

       
      window.location.href = '/signin';
      
       
      setTimeout(() => {
        window.location.reload();
      }, 100);

    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 