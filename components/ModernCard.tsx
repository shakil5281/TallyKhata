import React from 'react';
import { ViewStyle } from 'react-native';
import { Surface } from 'react-native-paper';
import { useTheme } from '~/context/ThemeContext';

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function ModernCard({
  children,
  style,
  variant = 'default',
  padding = 'md',
  margin = 'xs',
  borderRadius = 'md',
}: ModernCardProps) {
  const { theme } = useTheme();
  const { colors, borderRadius: borderRadiusTokens, shadows, spacing } = theme.custom;

  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: colors.surface,
      borderRadius: borderRadiusTokens[borderRadius],
      padding: spacing[padding],
      margin: spacing[margin],
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...shadows.medium,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.light,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: colors.surfaceSecondary,
          ...shadows.light,
        };
      default:
        return {
          ...baseStyle,
          ...shadows.light,
        };
    }
  };

  return (
    <Surface style={[getCardStyle(), style]} elevation={0}>
      {children}
    </Surface>
  );
}
