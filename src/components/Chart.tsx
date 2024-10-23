'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Subscription } from '../types/subscription';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ChartProps {
  subscriptions: Subscription[];
  currentDate: Date;
}

export function SubscriptionChart({ subscriptions, currentDate }: ChartProps) {
  // Move calculateCost function to the top
  const calculateCost = (sub: Subscription) => {
    const today = new Date();
    const startDate = new Date(sub.startDate);
    const cancelDate = sub.canceledDate ? new Date(sub.canceledDate) : null;

    // If cancelled before start
    if (cancelDate && cancelDate < startDate) {
      return 0;
    }

    // Calculate months including partial months
    const endDate = cancelDate || today;
    
    // Calculate the difference in months including partial months
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months += endDate.getMonth() - startDate.getMonth();
    
    // Add 1 to include both start and end months if we're past the start day in the end month
    if (endDate.getDate() >= startDate.getDate()) {
      months += 1;
    }

    return sub.price * Math.max(0, months);
  };

  // Update the totalCost calculation for monthly recurring cost
  const totalCost = subscriptions.reduce((sum, sub) => {
    const today = new Date();
    const startDate = new Date(sub.startDate);
    const cancelDate = sub.canceledDate ? new Date(sub.canceledDate) : null;

    // Don't include in monthly cost if:
    // 1. Subscription hasn't started yet
    // 2. Subscription is cancelled
    if (startDate > today || (cancelDate && cancelDate <= today)) {
      return sum;
    }

    return sum + sub.price;
  }, 0);

  const spentAmount = subscriptions.reduce((sum, sub) => {
    return sum + calculateCost(sub);
  }, 0);

  const series = subscriptions.map(sub => sub.price);
  const labels = subscriptions.map(sub => sub.name);

  const options = {
    chart: {
      type: 'donut' as const,
      background: 'transparent',
    },
    labels: labels,
    theme: {
      mode: 'dark' as const,
      palette: 'palette1',
    },
    colors: ['#6C5DD3', '#E91E63', '#00B5D8', '#4CAF50', '#FFA500'], // Modern color palette
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Monthly',
              color: '#FFFFFF',
              formatter: () => `$${totalCost.toFixed(2)}`,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false, // Disabled for cleaner look
    },
    legend: {
      show: false,
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => `$${val.toFixed(2)}`,
      },
    },
    stroke: {
      width: 0,
    },
  };

  return (
    <div className="bg-[#1C1C27] rounded-xl p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Subscription Overview</h2>
          <div className="flex gap-12"> {/* Increased gap for better spacing */}
            <div>
              <p className="text-3xl font-bold text-white">
                ${totalCost.toFixed(2)}
                <span className="text-sm text-gray-400 ml-2">/ month</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">Total Monthly Cost</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">${spentAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-400 mt-1">Total Spent to Date</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-1/2">
          <Chart
            options={options}
            series={series}
            type="donut"
            width="100%"
            height="320"
          />
        </div>
        
        <div className="w-1/2 pl-8 flex flex-col justify-center">
          {subscriptions.map((sub, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: options.colors[index % options.colors.length] }}
                />
                <span className="text-white">{sub.name}</span>
              </div>
              <div className="text-gray-400">
                ${sub.price.toFixed(2)}
                <span className="text-sm ml-2">
                  ({((sub.price / totalCost) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
