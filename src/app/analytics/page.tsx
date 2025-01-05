'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Subscription } from '@/types/subscription';
import useCheckAuth from '@/hooks/useCheckAuth';
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

export default function Analytics() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const { isLoading, isTokenValid } = useCheckAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isTokenValid) {
        router.push('/signin');
        return;
      }

      const loadedSubscriptions = JSON.parse(
        localStorage.getItem('subscriptions') || '[]',
        (key, value) => {
          if (key === 'startDate' || key === 'canceledDate') {
            return value ? new Date(value) : null;
          }
          return value;
        }
      );
      setSubscriptions(loadedSubscriptions);
    }
  }, [isLoading, isTokenValid, router]);

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

  const predictNextMonthSpending = () => {
    const monthlyData = calculateMonthlySpending();
    if (monthlyData.length < 3) return null;

    // Simple linear regression for prediction
    const recentMonths = monthlyData.slice(-3);
    const trend = (recentMonths[2].total - recentMonths[0].total) / 2;
    const predictedAmount = recentMonths[2].total + trend;

    return {
      predicted: Math.max(0, predictedAmount),
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#13131A] text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const monthlyData = calculateMonthlySpending();
  const prediction = predictNextMonthSpending();

  return (
    <div className="min-h-screen bg-[#13131A] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Subscription Trends</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white px-4 py-2 rounded transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Spending Trend Chart */}
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
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C1C24',
                    border: '1px solid #333',
                    borderRadius: '4px'
                  }}
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

        {/* Prediction Card */}
        {prediction && (
          <div className="bg-[#1C1C24] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Next Month Prediction</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Predicted Spending</p>
                <p className="text-2xl font-bold">${prediction.predicted.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400">Trend</p>
                <p className={`text-lg ${
                  prediction.trend === 'increasing' 
                    ? 'text-red-400' 
                    : prediction.trend === 'decreasing' 
                    ? 'text-green-400' 
                    : 'text-gray-400'
                }`}>
                  {prediction.trend.charAt(0).toUpperCase() + prediction.trend.slice(1)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 