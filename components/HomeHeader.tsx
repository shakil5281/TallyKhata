import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { IconButton, Avatar, Surface } from 'react-native-paper';
import { useTheme } from '~/context/ThemeContext';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

interface HomeHeaderProps {
  profileData?: {
    name: string;
    photo?: string;
    business_name?: string;
    email?: string;
  };
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
  onNotificationPress?: () => void;
}

export default function HomeHeader({
  profileData,
  onProfilePress,
  onSettingsPress,
  onNotificationPress,
}: HomeHeaderProps) {
  const { theme } = useTheme();
  const { colors, borderRadius, shadows } = theme.custom;
  const router = useRouter();

  console.log('HomeHeader rendering...', { profileData: !!profileData, colors: !!colors });

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/profile-edit');
    }
  };

  const handleSettingsPress = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      router.push('/settings');
    }
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    }
  };

  return (
    <Surface
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          borderRadius: borderRadius.lg,
          ...shadows.medium,
        },
      ]}
      elevation={0}>
      {/* Top Row - Profile and Actions */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.profileSection}
          onPress={handleProfilePress}
          activeOpacity={0.8}>
          <View style={styles.profileAvatar}>
            {profileData?.photo ? (
              <Avatar.Image
                size={50}
                source={{ uri: profileData.photo }}
                style={[styles.avatar, { borderColor: colors.textInverse + '20' }]}
              />
            ) : (
              <Avatar.Text
                size={50}
                label={profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                style={[styles.avatar, { borderColor: colors.textInverse + '20' }]}
                labelStyle={[styles.avatarText, { color: colors.textInverse }]}
              />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.greeting, { color: colors.textInverse }]}>
              Good{' '}
              {new Date().getHours() < 12
                ? 'Morning'
                : new Date().getHours() < 18
                  ? 'Afternoon'
                  : 'Evening'}
              !
            </Text>
            <Text style={[styles.userName, { color: colors.textInverse }]}>
              {profileData?.name || 'Welcome'}
            </Text>
            {profileData?.business_name && (
              <Text style={[styles.businessName, { color: colors.textInverse + '80' }]}>
                {profileData.business_name}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          {onNotificationPress && (
            <IconButton
              icon="bell-outline"
              size={24}
              iconColor={colors.textInverse}
              onPress={handleNotificationPress}
              style={[styles.actionButton, { backgroundColor: colors.textInverse + '10' }]}
            />
          )}
          <IconButton
            icon="cog-outline"
            size={24}
            iconColor={colors.textInverse}
            onPress={handleSettingsPress}
            style={[styles.actionButton, { backgroundColor: colors.textInverse + '10' }]}
          />
        </View>
      </View>

      {/* Bottom Row - Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.textInverse + '20' }]}>
            <Text style={[styles.statIconText, { color: colors.textInverse }]}>📊</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textInverse + '80' }]}>Reports</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.textInverse + '20' }]}>
            <Text style={[styles.statIconText, { color: colors.textInverse }]}>👥</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textInverse + '80' }]}>Customers</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.textInverse + '20' }]}>
            <Text style={[styles.statIconText, { color: colors.textInverse }]}>💰</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textInverse + '80' }]}>Transactions</Text>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginBottom: 8,
    padding: 20,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    marginRight: 16,
  },
  avatar: {
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.9,
  },
  userName: {
    fontSize: screenWidth < 400 ? 18 : 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  businessName: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    margin: 0,
    borderRadius: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
