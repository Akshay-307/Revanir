export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  units: number;
  isPaid: boolean;
  date: string;
  createdAt: string;
}

export interface DailySummary {
  totalUnits: number;
  totalPaid: number;
  totalPending: number;
  orderCount: number;
}
