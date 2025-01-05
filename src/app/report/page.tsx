'use client';

import { useState, useEffect } from 'react';
import useCheckAuth from '@/hooks/useCheckAuth';
import { Subscription } from '@/types/subscription';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function Report() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, isTokenValid } = useCheckAuth();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Only proceed with authentication check when loading is complete
        if (!isLoading) {
          // If not authenticated, redirect to signin
          if (!isTokenValid) {
            router.push('/signin');
            return;
          }

          // If authenticated, load subscriptions
          const storedData = localStorage.getItem('subscriptions');
          if (!storedData) {
            setSubscriptions([]);
            return;
          }

          const loadedSubscriptions = JSON.parse(storedData, (key, value) => {
            if (key === 'startDate' || key === 'canceledDate') {
              return value ? new Date(value) : null;
            }
            return value;
          });

          setSubscriptions(loadedSubscriptions);
        }
      } catch (err) {
        setError('Failed to load subscription data');
        console.error('Error loading data:', err);
      }
    };

    loadData();
  }, [isLoading, isTokenValid, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#13131A] text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // If not authenticated and not loading, return null (will redirect in useEffect)
  if (!isTokenValid) {
    return null;
  }

  // Updated calculation function without future projections
  const calculateSubscriptionDetails = (subscription: Subscription) => {
    const today = new Date();
    const startDate = new Date(subscription.startDate);
    const monthsActive = subscription.canceledDate 
      ? Math.ceil((new Date(subscription.canceledDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      : Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    const totalSpentToDate = subscription.price * monthsActive;

    return {
      monthsActive,
      totalSpentToDate,
      monthlyPayment: subscription.price
    };
  };

  const calculateOverallStats = () => {
    const stats = subscriptions.reduce((acc, sub) => {
      const details = calculateSubscriptionDetails(sub);
      return {
        totalSpentToDate: acc.totalSpentToDate + details.totalSpentToDate,
        activeSubscriptions: acc.activeSubscriptions + (sub.canceledDate ? 0 : 1),
        totalMonthlyPayments: acc.totalMonthlyPayments + (sub.canceledDate ? 0 : sub.price)
      };
    }, {
      totalSpentToDate: 0,
      activeSubscriptions: 0,
      totalMonthlyPayments: 0
    });

    return {
      ...stats,
      monthlyAverage: stats.totalSpentToDate / (subscriptions.length || 1)
    };
  };

  // Main render
  return (
    <div className="min-h-screen bg-[#13131A] text-white p-8 print:bg-white print:text-black">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 print:mb-4">
          <h1 className="text-3xl font-bold">Subscription Report</h1>
          <div className="space-x-4 print:hidden">
            <button 
              onClick={() => router.push('/')}
              className="bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white px-4 py-2 rounded transition-colors"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={() => window.print()} 
              className="bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white px-4 py-2 rounded transition-colors"
            >
              Print Report
            </button>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Overall Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-[#1C1C24] p-4 rounded print:bg-gray-100">
              <p className="text-gray-400 print:text-gray-600">Total Spent to Date</p>
              <p className="text-2xl font-bold">${calculateOverallStats().totalSpentToDate.toFixed(2)}</p>
            </div>
            <div className="bg-[#1C1C24] p-4 rounded print:bg-gray-100">
              <p className="text-gray-400 print:text-gray-600">Monthly Average Spent</p>
              <p className="text-2xl font-bold">${calculateOverallStats().monthlyAverage.toFixed(2)}</p>
            </div>
            <div className="bg-[#1C1C24] p-4 rounded print:bg-gray-100">
              <p className="text-gray-400 print:text-gray-600">Current Monthly Cost</p>
              <p className="text-2xl font-bold">${calculateOverallStats().totalMonthlyPayments.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Subscription Details */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
          {subscriptions.map((sub) => {
            const details = calculateSubscriptionDetails(sub);
            return (
              <div key={sub.id} className="mb-4 bg-[#1C1C24] p-4 rounded print:bg-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{sub.name}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    sub.canceledDate ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                  }`}>
                    {sub.canceledDate ? 'Canceled' : 'Active'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 print:text-gray-600">Start Date</p>
                    <p>{format(new Date(sub.startDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 print:text-gray-600">Monthly Payment</p>
                    <p>${details.monthlyPayment.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 print:text-gray-600">Months Active</p>
                    <p>{details.monthsActive} months</p>
                  </div>
                  <div>
                    <p className="text-gray-400 print:text-gray-600">Total Spent</p>
                    <p>${details.totalSpentToDate.toFixed(2)}</p>
                  </div>
                </div>
                {sub.canceledDate && (
                  <div className="mt-2 text-sm text-gray-400">
                    <p>Canceled on: {format(new Date(sub.canceledDate), 'MMM dd, yyyy')}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-400 print:text-gray-500 mt-8">
          <p>Report generated on: {format(new Date(), 'MMMM dd, yyyy')}</p>
        </div>
      </div>
    </div>
  );
}
