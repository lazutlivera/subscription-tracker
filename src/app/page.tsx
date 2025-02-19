'use client';

import React, { useState, useEffect } from 'react';
import { SubscriptionChart } from '../components/Chart';
import SubscriptionForm from '../components/SubscriptionForm';
import { Subscription } from '../types/subscription';
import Calendar from '@/components/Calendar';
import SubscriptionList from '@/components/SubscriptionList';
import NotificationBell from '@/components/NotificationBell';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import logo from '@/assets/brand/logo.png';

export default function Home() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [userName, setUserName] = useState<string>('');
  
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadSubscriptions = async () => {
      if (user) {
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id);
        
        if (data) {
          const transformedData = data.map(sub => ({
            id: sub.id,
            name: sub.name,
            price: Number(sub.price),
            startDate: new Date(sub.start_date),
            nextPaymentDate: new Date(sub.next_payment_date),
            canceledDate: sub.canceled_date ? new Date(sub.canceled_date) : null,
            category: sub.category,
            logo: sub.logo
          }));
          setSubscriptions(transformedData);
        }
      } else {
        const saved = localStorage.getItem('subscriptions');
        if (saved) {
          setSubscriptions(JSON.parse(saved));
        }
      }
    };

    loadSubscriptions();
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    }
  }, [subscriptions, user]);

  useEffect(() => {
    async function getUserProfile() {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (data?.full_name) {
          setUserName(data.full_name);
        }
      }
    }
    getUserProfile();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#13131A] text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  const handleSubscriptionSubmit = async (newSubscription: Omit<Subscription, "id">) => {
    if (user) {
      // Format the data to match database columns exactly
      const dbSubscription = {
        user_id: user.id,
        name: newSubscription.name,
        price: Number(newSubscription.price),
        start_date: new Date(newSubscription.startDate).toISOString(),
        next_payment_date: new Date(newSubscription.nextPaymentDate).toISOString(),
        canceled_date: newSubscription.canceledDate ? new Date(newSubscription.canceledDate).toISOString() : null,
        category: newSubscription.category || 'default',
        logo: newSubscription.logo || null
      };

      if (editingSubscription) {
        // Update existing subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .update(dbSubscription)
          .eq('id', editingSubscription.id)
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          return;
        }

        if (data) {
          setSubscriptions(prev => prev.map(sub => 
            sub.id === editingSubscription.id ? {
              id: data.id,
              name: data.name,
              price: Number(data.price),
              startDate: new Date(data.start_date),
              nextPaymentDate: new Date(data.next_payment_date),
              canceledDate: data.canceled_date ? new Date(data.canceled_date) : null,
              category: data.category,
              logo: data.logo
            } : sub
          ));
        }
      } else {
        // Insert new subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .insert([dbSubscription])
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          return;
        }

        if (data) {
          setSubscriptions(prev => [...prev, {
            id: data.id,
            name: data.name,
            price: Number(data.price),
            startDate: new Date(data.start_date),
            nextPaymentDate: new Date(data.next_payment_date),
            canceledDate: data.canceled_date ? new Date(data.canceled_date) : null,
            category: data.category,
            logo: data.logo
          }]);
        }
      }
    } else {
      // Local storage logic
      if (editingSubscription) {
        // Update existing subscription
        setSubscriptions(prev => prev.map(sub =>
          sub.id === editingSubscription.id ? { ...newSubscription, id: sub.id } : sub
        ));
      } else {
        // Add new subscription
        const subscriptionWithId = {
          ...newSubscription,
          id: Date.now().toString(),
        };
        setSubscriptions(prev => [...prev, subscriptionWithId]);
      }
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    }
    setEditingSubscription(null);
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
  };

  const handleDelete = async (subscriptionId: string) => {
    if (user) {
      // Delete from Supabase
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) {
        console.error('Error deleting subscription:', error);
        return;
      }
    }
    
    // Update local state
    setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
    
    // Update localStorage only if not authenticated
    if (!user) {
      const updatedSubscriptions = subscriptions.filter(sub => sub.id !== subscriptionId);
      localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));
    }
  };

  const handleDeleteAll = async () => {
    if (user) {
      // Delete all user's subscriptions from Supabase
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting all subscriptions:', error);
        return;
      }
    }
    
    setSubscriptions([]);
    
    // Update localStorage only if not authenticated
    if (!user) {
      localStorage.setItem('subscriptions', JSON.stringify([]));
    }
  };

  const handleCancel = async (subscription: Subscription) => {
    if (user) {
      // Update in Supabase
      const { error } = await supabase
        .from('subscriptions')
        .update({
          canceled_date: new Date().toISOString()
        })
        .eq('id', subscription.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error canceling subscription:', error);
        return;
      }
    }
    
    // Update local state
    const updatedSubscriptions = subscriptions.map(sub =>
      sub.id === subscription.id
        ? { ...sub, canceledDate: new Date() }
        : sub
    );
    setSubscriptions(updatedSubscriptions);
  };

  return (
    <main className="min-h-screen pt-12 p-4 bg-[#13131A]">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <div className="flex-1 flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-4">
              <NotificationBell />
              <button
                onClick={() => router.push('/settings')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Cog6ToothIcon className="h-6 w-6" />
              </button>
            </div>
            {user && (
              <h2 className="text-white text-base md:text-lg font-medium">
                Welcome, {userName || user.email?.split('@')[0]}
              </h2>
            )}
          </div>
          
          <div className="flex justify-center w-full md:w-auto md:flex-1">
            <div 
              style={{
                width: '240px',
                height: '60px',
                backgroundImage: `url(${logo.src})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
              className="md:w-[360px] md:h-[80px]"
            />
          </div>

          <div className="flex gap-2 md:gap-4 items-center justify-end w-full md:w-auto md:flex-1">
            <button 
              className="text-sm md:text-base bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white rounded-lg px-3 py-1.5 md:px-4 md:py-2 transition-colors"
              onClick={() => router.push('/report')}
            >
              View Report
            </button>
            <button 
              className="text-sm md:text-base bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white rounded-lg px-3 py-1.5 md:px-4 md:py-2 transition-colors"
              onClick={() => router.push('/analytics')}
            >
              View Trends
            </button>
            {user ? (
              <button 
                className="text-sm md:text-base bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 md:px-4 md:py-2 transition-colors"
                onClick={() => router.push('/signout')}
              >
                Sign Out
              </button>
            ) : (
              <button 
                className="text-sm md:text-base bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white rounded-lg px-3 py-1.5 md:px-4 md:py-2 transition-colors"
                onClick={() => router.push('/signin')}
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        <SubscriptionForm 
          onSubmit={handleSubscriptionSubmit} 
          existingSubscription={editingSubscription} 
          subscriptions={subscriptions} 
          onCancelEdit={() => setEditingSubscription(null)}
        />
        <SubscriptionList 
          subscriptions={subscriptions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteAll={handleDeleteAll}
          onCancel={handleCancel}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-8">
          <div className="h-[400px] md:h-[600px]">
            <Calendar subscriptions={subscriptions} onDateClick={() => {}} />
          </div>
          <div className="h-[400px] md:h-[600px] mt-8 lg:mt-0">
            <SubscriptionChart subscriptions={subscriptions} />
          </div>
        </div>
      </div>
    </main>
  );
}
