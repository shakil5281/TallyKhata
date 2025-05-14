// theme.js
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#fe4c24',
    secondary: '#F59E0B',
    accent: '#10B981',
    background: '#fff9f8',
    surface: '#374151',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#fe4c24',      // you can keep the same brand colors
    secondary: '#F59E0B',
    accent: '#10B981',
    background: 'green',    // darker backgrounds
    surface: '#1E1E1E',
  },
};
