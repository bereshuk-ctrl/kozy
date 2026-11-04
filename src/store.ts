import { AppData, AppSettings } from './types';

const STORAGE_KEY = 'farm_data';

const defaultSettings: AppSettings = {
  farmName: 'Моя Ферма',
  currency: '₽',
  milkUnit: 'л',
  lastBackup: null,
};

const defaultData: AppData = {
  goats: [],
  milkRecords: [],
  poultry: [],
  eggRecords: [],
  feedRecords: [],
  equipmentRecords: [],
  sales: [],
  expenses: [],
  invoices: [],
  settings: defaultSettings,
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed, settings: { ...defaultSettings, ...parsed.settings } };
  } catch {
    return { ...defaultData };
  }
}

export function saveData(d: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

export function exportData(d: AppData): string {
  return JSON.stringify(d, null, 2);
}

export function importData(json: string): AppData | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed.goats !== undefined) {
      return { ...defaultData, ...parsed, settings: { ...defaultSettings, ...parsed.settings } };
    }
    return null;
  } catch {
    return null;
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatCurrency(amount: number, currency = '₽'): string {
  return `${amount.toLocaleString('ru-RU')} ${currency}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}
