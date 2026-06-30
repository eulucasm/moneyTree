import { describe, it, expect } from 'vitest';
import { addMonths, generateInstallments, Purchase } from '../installmentEngine';

describe('Installment Engine Utility', () => {
  describe('addMonths', () => {
    it('should add months within the same year', () => {
      expect(addMonths('2025-01', 3)).toBe('2025-04');
      expect(addMonths('2025-05', 6)).toBe('2025-11');
    });

    it('should wrap around the year correctly', () => {
      expect(addMonths('2025-11', 2)).toBe('2026-01');
      expect(addMonths('2025-08', 10)).toBe('2026-06');
      expect(addMonths('2025-01', 12)).toBe('2026-01');
      expect(addMonths('2025-01', 24)).toBe('2027-01');
    });

    it('should handle zero months addition', () => {
      expect(addMonths('2025-03', 0)).toBe('2025-03');
    });
  });

  describe('generateInstallments', () => {
    it('should generate correct list of installments', () => {
      const samplePurchase: Purchase = {
        id: 'p1',
        description: 'TV Casas Bahia',
        totalValue: 1424,
        monthlyValue: 142.4,
        installments: 10,
        startDate: '2025-08',
        cardUsed: 'nubank',
      };

      const result = generateInstallments(samplePurchase);

      expect(result).toHaveLength(10);
      
      // Assert first installment
      expect(result[0]).toEqual({
        id: 'p1-inst-1',
        purchaseId: 'p1',
        description: 'TV Casas Bahia (01/10)',
        value: 142.4,
        installmentIndex: 1,
        totalInstallments: 10,
        date: '2025-08',
        cardUsed: 'nubank',
        status: 'pending',
      });

      // Assert fifth installment (index 4)
      expect(result[4].date).toBe('2025-12');
      expect(result[4].description).toBe('TV Casas Bahia (05/10)');

      // Assert last installment (index 9)
      expect(result[9].date).toBe('2026-05');
      expect(result[9].description).toBe('TV Casas Bahia (10/10)');
    });
  });
});
