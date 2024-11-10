export interface Subscription {
  id: string;
  name: string;
  price: number;
  startDate: Date;
  canceledDate: Date | null;
  category: string;
}
