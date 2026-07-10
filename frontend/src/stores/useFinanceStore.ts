import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Entry,
  Exit,
  Recurring,
  PurchaseId,
  CreditCard,
  SavingsItem,
  OutflowItem,
  MonthSummary,
  EntryId,
  ExitId,
  RecurringId
} from '../types/finance';
import { computeMonthlyOutflowsList, computeMonthlySummary } from '../services/summaryCalculator';
import { Purchase } from '../services/installmentEngine';
import i18n from '../i18n';

export const FINANCE_STORAGE_KEYS = {
  ENTRIES: '@MoneyTree:entries',
  EXITS: '@MoneyTree:exits',
  RECURRINGS: '@MoneyTree:recurrings',
  PURCHASES: '@MoneyTree:purchases',
  SAVINGS: '@MoneyTree:savingsLogs',
  SAVINGS_GOAL: '@MoneyTree:savingsGoal',
  LANGUAGE: '@MoneyTree:language',
  CREDIT_CARDS: '@MoneyTree:creditCards',
  INSTALLMENT_STATUS: '@MoneyTree:installmentStatusMap',
  LAST_UPDATED: '@MoneyTree:lastUpdatedAt',
};

export const defaultCards: CreditCard[] = [];

interface FinanceState {
  entries: Entry[];
  exits: Exit[];
  recurrings: Recurring[];
  purchases: Purchase[];
  savingsLogs: Record<string, number | SavingsItem[]>;
  savingsGoal: number;
  creditCards: CreditCard[];
  language: string;
  installmentStatusMap: Record<string, 'ok' | 'pending'>;
  lastUpdatedAt: number;

  // Actions
  setFinanceData: (data: Partial<FinanceState>) => void;
  clearAllData: () => Promise<void>;
  
  addEntry: (description: string, value: number, date: string) => void;
  deleteEntry: (id: EntryId) => void;
  toggleEntryStatus: (id: EntryId) => void;
  
  addExit: (desc: string, val: number, date: string, category?: 'fixed' | 'variable', dueDate?: number) => void;
  deleteExit: (id: ExitId) => void;
  toggleExitStatus: (id: ExitId) => void;
  addRecurring: (description: string, value: number, cardUsed: string) => void;
  deleteRecurring: (id: RecurringId) => void;
  
  addPurchase: (description: string, totalValue: number, installments: number, startDate: string, cardUsed: string) => void;
  deletePurchase: (id: PurchaseId) => void;
  toggleInstallmentStatus: (id: PurchaseId, date: string) => void;
  
  addCreditCard: (name: string, limit: number, color?: string, dueDate?: number, bestPurchaseDay?: number) => void;
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => void;
  updateCreditCardLimit: (id: string, newLimit: number) => void;
  deleteCreditCard: (id: string) => void;
  
  addSavingsItem: (monthStr: string, type: 'poupança' | 'caixinha', bank: string, amount: number, description: string) => void;
  deleteSavingsItem: (monthStr: string, id: string) => void;
  updateSavingsGoal: (goal: number) => void;
  

  changeLanguage: (lang: string) => void;

  // Computations
  getMonthlyOutflowsList: (monthStr: string, userCreatedAt: string) => OutflowItem[];
  getMonthlySummary: (monthStr: string, userCreatedAt: string) => MonthSummary;
}

