import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  TouchableOpacity,
  BackHandler,
  Linking,
  Share,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getUserProfile, clearDatabase, exportTotalsData } from '~/lib/db';
import {
  Surface,
  IconButton,
  Avatar,
  Switch,
  Divider,
  Card,
  Button,
  Badge,
  Menu,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Updates from 'expo-updates';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import PageTransition from '../../components/PageTransition';
import { useTheme } from '~/context/ThemeContext';


export default function SettingsScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [clearingProgress, setClearingProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [themeMenuVisible, setThemeMenuVisible] = useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('বাংলা');
  const router = useRouter();
  const { theme, currentThemeMode, setTheme } = useTheme();
  const { colors } = theme.custom;


  const loadProfile = useCallback(async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch {
      console.error('Error loading profile');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleClearData = async () => {
    Alert.alert(
      'সব ডেটা মুছে ফেলুন',
      'আপনি কি নিশ্চিত যে আপনি সব ডেটা মুছে ফেলতে চান? এই কাজটি অপরিবর্তনীয় এবং অ্যাপ পুনরায় চালু হবে।',
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'মুছে ফেলুন',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            setClearingProgress(0);

            // 5-second countdown with progress
            for (let i = 1; i <= 5; i++) {
              setClearingProgress((i / 5) * 100);
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            try {
              console.log('🗑️ Starting database clear process...');

              // Clear all data
              await clearDatabase();

              console.log('✅ Database cleared successfully');

              // Show success message briefly
              Alert.alert(
                'সফল',
                'সব ডেটা মুছে ফেলা হয়েছে। অ্যাপ পুনরায় চালু হচ্ছে...',
                [{ text: 'ঠিক আছে', onPress: () => restartApp() }],
                { cancelable: false }
              );
            } catch (error) {
              console.error('❌ Error during database clear:', error);
              setIsClearing(false);
              setClearingProgress(0);
              Alert.alert('ত্রুটি', `ডেটা মুছতে সমস্যা হয়েছে: ${error}`);
            }
          },
        },
      ]
    );
  };

  const restartApp = async () => {
    try {
      console.log('🔄 Attempting to restart app...');

      // Method 1: Try Expo Updates reload
      console.log('📱 Using Expo Updates reload...');
      await Updates.reloadAsync();
    } catch (error) {
      console.error('❌ Expo Updates reload failed:', error);

      try {
        // Method 3: Try BackHandler exit
        console.log('🚪 Using BackHandler.exitApp()...');
        BackHandler.exitApp();
      } catch (backHandlerError) {
        console.error('❌ BackHandler failed:', backHandlerError);

        // Method 4: Force app restart by clearing all state and navigating
        console.log('🔄 Using fallback restart method...');

        // Reset all state
        setIsClearing(false);
        setClearingProgress(0);

        // Clear navigation and go to home
        router.replace('/');

        // Force a complete app refresh by clearing cache
        setTimeout(() => {
          console.log('🔄 Reloading profile and refreshing app...');
          loadProfile();

          // Additional refresh trigger
          setTimeout(() => {
            console.log('🔄 Triggering additional refresh...');
            // Force component re-render
            setProfile(null);
            setTimeout(() => {
              loadProfile();
            }, 100);
          }, 500);
        }, 500);
      }
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      // Get current date for filename
      const currentDate = new Date().toISOString().split('T')[0];

      // Export data with progress tracking
      setExportProgress(25);
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1); // Export last 1 year of data
      const endDate = new Date();

      setExportProgress(50);
      const exportData = await exportTotalsData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      setExportProgress(75);

      // Create CSV content
      const csvContent = [
        'Customer,Type,Total Receivable,Total Payable,Net Balance',
        ...exportData.customers.map(
          (item: any) =>
            `${item.name},${item.customer_type},${item.total_receivable},${item.total_payable},${item.net_balance}`
        ),
      ].join('\n');

      // Create file
      const filename = `TallyKhata_Export_${currentDate}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      setExportProgress(100);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'আপনার TallyKhata ডেটা শেয়ার করুন',
        });
      } else {
        Alert.alert('সফল', `ডেটা এক্সপোর্ট করা হয়েছে: ${filename}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('ত্রুটি', 'ডেটা এক্সপোর্ট করতে সমস্যা হয়েছে');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };



  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'TallyKhata - ডিজিটাল খাতা অ্যাপ ডাউনলোড করুন! আপনার ব্যবসার হিসাব রাখুন সহজে।',
        title: 'TallyKhata অ্যাপ',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleRateApp = () => {
    Alert.alert('অ্যাপ রেটিং', 'আপনি কি TallyKhata অ্যাপ পছন্দ করেছেন? আমাদের ৫ স্টার রেটিং দিন!', [
      { text: 'পরে', style: 'cancel' },
      {
        text: 'রেটিং দিন',
        onPress: () => {
          // In a real app, this would open the app store
          Alert.alert('ধন্যবাদ', 'অ্যাপ স্টোর রেটিং শীঘ্রই উপলব্ধ হবে');
        },
      },
    ]);
  };

  const handleContactSupport = () => {
    Alert.alert('সাপোর্ট', 'কোন সমস্যা বা প্রশ্ন আছে?', [
      { text: 'বাতিল', style: 'cancel' },
      {
        text: 'ইমেইল পাঠান',
        onPress: () => {
          Linking.openURL('mailto:support@tallykhata.app?subject=TallyKhata Support');
        },
      },
    ]);
  };

  const getThemeDisplayName = (mode: string) => {
    switch (mode) {
      case 'light':
        return 'হালকা';
      case 'dark':
        return 'গাঢ়';
      case 'auto':
        return 'স্বয়ংক্রিয়';
      default:
        return 'স্বয়ংক্রিয়';
    }
  };

  const handleAbout = () => {
    router.push('/app-info');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.primary + 'DD']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}>
      <View style={styles.headerContent}>
        <View style={styles.profileSection}>
          <Avatar.Text
            size={90}
            label={profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            style={[styles.profileAvatar, { backgroundColor: colors.textInverse + '25' }]}
            labelStyle={[styles.profileAvatarText, { color: colors.textInverse }]}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.textInverse }]}>
              {profile?.name || 'ব্যবহারকারী'}
            </Text>
            {profile?.business_name && (
              <Text style={[styles.businessName, { color: colors.textInverse + 'CC' }]}>
                📊 {profile.business_name}
              </Text>
            )}
            <Text style={[styles.email, { color: colors.textInverse + 'AA' }]}>
              {profile?.email || profile?.phone || 'যোগাযোগের তথ্য নেই'}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    rightElement?: React.ReactNode,
    showDivider: boolean = true,
    iconColor?: string,
    badge?: string,
    disabled?: boolean
  ) => (
    <View key={title}>
      <TouchableOpacity
        style={[
          styles.settingItem,
          { backgroundColor: colors.surface },
          disabled && { opacity: 0.5 },
        ]}
        onPress={disabled ? undefined : onPress}
        activeOpacity={disabled ? 1 : 0.7}>
        <View style={styles.settingLeft}>
          <View
            style={[
              styles.settingIcon,
              { backgroundColor: (iconColor || colors.secondary) + '20' },
            ]}>
            <IconButton icon={icon} size={24} iconColor={iconColor || colors.secondary} />
          </View>
          <View style={styles.settingText}>
            <View style={styles.settingTitleRow}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
              {badge && (
                <Badge style={[styles.settingBadge, { backgroundColor: colors.primary }]}>
                  {badge}
                </Badge>
              )}
            </View>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          </View>
        </View>
        {rightElement && <View style={styles.settingRight}>{rightElement}</View>}
      </TouchableOpacity>
      {showDivider && <Divider style={[styles.divider, { backgroundColor: colors.border }]} />}
    </View>
  );

  return (
    <PageTransition>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderHeader()}

          <View style={styles.content}>


            {/* Profile Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}></Text>
              <Surface
                style={[styles.sectionCard, { backgroundColor: colors.surface }]}
                elevation={0}>
                {renderSettingItem(
                  'account-edit',
                  'প্রোফাইল সম্পাদনা করুন',
                  'নাম, ফোন, ইমেইল, ব্যবসার নাম পরিবর্তন করুন',
                  () => router.push('/profile-edit'),
                  <IconButton icon="chevron-right" size={24} iconColor={colors.textSecondary} />,
                  false,
                  colors.primary
                )}
              </Surface>
            </View>

            {/* Appearance & Preferences Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🎨 চেহারা ও পছন্দসমূহ
              </Text>
              <Surface
                style={[styles.sectionCard, { backgroundColor: colors.surface }]}
                elevation={0}>
                {renderSettingItem(
                  'theme-light-dark',
                  'থিম নির্বাচন',
                  `বর্তমান: ${getThemeDisplayName(currentThemeMode)}`,
                  () => setThemeMenuVisible(true),
                  <Menu
                    visible={themeMenuVisible}
                    onDismiss={() => setThemeMenuVisible(false)}
                    anchor={
                      <IconButton
                        icon="chevron-down"
                        size={24}
                        iconColor={colors.textSecondary}
                        onPress={() => setThemeMenuVisible(true)}
                      />
                    }>
                    <Menu.Item
                      onPress={() => {
                        setTheme('light');
                        setThemeMenuVisible(false);
                      }}
                      title="☀️ হালকা"
                    />
                    <Menu.Item
                      onPress={() => {
                        setTheme('dark');
                        setThemeMenuVisible(false);
                      }}
                      title="🌙 গাঢ়"
                    />
                    <Menu.Item
                      onPress={() => {
                        setTheme('auto');
                        setThemeMenuVisible(false);
                      }}
                      title="🔄 স্বয়ংক্রিয়"
                    />
                  </Menu>,
                  true,
                  colors.primary
                )}
                {renderSettingItem(
                  'bell-outline',
                  'বিজ্ঞপ্তি',
                  'পুশ নোটিফিকেশন সক্রিয় করুন',
                  () => {},
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    color={colors.primary}
                  />,
                  true,
                  colors.success
                )}
                {renderSettingItem(
                  'translate',
                  'ভাষা',
                  `বর্তমান: ${selectedLanguage}`,
                  () => setLanguageMenuVisible(true),
                  <Menu
                    visible={languageMenuVisible}
                    onDismiss={() => setLanguageMenuVisible(false)}
                    anchor={
                      <IconButton
                        icon="chevron-down"
                        size={24}
                        iconColor={colors.textSecondary}
                        onPress={() => setLanguageMenuVisible(true)}
                      />
                    }>
                    <Menu.Item
                      onPress={() => {
                        setSelectedLanguage('বাংলা');
                        setLanguageMenuVisible(false);
                      }}
                      title="🇧🇩 বাংলা"
                    />
                    <Menu.Item
                      onPress={() => {
                        setSelectedLanguage('English');
                        setLanguageMenuVisible(false);
                      }}
                      title="🇺🇸 English"
                      disabled={true}
                    />
                  </Menu>,
                  false,
                  colors.secondary,
                  selectedLanguage === 'বাংলা' ? 'ডিফল্ট' : undefined
                )}
              </Surface>
            </View>

            {/* Data Management Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>💾 ডেটা ব্যবস্থাপনা</Text>
              <Surface
                style={[styles.sectionCard, { backgroundColor: colors.surface }]}
                elevation={0}>
                {renderSettingItem(
                  'download',
                  'ডেটা রপ্তানি করুন',
                  'CSV ফাইল হিসাবে সব লেনদেনের তথ্য ডাউনলোড করুন',
                  handleExportData,
                  <IconButton icon="chevron-right" size={24} iconColor={colors.textSecondary} />,
                  true,
                  colors.primary,
                  'CSV'
                )}

                {renderSettingItem(
                  'delete-sweep',
                  'সব ডেটা মুছুন',
                  '⚠️ সব তথ্য স্থায়ীভাবে মুছে ফেলুন (অপরিবর্তনীয়)',
                  handleClearData,
                  <IconButton icon="chevron-right" size={24} iconColor={colors.error} />,
                  false,
                  colors.error,
                  'বিপজ্জনক'
                )}
              </Surface>
            </View>

            {/* Support & Community Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🤝 সাপোর্ট ও কমিউনিটি
              </Text>
              <Surface
                style={[styles.sectionCard, { backgroundColor: colors.surface }]}
                elevation={0}>
                {renderSettingItem(
                  'share-variant',
                  'অ্যাপ শেয়ার করুন',
                  'বন্ধুদের সাথে TallyKhata শেয়ার করুন',
                  handleShareApp,
                  <IconButton icon="chevron-right" size={24} iconColor={colors.textSecondary} />,
                  true,
                  colors.primary
                )}
                {renderSettingItem(
                  'star',
                  'অ্যাপ রেটিং দিন',
                  'আমাদের ৫ স্টার রেটিং দিন',
                  handleRateApp,
                  <IconButton icon="chevron-right" size={24} iconColor={colors.textSecondary} />,
                  true,
                  colors.warning
                )}
                {renderSettingItem(
                  'email-outline',
                  'সাপোর্ট যোগাযোগ',
                  'সমস্যা বা প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন',
                  handleContactSupport,
                  <IconButton icon="chevron-right" size={24} iconColor={colors.textSecondary} />,
                  false,
                  colors.secondary
                )}
              </Surface>
            </View>

            {/* App Information Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>ℹ️ অ্যাপ তথ্য</Text>
              <Surface
                style={[styles.sectionCard, { backgroundColor: colors.surface }]}
                elevation={0}>
                {renderSettingItem(
                  'information',
                  'TallyKhata সম্পর্কে',
                  'সংস্করণ ১.০.০ • অ্যাপ তথ্য ও ডেভেলপার',
                  handleAbout,
                  <IconButton icon="chevron-right" size={24} iconColor={colors.textSecondary} />,
                  false,
                  colors.primary,
                  'v1.0.0'
                )}
              </Surface>
            </View>

            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>

        {/* Loading Overlay for Data Clearing */}
        {isClearing && (
          <View style={styles.loadingOverlay}>
            <View style={[styles.loadingCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.loadingTitle, { color: colors.text }]}>
                ডেটা মুছে ফেলা হচ্ছে...
              </Text>
              <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>
                অনুগ্রহ করে অপেক্ষা করুন
              </Text>

              {/* Progress Bar */}
              <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: colors.primary,
                      width: `${clearingProgress}%`,
                    },
                  ]}
                />
              </View>

              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {Math.round(clearingProgress)}% সম্পন্ন
              </Text>
            </View>
          </View>
        )}

        {/* Loading Overlay for Data Export */}
        {isExporting && (
          <View style={styles.loadingOverlay}>
            <View style={[styles.loadingCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.loadingTitle, { color: colors.text }]}>
                ডেটা এক্সপোর্ট হচ্ছে...
              </Text>
              <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>
                CSV ফাইল তৈরি করা হচ্ছে
              </Text>

              {/* Progress Bar */}
              <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: colors.success,
                      width: `${exportProgress}%`,
                    },
                  ]}
                />
              </View>

              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {Math.round(exportProgress)}% সম্পন্ন
              </Text>
            </View>
          </View>
        )}
      </View>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 35,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
  },
  profileAvatar: {
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileAvatarText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  businessName: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  email: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  googleBadge: {
    marginTop: 4,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -25,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    minHeight: 72,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  settingBadge: {
    marginLeft: 8,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  settingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  settingRight: {
    marginLeft: 16,
  },
  googleSignInPrompt: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  googlePromptTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  googlePromptSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  googleSignInButton: {
    borderRadius: 12,
    elevation: 2,
  },
  divider: {
    marginHorizontal: 16,
  },
  bottomSpacing: {
    height: 100,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
    minWidth: 250,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.8,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
