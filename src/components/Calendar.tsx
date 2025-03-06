'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Subscription } from '../types/subscription';

interface CalendarProps {
  subscriptions: Subscription[];
  onDateClick: (date: Date) => void;
}

export default function Calendar({ subscriptions, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Subscription[]>([]);

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

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    
    const subs = getDaySubscriptions(date.getDate());
    console.log('Subscriptions found:', subs.length);
    
    if (subs.length > 0) {
      setSelectedDate(date);
      setSelectedSubscriptions(subs);
      setShowModal(true);
      
      console.log('Modal should be visible now');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setSelectedDate(null);
      setSelectedSubscriptions([]);
    }, 300); // Wait for animation to complete
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedDate && !(event.target as Element).closest('.date-popup') && 
          !(event.target as Element).closest('.calendar-date-cell')) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      console.log('Popup should be visible', {
        date: selectedDate,
        subscriptions: selectedSubscriptions,
      });
    }
  }, [selectedDate, selectedSubscriptions]);

  return (
    <div className="bg-[#1C1C27] rounded-xl p-4 pb-8 md:p-6 h-fit flex flex-col overflow-x-auto">
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

      <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 lg:gap-4 text-center text-sm text-gray-400 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs sm:text-sm text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-1">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div 
            key={`empty-${index}`} 
            className="p-1 min-h-[40px] sm:min-h-[45px] md:min-h-[55px] lg:min-h-[65px]"
          />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const subscriptionsForDay = getDaySubscriptions(day);
          const hasSubscriptions = subscriptionsForDay.length > 0;

          return (
            <div
              key={day}
              onClick={() => {
                console.log('Cell clicked for day:', day);
                handleDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
              }}
              className={`
                p-1 rounded-lg cursor-pointer
                relative group transition-all duration-200
                min-h-[40px] sm:min-h-[45px] md:min-h-[55px] lg:min-h-[65px]
                ${hasSubscriptions 
                  ? 'bg-[#6C5DD3]/20 hover:bg-[#6C5DD3]/30' 
                  : 'hover:bg-gray-800'
                }
              `}
            >
              <span className={`
                text-xs md:text-sm ${hasSubscriptions ? 'text-[#6C5DD3]' : 'text-gray-400'}
                group-hover:text-white transition-colors font-medium
              `}>
                {day}
              </span>
              
              {/* Subscription Logos - make them smaller on medium screens */}
              {hasSubscriptions && (
                <div className="absolute bottom-1 right-1 flex -space-x-1 md:-space-x-2">
                  {subscriptionsForDay.map((sub, idx) => {
                    if (idx < 2) {
                      return (
                        <div
                          key={idx}
                          className="w-4 md:w-6 lg:w-8 h-4 md:h-6 lg:h-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden shadow-sm hover:scale-110 transition-transform"
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
                          className="w-4 md:w-6 lg:w-8 h-4 md:h-6 lg:h-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden shadow-sm flex items-center justify-center hover:bg-gray-700 transition-colors"
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
            </div>
          );
        })}
      </div>

      {/* Date details modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div 
            className="bg-[#1C1C27] rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedDate?.getDate()} {monthNames[selectedDate?.getMonth() || 0]} {selectedDate?.getFullYear()}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-white font-medium">Subscriptions on this day:</h4>
              {selectedSubscriptions.map((sub, index) => (
                <div 
                  key={index}
                  className="bg-[#252836] rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {sub.logo && (
                      <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
                        <Image
                          src={sub.logo}
                          alt={sub.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{sub.name}</p>
                      <p className="text-gray-400 text-sm">£{sub.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    {sub.canceledDate ? (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Canceled</span>
                    ) : (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white rounded-lg px-4 py-2 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}