// Persist to AsyncStorage only. Cloud sync is handled by the Zustand subscriber
// in useGlobalSync.ts which debounces, retries, and validates before sending.
const persist = async (key: string, data: any) => {
  try {
    const { useAuthStore } = require('./useAuthStore');
    const uid = useAuthStore.getState().activeUid || 'guest';
    const scopedKey = `${uid}:${key}`;
    const scopedLastUpdateKey = `${uid}:${FINANCE_STORAGE_KEYS.LAST_UPDATED}`;

    await AsyncStorage.setItem(scopedKey, JSON.stringify(data));
    const newTimestamp = Date.now();
    await AsyncStorage.setItem(scopedLastUpdateKey, String(newTimestamp));
    useFinanceStore.setState({ lastUpdatedAt: newTimestamp });
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
};


export const useFinanceStore = create<FinanceState>((set, get) => ({
  entries: [],
  exits: [],
  recurrings: [],
  purchases: [],
  savingsLogs: {},
  creditCards: defaultCards,
  savingsGoal: 0,
  language: 'pt',
  installmentStatusMap: {},
  lastUpdatedAt: 0,

  setFinanceData: (data) => set((state) => ({ ...state, ...data })),

  clearAllData: async () => {
    set({
      entries: [],
      exits: [],
      recurrings: [],
      purchases: [],
      savingsLogs: {},
      installmentStatusMap: {},
      savingsGoal: 0,
      creditCards: defaultCards,
      language: 'pt',
      lastUpdatedAt: 0
    });
    i18n.changeLanguage('pt');
    // Also clear AsyncStorage to prevent stale local data from being restored on next boot
    try {
      const { useAuthStore } = require('./useAuthStore');
      const uid = useAuthStore.getState().activeUid || 'guest';
      const keysToRemove = Object.values(FINANCE_STORAGE_KEYS).map(key => `${uid}:${key}`);
      await AsyncStorage.removeMany(keysToRemove);
    } catch (err) {
      console.error('Error clearing AsyncStorage during clearAllData:', err);
    }
  },

  addEntry: (description, value, date) => {
    const newEntries: Entry[] = [...get().entries, {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as EntryId,
      description,
      value,
      date,
      status: 'pending',
    }];
    set({ entries: newEntries });
    persist(FINANCE_STORAGE_KEYS.ENTRIES, newEntries);
  },

  deleteEntry: (id) => {
    const newEntries = get().entries.filter(e => e.id !== id);
    set({ entries: newEntries });
    persist(FINANCE_STORAGE_KEYS.ENTRIES, newEntries);
  },

  toggleEntryStatus: (id) => {
    const newEntries = get().entries.map(e => e.id === id ? { ...e, status: (e.status === 'ok' ? 'pending' : 'ok') as 'ok' | 'pending' } : e);
    set({ entries: newEntries });
    persist(FINANCE_STORAGE_KEYS.ENTRIES, newEntries);
  },

  addExit: (desc, val, date, category = 'fixed', dueDate) => {
    const newExit: Exit = {
      id: `exit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as ExitId,
      description: desc,
      value: val,
      date,
      status: 'pending',
      category,
      dueDate
    };
    const newExits = [...get().exits, newExit];
    set({ exits: newExits });
    persist(FINANCE_STORAGE_KEYS.EXITS, newExits);
  },

  deleteExit: (id) => {
    const newExits = get().exits.filter(e => e.id !== id);
    set({ exits: newExits });
    persist(FINANCE_STORAGE_KEYS.EXITS, newExits);
  },

  toggleExitStatus: (id) => {
    const newExits = get().exits.map(e => e.id === id ? { ...e, status: (e.status === 'ok' ? 'pending' : 'ok') as 'ok' | 'pending' } : e);
    set({ exits: newExits });
    persist(FINANCE_STORAGE_KEYS.EXITS, newExits);
  },

  addRecurring: (description, value, cardUsed) => {
    const newRecurrings: Recurring[] = [...get().recurrings, {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as RecurringId,
      description,
      value,
      cardUsed,
    }];
    set({ recurrings: newRecurrings });
    persist(FINANCE_STORAGE_KEYS.RECURRINGS, newRecurrings);
  },

  deleteRecurring: (id) => {
    const newRecurrings = get().recurrings.filter(r => r.id !== id);
    set({ recurrings: newRecurrings });
    persist(FINANCE_STORAGE_KEYS.RECURRINGS, newRecurrings);
  },

  addPurchase: (description, totalValue, installments, startDate, cardUsed) => {
    const monthlyValue = parseFloat((totalValue / installments).toFixed(2));
    const newPurchases: Purchase[] = [...get().purchases, {
      id: `pur-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as PurchaseId,
      description,
      totalValue,
      monthlyValue,
      installments,
      startDate,
      cardUsed,
    }];
    set({ purchases: newPurchases });
    persist(FINANCE_STORAGE_KEYS.PURCHASES, newPurchases);
  },

  deletePurchase: (id) => {
    const newPurchases = get().purchases.filter(p => p.id !== id);
    set({ purchases: newPurchases });
    persist(FINANCE_STORAGE_KEYS.PURCHASES, newPurchases);
    
    const newMap = { ...get().installmentStatusMap };
    Object.keys(newMap).forEach(key => {
      if (key.startsWith(`${id}_`)) {
        delete newMap[key];
      }
    });
    set({ installmentStatusMap: newMap });
    persist(FINANCE_STORAGE_KEYS.INSTALLMENT_STATUS, newMap);
  },

  toggleInstallmentStatus: (id, date) => {
    const key = `${id}_${date}`;
    const map = get().installmentStatusMap;
    const newStatus = (map[key] === 'ok' ? 'pending' : 'ok') as 'ok' | 'pending';
    const newMap = { ...map, [key]: newStatus };
    set({ installmentStatusMap: newMap });
    persist(FINANCE_STORAGE_KEYS.INSTALLMENT_STATUS, newMap);
  },

  addCreditCard: (name, limit, color = '#64748B', dueDate, bestPurchaseDay) => {
    const id = `card-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newCards = [...get().creditCards, { id, name, limit, color, dueDate, bestPurchaseDay }];
    set({ creditCards: newCards });
    persist(FINANCE_STORAGE_KEYS.CREDIT_CARDS, newCards);
  },

  updateCreditCard: (id, updates) => {
    const newCards = get().creditCards.map(c => c.id === id ? { ...c, ...updates } : c);
    set({ creditCards: newCards });
    persist(FINANCE_STORAGE_KEYS.CREDIT_CARDS, newCards);
  },

  updateCreditCardLimit: (id, newLimit) => {
    const newCards = get().creditCards.map(c => c.id === id ? { ...c, limit: newLimit } : c);
    set({ creditCards: newCards });
    persist(FINANCE_STORAGE_KEYS.CREDIT_CARDS, newCards);
  },

  deleteCreditCard: (id) => {
    const newCards = get().creditCards.filter(c => c.id !== id);
    set({ creditCards: newCards });
    persist(FINANCE_STORAGE_KEYS.CREDIT_CARDS, newCards);
  },

  addSavingsItem: (monthStr, type, bank, amount, description) => {
    const logs = get().savingsLogs;
    const currentList = logs[monthStr] || [];
    const currentListArray = Array.isArray(currentList) ? currentList : [];
    
    const newItem: SavingsItem = {
      id: `sav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      bank,
      amount,
      description,
    };
    
    const newSavings = { ...logs, [monthStr]: [...currentListArray, newItem] };
    set({ savingsLogs: newSavings });
    persist(FINANCE_STORAGE_KEYS.SAVINGS, newSavings);
  },

  deleteSavingsItem: (monthStr, id) => {
    const logs = get().savingsLogs;
    const currentList = logs[monthStr] || [];
    const currentListArray = Array.isArray(currentList) ? currentList : [];
    
    const newSavings = { ...logs, [monthStr]: currentListArray.filter(item => item.id !== id) };
    set({ savingsLogs: newSavings });
    persist(FINANCE_STORAGE_KEYS.SAVINGS, newSavings);
  },

  updateSavingsGoal: (goal) => {
    set({ savingsGoal: goal });
    persist(FINANCE_STORAGE_KEYS.SAVINGS_GOAL, goal);
  },


  changeLanguage: (lang) => {
    set({ language: lang });
    i18n.changeLanguage(lang);
    persist(FINANCE_STORAGE_KEYS.LANGUAGE, lang);
  },

  getMonthlyOutflowsList: (monthStr, userCreatedAt) => {
    const { exits, recurrings, purchases, installmentStatusMap } = get();
    return computeMonthlyOutflowsList(monthStr, exits, recurrings, purchases, installmentStatusMap, userCreatedAt);
  },

  getMonthlySummary: (monthStr, userCreatedAt) => {
    const { entries, exits, recurrings, purchases, savingsLogs, installmentStatusMap } = get();
    if (monthStr < userCreatedAt) {
      return {
        entriesTotal: 0, exitsTotal: 0, savingsPlaced: 0, previousMonthSurplus: 0,
        previousMonthSavings: 0, totalSavings: 0, forecastLeftover: 0,
      };
    }
    return computeMonthlySummary(
      monthStr, entries, exits, recurrings, purchases, savingsLogs, installmentStatusMap, userCreatedAt, userCreatedAt
    );
  }
}));
