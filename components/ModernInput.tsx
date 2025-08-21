import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { TextInput, TextInputProps, HelperText } from 'react-native-paper';
import { useTheme } from '~/context/ThemeContext';

interface ModernInputProps extends Omit<TextInputProps, 'mode'> {
  label: string;
  error?: string;
  helperText?: string;
  variant?: 'outlined' | 'flat';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

export default function ModernInput({
  label,
  error,
  helperText,
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
  containerStyle,
  inputStyle,
  labelStyle,
  style,
  ...props
}: ModernInputProps) {
  const { theme } = useTheme();
  const { colors, borderRadius, spacing } = theme.custom;

  const getInputMode = () => {
    return variant === 'outlined' ? 'outlined' : 'flat';
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: spacing.sm,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return { ...baseStyle, ...containerStyle };
  };

  const getInputStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.input,
      borderRadius: borderRadius.md,
    };

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

    return { ...baseStyle, ...inputStyle, ...style };
  };

  const getLabelStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? 12 : size === 'large' ? 16 : 14,
      color: colors.text,
    };

    return { ...baseStyle, ...labelStyle };
  };

  return (
    <View style={getContainerStyle()}>
      <TextInput
        mode={getInputMode()}
        label={label}
        error={!!error}
        style={getInputStyle()}
        labelStyle={getLabelStyle()}
        activeOutlineColor={colors.inputFocus}
        outlineColor={colors.inputBorder}
        textColor={colors.text}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        {...props}
      />
      {(error || helperText) && (
        <HelperText
          type={error ? 'error' : 'info'}
          visible={true}
          style={[
            styles.helperText,
            {
              color: error ? colors.error : colors.textSecondary,
              fontSize: size === 'small' ? 10 : size === 'large' ? 14 : 12,
            },
          ]}>
          {error || helperText}
        </HelperText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  helperText: {
    marginTop: 4,
  },
});
