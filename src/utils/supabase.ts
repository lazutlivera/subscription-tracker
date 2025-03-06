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

 
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name
      }
    }
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

 
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

export async function checkDuplicateSubscription(name: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id')
      .match({
        name: name,
        user_id: userId,
        canceled_date: null
      })
      .maybeSingle();

    if (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking duplicate subscription:', error);
    return false;
  }
}

export async function createSubscription(subscriptionData: {
  name: string;
  price: number;
  start_date: string;
  next_payment_date: string;
  user_id: string;
  category?: string;
}) {
  try {
    const isDuplicate = await checkDuplicateSubscription(subscriptionData.name, subscriptionData.user_id);
    if (isDuplicate) {
      throw new Error('You already have an active subscription with this name');
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscriptionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
} 