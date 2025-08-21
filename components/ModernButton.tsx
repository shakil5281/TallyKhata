import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';
import { useTheme } from '~/context/ThemeContext';

interface ModernButtonProps extends Omit<ButtonProps, 'mode'> {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export default function ModernButton({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
  labelStyle,
  children,
  ...props
}: ModernButtonProps) {
  const { theme } = useTheme();
  const { colors, borderRadius, spacing } = theme.custom;

  const getButtonMode = () => {
    switch (variant) {
      case 'outlined':
        return 'outlined';
      case 'text':
        return 'text';
      default:
        return 'contained';
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case 'primary':
        return colors.buttonPrimary;
      case 'secondary':
        return colors.buttonSecondary;
      case 'success':
        return colors.buttonSuccess;
      case 'warning':
        return colors.buttonWarning;
      case 'error':
        return colors.buttonError;
      case 'outlined':
        return colors.primary;
      case 'text':
        return colors.primary;
      default:
        return colors.buttonPrimary;
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.md,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (size) {
      case 'small':
        baseStyle.paddingVertical = spacing.xs;
        baseStyle.paddingHorizontal = spacing.sm;
        break;
      case 'large':
        baseStyle.paddingVertical = spacing.md;
        baseStyle.paddingHorizontal = spacing.lg;
        break;
      default:
        baseStyle.paddingVertical = spacing.sm;
        baseStyle.paddingHorizontal = spacing.md;
    }

    return baseStyle;
  };

  const getLabelStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? 12 : size === 'large' ? 16 : 14,
      fontWeight: '600',
    };

    return { ...baseStyle, ...labelStyle };
  };

  return (
    <Button
      mode={getButtonMode()}
      buttonColor={getButtonMode() === 'contained' ? getButtonColor() : undefined}
      textColor={getButtonMode() === 'contained' ? colors.textInverse : getButtonColor()}
      style={[getButtonStyle(), style]}
      labelStyle={getLabelStyle()}
      {...props}>
      {children}
    </Button>
  );
}
