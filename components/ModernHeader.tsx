import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { IconButton, Avatar } from 'react-native-paper';
import { useTheme } from '~/context/ThemeContext';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showProfile?: boolean;
  profileData?: {
    name: string;
    photo?: string;
    business_name?: string;
  };
  rightAction?: {
    icon: string;
    onPress: () => void;
    color?: string;
  };
  variant?: 'default' | 'primary' | 'transparent';
}

export default function ModernHeader({
  title,
  subtitle,
  showBackButton = false,
  showProfile = false,
  profileData,
  rightAction,
  variant = 'default',
}: ModernHeaderProps) {
  const { theme } = useTheme();
  const { colors, borderRadius, shadows, spacing } = theme.custom;
  const router = useRouter();

  const getHeaderStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderBottomLeftRadius: borderRadius.lg,
          borderBottomRightRadius: borderRadius.lg,
        };
      case 'transparent':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return colors.textInverse;
      default:
        return colors.text;
    }
  };

  const getSubtextColor = () => {
    switch (variant) {
      case 'primary':
        return colors.textInverse + '80';
      default:
        return colors.textSecondary;
    }
  };

  const headerStyle = getHeaderStyle();
  const textColor = getTextColor();
  const subtextColor = getSubtextColor();

  return (
    <View
      style={[
        styles.container,
        headerStyle,
        {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.lg,
          ...shadows.medium,
        },
      ]}>
      {/* Top Row - Back Button and Right Action */}
      <View style={styles.topRow}>
        {showBackButton && (
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={textColor}
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: textColor + '10' }]}
          />
        )}

        <View style={styles.spacer} />

        {rightAction && (
          <IconButton
            icon={rightAction.icon}
            size={24}
            iconColor={rightAction.color || textColor}
            onPress={rightAction.onPress}
            style={[styles.rightButton, { backgroundColor: textColor + '10' }]}
          />
        )}
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {showProfile && profileData ? (
          <View style={styles.profileSection}>
            <View style={styles.profileAvatar}>
              {profileData.photo ? (
                <Avatar.Image
                  size={60}
                  source={{ uri: profileData.photo }}
                  style={[styles.avatar, { borderColor: textColor + '20' }]}
                />
              ) : (
                <Avatar.Text
                  size={60}
                  label={profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                  style={[styles.avatar, { borderColor: textColor + '20' }]}
                  labelStyle={[styles.avatarText, { color: textColor }]}
                />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: textColor }]}>
                {profileData.name || 'User Name'}
              </Text>
              {profileData.business_name && (
                <Text style={[styles.businessName, { color: subtextColor }]}>
                  {profileData.business_name}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
            {subtitle && <Text style={[styles.subtitle, { color: subtextColor }]}>{subtitle}</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    margin: 0,
    borderRadius: 20,
  },
  rightButton: {
    margin: 0,
    borderRadius: 20,
  },
  spacer: {
    flex: 1,
  },
  mainContent: {
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  profileAvatar: {
    marginRight: 16,
  },
  avatar: {
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  businessName: {
    fontSize: 14,
    textAlign: 'center',
  },
  titleSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: screenWidth < 400 ? 20 : 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
});
