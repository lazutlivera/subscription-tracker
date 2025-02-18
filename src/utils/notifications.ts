import { supabase } from './supabase';
import { Subscription } from '@/types/subscription';

export async function createPaymentDueNotification(subscription: Subscription, userId: string) {
  const dueDate = new Date(subscription.nextPaymentDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue <= 3 && daysUntilDue >= 0) {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      subscription_id: subscription.id,
      message: `Payment for ${subscription.name} is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
      type: 'payment_due',
      due_date: subscription.nextPaymentDate.toISOString()
    });

    if (error) {
      console.error('Error creating notification:', error);
    }
  }
} 