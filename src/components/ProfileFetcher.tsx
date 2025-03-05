'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function ProfileFetcher({ onProfileLoaded }: { onProfileLoaded: (name: string) => void }) {
  const { user } = useAuth();
  const [profileFetchAttempted, setProfileFetchAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset the fetch attempt when user changes
    if (user) {
      setProfileFetchAttempted(false);
    }
  }, [user?.id]); // Only reset when user ID changes

  useEffect(() => {
    if (user && !profileFetchAttempted && !isLoading) {
      setProfileFetchAttempted(true);
      setIsLoading(true);
      
      const getProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching profile:', error);
            // Fallback to user metadata
            onProfileLoaded((user as any).user_metadata?.full_name || user.email?.split('@')[0]);
          } else if (data) {
            onProfileLoaded(data.full_name);
          } else {
            // Fallback to user metadata
            onProfileLoaded((user as any).user_metadata?.full_name || user.email?.split('@')[0]);
          }
        } catch (error) {
          console.error('Exception fetching profile:', error);
          // Fallback to user metadata
          onProfileLoaded((user as any).user_metadata?.full_name || user.email?.split('@')[0]);
        } finally {
          setIsLoading(false);
        }
      };
      
      getProfile();
    }
  }, [user, profileFetchAttempted, onProfileLoaded, isLoading]);

  return null; // This component doesn't render anything
} 