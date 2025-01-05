'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationService } from '@/services/notificationService';
import { Subscription } from '@/types/subscription';

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (notificationId: string) => void;
  clearNotification: (notificationId: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const checkNotifications = () => {
      console.log('=== Loading Subscriptions ===');
      const rawData = localStorage.getItem('subscriptions');
      console.log('Raw storage data:', rawData);

      const subscriptions: Subscription[] = JSON.parse(
        rawData || '[]',
        (key, value) => {
          if (key === 'startDate' || key === 'canceledDate' || key === 'nextPaymentDate') {
            console.log(`Converting date for ${key}:`, value);
            return value ? new Date(value) : null;
          }
          return value;
        }
      );

      console.log('Parsed subscriptions:', subscriptions);
      const newNotifications = NotificationService.getAllNotifications(subscriptions);
      console.log('Generated notifications:', newNotifications);
      setNotifications(newNotifications);
    };

    checkNotifications();
    // Check more frequently during testing
    const interval = setInterval(checkNotifications, 1000 * 30); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, markAsRead, clearNotification, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 