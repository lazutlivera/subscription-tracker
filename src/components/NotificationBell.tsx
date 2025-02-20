'use client';

import { useState, useRef, useEffect } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import { createPaymentDueNotification } from '@/utils/notifications';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
  user_id: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      let mounted = true;

      const loadNotifications = async () => {
        const { data: notifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('deleted', false)
          .order('created_at', { ascending: false });
        
        if (mounted && notifications) {
          setNotifications(notifications);
        }
      };

      const checkForNewNotifications = async () => {
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id);

        if (subscriptions && mounted) {
          for (const sub of subscriptions) {
            await createPaymentDueNotification({
              ...sub,
              startDate: new Date(sub.start_date),
              nextPaymentDate: new Date(sub.next_payment_date),
              canceledDate: sub.canceled_date ? new Date(sub.canceled_date) : null,
            }, user.id);
          }
           
          loadNotifications();
        }
      };

       
      loadNotifications();
      checkForNewNotifications();

       
      const interval = setInterval(checkForNewNotifications, 3600000);

      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .match({ id: notificationId, user_id: user.id });

    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .match({ user_id: user.id, read: false });

    if (!error) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    }
  };

  const handleClearNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ deleted: true })
      .match({ id: notificationId, user_id: user.id });

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full -right-2 mt-2 w-80 bg-[#1C1C24] rounded-lg shadow-lg z-50 notification-container">
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[calc(4*88px)] md:max-h-[calc(4*88px)] overflow-y-auto 
            scrollbar-thin 
            scrollbar-thumb-[#6C5DD3] 
            scrollbar-track-[#1C1C24]/40 
            hover:scrollbar-thumb-[#5B4EC2]
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gradient-to-b
            [&::-webkit-scrollbar-thumb]:from-[#6C5DD3]
            [&::-webkit-scrollbar-thumb]:to-[#5B4EC2]
            [&::-webkit-scrollbar-thumb]:border
            [&::-webkit-scrollbar-thumb]:border-[#1C1C24]
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-[#1C1C24]/40
            hover:[&::-webkit-scrollbar-thumb]:from-[#5B4EC2]
            hover:[&::-webkit-scrollbar-thumb]:to-[#4B3EC2]
            transition-colors
            duration-150">
            {notifications.length === 0 ? (
              <p className="p-4 text-gray-400 text-center">No notifications</p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 relative group ${
                    !notification.read ? 'bg-gray-800/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <button
                    onClick={(e) => handleClearNotification(e, notification.id)}
                    className="absolute right-2 top-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                  <p className="text-white text-sm md:text-base pr-6">{notification.message}</p>
                  <p className="text-xs md:text-sm text-gray-400 mt-1">
                    {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 