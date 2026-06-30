import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore, ASYNC_STORAGE_KEYS as AUTH_KEYS } from '../stores/useAuthStore';
import { useFinanceStore, FINANCE_STORAGE_KEYS, defaultCards } from '../stores/useFinanceStore';
import { useSyncStore } from '../stores/useSyncStore';
import {
  EntryId,
  ExitId,
  RecurringId,
  PurchaseId,
  Entry,
  Exit,
  Recurring,
  MonthSummary,
  OutflowItem,
  CreditCard,
  SavingsItem
} from '../types/finance';
import { UserProfile } from '../types/user';

export {
  EntryId,
  ExitId,
  RecurringId,
  PurchaseId,
  SavingsItem,
  CreditCard,
  UserProfile
};

// Bridge hook for backwards compatibility while migrating screens to Zustand
export const useFinancials = () => {
  const auth = useAuthStore();
  const finance = useFinanceStore();
  const sync = useSyncStore();

  return {
    ...auth,
    ...finance,
    ...sync,
    // Add getMonthlyOutflowsList and getMonthlySummary with auto-injected userCreatedAt
    getMonthlyOutflowsList: (monthStr: string): OutflowItem[] => {
      const userCreatedAt = auth.userProfile?.createdAt || '2025-06';
      return finance.getMonthlyOutflowsList(monthStr, userCreatedAt);
    },
    getMonthlySummary: (monthStr: string): MonthSummary => {
      const userCreatedAt = auth.userProfile?.createdAt || '2025-06';
      return finance.getMonthlySummary(monthStr, userCreatedAt);
    },
    getInstallmentsStatusMap: (): Record<string, 'ok' | 'pending'> => finance.installmentStatusMap,
    updateUserProfile: auth.setUserProfile,
    importBackupData: async (backupJson: string): Promise<boolean> => {
      try {
        const parsed = JSON.parse(backupJson);
        if (
          !parsed ||
          typeof parsed !== 'object' ||
          !Array.isArray(parsed.entries) ||
          !Array.isArray(parsed.exits) ||
          !Array.isArray(parsed.recurrings) ||
          !Array.isArray(parsed.purchases)
        ) {
          throw new Error('Formato de backup inválido.');
        }

        await AsyncStorage.setMany({
          [FINANCE_STORAGE_KEYS.ENTRIES]: JSON.stringify(parsed.entries),
          [FINANCE_STORAGE_KEYS.EXITS]: JSON.stringify(parsed.exits),
          [FINANCE_STORAGE_KEYS.RECURRINGS]: JSON.stringify(parsed.recurrings),
          [FINANCE_STORAGE_KEYS.PURCHASES]: JSON.stringify(parsed.purchases),
          [FINANCE_STORAGE_KEYS.SAVINGS]: JSON.stringify(parsed.savingsLogs || {}),
          [FINANCE_STORAGE_KEYS.SAVINGS_GOAL]: String(parsed.savingsGoal || 0),
          [FINANCE_STORAGE_KEYS.CREDIT_CARDS]: JSON.stringify(parsed.creditCards || defaultCards),
        });

        if (parsed.userProfile) {
          auth.setUserProfile(parsed.userProfile);
        }

        finance.setFinanceData({
          entries: parsed.entries,
          exits: parsed.exits,
          recurrings: parsed.recurrings,
          purchases: parsed.purchases,
          savingsLogs: parsed.savingsLogs || {},
          savingsGoal: parsed.savingsGoal || 0,
          creditCards: parsed.creditCards || defaultCards,
          lastUpdatedAt: Date.now()
        });

        return true;
      } catch (err) {
        console.error('Error importing backup data:', err);
        return false;
      }
    },
  };
};
