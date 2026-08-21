export const THEME = {
  colors: {
    background: '#040407',
    surface: '#0B0B12',
    surfaceCard: '#13131F',
    surfaceGlass: 'rgba(25, 25, 40, 0.65)',
    surfaceInput: '#1A1A2B',
    surfaceElevated: '#212136',
    border: '#26263D',
    borderLight: '#383856',
    borderGlass: 'rgba(255, 255, 255, 0.12)',

    primary: '#7928CA',
    primaryGlow: '#9D4EDD',
    secondary: '#FF0080',
    accent: '#00DFD8',
    warning: '#FF5400',
    success: '#00F5D4',

    textPrimary: '#FFFFFF',
    textSecondary: '#A5A5C8',
    textMuted: '#686888',

    gradients: {
      aurora: ['#FF0080', '#7928CA', '#00DFD8'] as const,
      brand: ['#FF0080', '#7928CA'] as const,
      cyber: ['#00DFD8', '#7928CA'] as const,
      sunset: ['#FF5400', '#FF0080', '#7928CA'] as const,
      cardGlass: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)'] as const,
      storyActive: ['#FF0080', '#7928CA', '#00DFD8'] as const,
      storySeen: ['#383856', '#26263D'] as const,
      chatSent: ['#7928CA', '#FF0080'] as const,
    },
  },

  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      display: 32,
    },
  },

  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 26,
    pill: 9999,
  },

  shadows: {
    card: {
      shadowColor: '#7928CA',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 14,
      elevation: 8,
    },
    glowBrand: {
      shadowColor: '#FF0080',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 12,
    },
    glowPrimary: {
      shadowColor: '#7928CA',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
    glowAccent: {
      shadowColor: '#00DFD8',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 10,
    },
  },
};
