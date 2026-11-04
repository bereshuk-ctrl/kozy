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

export type PoultryType = 'chicken' | 'turkey' | 'goose' | 'duck' | 'broiler';
export type PoultryPurpose = 'layer' | 'meat' | 'breeding';

export interface Poultry {
  id: string;
  name: string;
  type: PoultryType;
  breed: string;
  birthDate: string;
  purchaseDate: string;
  purchasePrice: number;
  purpose: PoultryPurpose;
  count: number;
  notes: string;
  status: 'active' | 'sold' | 'dead';
}

export interface EggRecord {
  id: string;
  poultryId: string;
  date: string;
  quantity: number;
  broken: number;
  net: number;
  notes: string;
}

export interface FeedRecord {
  id: string;
  date: string;
  type: 'goat' | 'poultry' | 'all';
  category: 'grain' | 'compound' | 'hay' | 'vegetables' | 'supplements' | 'other';
  description: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface EquipmentRecord {
  id: string;
  date: string;
  name: string;
  category: 'poultry' | 'goat' | 'general';
  cost: number;
  notes: string;
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

export interface AppSettings {
  farmName: string;
  currency: string;
  milkUnit: string;
  lastBackup: string | null;
}

export interface AppData {
  goats: Goat[];
  milkRecords: MilkRecord[];
  poultry: Poultry[];
  eggRecords: EggRecord[];
  feedRecords: FeedRecord[];
  equipmentRecords: EquipmentRecord[];
  sales: Sale[];
  expenses: Expense[];
  invoices: Invoice[];
  settings: AppSettings;
}

export type PageType = 'dashboard' | 'goats' | 'poultry' | 'eggs' | 'production' | 'feed' | 'equipment' | 'sales' | 'expenses' | 'invoices' | 'statistics' | 'settings' | 'server';
