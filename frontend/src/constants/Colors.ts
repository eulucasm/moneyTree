// Design System Theme constants for FinanciLife (Premium Fintech 2026)

export const Theme = {
  light: {
    // Backgrounds - Off-white Minimalist Tech
    background: '#F8F9FA', 
    surface: '#FFFFFF',    
    surfaceGlass: 'rgba(255, 255, 255, 0.85)',
    borderGlass: '#E2E8F0',  
    borderGlassActive: '#10B981', 
    
    // Typography
    text: '#064E3B', // Deep Emerald
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
      other: '#064E3B',
    },

    // UI Accents
    tint: '#10B981',
    tintGradient: ['#10B981', '#059669'],
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#10B981',
  },
  dark: {
    // Premium OLED Black & Dark Zinc
    background: '#000000', // Absolute Black (OLED)
    surface: '#09090B',    // Dark Zinc
    surfaceGlass: 'rgba(9, 9, 11, 0.7)',
    borderGlass: '#27272A',
    borderGlassActive: '#10B981',
    
    text: '#FAFAFA',
    textMuted: '#A1A1AA',
    textSecondary: '#E4E4E7',
    
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
    tintGradient: ['#34D399', '#10B981'],
    tabIconDefault: '#52525B',
    tabIconSelected: '#10B981',
  }
};

export default Theme;
