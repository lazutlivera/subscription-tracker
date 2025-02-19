'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Subscription } from '@/types/subscription';
import { format, subMonths } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';

export default function Analytics() {
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
          const loadedSubscriptions = JSON.parse(saved, (key, value) => {
            if (key === 'startDate' || key === 'canceledDate' || key === 'nextPaymentDate') {
              return value ? new Date(value) : null;
            }
            return value;
          });
          setSubscriptions(loadedSubscriptions);
        }
      }
    };

    loadSubscriptions();
  }, [user]);

  const calculateMonthlySpending = () => {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        month: format(date, 'MMM yyyy'),
        date: date,
        total: 0,
      };
    }).reverse();

    subscriptions.forEach(sub => {
      const startDate = new Date(sub.startDate);
      const endDate = sub.canceledDate ? new Date(sub.canceledDate) : new Date();

      last12Months.forEach(monthData => {
        if (monthData.date >= startDate && monthData.date <= endDate) {
          monthData.total += sub.price;
        }
      });
    });

    return last12Months;
  };

  const calculateCategorySpending = () => {
    const categoryTotals = subscriptions.reduce((acc, sub) => {
      const category = sub.category || 'Other';
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          count: 0,
          subscriptions: []
        };
      }
      acc[category].total += sub.price;
      acc[category].count += 1;
      acc[category].subscriptions.push(sub.name);
      return acc;
    }, {} as Record<string, { total: number; count: number; subscriptions: string[] }>);

    return Object.entries(categoryTotals)
      .sort((a, b) => b[1].total - a[1].total);
  };

  const monthlyData = calculateMonthlySpending();
  const categoryData = calculateCategorySpending();

  return (
    <div className="min-h-screen bg-[#13131A] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-0">Subscription Trends</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-[#1C1C24] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Monthly Spending Trend</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                  />
                  <YAxis 
                    stroke="#666"
                    tickFormatter={(value) => `£${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1C1C24',
                      border: '1px solid #333',
                      borderRadius: '4px'
                    }}
                    formatter={(value) => [`£${Number(value).toFixed(2)}`, "Monthly Spending"]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#6C5DD3" 
                    name="Monthly Spending"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#1C1C24] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
            <div className="space-y-4">
              {categoryData.map(([category, data]) => {
                const getMessage = () => {
                  if (data.count <= 1) return null;
                  
                  switch(category) {
                    case 'Streaming & Entertainment':
                      return `Wow! ${data.count} streaming services? Maybe it's time to pick favorites... or start a movie marathon to get your money's worth! 🎬`;
                    case 'Music & Audio':
                      return `${data.count} music services? That's enough to start your own radio station! Maybe stick to one and buy some concert tickets instead? 🎵`;
                    case 'Cloud Storage':
                      return `${data.count} cloud storage services? That's a lot of space! Time to declutter your digital life? ☁️`;
                    case 'Productivity':
                      return `${data.count} productivity apps? Ironically, managing them might be decreasing your productivity! 😅`;
                    case 'Gaming':
                      return `${data.count} gaming subscriptions? That's a lot of boss fights! Consider alternating them monthly - your wallet (and sleep schedule) will thank you! 🎮`;
                    case 'News & Reading':
                      return `${data.count} news subscriptions? You must be the most well-informed person around! Maybe share accounts with family? 📰`;
                    case 'Fitness & Health':
                      return `${data.count} fitness subscriptions? Your wallet is getting quite the workout too! Maybe try running - it's free! 🏃‍♂️`;
                    case 'Learning & Education':
                      return `${data.count} learning platforms? You must be really smart by now! Maybe share one account with a study buddy? 📚`;
                    case 'Security & VPN':
                      return `${data.count} security subscriptions? Your data must be Fort Knox level secure! Maybe bundle some services? 🔒`;
                    case 'Business & Professional':
                      return `${data.count} business services? Your business must be booming! Maybe bundle some services together? 💼`;
                    case 'Social & Communication':
                      return `${data.count} social subscriptions? You must be the most connected person around! Time to touch some grass? 🌱`;
                    case 'Other':
                      return `${data.count} miscellaneous subscriptions? That's an interesting mix! Time for a subscription audit? 🤔`;
                    default:
                      return `${data.count} subscriptions in ${category}? That's quite a collection! Might be worth reviewing if you need them all. 💭`;
                  }
                };

                const message = getMessage();

                return (
                  <div key={category} className="border-b border-gray-800 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">{category}</h3>
                      <p className="text-lg font-bold">£{data.total.toFixed(2)}</p>
                    </div>
                    <p className="text-sm text-gray-400">
                      {data.count} subscription{data.count !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-400">
                      {data.subscriptions.join(', ')}
                    </p>
                    {message && (
                      <p className="mt-2 text-sm text-yellow-400 italic">
                        {message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 