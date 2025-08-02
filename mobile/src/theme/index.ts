import { MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
};

export const theme: MD3Theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563eb', // Blue-600
    primaryContainer: '#dbeafe', // Blue-100
    secondary: '#059669', // Emerald-600
    secondaryContainer: '#d1fae5', // Emerald-100
    tertiary: '#7c3aed', // Violet-600
    tertiaryContainer: '#ede9fe', // Violet-100
    surface: '#ffffff',
    surfaceVariant: '#f8fafc', // Slate-50
    background: '#f8fafc', // Slate-50
    error: '#dc2626', // Red-600
    errorContainer: '#fee2e2', // Red-100
    onPrimary: '#ffffff',
    onPrimaryContainer: '#1e40af', // Blue-700
    onSecondary: '#ffffff',
    onSecondaryContainer: '#047857', // Emerald-700
    onTertiary: '#ffffff',
    onTertiaryContainer: '#6d28d9', // Violet-700
    onSurface: '#0f172a', // Slate-900
    onSurfaceVariant: '#475569', // Slate-600
    onBackground: '#0f172a', // Slate-900
    onError: '#ffffff',
    onErrorContainer: '#b91c1c', // Red-700
    outline: '#cbd5e1', // Slate-300
    outlineVariant: '#e2e8f0', // Slate-200
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#1e293b', // Slate-800
    inverseOnSurface: '#f1f5f9', // Slate-100
    inversePrimary: '#60a5fa', // Blue-400
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#f8fafc',
      level3: '#f1f5f9',
      level4: '#e2e8f0',
      level5: '#cbd5e1',
    },
    surfaceDisabled: '#e2e8f0',
    onSurfaceDisabled: '#94a3b8',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

export const colors = {
  // Status colors
  success: '#059669', // Emerald-600
  warning: '#d97706', // Amber-600
  info: '#0284c7', // Sky-600
  
  // Equipment status colors
  available: '#059669', // Emerald-600
  inUse: '#d97706', // Amber-600
  maintenance: '#dc2626', // Red-600
  outOfService: '#6b7280', // Gray-500
  
  // Priority colors
  low: '#6b7280', // Gray-500
  medium: '#d97706', // Amber-600
  high: '#dc2626', // Red-600
  urgent: '#7c2d12', // Red-900
  
  // Gradients
  primaryGradient: ['#3b82f6', '#2563eb'], // Blue-500 to Blue-600
  successGradient: ['#10b981', '#059669'], // Emerald-500 to Emerald-600
  warningGradient: ['#f59e0b', '#d97706'], // Amber-500 to Amber-600
  errorGradient: ['#ef4444', '#dc2626'], // Red-500 to Red-600
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};
