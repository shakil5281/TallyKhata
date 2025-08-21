import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity, BackHandler } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getUserProfile, clearDatabase } from '~/lib/db';
import { Surface, IconButton, Avatar, Switch, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Updates from 'expo-updates';
import PageTransition from '../../components/PageTransition';
import { useTheme } from '~/context/ThemeContext';

export default function SettingsScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [clearingProgress, setClearingProgress] = useState(0);
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
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
              await new Promise(resolve => setTimeout(resolve, 1000));
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

  const handleExportData = () => {
    Alert.alert('রপ্তানি', 'এই বৈশিষ্ট্যটি শীঘ্রই আসবে');
  };

  const handleBackupData = () => {
    Alert.alert('ব্যাকআপ', 'এই বৈশিষ্ট্যটি শীঘ্রই আসবে');
  };

  const handleRestoreData = () => {
    Alert.alert('পুনরুদ্ধার', 'এই বৈশিষ্ট্যটি শীঘ্রই আসবে');
  };

  const handleAbout = () => {
    router.push('/app-info');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}>
      <View style={styles.headerContent}>
        <View style={styles.profileSection}>
          <Avatar.Text
            size={80}
            label={profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            style={[styles.profileAvatar, { backgroundColor: colors.textInverse + '20' }]}
            labelStyle={[styles.profileAvatarText, { color: colors.textInverse }]}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.textInverse }]}>
              {profile?.name || 'ব্যবহারকারী'}
            </Text>
            {profile?.business_name && (
              <Text style={[styles.businessName, { color: colors.textInverse + '80' }]}>
                {profile.business_name}
              </Text>
            )}
            <Text style={[styles.email, { color: colors.textInverse + '80' }]}>
              {profile?.email || 'ইমেইল নেই'}
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
    showDivider: boolean = true
  ) => (
    <View key={title}>
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: colors.surface }]}
        onPress={onPress}
        activeOpacity={0.7}>
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: colors.secondary + '20' }]}>
            <IconButton icon={icon} size={24} iconColor={colors.secondary} />
          </View>
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
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
              <Surface style={[styles.sectionCard, { backgroundColor: colors.surface }]} elevation={0}>
                {renderSettingItem(
                  'account-edit',
                  'প্রোফাইল সম্পাদনা করুন',
                  'নাম, ফোন, ইমেইল পরিবর্তন করুন',
                  () => router.push('/profile-edit'),
                  <IconButton icon="chevron-right" size={24} iconColor={colors.textSecondary} />,
                  false
                )}
              </Surface>
            </View>

            {/* Preferences Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>পছন্দসমূহ</Text>
              <Surface style={[styles.sectionCard, { backgroundColor: colors.surface }]} elevation={0}>
                {renderSettingItem(
                  'theme-light-dark',
                  'ডার্ক মোড',
                  'অ্যাপের থিম পরিবর্তন করুন',
                  () => {},
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    color={colors.primary}
                  />,
                  true
                )}
                {renderSettingItem(
                  'bell-outline',
                  'বিজ্ঞপ্তি',
                  'বিজ্ঞপ্তি সক্রিয় করুন',
                  () => {},
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    color={colors.primary}
                  />,
                  true
                )}
                {renderSettingItem(
                  'cloud-upload-outline',
                  'স্বয়ংক্রিয় ব্যাকআপ',
                  'ডেটা স্বয়ংক্রিয়ভাবে ব্যাকআপ করুন',
                  () => {},
                  <Switch
                    value={autoBackupEnabled}
                    onValueChange={setAutoBackupEnabled}
                    color={colors.primary}
                  />,
                  false
                )}
              </Surface>
            </View>

            {/* Data Management Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>ডেটা ব্যবস্থাপনা</Text>
              <Surface style={[styles.sectionCard, { backgroundColor: colors.surface }]} elevation={0}>
                {renderSettingItem(
                  'download',
                  'ডেটা রপ্তানি করুন',
                  'আপনার ডেটা ফাইল হিসাবে ডাউনলোড করুন',
                  handleExportData,
                  <IconButton icon="chevron-right" size={24} iconColor={colors.textSecondary} />,
                  true
                )}
                {renderSettingItem(
                  'cloud-upload',
                  'ডেটা ব্যাকআপ করুন',
                  'ডেটা ক্লাউডে ব্যাকআপ করুন',
                  handleBackupData,
                  <IconButton icon="chevron-right" size={24} iconColor={colors.textSecondary} />,
                  true
                )}
                {renderSettingItem(
                  'cloud-download',
                  'ডেটা পুনরুদ্ধার করুন',
                  'ব্যাকআপ থেকে ডেটা পুনরুদ্ধার করুন',
                  handleRestoreData,
                  <IconButton icon="chevron-right" size={24} iconColor={colors.textSecondary} />,
                  true
                )}
                {renderSettingItem(
                  'delete-sweep',
                  'সব ডেটা মুছুন',
                  'সব ডেটা স্থায়ীভাবে মুছে ফেলুন',
                  handleClearData,
                  <IconButton icon="chevron-right" size={24} iconColor={colors.error} />,
                  false
                )}
              </Surface>
            </View>

            {/* App Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>অ্যাপ</Text>
              <Surface style={[styles.sectionCard, { backgroundColor: colors.surface }]} elevation={0}>
                {renderSettingItem(
                  'information',
                  'টালিখাতা সম্পর্কে',
                  'সংস্করণ ১.০.০ • অ্যাপ সম্পর্কে জানুন',
                  handleAbout,
                  <IconButton icon="chevron-right" size={24} iconColor={colors.textSecondary} />,
                  false
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
                      width: `${clearingProgress}%` 
                    }
                  ]} 
                />
              </View>
              
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {Math.round(clearingProgress)}% সম্পন্ন
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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
  },
  profileAvatar: {
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  businessName: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  settingRight: {
    marginLeft: 16,
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
