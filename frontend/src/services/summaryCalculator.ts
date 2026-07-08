import { Purchase, generateInstallments } from './installmentEngine';
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

/**
 * Determines the true start month by comparing the user's account creation date
 * against the earliest explicit date in entries, exits, or purchases.
 */
export function getEarliestDataMonth(
  userCreatedAt: string,
  entries: Entry[],
  exits: Exit[],
  purchases: Purchase[]
): string {
  let earliest = userCreatedAt;
  entries.forEach(e => {
    if (e.date < earliest) earliest = e.date;
  });
  exits.forEach(e => {
    if (e.date < earliest) earliest = e.date;
  });
  purchases.forEach(p => {
    if (p.startDate < earliest) earliest = p.startDate;
  });
  return earliest;
}

/**
 * Computes all outflows for a given month, compiling fixed, recurring, and installments.
 */
export function computeMonthlyOutflowsList(
  monthStr: string,
  exits: Exit[],
  recurrings: Recurring[],
  purchases: Purchase[],
  installmentStatusMap: Record<string, 'ok' | 'pending'>,
  cutoffMonth?: string
): OutflowItem[] {
  if (cutoffMonth && monthStr < cutoffMonth) {
    return [];
  }
  const list: OutflowItem[] = [];

  // a. Add standard fixed/variable exits for this month
  exits
    .filter(e => e.date === monthStr)
    .forEach(e => {
      list.push({
        id: e.id,
        description: e.description,
        value: e.value,
        type: e.category === 'variable' ? 'variable' : 'fixed',
        status: e.status,
        dueDate: e.dueDate,
      });
    });

  // b. Add recurrings
  recurrings.forEach(r => {
    list.push({
      id: `rec-item-${r.id}`,
      description: r.description,
      value: r.value,
      type: 'recurring',
      status: 'ok', // recurrings are computed as auto-paid placeholders
      cardUsed: r.cardUsed,
    });
  });

  // c. Add credit card installments scheduled for this month
  purchases.forEach(p => {
    const generated = generateInstallments(p);
    const matched = generated.find(inst => inst.date === monthStr);
    if (matched) {
      const key = `${p.id}_${monthStr}`;
      const status = installmentStatusMap[key] || 'pending';
      list.push({
        id: p.id,
        description: matched.description,
        value: matched.value,
        type: 'installment',
        status,
        installmentRef: `${matched.installmentIndex}/${matched.totalInstallments}`,
        cardUsed: p.cardUsed,
      });
    }
  });

  return list;
}

/**
 * Iteratively calculates historical and current summaries from 2025-01 up to monthStr,
 * cascading monthly leftovers and savings sequentially.
 */


const getMonthsRange = (start: string, end: string): string[] => {
  const list: string[] = [];
  const [startYear, startMonth] = start.split('-').map(Number);
  const [endYear, endMonth] = end.split('-').map(Number);
  
  let y = startYear;
  let m = startMonth;
  
  while (y < endYear || (y === endYear && m <= endMonth)) {
    list.push(`${y}-${String(m).padStart(2, '0')}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return list;
};

let cachedInputs: any = null;
let cachedSummaryMap: Record<string, MonthSummary> = {};

export function computeMonthlySummary(
  monthStr: string,
  entries: Entry[],
  exits: Exit[],
  recurrings: Recurring[],
  purchases: Purchase[],
  savingsLogs: Record<string, number | SavingsItem[]>,
  installmentStatusMap: Record<string, 'ok' | 'pending'>,
  startMonth = '2025-01',
  cutoffMonth?: string
): MonthSummary {
  if (
    cachedInputs &&
    cachedInputs.entries === entries &&
    cachedInputs.exits === exits &&
    cachedInputs.recurrings === recurrings &&
    cachedInputs.purchases === purchases &&
    cachedInputs.savingsLogs === savingsLogs &&
    cachedInputs.installmentStatusMap === installmentStatusMap &&
    cachedInputs.startMonth === startMonth &&
    cachedInputs.cutoffMonth === cutoffMonth
  ) {
    if (cachedSummaryMap[monthStr]) {
      return cachedSummaryMap[monthStr];
    }
  }

  // Generate all sequential months from startMonth to the target monthStr (no skipped months!)
  const sortedMonths = getMonthsRange(startMonth, monthStr);

  let cumulativeSurplus = 0;
  let cumulativeSavings = 0;

  const summaryMap: Record<string, MonthSummary> = {};

  sortedMonths.forEach(m => {
    const isBeforeCutoff = cutoffMonth ? m < cutoffMonth : false;

    // Entries sum
    const monthlyEntriesTotal = isBeforeCutoff ? 0 : entries
      .filter(e => e.date === m)
      .reduce((sum, e) => sum + e.value, 0);

    const monthlyOutflows = isBeforeCutoff ? [] : computeMonthlyOutflowsList(m, exits, recurrings, purchases, installmentStatusMap, cutoffMonth);
    
    let monthlyExitsTotal = 0;
    if (!isBeforeCutoff) {
      // Add fixed and variable
      monthlyExitsTotal += monthlyOutflows.filter(o => o.type === 'fixed' || o.type === 'variable').reduce((sum, o) => sum + o.value, 0);

      monthlyExitsTotal += monthlyOutflows.filter(o => o.type === 'installment' || o.type === 'recurring').reduce((sum, o) => sum + o.value, 0);
    }

    const monthlySavingsLogs = isBeforeCutoff ? 0 : (savingsLogs[m] || 0);
    let savingsPlaced = 0;
    if (Array.isArray(monthlySavingsLogs)) {
      savingsPlaced = monthlySavingsLogs.reduce((sum, item) => sum + item.amount, 0);
    } else if (typeof monthlySavingsLogs === 'number') {
      savingsPlaced = monthlySavingsLogs;
    }

    const prevSurplus = isBeforeCutoff ? 0 : cumulativeSurplus;
    const prevSavings = isBeforeCutoff ? 0 : cumulativeSavings;

    // Leftover: Entradas + previous surplus - exits (Caixinha agora fica na aba Investimentos e é contada à parte)
    const leftover = isBeforeCutoff ? 0 : (monthlyEntriesTotal + prevSurplus - monthlyExitsTotal);
    
    if (isBeforeCutoff) {
      cumulativeSurplus = 0;
      cumulativeSavings = 0;
    } else {
      cumulativeSurplus = leftover;
      cumulativeSavings += savingsPlaced;
    }

    summaryMap[m] = {
      entriesTotal: monthlyEntriesTotal,
      exitsTotal: monthlyExitsTotal,
      savingsPlaced,
      previousMonthSurplus: prevSurplus,
      previousMonthSavings: prevSavings,
      totalSavings: prevSavings + savingsPlaced,
      forecastLeftover: leftover,
    };
  });

  cachedInputs = { entries, exits, recurrings, purchases, savingsLogs, installmentStatusMap, startMonth, cutoffMonth };
  cachedSummaryMap = summaryMap;

  return summaryMap[monthStr] || {
    entriesTotal: 0,
    exitsTotal: 0,
    savingsPlaced: 0,
    previousMonthSurplus: 0,
    previousMonthSavings: 0,
    totalSavings: 0,
    forecastLeftover: 0,
  };
}
