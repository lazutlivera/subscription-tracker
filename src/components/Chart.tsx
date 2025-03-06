'use client';

import React, { useEffect, useState } from 'react';
import { Subscription } from '../types/subscription';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
  const [isMounted, setIsMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMidScreen, setIsMidScreen] = useState(false);
  const [isMidScreen2, setIsMidScreen2] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    // Check if device is touch-enabled
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    // Function to check screen size
    const checkScreenSize = () => {
      setIsMidScreen(window.innerWidth <= 1163 && window.innerWidth >= 768);
      setIsMidScreen2(window.innerWidth <= 767 && window.innerWidth >= 481);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Add responsive styles for different screen sizes
    const style = document.createElement('style');
    style.innerHTML = `
      .recharts-sector {
        outline: none !important;
        box-shadow: none !important;
      }
      .recharts-pie {
        outline: none !important;
        user-select: none !important;
      }
      
      @media (min-width: 768px) and (max-width: 1255px) {
        .recharts-pie {
          transform: scale(0.9);
          transform-origin: center 42%;
        }
        .chart-container-mid {
          margin-top: 0 !important;
          padding-top: 20px !important;
        }
        .chart-center-text-mid {
          top: 35% !important;
        }
      }

      @media (min-width: 481px) and (max-width: 767px) {
        .recharts-pie {
          transform: scale(0.9);
          transform-origin: center 100%;
        }
        .chart-container-mid2 {
          margin-top: 0 !important;
          padding-top: 20px !important;
        }
        .chart-center-text-mid2 {
          top: 42% !important;
        }
      }
      
      @media (max-width: 480px) {
        .recharts-pie {
          transform: scale(1.1);
          transform-origin: center 5%;
        }
        .chart-container-mobile {
          margin-top: 10px !important;
          height: auto !important;
          min-height: 300px !important;
        }
        .chart-center-text-mobile {
          top: 40% !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      document.head.removeChild(style);
      setIsMounted(false);
    };
  }, []);

  // Calculate total monthly cost
  const totalMonthly = subscriptions
    .filter(sub => !sub.canceled_date) // Only include active subscriptions
    .reduce((total, sub) => total + Number(sub.price), 0);

  // Calculate total spent to date
  const totalSpent = subscriptions.reduce((total, sub) => {
    const startDate = new Date(sub.start_date);
    const today = new Date();
    
    // Skip future subscriptions
    if (startDate > today) {
      return total;
    }

    const endDate = sub.canceled_date ? 
      new Date(Math.min(new Date(sub.canceled_date).getTime(), today.getTime())) : 
      today;

    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
    
    return total + (Number(sub.price) * Math.max(1, monthsDiff));
  }, 0);

  // Format data for Recharts
  const chartData = subscriptions.map(sub => ({
    name: sub.name,
    value: sub.price,
    percentage: ((sub.price / totalMonthly) * 100).toFixed(1)
  }));

  const handlePieEnter = (data: any, index: number) => {
    setActiveIndex(index);
  };

  const handlePieLeave = () => {
    setActiveIndex(null);
  };

  const handlePieClick = (data: any, index: number) => {
    // Do nothing - disable click functionality
    return;
  };

  // Empty tooltip to prevent default tooltip
  const EmptyTooltip = () => null;

  const showCenterText = subscriptions.length > 0;

  if (!isMounted) {
    return <div>Loading chart...</div>;
  }

  return (
    <div className="bg-[#1C1C27] rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Subscription Overview</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">£{totalMonthly.toFixed(2)}</h3>
          <p className="text-gray-400 text-sm">Total Monthly Cost</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">£{totalSpent.toFixed(2)}</h3>
          <p className="text-gray-400 text-sm">Total Spent to Date</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto">
        <div className={`w-full md:w-1/2 min-h-[250px] md:min-h-[400px] flex-shrink-0 relative ${isTouchDevice ? 'chart-container-mobile' : isMidScreen ? 'chart-container-mid' : 'chart-container-mid2'}`}>
          {showCenterText && (
            <div className={`absolute inset-0 flex items-center justify-center z-10 pointer-events-none ${isTouchDevice ? 'chart-center-text-mobile' : isMidScreen ? 'chart-center-text-mid' : 'chart-center-text-mid2'}`} style={{ top: '30%', transform: 'translateY(-50%)' }}>
              <div className="text-center">
                {activeIndex !== null ? (
                  <>
                    <p className="text-lg font-medium text-white">{chartData[activeIndex].name}</p>
                    <p className="text-2xl font-bold text-white">£{chartData[activeIndex].value.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">{chartData[activeIndex].percentage}%</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium text-white">Total Monthly</p>
                    <p className="text-2xl font-bold text-white">£{totalMonthly.toFixed(2)}</p>
                  </>
                )}
              </div>
            </div>
          )}
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height={isTouchDevice ? 300 : isMidScreen ? 300 : isMidScreen2 ? 300 : "100%"}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy={isTouchDevice ? "40%" : isMidScreen ? "40%" : isMidScreen2 ? "30%" : "30%"}
                  innerRadius={110}
                  outerRadius={120}
                  paddingAngle={6}
                  cornerRadius={6}
                  dataKey="value"
                  animationDuration={0}
                  animationBegin={0}
                  onMouseEnter={handlePieEnter}
                  onMouseLeave={handlePieLeave}
                  strokeWidth={0}
                  activeIndex={-1}
                  activeShape={undefined}
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={chartColors[index % chartColors.length]} 
                      stroke="none"
                      style={{ 
                        filter: activeIndex === index ? 'brightness(1.2)' : 'none',
                        outline: 'none'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<EmptyTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-8">
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#6C5DD3] scrollbar-track-[#1C1C24]/40 hover:scrollbar-thumb-[#5B4EC2]">
            {chartData.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0 ${activeIndex === index ? 'bg-gray-800/30 rounded' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => isTouchDevice && setActiveIndex(index === activeIndex ? null : index)}
                style={{ cursor: 'default' }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className="text-white text-sm md:text-base">{item.name}</span>
                </div>
                <div className="text-gray-400 text-sm md:text-base">
                  £{Number(item.value).toFixed(2)}
                  <span className="text-xs md:text-sm ml-2">
                    ({item.percentage}%)
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
