export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  startDate?: string;
  endDate?: string;
  expired?: boolean;
  daysLeft?: number;
}
