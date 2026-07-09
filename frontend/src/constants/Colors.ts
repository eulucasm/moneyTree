// Design System Theme constants for FinanciLife (inspired by REFCORES and glassmorphism layouts)

export const Theme = {
  light: {
    // Backgrounds - Off-white Minimalist Tech
    background: '#F8F9FA', // Off-white principal
    surface: '#FFFFFF',    // Card/surface background puro
    surfaceGlass: 'rgba(255, 255, 255, 0.95)',
    borderGlass: '#E5E7EB',  // Card border sutil
    borderGlassActive: '#10B981', // Selected/Active card border
    
    // Typography
    text: '#0F5132',
    textMuted: '#64748B',
    textSecondary: '#334155',
    
    // Financial Status
    entry: '#10B981',
    exit: '#EF4444',
    saving: '#3B82F6',
    forecast: '#F59E0B',
    
    // Credit Cards and Institution Brand Colors
    brands: {
      nubank: '#820ad1',
      mercadopago: '#009ee3',
      caixa: '#005ca9',
      caixaOrange: '#f29100',
      bradesco: '#cc092f',
      vale: '#facc15',
      other: '#0F5132',
    },

    // UI Accents
    tint: '#10B981',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#10B981',
  },
  dark: {
    // Premium Deep Navy Dark
    background: '#0F1523', // Fundo profundo
    surface: '#182133',    // Card escuro
    surfaceGlass: 'rgba(255, 255, 255, 0.03)',
    borderGlass: '#26334D',
    borderGlassActive: '#10B981',
    
    text: '#FFFFFF',
    textMuted: '#8B9BB4',
    textSecondary: '#CBD5E1',
    
    entry: '#10B981',
    exit: '#EF4444',
    saving: '#3B82F6',
    forecast: '#F59E0B',
    
    brands: {
      nubank: '#820ad1',
      mercadopago: '#009ee3',
      caixa: '#005ca9',
      caixaOrange: '#f29100',
      bradesco: '#cc092f',
      vale: '#facc15',
      other: '#10B981',
    },

    tint: '#10B981',
    tabIconDefault: '#475569',
    tabIconSelected: '#10B981',
  }
};

export default Theme;
