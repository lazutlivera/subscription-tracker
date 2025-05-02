export interface Subscription {
  id: string;
  name: string;
  price: number;
  start_date: string;
  next_payment_date: string;
  canceled_date: string | null;
  user_id: string;
  category?: string;
  logo?: string | null;
  // Aliases for compatibility with components using camelCase
  startDate?: string;
  nextPaymentDate?: string;
  canceledDate?: string | null;
}
