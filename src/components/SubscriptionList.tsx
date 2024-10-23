'use client';

import { TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Subscription } from '../types/subscription';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscriptionId: string) => void;
  onDeleteAll: () => void;
  onCancel: (subscription: Subscription) => void;
}

export default function SubscriptionList({ 
  subscriptions, 
  onEdit, 
  onDelete,
  onDeleteAll,
  onCancel 
}: SubscriptionListProps) {
  return (
    <div className="bg-[#1C1C27] rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Your Subscriptions</h2>
        {subscriptions.length > 0 && (
          <button
            onClick={onDeleteAll}
            className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
          >
            Delete All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {subscriptions.map((subscription) => (
          <div 
            key={subscription.id} 
            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-4">
              {subscription.logo && (
                <Image
                  src={subscription.logo}
                  alt={subscription.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div>
                <h3 className="text-white font-medium">{subscription.name}</h3>
                <p className="text-gray-400 text-sm">
                  ${subscription.price}/month
                  {subscription.canceledDate && (
                    <span className="text-red-400 ml-2">
                      (Cancelled: {new Date(subscription.canceledDate).toLocaleDateString()})
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(subscription)}
                className="text-gray-400 hover:text-white transition-colors px-3 py-1 rounded"
              >
                Edit
              </button>
              {!subscription.canceledDate && (
                <button
                  onClick={() => onCancel(subscription)}
                  className="text-yellow-500 hover:text-yellow-400 transition-colors px-3 py-1 rounded"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => onDelete(subscription.id)}
                className="text-red-500 hover:text-red-400 transition-colors px-3 py-1 rounded"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
