'use client';

import React, { useState, useEffect } from 'react';
import { SubscriptionChart } from '../components/Chart';
import SubscriptionForm from '../components/SubscriptionForm';
import { Subscription } from '../types/subscription';
import Calendar from '@/components/Calendar';
import { mockSubscriptions } from '../utils/subscriptionData';
import SubscriptionList from '@/components/SubscriptionList';
import { format } from 'date-fns';

export default function Home() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

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
      
      // Save to localStorage
      localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));
    } else {
      // Add new subscription
      const subscriptionWithId = {
        ...newSubscription,
        id: Date.now().toString(),
      };
      const updatedSubscriptions = [...subscriptions, subscriptionWithId];
      setSubscriptions(updatedSubscriptions);
      
      // Save to localStorage
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

  return (
    <main className="min-h-screen p-8 bg-[#13131A]">
      <div className="max-w-7xl mx-auto space-y-8">
        <SubscriptionForm onSubmit={handleSubscriptionSubmit} existingSubscription={editingSubscription} />
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
