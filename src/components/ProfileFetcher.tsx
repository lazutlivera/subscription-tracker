'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';

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
          // First check if the profile exists
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id);
            
          if (error || !data || data.length === 0) {
            console.log('No profile found, creating one with name from metadata');
            
            // Get the name from user metadata or email
            const fullName = (user as any).user_metadata?.full_name || 
                             (user as any).user_metadata?.name ||
                             user.email?.split('@')[0] || 
                             'User';
            
            // Use this name for display
            onProfileLoaded(fullName);
            
            // Create a profile with this name
            try {
              const { error: insertError } = await supabase
                .from('profiles')
                .upsert([
                  {
                    id: user.id,
                    full_name: fullName,
                  }
                ], { onConflict: 'id' });
                
              if (insertError) {
                console.error('Error creating profile:', insertError);
              }
            } catch (insertErr) {
              console.error('Error creating profile:', insertErr);
            }
          } else if (data && data.length > 0) {
            console.log('Profile found with name:', data[0].full_name);
            onProfileLoaded(data[0].full_name);
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

  // Add debugging to see what user data we have
  if (user) {
    console.log('User data in ProfileFetcher:', {
      id: user.id,
      email: user.email,
      metadata: (user as any).user_metadata,
    });
  }

  return null; // This component doesn't render anything
} 