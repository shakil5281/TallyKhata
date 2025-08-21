// theme.js
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive design tokens
export const responsiveTokens = {
  // Screen dimensions
  screenWidth,
  screenHeight,

  // Breakpoints
  breakpoints: {
    small: 375,
    medium: 768,
    large: 1024,
  },

  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 50,
  },

  // Shadows
  shadows: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    heavy: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
  },

  // Typography scale
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 28, fontWeight: 'bold' },
    h3: { fontSize: 24, fontWeight: 'bold' },
    h4: { fontSize: 20, fontWeight: '600' },
    h5: { fontSize: 18, fontWeight: '600' },
    h6: { fontSize: 16, fontWeight: '600' },
    body1: { fontSize: 16, fontWeight: 'normal' },
    body2: { fontSize: 14, fontWeight: 'normal' },
    caption: { fontSize: 12, fontWeight: 'normal' },
    button: { fontSize: 14, fontWeight: '600' },
  },
};

// Light theme colors
export const lightColors = {
  // Brand colors
  primary: '#fe4c24',
  primaryLight: '#ff6b4a',
  primaryDark: '#d63d1a',

  // Secondary colors
  secondary: '#F59E0B',
  secondaryLight: '#fbbf24',
  secondaryDark: '#d97706',

  // Accent colors
  accent: '#10B981',
  accentLight: '#34d399',
  accentDark: '#059669',

  // Background colors
  background: '#fff9f8',
  backgroundSecondary: '#f8f9fa',
  backgroundTertiary: '#f1f3f4',

  // Surface colors
  surface: '#ffffff',
  surfaceSecondary: '#f8f9fa',
  surfaceTertiary: '#f1f3f4',

  // Text colors
  text: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  textInverse: '#ffffff',

  // Border colors
  border: '#e5e7eb',
  borderSecondary: '#f3f4f6',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#ef4444',
  info: '#3b82f6',

  // Card colors
  card: '#ffffff',
  cardSecondary: '#f8f9fa',

  // Input colors
  input: '#ffffff',
  inputBorder: '#d1d5db',
  inputFocus: '#fe4c24',

  // Button colors
  buttonPrimary: '#fe4c24',
  buttonSecondary: '#6b7280',
  buttonSuccess: '#10B981',
  buttonWarning: '#F59E0B',
  buttonError: '#ef4444',
};

// Dark theme colors
export const darkColors = {
  // Brand colors (keep same for consistency)
  primary: '#fe4c24',
  primaryLight: '#ff6b4a',
  primaryDark: '#d63d1a',

  // Secondary colors
  secondary: '#F59E0B',
  secondaryLight: '#fbbf24',
  secondaryDark: '#d97706',

  // Accent colors
  accent: '#10B981',
  accentLight: '#34d399',
  accentDark: '#059669',

  // Background colors
  background: '#0f0f0f',
  backgroundSecondary: '#1a1a1a',
  backgroundTertiary: '#2a2a2a',

  // Surface colors
  surface: '#1e1e1e',
  surfaceSecondary: '#2a2a2a',
  surfaceTertiary: '#3a3a3a',

  // Text colors
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  textInverse: '#1f2937',

  // Border colors
  border: '#374151',
  borderSecondary: '#4b5563',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#ef4444',
  info: '#3b82f6',

  // Card colors
  card: '#1e1e1e',
  cardSecondary: '#2a2a2a',

  // Input colors
  input: '#2a2a2a',
  inputBorder: '#4b5563',
  inputFocus: '#fe4c24',

  // Button colors
  buttonPrimary: '#fe4c24',
  buttonSecondary: '#6b7280',
  buttonSuccess: '#10B981',
  buttonWarning: '#F59E0B',
  buttonError: '#ef4444',
};

// Create theme objects
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  // Add custom properties
  custom: {
    ...responsiveTokens,
    colors: lightColors,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  // Add custom properties
  custom: {
    ...responsiveTokens,
    colors: darkColors,
  },
};

// Theme type for TypeScript
export type AppTheme = typeof lightTheme;
export type AppColors = typeof lightColors;

// Helper function to get responsive values
export const getResponsiveValue = (small: any, medium: any, large: any) => {
  if (screenWidth >= responsiveTokens.breakpoints.large) return large;
  if (screenWidth >= responsiveTokens.breakpoints.medium) return medium;
  return small;
};

// Helper function to get theme-aware colors
export const getThemeColor = (theme: AppTheme, colorKey: keyof AppColors) => {
  return theme.custom.colors[colorKey];
};
