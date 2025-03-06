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
}
