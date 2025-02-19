import { createClient } from '@supabase/supabase-js';
import { Subscription } from '@/types/subscription';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: 'subswise-auth',
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
});

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  // First sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });
  if (error) throw error;

  // Then create their profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          full_name: name,
        }
      ]);
    if (profileError) throw profileError;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Database helper functions for subscriptions
export const getSubscriptions = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};

export const addSubscription = async (subscription: Omit<Subscription, 'id'>, userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([{ ...subscription, user_id: userId }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}; 