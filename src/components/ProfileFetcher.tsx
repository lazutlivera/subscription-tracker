'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';

export default function ProfileFetcher({ onProfileLoaded }: { onProfileLoaded: (name: string) => void }) {
  const { user } = useAuth();
  const [profileFetchAttempted, setProfileFetchAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !profileFetchAttempted && !isLoading) {
      setProfileFetchAttempted(true);
      setIsLoading(true);
      
      // Use metadata name if available
      if (user.user_metadata?.full_name) {
        onProfileLoaded(user.user_metadata.full_name);
        setIsLoading(false);
        return;
      }

      // Only fetch from profiles if no metadata name exists
      const getProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
            
          if (data?.full_name) {
            onProfileLoaded(data.full_name);
          } else {
            onProfileLoaded(user.email?.split('@')[0] || 'User');
          }
        } catch (error) {
          console.error('Exception fetching profile:', error);
          onProfileLoaded(user.email?.split('@')[0] || 'User');
        } finally {
          setIsLoading(false);
        }
      };
      
      getProfile();
    }
  }, [user, profileFetchAttempted, onProfileLoaded, isLoading]);


  return null; 
} 