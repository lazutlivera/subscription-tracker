import { supabase } from './supabase';
import { Subscription } from '@/types/subscription';

export async function createPaymentDueNotification(subscription: Subscription, userId: string) {
  const dueDate = new Date(subscription.nextPaymentDate);
  const today = new Date();
  
   
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

   
  if (daysUntilDue <= 1 && daysUntilDue >= 0) {
     
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('subscription_id', subscription.id)
      .eq('user_id', userId)
      .eq('due_date', subscription.nextPaymentDate.toISOString().split('T')[0])
      .eq('deleted', false);  

    if (!count) {
      const message = `Payment of £${subscription.price} for ${subscription.name} is due ${
        daysUntilDue === 0 ? 'today' : 'tomorrow'
      }`;

      await supabase.from('notifications').insert({
        user_id: userId,
        subscription_id: subscription.id,
        message,
        type: 'payment_due',
        due_date: subscription.nextPaymentDate.toISOString().split('T')[0],
        read: false,
        deleted: false  
      });
    }
  }
} 