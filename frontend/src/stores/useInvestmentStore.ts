import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const INVESTMENT_STORAGE_KEYS = {
  PORTFOLIO: '@MoneyTree:investmentPortfolio',
};

export type AssetClass = 'Ações' | 'Exterior' | 'ETFs' | 'FIIs' | 'Renda Fixa' | 'Criptomoedas';

export interface InvestmentAsset {
  id: string;
  assetClass: AssetClass;
  subCategory?: string;
  ticker: string;
  currentValue: number;
}

export interface InvestmentPortfolio {
  targetStocks: number;
  targetForeign: number;
  targetETFs: number;
  targetREITs: number;
  targetFixed: number;
  targetCrypto: number;
  assets: InvestmentAsset[];
}

export interface RebalanceRecommendation {
  assetClass: AssetClass;
  currentValue: number;
  currentPercentage: number;
  idealPercentage: number;
  idealValue: number;
  suggestedContribution: number;
}

interface InvestmentState {
  portfolio: InvestmentPortfolio;
  
  // Actions
  setPortfolio: (data: Partial<InvestmentPortfolio>) => void;
  updateTargets: (targets: Partial<InvestmentPortfolio>) => void;
  addAsset: (asset: Omit<InvestmentAsset, 'id'>) => void;
  updateAsset: (id: string, value: number) => void;
  deleteAsset: (id: string) => void;
  clearAllData: () => Promise<void>;
  
  // Computations
  getTotalInvested: () => number;
  getRebalancingPlan: (contributionAmount: number) => RebalanceRecommendation[];
}

const defaultPortfolio: InvestmentPortfolio = {
  targetStocks: 20,
  targetForeign: 20,
  targetETFs: 5,
  targetREITs: 25,
  targetFixed: 25,
  targetCrypto: 5,
  assets: [],
};

const persist = async (data: InvestmentPortfolio) => {
  try {
    await AsyncStorage.setItem(INVESTMENT_STORAGE_KEYS.PORTFOLIO, JSON.stringify(data));
    // Trigger sync globally by updating lastUpdatedAt in FinanceStore (or we can handle it in useGlobalSync)
    const { useFinanceStore } = require('./useFinanceStore');
    useFinanceStore.setState({ lastUpdatedAt: Date.now() });
  } catch (err) {
    console.error('Error saving investments:', err);
  }
};

export const useInvestmentStore = create<InvestmentState>((set, get) => ({
  portfolio: defaultPortfolio,

  setPortfolio: (data) => {
    set((state) => {
      const newPortfolio = { ...state.portfolio, ...data };
      return { portfolio: newPortfolio };
    });
  },

  updateTargets: (targets) => {
    const newPortfolio = { ...get().portfolio, ...targets };
    set({ portfolio: newPortfolio });
    persist(newPortfolio);
  },

  addAsset: (asset) => {
    const newAsset: InvestmentAsset = {
      ...asset,
      id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const newPortfolio = { 
      ...get().portfolio, 
      assets: [...get().portfolio.assets, newAsset] 
    };
    set({ portfolio: newPortfolio });
    persist(newPortfolio);
  },

  updateAsset: (id, value) => {
    const newAssets = get().portfolio.assets.map(a => 
      a.id === id ? { ...a, currentValue: value } : a
    );
    const newPortfolio = { ...get().portfolio, assets: newAssets };
    set({ portfolio: newPortfolio });
    persist(newPortfolio);
  },

  deleteAsset: (id) => {
    const newAssets = get().portfolio.assets.filter(a => a.id !== id);
    const newPortfolio = { ...get().portfolio, assets: newAssets };
    set({ portfolio: newPortfolio });
    persist(newPortfolio);
  },

  clearAllData: async () => {
    set({ portfolio: defaultPortfolio });
    try {
      await AsyncStorage.removeItem(INVESTMENT_STORAGE_KEYS.PORTFOLIO);
    } catch (err) {
      console.error('Error clearing Investment AsyncStorage:', err);
    }
  },

  getTotalInvested: () => {
    return get().portfolio.assets.reduce((sum, a) => sum + a.currentValue, 0);
  },

  getRebalancingPlan: (contributionAmount: number) => {
    const p = get().portfolio;
    const totalInvested = get().getTotalInvested();
    const newTotal = totalInvested + contributionAmount;

    const classTargets: Record<AssetClass, number> = {
      'Ações': p.targetStocks,
      'Exterior': p.targetForeign,
      'ETFs': p.targetETFs,
      'FIIs': p.targetREITs,
      'Renda Fixa': p.targetFixed,
      'Criptomoedas': p.targetCrypto,
    };

    const currentValues: Record<AssetClass, number> = {
      'Ações': 0, 'Exterior': 0, 'ETFs': 0, 'FIIs': 0, 'Renda Fixa': 0, 'Criptomoedas': 0
    };

    p.assets.forEach(a => {
      if (currentValues[a.assetClass] !== undefined) {
        currentValues[a.assetClass] += a.currentValue;
      }
    });

    const recommendations: RebalanceRecommendation[] = [];

    const classes: AssetClass[] = ['Ações', 'Exterior', 'ETFs', 'FIIs', 'Renda Fixa', 'Criptomoedas'];

    classes.forEach(c => {
      const cValue = currentValues[c];
      const cPercentage = totalInvested > 0 ? (cValue / totalInvested) * 100 : 0;
      const targetPercent = classTargets[c];
      const idealValue = newTotal * (targetPercent / 100);
      let suggested = idealValue - cValue;
      
      // If we already have more than ideal, don't sell, just put 0.
      if (suggested < 0) suggested = 0;

      recommendations.push({
        assetClass: c,
        currentValue: cValue,
        currentPercentage: cPercentage,
        idealPercentage: targetPercent,
        idealValue,
        suggestedContribution: suggested,
      });
    });

    return recommendations;
  }
}));
