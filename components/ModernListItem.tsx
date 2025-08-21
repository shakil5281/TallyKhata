import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { IconButton, Avatar } from 'react-native-paper';
import { useTheme } from '~/context/ThemeContext';

interface ModernListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  avatar?: string;
  avatarLabel?: string;
  avatarColor?: string;
  onPress?: () => void;
  onRightPress?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export default function ModernListItem({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  avatar,
  avatarLabel,
  avatarColor,
  onPress,
  onRightPress,
  disabled = false,
  variant = 'default',
  size = 'medium',
  style,
  titleStyle,
  subtitleStyle,
}: ModernListItemProps) {
  const { theme } = useTheme();
  const { colors, borderRadius, shadows, spacing } = theme.custom;

  const getItemStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
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
      default:
        return {
          ...baseStyle,
          ...shadows.light,
        };
    }
  };

  const getTitleStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: colors.text,
      fontWeight: '500',
      flex: 1,
    };

    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'large':
        baseStyle.fontSize = 18;
        break;
      default:
        baseStyle.fontSize = 16;
    }

    return { ...baseStyle, ...titleStyle };
  };

  const getSubtitleStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: colors.textSecondary,
      marginTop: 2,
    };

    switch (size) {
      case 'small':
        baseStyle.fontSize = 11;
        break;
      case 'large':
        baseStyle.fontSize = 14;
        break;
      default:
        baseStyle.fontSize = 13;
    }

    return { ...baseStyle, ...subtitleStyle };
  };

  const getAvatarSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 56;
      default:
        return 40;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  const itemStyle = getItemStyle();
  const titleStyleFinal = getTitleStyle();
  const subtitleStyleFinal = getSubtitleStyle();
  const avatarSize = getAvatarSize();
  const iconSize = getIconSize();

  const content = (
    <View style={[itemStyle, style]}>
      {/* Left Icon or Avatar */}
      {leftIcon && (
        <IconButton
          icon={leftIcon}
          size={iconSize}
          iconColor={colors.primary}
          style={styles.leftIcon}
        />
      )}

      {avatar && (
        <Avatar.Image
          size={avatarSize}
          source={{ uri: avatar }}
          style={[styles.avatar, { marginRight: spacing.sm }]}
        />
      )}

      {avatarLabel && (
        <Avatar.Text
          size={avatarSize}
          label={avatarLabel}
          style={[
            styles.avatar,
            {
              marginRight: spacing.sm,
              backgroundColor: avatarColor || colors.primary,
            },
          ]}
          labelStyle={styles.avatarLabel}
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={titleStyleFinal}>{title}</Text>
        {subtitle && <Text style={subtitleStyleFinal}>{subtitle}</Text>}
      </View>

      {/* Right Icon */}
      {rightIcon && (
        <IconButton
          icon={rightIcon}
          size={iconSize}
          iconColor={colors.textSecondary}
          onPress={onRightPress}
          style={styles.rightIcon}
        />
      )}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  leftIcon: {
    margin: 0,
    marginRight: 8,
  },
  rightIcon: {
    margin: 0,
    marginLeft: 8,
  },
  avatar: {
    marginRight: 8,
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
});
