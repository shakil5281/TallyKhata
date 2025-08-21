import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { lightTheme, darkTheme, AppTheme } from '../theme/theme';

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  currentThemeMode: 'light' | 'dark' | 'auto';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [currentThemeMode, setCurrentThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [isDark, setIsDark] = useState(false);

  // Determine the actual theme based on mode and system preference
  const getActualTheme = (): AppTheme => {
    if (currentThemeMode === 'auto') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return currentThemeMode === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getActualTheme();

  // Update theme when system color scheme changes
  useEffect(() => {
    if (currentThemeMode === 'auto') {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, currentThemeMode]);

  // Update theme when manual theme changes
  useEffect(() => {
    if (currentThemeMode === 'light') {
      setIsDark(false);
    } else if (currentThemeMode === 'dark') {
      setIsDark(true);
    } else {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [currentThemeMode, systemColorScheme]);

  const toggleTheme = () => {
    if (currentThemeMode === 'auto') {
      setCurrentThemeMode(systemColorScheme === 'dark' ? 'light' : 'dark');
    } else if (currentThemeMode === 'light') {
      setCurrentThemeMode('dark');
    } else {
      setCurrentThemeMode('light');
    }
  };

  const setTheme = (themeMode: 'light' | 'dark' | 'auto') => {
    setCurrentThemeMode(themeMode);
  };

  // Listen for system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (currentThemeMode === 'auto') {
        setIsDark(colorScheme === 'dark');
      }
    });

    return () => subscription?.remove();
  }, [currentThemeMode]);

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    currentThemeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for getting theme-aware colors
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.custom.colors;
};

// Hook for getting responsive tokens
export const useResponsiveTokens = () => {
  const { theme } = useTheme();
  return theme.custom;
};
