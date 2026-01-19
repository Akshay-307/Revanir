export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  route_id: string | null;
  is_regular: boolean;
  default_units: number | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  units: number;
  is_paid: boolean;
  product_type: 'bottle' | 'jug';
  order_type: 'regular' | 'bulk';
  price: number;
  billing_month: string | null;
  delivered_at: string;
  logged_by: string | null;
  notes: string | null;
  created_at: string;
  customer?: Customer; // For joined data
}

export interface DailySummary {
  totalUnits: number;
  totalPaid: number;
  totalPending: number;
  orderCount: number;
}
