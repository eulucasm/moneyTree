// Installment Generator Engine for FinanciLife

export interface Purchase {
  id: string;
  description: string;
  totalValue: number;
  monthlyValue: number;
  installments: number;
  startDate: string; // Format: "YYYY-MM" (e.g., "2025-08")
  cardUsed: string;
}

export interface InstallmentItem {
  id: string;
  purchaseId: string;
  description: string; // E.g., "TV Casas Bahia (01/10)"
  value: number;
  installmentIndex: number; // 1-indexed
  totalInstallments: number;
  date: string; // Format: "YYYY-MM"
  cardUsed: string;
  status: 'ok' | 'pending';
}

/**
 * Adds months to a "YYYY-MM" formatted string, correctly wrapping around years.
 */
export function addMonths(dateStr: string, monthsToAdd: number): string {
  const [yearStr, monthStr] = dateStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) - 1; // Convert to 0-indexed for calculation
  
  month += monthsToAdd;
  year += Math.floor(month / 12);
  month = month % 12;
  
  if (month < 0) {
    month += 12;
    year -= 1;
  }
  
  const paddedMonth = String(month + 1).padStart(2, '0');
  return `${year}-${paddedMonth}`;
}

/**
 * Generates an array of individual InstallmentItem elements from a single Purchase entry.
 */
export function generateInstallments(purchase: Purchase): InstallmentItem[] {
  const items: InstallmentItem[] = [];
  
  for (let i = 0; i < purchase.installments; i++) {
    const installmentDate = addMonths(purchase.startDate, i);
    const indexStr = String(i + 1).padStart(2, '0');
    const totalStr = String(purchase.installments).padStart(2, '0');
    
    items.push({
      id: `${purchase.id}-inst-${i + 1}`,
      purchaseId: purchase.id,
      description: `${purchase.description} (${indexStr}/${totalStr})`,
      value: purchase.monthlyValue,
      installmentIndex: i + 1,
      totalInstallments: purchase.installments,
      date: installmentDate,
      cardUsed: purchase.cardUsed,
      status: 'pending',
    });
  }
  
  return items;
}
