import { Subscription } from '../types/subscription';

export const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    price: 15.99,
    startDate: new Date('2024-01-01'),
    logo: 'https://logo.clearbit.com/netflix.com',
    canceledDate: null,
    billingCycle: 'monthly',
  },
  {
    id: '2',
    name: 'LinkedIn',
    price: 29.99,
    startDate: new Date(2023, 3, 1),
    billingCycle: 'monthly',
    logo: 'https://logo.clearbit.com/linkedin.com',
    canceledDate: null,
  },
  {
    id: '3',
    name: 'Spotify',
    price: 9.99,
    startDate: new Date(2023, 3, 1),
    billingCycle: 'monthly',
    logo: 'https://logo.clearbit.com/spotify.com',
    canceledDate: null,
  },
  {
    id: '4',
    name: 'Amazon Prime',
    price: 12.99,
    startDate: new Date(2023, 3, 1),
    billingCycle: 'monthly',
    logo: 'https://logo.clearbit.com/amazon.com',
    canceledDate: null,
  },
  // Add more mock subscriptions as needed
];

