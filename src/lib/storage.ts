'use client';

import {
  AppState,
  Transaction,
  Category,
  Budget,
  Reminder,
  UserSettings,
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS,
} from '@/types/finance';
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const STORAGE_KEY = 'finance_app_data';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function generateMockTransactions(categories: Category[]): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');
  const incomeCategories = categories.filter(c => c.type === 'income' || c.type === 'both');

  // Generate 3 months of mock data
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const baseDate = subMonths(now, monthOffset);

    // Income transactions
    transactions.push({
      id: generateId(),
      type: 'income',
      amount: 45000 + Math.random() * 10000,
      currency: 'UAH',
      categoryId: 'salary',
      description: 'Зарплата',
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 5).toISOString(),
    });

    if (Math.random() > 0.5) {
      transactions.push({
        id: generateId(),
        type: 'income',
        amount: 5000 + Math.random() * 15000,
        currency: 'UAH',
        categoryId: 'freelance',
        description: 'Фріланс проект',
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 15).toISOString(),
      });
    }

    // Expense transactions
    const expenseData = [
      { categoryId: 'food', amounts: [350, 420, 280, 510, 390, 460, 320, 480, 290, 550], desc: ['Продукти', 'Ресторан', 'Кафе', 'Доставка їжі'] },
      { categoryId: 'transport', amounts: [1200, 800, 950], desc: ['Бензин', 'Таксі', 'Громадський транспорт'] },
      { categoryId: 'housing', amounts: [8000, 500, 300], desc: ['Оренда', 'Комунальні послуги', 'Інтернет'] },
      { categoryId: 'entertainment', amounts: [500, 300, 800, 200], desc: ['Кіно', 'Концерт', 'Підписки', 'Ігри'] },
      { categoryId: 'health', amounts: [800, 1200, 400], desc: ['Аптека', 'Лікар', 'Спортзал'] },
      { categoryId: 'shopping', amounts: [2000, 1500, 800, 3000], desc: ['Одяг', 'Електроніка', 'Книги', 'Подарунки'] },
    ];

    expenseData.forEach(({ categoryId, amounts, desc }) => {
      const numTransactions = Math.floor(Math.random() * amounts.length) + 1;
      for (let i = 0; i < numTransactions; i++) {
        const day = Math.floor(Math.random() * 28) + 1;
        transactions.push({
          id: generateId(),
          type: 'expense',
          amount: amounts[Math.floor(Math.random() * amounts.length)],
          currency: 'UAH',
          categoryId,
          description: desc[Math.floor(Math.random() * desc.length)],
          date: new Date(baseDate.getFullYear(), baseDate.getMonth(), day).toISOString(),
        });
      }
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function getDefaultState(): AppState {
  const categories = [...DEFAULT_CATEGORIES];
  return {
    transactions: generateMockTransactions(categories),
    categories,
    budgets: [
      { id: generateId(), categoryId: 'food', amount: 8000, currency: 'UAH', period: 'monthly', spent: 0 },
      { id: generateId(), categoryId: 'transport', amount: 3000, currency: 'UAH', period: 'monthly', spent: 0 },
      { id: generateId(), categoryId: 'entertainment', amount: 2000, currency: 'UAH', period: 'monthly', spent: 0 },
      { id: generateId(), categoryId: 'shopping', amount: 5000, currency: 'UAH', period: 'monthly', spent: 0 },
    ],
    reminders: [
      {
        id: generateId(),
        title: 'Оренда квартири',
        amount: 8000,
        currency: 'UAH',
        categoryId: 'housing',
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        isRecurring: true,
        recurringInterval: 'monthly',
        isActive: true,
      },
      {
        id: generateId(),
        title: 'Інтернет',
        amount: 300,
        currency: 'UAH',
        categoryId: 'housing',
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(),
        isRecurring: true,
        recurringInterval: 'monthly',
        isActive: true,
      },
    ],
    settings: DEFAULT_SETTINGS,
  };
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AppState;
    }
  } catch {
    // ignore
  }
  const defaultState = getDefaultState();
  saveState(defaultState);
  return defaultState;
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function generateTransactionId(): string {
  return generateId();
}

// Statistics helpers
export function getMonthlyStats(transactions: Transaction[], monthOffset = 0) {
  const date = subMonths(new Date(), monthOffset);
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  const monthTransactions = transactions.filter(t =>
    isWithinInterval(parseISO(t.date), { start, end })
  );

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const byCategory: { categoryId: string; amount: number }[] = [];
  const categoryMap = new Map<string, number>();

  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryMap.set(t.categoryId, (categoryMap.get(t.categoryId) || 0) + t.amount);
    });

  categoryMap.forEach((amount, categoryId) => {
    byCategory.push({ categoryId, amount });
  });

  return {
    month: format(date, 'MMMM yyyy'),
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    byCategory: byCategory.sort((a, b) => b.amount - a.amount),
    transactions: monthTransactions,
  };
}

export function getWeeklyData(transactions: Transaction[]) {
  const weeks: { label: string; income: number; expenses: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTransactions = transactions.filter(t => t.date.startsWith(dateStr));

    weeks.push({
      label: format(date, 'EEE'),
      income: dayTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: dayTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    });
  }

  return weeks;
}

export function getLast6MonthsData(transactions: Transaction[]) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const stats = getMonthlyStats(transactions, i);
    months.push({
      label: format(subMonths(new Date(), i), 'MMM'),
      income: stats.totalIncome,
      expenses: stats.totalExpenses,
    });
  }
  return months;
}

export function calculateBudgetSpent(budgets: Budget[], transactions: Transaction[]): Budget[] {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  return budgets.map(budget => {
    const spent = transactions
      .filter(t =>
        t.type === 'expense' &&
        t.categoryId === budget.categoryId &&
        isWithinInterval(parseISO(t.date), { start, end })
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return { ...budget, spent };
  });
}

export function exportToCSV(transactions: Transaction[], categories: Category[]): string {
  const headers = ['Дата', 'Тип', 'Категорія', 'Опис', 'Сума', 'Валюта'];
  const rows = transactions.map(t => {
    const category = categories.find(c => c.id === t.categoryId);
    return [
      format(parseISO(t.date), 'dd.MM.yyyy'),
      t.type === 'income' ? 'Дохід' : 'Витрата',
      category?.name || t.categoryId,
      t.description,
      t.amount.toFixed(2),
      t.currency,
    ];
  });

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', UAH: '₴', GBP: '£', PLN: 'zł',
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString('uk-UA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function predictNextMonthExpenses(transactions: Transaction[]): number {
  const monthlyExpenses = [];
  for (let i = 1; i <= 3; i++) {
    const stats = getMonthlyStats(transactions, i);
    monthlyExpenses.push(stats.totalExpenses);
  }
  if (monthlyExpenses.length === 0) return 0;
  return monthlyExpenses.reduce((a, b) => a + b, 0) / monthlyExpenses.length;
}
