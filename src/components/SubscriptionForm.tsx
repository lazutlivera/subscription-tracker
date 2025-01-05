'use client';

import React, { useState, useEffect } from 'react';
import { Subscription } from '../types/subscription';
import { PlusIcon } from '@heroicons/react/24/solid';
import SubscriptionList from './SubscriptionList';

interface SubscriptionFormProps {
  onSubmit: (subscription: Omit<Subscription, "id">) => void;
  existingSubscription: Subscription | null;
  subscriptions: Subscription[];
}

interface CommonSubscription {
  name: string;
  logo: string;
  defaultPrice: number; // Changed to only monthly price
}



const commonSubscriptions: CommonSubscription[] = [
  // Existing Subscriptions
  {
    name: 'Netflix',
    logo: 'https://logo.clearbit.com/netflix.com',
    defaultPrice: 15.49,
  },
  {
    name: 'Spotify',
    logo: 'https://logo.clearbit.com/spotify.com',
    defaultPrice: 9.99,
  },
  {
    name: 'Disney+',
    logo: 'https://logo.clearbit.com/disneyplus.com',
    defaultPrice: 7.99,
  },
  // New Subscriptions
  {
    name: 'Hulu',
    logo: 'https://logo.clearbit.com/hulu.com',
    defaultPrice: 5.99,
  },
  {
    name: 'Amazon Prime',
    logo: 'https://logo.clearbit.com/amazon.com',
    defaultPrice: 12.99,
  },
  {
    name: 'HBO Max',
    logo: 'https://logo.clearbit.com/hbomax.com',
    defaultPrice: 14.99,
  },
  {
    name: 'Apple Music',
    logo: 'https://logo.clearbit.com/apple.com',
    defaultPrice: 9.99,
  },
  {
    name: 'YouTube Premium',
    logo: 'https://logo.clearbit.com/youtube.com',
    defaultPrice: 11.99,
  },
  {
    name: 'Adobe Creative Cloud',
    logo: 'https://logo.clearbit.com/adobe.com',
    defaultPrice: 52.99,
  },
  {
    name: 'Dropbox',
    logo: 'https://logo.clearbit.com/dropbox.com',
    defaultPrice: 9.99,
  },
  {
    name: 'Microsoft 365',
    logo: 'https://logo.clearbit.com/microsoft.com',
    defaultPrice: 6.99,
  },
  {
    name: 'Slack',
    logo: 'https://logo.clearbit.com/slack.com',
    defaultPrice: 6.67,
  },
  // Added 9 More Subscriptions
  {
    name: 'Zoom',
    logo: 'https://logo.clearbit.com/zoom.us',
    defaultPrice: 14.99,
  },
  {
    name: 'Trello',
    logo: 'https://logo.clearbit.com/trello.com',
    defaultPrice: 9.99,
  },
  {
    name: 'GitHub',
    logo: 'https://logo.clearbit.com/github.com',
    defaultPrice: 4.0,
  },
  {
    name: 'LinkedIn Premium',
    logo: 'https://logo.clearbit.com/linkedin.com',
    defaultPrice: 29.99,
  },
  {
    name: 'Dropbox Business',
    logo: 'https://logo.clearbit.com/dropbox.com',
    defaultPrice: 15.0,
  },
  {
    name: 'Evernote',
    logo: 'https://logo.clearbit.com/evernote.com',
    defaultPrice: 7.99,
  },
  {
    name: 'Canva Pro',
    logo: 'https://logo.clearbit.com/canva.com',
    defaultPrice: 12.95,
  },
  {
    name: 'Notion',
    logo: 'https://logo.clearbit.com/notion.so',
    defaultPrice: 4.0,
  },
];

