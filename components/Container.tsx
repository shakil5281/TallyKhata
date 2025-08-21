import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '~/context/ThemeContext';

interface ContainerProps {
  children: React.ReactNode;
  style?: any;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Container: React.FC<ContainerProps> = ({ children, style, padding = 'md' }) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme.custom;

  const containerStyle = [
    styles.container,
    {
      backgroundColor: colors.background,
      padding: spacing[padding],
    },
    style,
  ];

  return <SafeAreaView style={containerStyle}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
