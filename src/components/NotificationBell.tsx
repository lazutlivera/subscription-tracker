'use client';

import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { BellIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, clearNotification } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white focus:outline-none"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1C1C24] rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Payment Reminders</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No upcoming payments
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-800 transition-colors ${
                      !notification.isRead ? 'bg-gray-800/50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">💰</span>
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(notification.date, 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                        className="text-gray-500 hover:text-gray-300"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 