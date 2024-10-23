export interface Subscription {
  id: string;
  name: string;
  price: number;
  startDate: Date;
  logo: string | null; // Changed to allow null
  canceledDate: Date | null;
  billingCycle: 'monthly';
}
