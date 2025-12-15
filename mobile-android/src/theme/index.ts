export const colors = {
  // Primary (Verde para online)
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  
  // Error (Vermelho para offline)
  error: '#F44336',
  errorDark: '#C62828',
  errorLight: '#E57373',
  
  // Warning (Âmbar para instável)
  warning: '#FFC107',
  warningDark: '#F57C00',
  warningLight: '#FFD54F',
  
  // Background
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  
  // Text
  onBackground: '#FFFFFF',
  onSurface: '#E0E0E0',
  onSurfaceVariant: '#B0B0B0',
  
  // Divider
  divider: '#424242',
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
};
