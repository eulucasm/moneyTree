// Design System Theme constants for FinanciLife (inspired by REFCORES and glassmorphism layouts)

export const Theme = {
  light: {
    // Backgrounds - Off-white Minimalist Tech
    background: '#F8F9FA', // Off-white principal
    surface: '#FFFFFF',    // Card/surface background puro com cantos arredondados
    surfaceGlass: 'rgba(255, 255, 255, 0.95)', // Transludic card
    borderGlass: 'rgba(0, 0, 0, 0.04)',  // Card border sutil
    borderGlassActive: '#10B981', // Selected/Active card border em Esmeralda
    
    // Typography
    text: '#0F5132',       // Verde Floresta (Seriedade/Principal)
    textMuted: '#64748B',  // Secondary/muted text
    textSecondary: '#334155', // Subtitles
    
    // Financial Status
    entry: '#10B981',      // Verde Esmeralda Vibrante (Sucesso/Ações)
    exit: '#EF4444',       // Alert Red (Atenção/Saídas)
    saving: '#3B82F6',     // Info Blue
    forecast: '#F59E0B',   // Warning Orange/Yellow
    
    // Credit Cards and Institution Brand Colors (REFCORES)
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
    tint: '#10B981',       // Verde Esmeralda como Accent Principal
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#10B981',
  },
  dark: {
    // Caso o usuário prefira o sistema dark, oferecemos um Dark Forest minimalista
    background: '#0B0F19', // Fundo profundo
    surface: '#151D30',    // Card escuro
    surfaceGlass: 'rgba(255, 255, 255, 0.03)',
    borderGlass: 'rgba(255, 255, 255, 0.08)',
    borderGlassActive: '#10B981', // Verde esmeralda se mantém
    
    text: '#F8F9FA',       // Texto claro off-white
    textMuted: '#94A3B8',
    textSecondary: '#CBD5E1',
    
    entry: '#10B981',      // Verde Esmeralda
    exit: '#EF4444',       // Alert Red
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
