'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Subscription } from '../types/subscription';

const Chart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <div>Loading chart...</div>
});

interface ChartProps {
  subscriptions: Subscription[];
}

 
const chartColors = [
  '#6C5DD3', // Purple (primary)
  '#FF8F6B', // Coral
  '#4ECB71', // Green
  '#3E7BFA', // Blue
  '#FFB800', // Yellow
  '#FF6B6B', // Red
  '#45B36B', // Emerald
  '#9B51E0', // Violet
  '#00C4B4', // Teal
  '#FF9F43', // Orange
  '#EA5455', // Pink
  '#28C76F', // Mint
  '#4B4DED', // Indigo
  '#FF6B6B', // Salmon
  '#43A047', // Forest
];

export function SubscriptionChart({ subscriptions }: ChartProps) {
  const [chartHeight, setChartHeight] = useState("320");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateHeight = () => {
      setChartHeight(window.innerWidth < 768 ? "250" : "320");
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  if (!isMounted) {
    return <div>Loading chart...</div>;
  }

   
  const calculateCost = (sub: Subscription) => {
    const today = new Date();
    const startDate = new Date(sub.startDate);
    const cancelDate = sub.canceledDate ? new Date(sub.canceledDate) : null;

     
    if (cancelDate && cancelDate < startDate) {
      return 0;
    }

     
    const endDate = cancelDate || today;
    
     
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months += endDate.getMonth() - startDate.getMonth();
    
     
    if (endDate.getDate() >= startDate.getDate()) {
      months += 1;
    }

    return sub.price * Math.max(0, months);
  };

   
  const totalCost = subscriptions.reduce((sum, sub) => {
    const today = new Date();
    const startDate = new Date(sub.startDate);
    const cancelDate = sub.canceledDate ? new Date(sub.canceledDate) : null;

     
     
     
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
    },
    colors: chartColors,  
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
              formatter: () => `£${totalCost.toFixed(2)}`,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,  
    },
    legend: {
      show: false,
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => `£${val.toFixed(2)}`,
      },
    },
    stroke: {
      width: 0,
    },
  };

  return (
    <div className="bg-[#1C1C27] rounded-xl p-4 md:p-8 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-white mb-2">Subscription Overview</h2>
          <div className="flex gap-4 md:gap-12">
            <div>
              <p className="text-xl md:text-3xl font-bold text-white">
                £{totalCost.toFixed(2)}
                <span className="text-xs md:text-sm text-gray-400 ml-2">/ month</span>
              </p>
              <p className="text-xs md:text-sm text-gray-400 mt-1">Total Monthly Cost</p>
            </div>
            <div>
              <p className="text-xl md:text-3xl font-bold text-white">£{spentAmount.toFixed(2)}</p>
              <p className="text-xs md:text-sm text-gray-400 mt-1">Total Spent to Date</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto">
        <div className="w-full md:w-1/2 min-h-[250px] md:min-h-[400px] flex-shrink-0">
          <Chart
            options={options}
            series={series}
            type="donut"
            width="100%"
            height={chartHeight}
          />
        </div>
        
        <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-8">
          <div className="h-[300px] md:h-[400px] overflow-y-auto 
            scrollbar-thin 
            scrollbar-thumb-[#6C5DD3] 
            scrollbar-track-[#1C1C24]/40 
            hover:scrollbar-thumb-[#5B4EC2]
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gradient-to-b
            [&::-webkit-scrollbar-thumb]:from-[#6C5DD3]
            [&::-webkit-scrollbar-thumb]:to-[#5B4EC2]
            [&::-webkit-scrollbar-thumb]:border
            [&::-webkit-scrollbar-thumb]:border-[#1C1C24]
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-[#1C1C24]/40
            hover:[&::-webkit-scrollbar-thumb]:from-[#5B4EC2]
            hover:[&::-webkit-scrollbar-thumb]:to-[#4B3EC2]
            transition-colors
            duration-150">
            {subscriptions.map((sub, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className="text-white text-sm md:text-base">{sub.name}</span>
                </div>
                <div className="text-gray-400 text-sm md:text-base">
                  £{sub.price.toFixed(2)}
                  <span className="text-xs md:text-sm ml-2">
                    ({((sub.price / totalCost) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
