import { describe, it, expect } from 'vitest';
import { 
  computeMonthlyOutflowsList, 
  computeMonthlySummary,
} from '../summaryCalculator';
import {
  Entry,
  Exit,
  Recurring,
  EntryId,
  ExitId,
  RecurringId,
  PurchaseId
} from '../../types/finance';
import { Purchase } from '../installmentEngine';

describe('Summary Calculator Engine', () => {
  const dummyEntries: Entry[] = [
    { id: 'e1' as EntryId, description: 'Salário', value: 5000, date: '2025-01', status: 'ok' },
    { id: 'e2' as EntryId, description: 'Vale', value: 1500, date: '2025-01', status: 'ok' },
    { id: 'e3' as EntryId, description: 'Salário', value: 5000, date: '2025-02', status: 'ok' },
  ];

  const dummyExits: Exit[] = [
    { id: 'ex1' as ExitId, description: 'Aluguel', value: 1200, date: '2025-01', status: 'ok', category: 'fixed' },
    { id: 'ex2' as ExitId, description: 'Internet', value: 100, date: '2025-01', status: 'ok', category: 'variable' },
  ];

  const dummyRecurrings: Recurring[] = [
    { id: 'r1' as RecurringId, description: 'Spotify', value: 20 },
  ];

  const dummyPurchases: Purchase[] = [
    {
      id: 'p1' as PurchaseId,
      description: 'Celular',
      totalValue: 1200,
      monthlyValue: 300,
      installments: 4,
      startDate: '2025-01',
      cardUsed: 'nubank',
    }
  ];

  const dummySavingsLogs: Record<string, number> = {
    '2025-01': 500,
  };

  const dummyInstallmentStatusMap: Record<string, 'ok' | 'pending'> = {
    'p1_2025-01': 'ok',
    'p1_2025-02': 'pending',
  };

  describe('computeMonthlyOutflowsList', () => {
    it('should combine fixed exits, recurrings, and installments correctly', () => {
      const list = computeMonthlyOutflowsList(
        '2025-01',
        dummyExits,
        dummyRecurrings,
        dummyPurchases,
        dummyInstallmentStatusMap
      );

      // Should have: Aluguel (fixed), Internet (variable), Spotify (recurring), Celular 1/4 (installment)
      expect(list).toHaveLength(4);
      
      const fixedItems = list.filter(o => o.type === 'fixed');
      expect(fixedItems).toHaveLength(1);
      expect(fixedItems.map(f => f.description)).toContain('Aluguel');

      const variableItems = list.filter(o => o.type === 'variable');
      expect(variableItems).toHaveLength(1);
      expect(variableItems.map(v => v.description)).toContain('Internet');

      const recItem = list.find(o => o.type === 'recurring');
      expect(recItem).toBeDefined();
      expect(recItem?.description).toBe('Spotify');

      const instItem = list.find(o => o.type === 'installment');
      expect(instItem).toBeDefined();
      expect(instItem?.description).toBe('Celular (01/04)');
      expect(instItem?.value).toBe(300);
      expect(instItem?.status).toBe('ok');
    });

    it('should advance installment indices in subsequent months', () => {
      const list = computeMonthlyOutflowsList(
        '2025-02',
        dummyExits,
        dummyRecurrings,
        dummyPurchases,
        dummyInstallmentStatusMap
      );

      const instItem = list.find(o => o.type === 'installment');
      expect(instItem).toBeDefined();
      expect(instItem?.description).toBe('Celular (02/04)');
      expect(instItem?.status).toBe('pending');
    });
  });

  describe('computeMonthlySummary', () => {
    it('should compute summary for 2025-01 correctly', () => {
      const summary = computeMonthlySummary(
        '2025-01',
        dummyEntries,
        dummyExits,
        dummyRecurrings,
        dummyPurchases,
        dummySavingsLogs,
        dummyInstallmentStatusMap
      );

      // Entradas: 5000 + 1500 = 6500
      expect(summary.entriesTotal).toBe(6500);

      // Saídas: 1200 (Aluguel) + 100 (Internet) + 20 (Spotify) + 300 (Celular) = 1620
      expect(summary.exitsTotal).toBe(1620);

      // Poupança colocada: 500
      expect(summary.savingsPlaced).toBe(500);

      // Previsão sobra: Entradas (6500) + Anterior (0) - Saídas (1620) - Poupança (500) = 4380
      expect(summary.forecastLeftover).toBe(4380);
      expect(summary.totalSavings).toBe(500);
    });

    it('should cascade cumulative leftovers and savings to 2025-02', () => {
      const summary = computeMonthlySummary(
        '2025-02',
        dummyEntries,
        dummyExits,
        dummyRecurrings,
        dummyPurchases,
        dummySavingsLogs,
        dummyInstallmentStatusMap
      );

      // Previous month surplus (from 2025-01): 4380
      expect(summary.previousMonthSurplus).toBe(4380);

      // Previous month savings: 500
      expect(summary.previousMonthSavings).toBe(500);

      // Entradas em 2025-02: 5000 (Salário)
      expect(summary.entriesTotal).toBe(5000);

      // Saídas em 2025-02: 20 (Spotify) + 300 (Celular 2/4) = 320 (Aluguel e Internet não se aplicam a Fev pois a data era Jan)
      expect(summary.exitsTotal).toBe(320);

      // Leftover: Entradas (5000) + Anterior (4380) - Saídas (320) - Poupança (0) = 9060
      expect(summary.forecastLeftover).toBe(9060);
      expect(summary.totalSavings).toBe(500);
    });
  });
});
