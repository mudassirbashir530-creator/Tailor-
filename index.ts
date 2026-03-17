export interface Shop {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  measurements: Measurements;
  referenceImage?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Measurements {
  chest?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  sleeve?: number;
  length?: number;
  neck?: number;
  armhole?: number;
  wrist?: number;
  thigh?: number;
  knee?: number;
  ankle?: number;
  [key: string]: number | undefined;
}

export interface Order {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  suitType: string;
  suitDetails: string;
  sampleImage?: string;
  deliveryDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'delivered';
  paymentStatus: 'pending' | 'partial' | 'paid';
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  imageExpiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  shopId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid';
  createdAt: Date;
  dueDate: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DashboardStats {
  totalCustomers: number;
  activeOrders: number;
  completedOrders: number;
  pendingPayments: number;
  totalRevenue: number;
}