export default function SubscriptionForm({ onSubmit, existingSubscription, subscriptions }: SubscriptionFormProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    startDate: new Date().toISOString().split('T')[0],
    canceledDate: null as string | null,
    billingCycle: 'monthly' as const,
    logo: null as string | null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Initialize form with existing subscription data if provided
  useEffect(() => {
    if (existingSubscription) {
      setFormData({
        name: existingSubscription.name,
        price: existingSubscription.price.toString(),
        startDate: new Date(existingSubscription.startDate).toISOString().split('T')[0],
        canceledDate: existingSubscription.canceledDate 
          ? new Date(existingSubscription.canceledDate).toISOString().split('T')[0]
          : null,
        billingCycle: 'monthly',
        logo: existingSubscription.logo || commonSubscriptions.find(s => s.name === existingSubscription.name)?.logo || null,
      });
      setIsCustom(!commonSubscriptions.some(sub => sub.name === existingSubscription.name));
    }
  }, [existingSubscription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Please select or enter a subscription name');
      setIsError(true);
      return;
    }

    if (!formData.price && !commonSubscriptions.find(s => s.name === formData.name)?.defaultPrice) {
      setError('Please enter a valid price');
      setIsError(true);
      return;
    }

    // Only check for duplicates if this is a new subscription
    if (!existingSubscription) {
      const isDuplicate = subscriptions.some(
        sub => sub.name.toLowerCase() === formData.name.toLowerCase()
      );
      if (isDuplicate) {
        setError('This subscription already exists!');
        setIsError(true);
        return;
      }
    }

    // Validate required fields for custom subscriptions
    if (isCustom && (!formData.name || !formData.price)) {
      alert('Name and price are required for custom subscriptions');
      return;
    }

    // Clear any existing errors
    setError(null);
    setIsError(false);

    const price = isCustom 
      ? Number(formData.price) 
      : (Number(formData.price) || commonSubscriptions.find(s => s.name === formData.name)?.defaultPrice || 0);

    const startDate = new Date(formData.startDate);
    const today = new Date();
    
    // Simplified next payment date calculation
    const calculateNextPaymentDate = (baseDate: Date): Date => {
      const date = new Date(baseDate);
      const today = new Date();
      
      // If the date is in the future, return it
      if (date > today) {
        return date;
      }
      
      // Calculate all possible payment dates until we find one in the future
      let currentDate = new Date(date);
      while (currentDate <= today) {
        currentDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          currentDate.getDate()
        );
      }
      
      return currentDate;
    };

    const nextPaymentDate = calculateNextPaymentDate(startDate);

    console.log('FORM: Saving subscription with dates:', {
      name: formData.name,
      startDate: startDate.toISOString(),
      nextPaymentDate: nextPaymentDate.toISOString(),
      rawNextPayment: nextPaymentDate
    });

    const subscription: Omit<Subscription, "id"> = {
      name: formData.name,
      price: Number(price),
      startDate: startDate,
      category: 'default',
      canceledDate: formData.canceledDate ? new Date(formData.canceledDate) : null,
      nextPaymentDate: nextPaymentDate,
      logo: formData.logo || commonSubscriptions.find(s => s.name === formData.name)?.logo || null,
    };

    onSubmit(subscription);

    // Reset form
    setFormData({
      name: '',
      price: '',
      startDate: new Date().toISOString().split('T')[0],
      canceledDate: null,
      billingCycle: 'monthly',
      logo: null,
    });
    setIsCustom(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value  
    }));
    setError(null);
    setIsError(false);
  };

  const handleCancelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      canceledDate: isChecked ? new Date().toISOString().split('T')[0] : null,
    }));
  };

  return (
    <div className="bg-[#1C1C27] rounded-xl p-6 shadow-lg">
      {isError && error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      <h2 className="text-xl font-semibold text-white mb-6">
        {existingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!existingSubscription ? (
          <div className="grid grid-cols-2 gap-4">
            {!isCustom && (
              <select
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="bg-gray-800 text-white rounded-lg p-3 w-full"
              >
                <option value="">Select a subscription</option>
                {commonSubscriptions.map((sub) => (
                  <option key={sub.name} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            )}

            {isCustom && (
              <input
                type="text"
                name="name"
                placeholder="Subscription name"
                value={formData.name}
                onChange={handleChange}
                className="bg-gray-800 text-white rounded-lg p-3"
                required={isCustom}
              />
            )}

            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              {isCustom ? 'Choose from list' : 'Add custom'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-gray-400 text-sm">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-800 text-white rounded-lg p-3 h-12 w-full"
              disabled
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="price" className="text-gray-400 text-sm">Price</label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder={
                !existingSubscription && !isCustom 
                  ? `${commonSubscriptions.find(s => s.name === formData.name)?.defaultPrice || 'Price (optional)'}`
                  : 'Price (required)'
              }
              className="bg-gray-800 text-white rounded-lg p-3 h-12 w-full"
              required={isCustom || !!existingSubscription}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="startDate" className="text-gray-400 text-sm">Start Date</label>
            <input
              id="startDate"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="bg-gray-800 text-white rounded-lg p-3 h-12 w-full"
            />
          </div>

          {existingSubscription && (
            <div className="flex flex-col gap-1">
              <label htmlFor="canceledDate" className="text-gray-400 text-sm">Cancellation Date</label>
              <input
                id="canceledDate"
                type="date"
                name="canceledDate"
                value={formData.canceledDate || ''}
                onChange={handleChange}
                className="bg-gray-800 text-white rounded-lg p-3 h-12 w-full"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white rounded-lg p-3 transition-colors"
        >
          {existingSubscription ? 'Update Subscription' : 'Add Subscription'}
        </button>
      </form>
    </div>
  );
}
