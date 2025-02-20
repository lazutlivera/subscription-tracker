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

    
      if (subCancelDate && subCancelDate < subStartDate) {
        return false;
      }

      if (subCancelDate && subStartDate > today && subCancelDate <= today) {
        return false;
      }

      const isDayMatch = day === subStartDate.getDate();
      

      const isCurrentOrAfterStart = 
        (currentDate.getFullYear() > subStartDate.getFullYear()) ||
        (currentDate.getFullYear() === subStartDate.getFullYear() && 
         currentDate.getMonth() >= subStartDate.getMonth());

       
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
    <div className="bg-[#1C1C27] rounded-xl p-4 pb-8 md:p-8 h-fit max-h-[600px]">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-white">Subscription Calendar</h2>
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

      <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-sm text-gray-400 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
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
                group-hover:text-white transition-colors font-medium
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
                          className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden shadow-sm hover:scale-110 transition-transform"
                          title={`${sub.name} - £${sub.price}`}
                        >
                          {sub.logo && (
                            <Image
                              src={sub.logo}
                              alt={sub.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      );
                    } else if (idx === 2 && subscriptionsForDay.length > 2) {
                      return (
                        <div 
                          key={idx}
                          className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden shadow-sm flex items-center justify-center hover:bg-gray-700 transition-colors"
                          title={`${subscriptionsForDay.length - 2} more subscriptions`}
                        >
                          <span className="text-xs text-gray-300 font-medium">
                            +{subscriptionsForDay.length - 2}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

        
              {hasSubscriptions && (
                <div 
                  className="absolute bottom-full mb-2 hidden group-hover:block z-50"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    ...((index + firstDayOfMonth) % 7 <= 1 && { 
                      left: '0', 
                      transform: 'none',
                      right: 'auto' 
                    }),
                    ...((index + firstDayOfMonth) % 7 >= 5 && { 
                      left: 'auto', 
                      right: '0',
                      transform: 'none' 
                    })
                  }}
                >
                  <div className="bg-[#23232D] rounded-lg shadow-xl p-2 whitespace-nowrap border border-gray-700">
                    {subscriptionsForDay.map((sub, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between gap-3 py-1.5 px-1 hover:bg-gray-800 rounded min-w-[200px]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {sub.logo && (
                            <Image
                              src={sub.logo}
                              alt={sub.name}
                              width={20}
                              height={20}
                              className="rounded flex-shrink-0"
                            />
                          )}
                          <span className="text-white text-sm font-medium truncate">{sub.name}</span>
                        </div>
                        <span className="text-gray-400 text-sm flex-shrink-0">£{sub.price.toFixed(2)}</span>
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
