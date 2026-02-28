export type TransactionType = 'income' | 'expense';

export type Currency = 'USD' | 'EUR' | 'UAH' | 'GBP' | 'PLN';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | 'both';
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  categoryId: string;
  description: string;
  date: string; // ISO string
  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  currency: Currency;
  period: 'weekly' | 'monthly';
  spent: number;
}

export interface Reminder {
  id: string;
  title: string;
  amount: number;
  currency: Currency;
  categoryId: string;
  dueDate: string; // ISO string
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isActive: boolean;
}

export interface UserSettings {
  defaultCurrency: Currency;
  theme: 'light' | 'dark' | 'system';
  pinEnabled: boolean;
  pin?: string;
  biometricEnabled: boolean;
  language: string;
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  reminders: Reminder[];
  settings: UserSettings;
}

export interface MonthlyStats {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  byCategory: { categoryId: string; amount: number }[];
}

export interface WeeklyStats {
  week: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  days: { date: string; income: number; expenses: number }[];
}

export const CURRENCIES: { code: Currency; symbol: string; name: string }[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Їжа', icon: '🍔', color: '#FF6B6B', type: 'expense' },
  { id: 'transport', name: 'Транспорт', icon: '🚗', color: '#4ECDC4', type: 'expense' },
  { id: 'housing', name: 'Житло', icon: '🏠', color: '#45B7D1', type: 'expense' },
  { id: 'entertainment', name: 'Розваги', icon: '🎮', color: '#96CEB4', type: 'expense' },
  { id: 'health', name: 'Здоров\'я', icon: '💊', color: '#FFEAA7', type: 'expense' },
  { id: 'shopping', name: 'Покупки', icon: '🛍️', color: '#DDA0DD', type: 'expense' },
  { id: 'education', name: 'Освіта', icon: '📚', color: '#98D8C8', type: 'expense' },
  { id: 'travel', name: 'Подорожі', icon: '✈️', color: '#F7DC6F', type: 'expense' },
  { id: 'salary', name: 'Зарплата', icon: '💼', color: '#82E0AA', type: 'income' },
  { id: 'freelance', name: 'Фріланс', icon: '💻', color: '#85C1E9', type: 'income' },
  { id: 'investment', name: 'Інвестиції', icon: '📈', color: '#F8C471', type: 'income' },
  { id: 'gift', name: 'Подарунок', icon: '🎁', color: '#F1948A', type: 'income' },
  { id: 'other', name: 'Інше', icon: '📦', color: '#AEB6BF', type: 'both' },
];

export const DEFAULT_SETTINGS: UserSettings = {
  defaultCurrency: 'UAH',
  theme: 'system',
  pinEnabled: false,
  biometricEnabled: false,
  language: 'uk',
};
