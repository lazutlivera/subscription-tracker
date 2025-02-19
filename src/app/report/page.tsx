'use client';

import { useState, useEffect } from 'react';
import { Subscription } from '@/types/subscription';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';

export default function Report() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const loadSubscriptions = async () => {
      if (user) {
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id);

        console.log('Raw data from Supabase:', data);

        if (data) {
          const transformedData = data.map(sub => {
            const price = Number(sub.price);
            console.log('Price conversion:', sub.price, '->', price);
            return {
              id: sub.id,
              name: sub.name,
              price: price,
              startDate: new Date(sub.start_date),
              nextPaymentDate: new Date(sub.next_payment_date),
              canceledDate: sub.canceled_date ? new Date(sub.canceled_date) : null,
              category: sub.category,
              logo: sub.logo
            };
          });
          
          console.log('Transformed data:', transformedData);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#13131A] text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl mb-4">Please Sign In</h1>
          <p>You need to be signed in to view the report.</p>
          <button
            onClick={() => router.push('/signin')}
            className="mt-4 bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white px-4 py-2 rounded"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

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
    let totalSpentToDate = 0;
    let totalMonthlyPayments = 0;
    let activeSubscriptions = 0;

    const startDates = subscriptions.map(sub => new Date(sub.startDate));
    const earliestDate = new Date(Math.min(...startDates.map(date => date.getTime())));
    const today = new Date();
    
    const totalMonths = Math.ceil((today.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    subscriptions.forEach(sub => {
      const details = calculateSubscriptionDetails(sub);
      totalSpentToDate += details.totalSpentToDate;
      
      if (!sub.canceledDate) {
        totalMonthlyPayments += sub.price;
        activeSubscriptions += 1;
      }
    });


    const categoryBreakdown = subscriptions.reduce((acc, sub) => {
      const category = sub.category || 'Other';
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          count: 0,
          monthlySpend: 0
        };
      }
      const details = calculateSubscriptionDetails(sub);
      acc[category].total += details.totalSpentToDate;
      acc[category].count += 1;
      acc[category].monthlySpend += sub.canceledDate ? 0 : sub.price;
      return acc;
    }, {} as Record<string, { total: number; count: number; monthlySpend: number }>);

    return {
      totalSpentToDate,
      activeSubscriptions,
      totalMonthlyPayments,
      categoryBreakdown,
      monthlyAverage: totalSpentToDate / Math.max(totalMonths, 1)
    };
  };

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

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Overall Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-[#1C1C24] p-4 rounded print:bg-gray-100">
              <p className="text-gray-400 print:text-gray-600">Total Spent to Date</p>
              <p className="text-2xl font-bold">£{calculateOverallStats().totalSpentToDate.toFixed(2)}</p>
            </div>
            <div className="bg-[#1C1C24] p-4 rounded print:bg-gray-100">
              <p className="text-gray-400 print:text-gray-600">Monthly Average Spent</p>
              <p className="text-2xl font-bold">£{calculateOverallStats().monthlyAverage.toFixed(2)}</p>
            </div>
            <div className="bg-[#1C1C24] p-4 rounded print:bg-gray-100">
              <p className="text-gray-400 print:text-gray-600">Current Monthly Cost</p>
              <p className="text-2xl font-bold">£{calculateOverallStats().totalMonthlyPayments.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Category Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(calculateOverallStats().categoryBreakdown).map(([category, data]) => (
              <div key={category} className="bg-[#1C1C24] p-4 rounded print:bg-gray-100">
                <h3 className="text-lg font-semibold mb-2">{category}</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-400 print:text-gray-600">Monthly Spend</p>
                    <p className="text-xl font-bold">£{data.monthlySpend.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 print:text-gray-600">Total Spent</p>
                    <p className="text-xl font-bold">£{data.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 print:text-gray-600">Subscriptions</p>
                    <p className="text-xl font-bold">{data.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                    <p>£{details.monthlyPayment.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 print:text-gray-600">Months Active</p>
                    <p>{details.monthsActive} months</p>
                  </div>
                  <div>
                    <p className="text-gray-400 print:text-gray-600">Total Spent</p>
                    <p>£{details.totalSpentToDate.toFixed(2)}</p>
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

        <div className="text-sm text-gray-400 print:text-gray-500 mt-8">
          <p>Report generated on: {format(new Date(), 'MMMM dd, yyyy')}</p>
        </div>
      </div>
    </div>
  );
}
