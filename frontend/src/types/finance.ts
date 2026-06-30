// Branded Types for nominal type safety
export type EntryId = string & { readonly __brand: 'EntryId' };
export type ExitId = string & { readonly __brand: 'ExitId' };
export type RecurringId = string & { readonly __brand: 'RecurringId' };
export type PurchaseId = string & { readonly __brand: 'PurchaseId' };

export interface Entry {
  id: EntryId;
  description: string;
  value: number;
  date: string; // "YYYY-MM"
  status: 'ok' | 'pending';
}

export interface Exit {
  id: ExitId;
  description: string;
  value: number;
  date: string; // "YYYY-MM"
  status: 'ok' | 'pending';
  category?: 'fixed' | 'variable';
  dueDate?: number;
}

export interface Recurring {
  id: RecurringId;
  description: string;
  value: number;
}

export interface MonthSummary {
  entriesTotal: number;
  exitsTotal: number;
  savingsPlaced: number;
  previousMonthSurplus: number;
  previousMonthSavings: number;
  totalSavings: number;
  forecastLeftover: number;
}

export interface OutflowItem {
  id: string;
  description: string;
  value: number;
  type: 'fixed' | 'variable' | 'recurring' | 'installment';
  status: 'ok' | 'pending';
  installmentRef?: string;
  cardUsed?: string;
  dueDate?: number;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  color?: string;
  dueDate?: number;
  bestPurchaseDay?: number;
}

export interface SavingsItem {
  id: string;
  type: 'poupança' | 'caixinha';
  bank: 'nubank' | 'mercadopago' | 'caixa' | 'bradesco' | 'other' | string;
  amount: number;
  description: string;
}
