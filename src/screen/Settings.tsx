import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { IconButton, Switch, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getUserProfile } from '~/lib/db';
import { StatusBar } from 'expo-status-bar';
import PageTransition from '../../components/PageTransition';
import { useTheme } from '~/context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';

export default function SettingsScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { colors, spacing, borderRadius, shadows } = theme.custom;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await getUserProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileEdit = () => {
    router.push('/profile-edit');
  };

  const handleAppInfo = () => {
    router.push('/app-info');
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Choose export format:', [
      { text: 'CSV', onPress: () => {} },
      { text: 'JSON', onPress: () => {} },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            // Implement clear data functionality
            Alert.alert('Data Cleared', 'All data has been cleared successfully.');
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.xs,
          borderRadius: borderRadius.md,
          marginBottom: spacing.xs,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.settingItemLeft}>
        <IconButton
          icon={icon}
          size={24}
          iconColor={colors.primary}
          style={[styles.settingIcon, { marginRight: spacing.sm }]}
        />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text
              style={[
                styles.settingSubtitle,
                {
                  color: colors.textSecondary,
                  marginTop: spacing.xs / 2,
                },
              ]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement ||
        (onPress && (
          <IconButton
            icon="chevron-right"
            size={20}
            iconColor={colors.textSecondary}
            style={[styles.chevronIcon, { marginLeft: spacing.sm }]}
          />
        ))}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <PageTransition>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.headerContainer}>
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor={colors.textInverse}
              onPress={() => router.back()}
              style={styles.headerLeftAction}
            />
            <Text style={[styles.headerTitle, { color: colors.textInverse }]}>Settings</Text>
          </View>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
          </View>
        </View>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.headerContainer,
            {
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.lg,
              borderBottomLeftRadius: borderRadius.lg,
              borderBottomRightRadius: borderRadius.lg,
              ...shadows.light,
            },
          ]}>
          {/* User Profile Section */}
          <View style={styles.userProfileSection}>
            <View style={styles.userAvatarContainer}>
              {profile?.photo ? (
                <Avatar.Image
                  size={60}
                  source={{ uri: profile.photo }}
                  style={[styles.userAvatar, { borderColor: colors.textInverse }]}
                />
              ) : (
                <Avatar.Text
                  size={60}
                  label={profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  style={[styles.userAvatar, { borderColor: colors.textInverse }]}
                  labelStyle={[styles.userAvatarText, { color: colors.textInverse }]}
                />
              )}
            </View>
            <View style={styles.userInfoContainer}>
              <Text style={[styles.userName, { color: colors.textInverse }]}>
                {profile?.name || 'User Name'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textInverse }]}>
                {profile?.email || 'user@example.com'}
              </Text>
              <Text style={[styles.userBusiness, { color: colors.textInverse }]}>
                {profile?.business_name || 'Business Name'}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollViewContent, { padding: spacing.md }]}
          showsVerticalScrollIndicator={false}>
          {/* Theme Section */}
          <View
            style={[
              styles.sectionContainer,
              {
                marginBottom: spacing.lg,
                paddingBottom: spacing.md,
                borderBottomColor: colors.borderSecondary,
              },
            ]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  marginBottom: spacing.sm,
                },
              ]}>
              Appearance
            </Text>
            <ThemeToggle showTitle={false} />
          </View>

          {/* Profile Section */}
          <View
            style={[
              styles.sectionContainer,
              {
                marginBottom: spacing.lg,
                paddingBottom: spacing.md,
                borderBottomColor: colors.borderSecondary,
              },
            ]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  marginBottom: spacing.sm,
                },
              ]}>
              Profile
            </Text>
            {renderSettingItem(
              'account-edit',
              'Edit Profile',
              `Current: ${profile?.name || 'Not set'}`,
              handleProfileEdit
            )}
          </View>

          {/* Preferences Section */}
          <View
            style={[
              styles.sectionContainer,
              {
                marginBottom: spacing.lg,
                paddingBottom: spacing.md,
                borderBottomColor: colors.borderSecondary,
              },
            ]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  marginBottom: spacing.sm,
                },
              ]}>
              Preferences
            </Text>
            {renderSettingItem(
              'bell',
              'Notifications',
              'Receive push notifications',
              undefined,
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color={colors.primary}
              />
            )}
            {renderSettingItem(
              'cloud-upload',
              'Auto Backup',
              'Automatically backup data',
              undefined,
              <Switch value={autoBackup} onValueChange={setAutoBackup} color={colors.primary} />
            )}
          </View>

          {/* Data Section */}
          <View
            style={[
              styles.sectionContainer,
              {
                marginBottom: spacing.lg,
                paddingBottom: spacing.md,
                borderBottomColor: colors.borderSecondary,
              },
            ]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  marginBottom: spacing.sm,
                },
              ]}>
              Data Management
            </Text>
            {renderSettingItem(
              'download',
              'Export Data',
              'Download your data as CSV or JSON',
              handleExportData
            )}
            {renderSettingItem(
              'database-remove',
              'Clear All Data',
              'Permanently delete all data',
              handleClearData
            )}
          </View>

          {/* About Section */}
          <View
            style={[
              styles.sectionContainer,
              {
                marginBottom: spacing.lg,
                paddingBottom: spacing.md,
                borderBottomColor: colors.borderSecondary,
              },
            ]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  marginBottom: spacing.sm,
                },
              ]}>
              About
            </Text>
            {renderSettingItem(
              'information',
              'App Information',
              'Version, license, and more',
              handleAppInfo
            )}
          </View>
        </ScrollView>
      </View>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeftAction: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  userProfileSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarContainer: {
    marginRight: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 2,
  },
  userBusiness: {
    fontSize: 12,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', // Placeholder for border color
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 8,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  chevronIcon: {
    marginLeft: 8,
  },
});
