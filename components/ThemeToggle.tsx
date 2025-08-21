import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, IconButton, Chip } from 'react-native-paper';
import { useTheme } from '~/context/ThemeContext';

interface ThemeToggleProps {
  showTitle?: boolean;
  compact?: boolean;
}

export default function ThemeToggle({ showTitle = true, compact = false }: ThemeToggleProps) {
  const { currentThemeMode, setTheme, isDark } = useTheme();
  const { colors, borderRadius } = useTheme().theme.custom;

  const themeOptions = [
    { key: 'light', label: 'Light', icon: 'white-balance-sunny', color: '#fbbf24' },
    { key: 'dark', label: 'Dark', icon: 'moon-waning-crescent', color: '#6b7280' },
    { key: 'auto', label: 'Auto', icon: 'theme-light-dark', color: '#10b981' },
  ] as const;

  const handleThemeChange = (themeKey: 'light' | 'dark' | 'auto') => {
    setTheme(themeKey);
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {themeOptions.map((option) => (
          <IconButton
            key={option.key}
            icon={option.icon}
            size={24}
            iconColor={currentThemeMode === option.key ? colors.primary : colors.textSecondary}
            style={[
              styles.compactButton,
              {
                backgroundColor: currentThemeMode === option.key ? colors.primary : 'transparent',
                borderRadius: borderRadius.round,
              },
            ]}
            onPress={() => handleThemeChange(option.key)}
          />
        ))}
      </View>
    );
  }

  return (
    <Surface style={[styles.container, { backgroundColor: colors.surface }]}>
      {showTitle && <Text style={[styles.title, { color: colors.text }]}>Theme</Text>}

      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => (
          <Chip
            key={option.key}
            selected={currentThemeMode === option.key}
            onPress={() => handleThemeChange(option.key)}
            style={[
              styles.optionChip,
              {
                backgroundColor:
                  currentThemeMode === option.key ? colors.primary : colors.surfaceSecondary,
                borderColor: currentThemeMode === option.key ? colors.primary : colors.border,
              },
            ]}
            textStyle={[
              styles.optionText,
              {
                color: currentThemeMode === option.key ? colors.textInverse : colors.text,
              },
            ]}
            icon={option.icon}>
            {option.label}
          </Chip>
        ))}
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {currentThemeMode === 'auto'
          ? `Following system theme (${isDark ? 'Dark' : 'Light'})`
          : `Using ${currentThemeMode} theme`}
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  optionChip: {
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactButton: {
    margin: 0,
  },
});
