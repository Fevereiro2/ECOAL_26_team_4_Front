export const theme = {
  colors: {
    background: '#090B11',
    surface: '#121824',
    surfaceAlt: '#1A2233',
    border: '#273149',
    textPrimary: '#F3F6FF',
    textSecondary: '#AEB9D4',
    accent: '#F59E0B',
    accentMuted: '#3A2A0A',
    success: '#3ECF8E',
    danger: '#F87171',
    warning: '#FACC15',
    chipBg: '#1A2132',
    cardOverlay: 'rgba(9,11,17,0.45)'
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32
  },
  typography: {
    h1: 30,
    h2: 24,
    h3: 18,
    body: 14,
    small: 12
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.24,
      shadowRadius: 20,
      elevation: 6
    }
  }
} as const;
