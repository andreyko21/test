'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, Transaction, Category, Budget, Reminder, UserSettings } from '@/types/finance';
import { loadState, saveState, generateTransactionId } from '@/lib/storage';

type Action =
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id'> }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id'> }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_BUDGET'; payload: Omit<Budget, 'id' | 'spent'> }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'ADD_REMINDER'; payload: Omit<Reminder, 'id'> }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'LOAD_STATE'; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [
          { ...action.payload, id: generateTransactionId() },
          ...state.transactions,
        ],
      };

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [
          ...state.categories,
          { ...action.payload, id: generateTransactionId(), isCustom: true },
        ],
      };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload),
      };

    case 'ADD_BUDGET':
      return {
        ...state,
        budgets: [
          ...state.budgets,
          { ...action.payload, id: generateTransactionId(), spent: 0 },
        ],
      };

    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(b =>
          b.id === action.payload.id ? action.payload : b
        ),
      };

    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(b => b.id !== action.payload),
      };

    case 'ADD_REMINDER':
      return {
        ...state,
        reminders: [
          ...state.reminders,
          { ...action.payload, id: generateTransactionId() },
        ],
      };

    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(r =>
          r.id === action.payload.id ? action.payload : r
        ),
      };

    case 'DELETE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter(r => r.id !== action.payload),
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (c: Omit<Category, 'id'>) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  addBudget: (b: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;
  addReminder: (r: Omit<Reminder, 'id'>) => void;
  updateReminder: (r: Reminder) => void;
  deleteReminder: (id: string) => void;
  updateSettings: (s: Partial<UserSettings>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const initialState: AppState = {
  transactions: [],
  categories: [],
  budgets: [],
  reminders: [],
  settings: {
    defaultCurrency: 'UAH',
    theme: 'system',
    pinEnabled: false,
    biometricEnabled: false,
    language: 'uk',
  },
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const loaded = loadState();
    dispatch({ type: 'LOAD_STATE', payload: loaded });
  }, []);

  useEffect(() => {
    if (state.transactions.length > 0 || state.categories.length > 0) {
      saveState(state);
    }
  }, [state]);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => dispatch({ type: 'ADD_TRANSACTION', payload: t }), []);
  const updateTransaction = useCallback((t: Transaction) => dispatch({ type: 'UPDATE_TRANSACTION', payload: t }), []);
  const deleteTransaction = useCallback((id: string) => dispatch({ type: 'DELETE_TRANSACTION', payload: id }), []);
  const addCategory = useCallback((c: Omit<Category, 'id'>) => dispatch({ type: 'ADD_CATEGORY', payload: c }), []);
  const updateCategory = useCallback((c: Category) => dispatch({ type: 'UPDATE_CATEGORY', payload: c }), []);
  const deleteCategory = useCallback((id: string) => dispatch({ type: 'DELETE_CATEGORY', payload: id }), []);
  const addBudget = useCallback((b: Omit<Budget, 'id' | 'spent'>) => dispatch({ type: 'ADD_BUDGET', payload: b }), []);
  const updateBudget = useCallback((b: Budget) => dispatch({ type: 'UPDATE_BUDGET', payload: b }), []);
  const deleteBudget = useCallback((id: string) => dispatch({ type: 'DELETE_BUDGET', payload: id }), []);
  const addReminder = useCallback((r: Omit<Reminder, 'id'>) => dispatch({ type: 'ADD_REMINDER', payload: r }), []);
  const updateReminder = useCallback((r: Reminder) => dispatch({ type: 'UPDATE_REMINDER', payload: r }), []);
  const deleteReminder = useCallback((id: string) => dispatch({ type: 'DELETE_REMINDER', payload: id }), []);
  const updateSettings = useCallback((s: Partial<UserSettings>) => dispatch({ type: 'UPDATE_SETTINGS', payload: s }), []);

  return (
    <AppContext.Provider value={{
      state, dispatch,
      addTransaction, updateTransaction, deleteTransaction,
      addCategory, updateCategory, deleteCategory,
      addBudget, updateBudget, deleteBudget,
      addReminder, updateReminder, deleteReminder,
      updateSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
