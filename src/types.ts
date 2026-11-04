export interface Goat {
  id: string;
  name: string;
  breed: string;
  birthDate: string;
  purchaseDate: string;
  purchasePrice: number;
  notes: string;
  status: 'active' | 'sold' | 'dead';
  tag?: string;
}

export interface MilkRecord {
  id: string;
  goatId: string;
  date: string;
  morning: number;
  evening: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  product: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  buyer: string;
  invoiceId?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'feed' | 'vet' | 'purchase' | 'equipment' | 'other';
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  buyer: string;
  buyerPhone: string;
  items: InvoiceItem[];
  total: number;
  status: 'pending' | 'paid' | 'overdue';
  notes: string;
}

export interface InvoiceItem {
  product: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface AppData {
  goats: Goat[];
  milkRecords: MilkRecord[];
  sales: Sale[];
  expenses: Expense[];
  invoices: Invoice[];
  settings: AppSettings;
}

export interface AppSettings {
  farmName: string;
  currency: string;
  milkUnit: string;
  lastBackup: string | null;
}

export type PageType = 'dashboard' | 'goats' | 'production' | 'sales' | 'expenses' | 'invoices' | 'statistics' | 'settings';
