import { supabase } from './supabase';
import { subscriptionData } from '@/data/subscriptionData';
import type { SubscriptionCategory } from './categories';

export interface CommonSubscription {
  id: string;
  name: string;
  default_price: number;
  logo: string;
  category: SubscriptionCategory;
}

export async function getCommonSubscriptions(): Promise<CommonSubscription[]> {
  const { data, error } = await supabase
    .from('common_subscriptions')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error loading common subscriptions:', error);
    return [];
  }

  return data || [];
}

export async function initializeCommonSubscriptions() {
  const { data: existing } = await supabase
    .from('common_subscriptions')
    .select('id');

  if (existing && existing.length > 0) {
     ('Common subscriptions already initialized');
    return;
  }

  const { error } = await supabase
    .from('common_subscriptions')
    .insert(subscriptionData);

  if (error) {
    console.error('Error initializing common subscriptions:', error);
  }
} 