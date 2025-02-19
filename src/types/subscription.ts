export interface Subscription {
  id: string;
  name: string;
  price: number;
  startDate: Date;
  canceledDate: Date | null;
  category: string;
  nextPaymentDate: Date;
  logo?: string | null;
  billingCycle?: 'monthly' | 'yearly';
}
