'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Subscription } from '../types/subscription';

interface CalendarProps {
  subscriptions: Subscription[];
  onDateClick: (date: Date) => void;
}

export default function Calendar({ subscriptions, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaySubscriptions = (day: number) => {
    return subscriptions.filter(sub => {
      const subStartDate = new Date(sub.startDate);
      const subCancelDate = sub.canceledDate ? new Date(sub.canceledDate) : null;
      const currentMonthDate = new Date(
        currentDate.getFullYear(), 
        currentDate.getMonth(), 
        day
      );
      const today = new Date();

      // Check if subscription was cancelled before it even started
      if (subCancelDate && subCancelDate < subStartDate) {
        return false;
      }

      // For subscriptions cancelled within trial/before first payment
      if (subCancelDate && subStartDate > today && subCancelDate <= today) {
        return false;
      }

      // Check if the day matches the subscription start date
      const isDayMatch = day === subStartDate.getDate();
      
      // Check if we're in or after the start month/year
      const isCurrentOrAfterStart = 
        (currentDate.getFullYear() > subStartDate.getFullYear()) ||
        (currentDate.getFullYear() === subStartDate.getFullYear() && 
         currentDate.getMonth() >= subStartDate.getMonth());

      // Check if before cancellation
      const isBeforeCancel = !subCancelDate || currentMonthDate <= subCancelDate;

      return isDayMatch && isCurrentOrAfterStart && isBeforeCancel;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="bg-[#1C1C27] rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Calendar</h2>
        <div className="flex items-center w-64">
          <button 
            onClick={previousMonth}
            className="text-gray-400 hover:text-white transition-colors w-8"
          >
            ←
          </button>
          <span className="text-white font-medium flex-1 text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button 
            onClick={nextMonth}
            className="text-gray-400 hover:text-white transition-colors w-8"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const subscriptionsForDay = getDaySubscriptions(day);
          const hasSubscriptions = subscriptionsForDay.length > 0;

          return (
            <div
              key={day}
              onClick={() => onDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
              className={`
                aspect-square p-1 rounded-lg cursor-pointer
                relative group transition-all duration-200
                ${hasSubscriptions 
                  ? 'bg-[#6C5DD3]/20 hover:bg-[#6C5DD3]/30' 
                  : 'hover:bg-gray-800'
                }
              `}
            >
              <span className={`
                text-sm ${hasSubscriptions ? 'text-[#6C5DD3]' : 'text-gray-400'}
                group-hover:text-white transition-colors
              `}>
                {day}
              </span>
              
              {/* Subscription Logos */}
              {hasSubscriptions && (
                <div className="absolute bottom-1 right-1 flex -space-x-2">
                  {subscriptionsForDay.map((sub, idx) => {
                    if (idx < 2) {
                      return (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden shadow-sm"
                          title={sub.name}
                        >
                          {sub.logo && (
                            <Image
                              src={sub.logo}
                              alt={sub.name}
                              width={24}
                              height={24}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      );
                    } else if (idx === 2 && subscriptionsForDay.length > 2) {
                      return (
                        <div 
                          key={idx}
                          className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden shadow-sm flex items-center justify-center"
                          title={`+${subscriptionsForDay.length - 2} more`}
                        >
                          <span className="text-xs text-gray-400">
                            +{subscriptionsForDay.length - 2}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

              {/* Hover tooltip for multiple subscriptions */}
              {hasSubscriptions && subscriptionsForDay.length > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                               hidden group-hover:block z-10">
                  <div className="bg-gray-800 rounded-lg shadow-lg p-2 whitespace-nowrap">
                    {subscriptionsForDay.map((sub, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-white py-1">
                        {sub.logo && (
                          <Image
                            src={sub.logo}
                            alt={sub.name}
                            width={16}
                            height={16}
                            className="rounded-full"
                          />
                        )}
                        <span>{sub.name}</span>
                        <span className="text-gray-400">${sub.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
