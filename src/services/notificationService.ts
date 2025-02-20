import { Subscription } from '@/types/subscription';
import { addDays, isWithinInterval } from 'date-fns';

export interface Notification {
  id: string;
  message: string;
  subscription: Subscription;
  date: Date;
  isRead: boolean;
}

export class NotificationService {
  private static generateNotificationId(): string {
    return Date.now().toString();
  }

  static checkPaymentDue(subscription: Subscription): Notification | null {
    const today = new Date();
    const threeDaysFromNow = addDays(today, 3);

     
    const getRecurringPaymentDates = (sub: Subscription): Date[] => {
      const dates = [];
      let currentDate = new Date(sub.startDate);
      const endDate = addDays(today, 7);  

      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
         
        currentDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          currentDate.getDate()
        );
      }
      return dates;
    };

     
    const paymentDates = getRecurringPaymentDates(subscription);
    
     
    const nextPayment = paymentDates.find(date => 
      isWithinInterval(date, {
        start: today,
        end: threeDaysFromNow,
      })
    );

     ('NOTIFICATION CHECK:', {
      name: subscription.name,
      paymentDates: paymentDates.map(d => d.toLocaleDateString()),
      nextPayment: nextPayment?.toLocaleDateString(),
      today: today.toLocaleDateString(),
      threeDaysFromNow: threeDaysFromNow.toLocaleDateString()
    });

    if (!subscription.canceledDate && nextPayment) {
       ('✅ Creating notification');
      return {
        id: this.generateNotificationId(),
        message: `Payment of $${subscription.price} for ${subscription.name} is due on ${nextPayment.toLocaleDateString()}`,
        subscription,
        date: today,
        isRead: false,
      };
    }

     ('❌ No notification needed');
    return null;
  }

  static getAllNotifications(subscriptions: Subscription[]): Notification[] {
    const notifications: Notification[] = [];

    subscriptions.forEach(subscription => {
      const paymentNotification = this.checkPaymentDue(subscription);
      if (paymentNotification) {
        notifications.push(paymentNotification);
      }
    });

    return notifications.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
} 