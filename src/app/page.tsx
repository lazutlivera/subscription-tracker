'use client';

import React, { useState, useEffect } from 'react';
import { SubscriptionChart } from '../components/Chart';
import SubscriptionForm from '../components/SubscriptionForm';
import { Subscription } from '../types/subscription';
import Calendar from '@/components/Calendar';
import { mockSubscriptions } from '../utils/subscriptionData';
import SubscriptionList from '@/components/SubscriptionList';
import { format } from 'date-fns';
import useCheckAuth from '@/hooks/useCheckAuth';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';

export default function Home() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const { isLoading, isTokenValid } = useCheckAuth();
  const router = useRouter();

  useEffect(() => {
    if (isTokenValid) {
      setIsLoggedIn(true);
    } 
  }, [isTokenValid]);

  useEffect(() => {
    // Load and parse subscriptions from localStorage
    const loadedSubscriptions = JSON.parse(
      localStorage.getItem('subscriptions') || '[]',
      (key, value) => {
        // Convert date strings back to Date objects
        if (key === 'startDate' || key === 'canceledDate') {
          return value ? new Date(value) : null;
        }
        return value;
      }
    );
    setSubscriptions(loadedSubscriptions);
  }, []);

  



  const handleSubscriptionSubmit = (newSubscription: Omit<Subscription, "id">) => {
    if (editingSubscription) {
      // Update existing subscription
      const updatedSubscriptions = subscriptions.map(sub =>
        sub.id === editingSubscription.id
          ? { ...newSubscription, id: editingSubscription.id }
          : sub
      );
      setSubscriptions(updatedSubscriptions);
      setEditingSubscription(null);
      
      localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));
    } else {
      // Add new subscription
      const subscriptionWithId = {
        ...newSubscription,
        id: Date.now().toString(),
        // Calculate next payment date based on start date
        nextPaymentDate: new Date(newSubscription.startDate),
      };
      const updatedSubscriptions = [...subscriptions, subscriptionWithId];
      setSubscriptions(updatedSubscriptions);
      
      localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
  };

  // Calculate next payment date for a subscription
  const getNextPaymentDate = (subscription: Subscription): Date | null => {
    if (subscription.canceledDate) {
      return null; // No next payment for canceled subscriptions
    }

    const today = new Date();
    const startDate = new Date(subscription.startDate);
    let nextDate = new Date(startDate);

    // Find the next payment date after today
    while (nextDate <= today) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    return nextDate;
  };

  // Add these delete functions
  const handleDelete = (subscriptionId: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
    // Update localStorage
    const updatedSubscriptions = subscriptions.filter(sub => sub.id !== subscriptionId);
    localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));
  };

  const handleDeleteAll = () => {
    setSubscriptions([]);
    // Clear localStorage
    localStorage.setItem('subscriptions', JSON.stringify([]));
  };

  const handleCancel = (subscription: Subscription) => {
    const updatedSubscriptions = subscriptions.map(sub =>
      sub.id === subscription.id
        ? { ...sub, canceledDate: new Date() }  // Remove toISOString()
        : sub
    );
    setSubscriptions(updatedSubscriptions);

    localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));
  };

  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <main className="min-h-screen p-8 bg-[#13131A]">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="flex justify-end gap-4 items-center">
          <NotificationBell />
          <button 
            className="w-[10%] bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white rounded-lg p-3 transition-colors"
            onClick={() => router.push('/report')}
          >
            View Report
          </button>
          <button 
            className="w-[10%] bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white rounded-lg p-3 transition-colors"
            onClick={() => router.push('/analytics')}
          >
            View Trends
          </button>
          <button 
            className="w-[10%] bg-red-500 hover:bg-red-600 text-white rounded-lg p-3 transition-colors"
            onClick={isLoggedIn ? handleLogout : () => window.location.href = '/signin'}
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </button>
        </section>
        <SubscriptionForm onSubmit={handleSubscriptionSubmit} existingSubscription={editingSubscription} subscriptions={subscriptions} />
        <SubscriptionList 
          subscriptions={subscriptions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteAll={handleDeleteAll}
          onCancel={handleCancel}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[600px]">
            <Calendar subscriptions={subscriptions} onDateClick={() => {}} />
          </div>
          <div>
            <SubscriptionChart subscriptions={subscriptions} currentDate={new Date()} />
          </div>
        </div>
      </div>
    </main>
  );
}
