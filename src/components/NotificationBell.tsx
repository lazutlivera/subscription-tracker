'use client';

import { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';

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
      // Load notifications
      const loadNotifications = async () => {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (data) {
          setNotifications(data);
        }
      };

      loadNotifications();

      // Subscribe to new notifications
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          payload => {
            loadNotifications();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification.id);

    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
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
        <div className="absolute right-0 mt-2 w-80 md:w-80 w-screen -right-2 md:right-0 bg-[#1C1C24] rounded-lg shadow-lg z-50">
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

          <div className="max-h-[calc(4*88px)] md:max-h-[calc(4*88px)] max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {notifications.length === 0 ? (
              <p className="p-4 text-gray-400 text-center">No notifications</p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
                    !notification.read ? 'bg-gray-800/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p className="text-white text-sm md:text-base">{notification.message}</p>
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