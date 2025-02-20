'use client';

import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Subscription } from '../types/subscription';
import { format } from 'date-fns';

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
    <div className="bg-[#1C1C27] rounded-xl p-4 md:p-6 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-2 md:gap-0">
        <h2 className="text-lg md:text-xl font-semibold text-white">
          Your Subscriptions
        </h2>
        {subscriptions.length > 0 && (
          <button
            onClick={onDeleteAll}
            className="text-sm md:text-base text-red-500 hover:text-red-400 transition-colors"
          >
            Delete All
          </button>
        )}
      </div>

      {subscriptions.length === 0 ? (
        <p className="text-gray-400 text-center text-sm md:text-base">No subscriptions yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="bg-[#23232D] rounded-lg p-4 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {subscription.logo ? (
                    <img
                      src={subscription.logo}
                      alt={subscription.name}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-700 rounded-lg" />
                  )}
                  <div>
                    <h3 className="text-white font-medium text-sm md:text-base">
                      {subscription.name}
                    </h3>
                    <p className="text-gray-400 text-xs md:text-sm">
                      {subscription.category}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      window.scrollTo(0, 0);
                      onEdit(subscription);
                    }}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                  >
                    <PencilIcon className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(subscription.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <TrashIcon className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs md:text-sm">Price</span>
                  <span className="text-white font-medium text-sm md:text-base">
                    £{subscription.price.toFixed(2)}/mo
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs md:text-sm">Next Payment</span>
                  <span className="text-white text-sm md:text-base">
                    {format(subscription.nextPaymentDate, 'MMM dd, yyyy')}
                  </span>
                </div>
                {!subscription.canceledDate && (
                  <button
                    onClick={() => onCancel(subscription)}
                    className="w-full mt-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg py-1.5 md:py-2 text-sm md:text-base transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
