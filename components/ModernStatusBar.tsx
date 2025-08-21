import React from 'react';
import { StatusBar as ExpoStatusBar, StatusBarStyle } from 'expo-status-bar';
import { useTheme } from '~/context/ThemeContext';

interface ModernStatusBarProps {
  style?: StatusBarStyle;
  backgroundColor?: string;
  translucent?: boolean;
}

export default function ModernStatusBar({
  style,
  backgroundColor,
  translucent = false,
}: ModernStatusBarProps) {
  const { theme, isDark } = useTheme();
  const { colors } = theme.custom;

  const statusBarStyle = style || (isDark ? 'light' : 'dark');
  const statusBarBackground = backgroundColor || colors.statusBarBackground;

  return (
    <ExpoStatusBar
      style={statusBarStyle}
      backgroundColor={statusBarBackground}
      translucent={translucent}
    />
  );
}
