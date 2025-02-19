'use client';

import React, { useState, useEffect } from 'react';
import { Subscription } from '../types/subscription';
import { PlusIcon } from '@heroicons/react/24/solid';
import { subscriptionCategories, defaultCategories, SubscriptionCategory } from '@/utils/categories';
import { createPaymentDueNotification } from '@/utils/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import { subscriptionData } from '@/data/subscriptionData';

interface SubscriptionFormProps {
  onSubmit: (subscription: Omit<Subscription, "id">) => void;
  existingSubscription: Subscription | null;
  subscriptions: Subscription[];
  onCancelEdit?: () => void;
}

const generateInitialsLogo = (name: string): string => {
  // Split the name into words and get initials
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2); // Only take first two initials

  // Create a canvas to generate the logo
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Set background
    ctx.fillStyle = '#6C5DD3';
    ctx.fillRect(0, 0, 100, 100);
    
    // Set text properties
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw initials
    ctx.fillText(initials, 50, 50);
    
    // Convert to data URL
    return canvas.toDataURL('image/png');
  }
  
  return '';
};

export default function SubscriptionForm({ onSubmit, existingSubscription, subscriptions, onCancelEdit }: SubscriptionFormProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    startDate: new Date().toISOString().split('T')[0],
    canceledDate: null as string | null,
    billingCycle: 'monthly' as const,
    logo: '' as string,
    category: 'Other' as SubscriptionCategory,
  });
  const [error, setError] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const { user } = useAuth();

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
        logo: existingSubscription.logo || '',
        category: (existingSubscription.category || defaultCategories[existingSubscription.name] || 'Other') as SubscriptionCategory,
      });
      setIsCustom(false);
    }
  }, [existingSubscription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Please select or enter a subscription name');
      setIsError(true);
      return;
    }

    if (!formData.price) {
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
      : Number(formData.price);

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

    const subscription: Omit<Subscription, "id"> = {
      name: formData.name,
      price: Number(price),
      startDate: startDate,
      category: (formData.category || defaultCategories[formData.name] || 'Other') as SubscriptionCategory,
      canceledDate: formData.canceledDate ? new Date(formData.canceledDate) : null,
      nextPaymentDate: nextPaymentDate,
      logo: isCustom ? generateInitialsLogo(formData.name) : (formData.logo || ''),
    };

    onSubmit(subscription);

    // Create notification after subscription is saved
    if (user) {
      const { data } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('name', subscription.name)
        .eq('user_id', user.id)
        .single();

      if (data) {
        await createPaymentDueNotification({ ...subscription, id: data.id }, user.id);
      }
    }

    // Reset form
    setFormData({
      name: '',
      price: '',
      startDate: new Date().toISOString().split('T')[0],
      canceledDate: null,
      billingCycle: 'monthly',
      logo: '',
      category: 'Other',
    });
    setIsCustom(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updates = { [name]: value };
      
      // Auto-select category, price, and logo when subscription name changes
      if (name === 'name' && !isCustom) {
        const selectedSub = subscriptionData.find(sub => sub.name === value);
        updates.category = defaultCategories[value] || 'Other';
        updates.price = selectedSub ? selectedSub.default_price.toString() : '';
        updates.logo = selectedSub ? selectedSub.logo : '';
      }
      
      return { ...prev, ...updates };
    });
    setError(null);
    setIsError(false);
  };

  return (
    <div className="bg-[#1C1C27] rounded-xl p-4 md:p-6 shadow-lg">
      {isError && error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">
        {existingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {!existingSubscription ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isCustom && (
                <select
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-gray-800 text-white rounded-lg p-2 md:p-3 w-full text-sm md:text-base"
                >
                  <option value="">Select a subscription</option>
                  {subscriptionData.map((sub) => (
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
                  className="bg-gray-800 text-white rounded-lg p-2 md:p-3 text-sm md:text-base"
                  required={isCustom}
                />
              )}

              <button
                type="button"
                onClick={() => setIsCustom(!isCustom)}
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm md:text-base"
              >
                <PlusIcon className="h-5 w-5" />
                {isCustom ? 'Choose from list' : 'Add custom'}
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="category" className="text-gray-400 text-sm">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="bg-gray-800 text-white rounded-lg p-2 md:p-3 h-10 md:h-12 w-full text-sm md:text-base"
              >
                {subscriptionCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-gray-400 text-sm">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-800 text-white rounded-lg p-2 md:p-3 h-10 md:h-12 w-full text-sm md:text-base"
              disabled
            />
          </div>
        )}

        {existingSubscription && (
          <div className="flex flex-col gap-1">
            <label htmlFor="category" className="text-gray-400 text-sm">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="bg-gray-800 text-white rounded-lg p-2 md:p-3 h-10 md:h-12 w-full text-sm md:text-base"
            >
              {subscriptionCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="price" className="text-gray-400 text-sm">Price</label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price (required)"
              className="bg-gray-800 text-white rounded-lg p-2 md:p-3 h-10 md:h-12 w-full text-sm md:text-base"
              required={true}
              step="0.01"
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
              className="bg-gray-800 text-white rounded-lg p-2 md:p-3 h-10 md:h-12 w-full text-sm md:text-base"
            />
          </div>
        </div>

        <div className="flex gap-2 md:gap-4">
          <button
            type="submit"
            className="flex-1 bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white rounded-lg p-2 md:p-3 transition-colors text-sm md:text-base"
          >
            {existingSubscription ? 'Update Subscription' : 'Add Subscription'}
          </button>
          {existingSubscription && (
            <button
              type="button"
              onClick={() => onCancelEdit?.()}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg p-2 md:p-3 transition-colors text-sm md:text-base"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
