'use client';

import { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationService } from '@/services/notificationService';
import { Notification } from '@/types/notification';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (user) {
      const notifications = await NotificationService.getUserNotifications(user.id);
      setNotifications(notifications);
    }
  };

  const handleBellClick = async () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && user && notifications.length > 0) {
      // Mark all as read when opening dropdown
      await Promise.all(
        notifications.map(n => NotificationService.markAsRead(n.id, user.id))
      );
      await loadNotifications();
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (user) {
      await NotificationService.deleteNotification(notificationId, user.id);
      await loadNotifications();
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={handleBellClick}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <BellIcon className="h-5 w-5" />
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {notifications.filter(n => !n.read).length}
          </span>
        )}
      </button>

      {showDropdown && notifications.length > 0 && (
        <div className="absolute left-0 mt-1 w-80 bg-[#1C1C27] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`px-4 py-3 border-b border-gray-700 hover:bg-[#23232D] flex justify-between items-start gap-2 ${
                  notification.read ? 'opacity-70' : ''
                }`}
              >
                <p className="text-sm text-white flex-1">{notification.message}</p>
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 