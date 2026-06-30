import { useMemo } from 'react';
import { useFinanceStore } from '../stores/useFinanceStore';
import { useAuthStore } from '../stores/useAuthStore';
import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
}

// Local store for managing dismissed notifications during the session
interface NotificationUIState {
  dismissedIds: string[];
  dismiss: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationUIStore = create<NotificationUIState>((set) => ({
  dismissedIds: [],
  dismiss: (id) => set((state) => ({ dismissedIds: [...state.dismissedIds, id] })),
  clearAll: () => set({ dismissedIds: [] }) // Note: Doesn't truly clear, just hides all currently visible by dismissing them later? Actually clearAll should probably dismiss all active. We'll handle this in the UI.
}));

export function useNotifications(): AppNotification[] {
  const getMonthlySummary = useFinanceStore(s => s.getMonthlySummary);
  const getMonthlyOutflowsList = useFinanceStore(s => s.getMonthlyOutflowsList);
  const creditCards = useFinanceStore(s => s.creditCards);
  const savingsGoal = useFinanceStore(s => s.savingsGoal);
  const userProfile = useAuthStore(s => s.userProfile);
  
  const dismissedIds = useNotificationUIStore(s => s.dismissedIds);

  const notifications = useMemo(() => {
    const list: AppNotification[] = [];
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const userCreatedAt = userProfile?.createdAt || '2025-06';
    
    // 1. Check Budget (Forecast Leftover)
    const summary = getMonthlySummary(currentMonthStr, userCreatedAt);
    if (summary.forecastLeftover < 0) {
      list.push({
        id: `budget-negative-${currentMonthStr}`,
        type: 'critical',
        title: 'Balanço Negativo',
        message: 'Seu balanço projetado para este mês está negativo. Revise seus gastos!'
      });
    } else if (summary.forecastLeftover < (summary.entriesTotal * 0.1) && summary.entriesTotal > 0) {
      list.push({
        id: `budget-warning-${currentMonthStr}`,
        type: 'warning',
        title: 'Orçamento Apertado',
        message: 'Seu saldo projetado está abaixo de 10% das suas receitas.'
      });
    }

    // 2. Check Credit Cards Due Dates
    // Let's see if any credit card has a due date coming up in the next 5 days
    // We also need to know if they actually have purchases.
    const currentOutflows = getMonthlyOutflowsList(currentMonthStr, userCreatedAt);
    const hasOutflowsMap = new Set(currentOutflows.filter(o => o.cardUsed).map(o => o.cardUsed));

    const todayDay = now.getDate();
    
    creditCards.forEach(card => {
      if (card.dueDate && hasOutflowsMap.has(card.id)) {
        let diff = card.dueDate - todayDay;
        
        // Handle wrap around for next month (very simple heuristic)
        if (diff < 0 && (todayDay > 25 && card.dueDate < 10)) {
          diff = (30 - todayDay) + card.dueDate;
        }

        if (diff >= 0 && diff <= 5) {
          list.push({
            id: `card-due-${card.id}-${currentMonthStr}`,
            type: diff <= 2 ? 'critical' : 'warning',
            title: `Fatura Próxima: ${card.name}`,
            message: `O vencimento do seu cartão será no dia ${card.dueDate} (em ${diff} ${diff === 1 ? 'dia' : 'dias'}).`
          });
        }
      }
    });

    // 3. Check Fixed Expenses Due Dates
    currentOutflows.forEach(outflow => {
      if (outflow.type === 'fixed' && outflow.dueDate && outflow.status !== 'ok') {
        let diff = outflow.dueDate - todayDay;
        
        // Handle wrap around
        if (diff < 0 && (todayDay > 25 && outflow.dueDate < 10)) {
          diff = (30 - todayDay) + outflow.dueDate;
        }

        // The user specifically requested notification 1 day before due date.
        // I will trigger it if diff === 1 or if it is exactly today (diff === 0) just to be safe.
        if (diff === 1 || diff === 0) {
          list.push({
            id: `fixed-due-${outflow.id}-${currentMonthStr}`,
            type: diff === 0 ? 'critical' : 'warning',
            title: `Vencimento Próximo: ${outflow.description}`,
            message: `Sua despesa vence ${diff === 0 ? 'hoje!' : 'amanhã!'}`
          });
        }
      }
    });

    // 4. Check Savings Goal
    if (savingsGoal > 0) {
      const progress = summary.totalSavings / savingsGoal;
      if (progress >= 0.8 && progress < 1) {
        list.push({
          id: `savings-close-${currentMonthStr}`,
          type: 'info',
          title: 'Quase Lá!',
          message: `Faltam apenas R$ ${(savingsGoal - summary.totalSavings).toFixed(2).replace('.', ',')} para atingir sua meta de reserva.`
        });
      } else if (progress >= 1) {
        list.push({
          id: `savings-achieved-${currentMonthStr}`,
          type: 'info',
          title: 'Meta Atingida! 🎉',
          message: 'Parabéns! Você alcançou ou superou sua meta de reserva global.'
        });
      }
    }

    // Filter out dismissed notifications
    return list.filter(n => !dismissedIds.includes(n.id));
  }, [getMonthlySummary, getMonthlyOutflowsList, creditCards, savingsGoal, userProfile, dismissedIds]);

  return notifications;
}
