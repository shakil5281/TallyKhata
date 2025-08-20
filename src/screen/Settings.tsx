import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Share,
  Linking,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  Card,
  Button,
  Text,
  Avatar,
  IconButton,
  Switch,
  Portal,
  List,
  Divider,
  Modal,
  Surface,
} from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  getUserProfile,
  updateUserProfile,
  getDashboardStats,
  clearAllDatabaseData,
  UserProfile,
} from '~/lib/db';
import { exportAllData } from '~/lib/exportData';
import { StatusBar } from 'expo-status-bar';
import PageTransition from '../../components/PageTransition';
// import { Updates } from 'expo-updates'; // Not available in development

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  type: 'toggle' | 'action';
  value?: boolean;
  icon?: string;
  onPress?: () => void;
}

export default function SettingsComponent() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearingProgress, setClearingProgress] = useState(0);
  const [clearingMessage, setClearingMessage] = useState('Preparing...');

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  // Refresh data when screen comes into focus (e.g., coming back from profile edit)
  useFocusEffect(
    useCallback(() => {
      // Only refresh if not initial loading
      if (!loading) {
        // Quick refresh without loading state for smoother UX
        loadProfile();
        loadStats();
      }
    }, [loading])
  );

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch (_error) {
      console.error('Error loading profile:', _error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
    } catch (_error) {
      console.error('Error loading stats:', _error);
    }
  };

  const handleToggle = async (key: string, value: boolean) => {
    if (profile) {
      const updates = { [key]: value };
      const success = await updateUserProfile(updates);

      if (success) {
        setProfile({ ...profile, [key]: value });
      }
    }
  };



  const handleClearDatabase = () => {
    setShowClearModal(true);
  };

  const confirmClearData = async () => {
    setClearing(true);
    setClearingProgress(0);
    setClearingMessage('Initializing data clearing...');
    const startTime = Date.now();

    try {
      // Progress simulation for better UX
      const updateProgress = (progress: number, message: string) => {
        setClearingProgress(progress);
        setClearingMessage(message);
      };

      // Step 1: Prepare for clearing
      updateProgress(10, 'Preparing database...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 2: Start clearing
      updateProgress(25, 'Clearing customer data...');
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 3: Clear transactions
      updateProgress(50, 'Clearing transaction records...');
      const success = await clearAllDatabaseData();

      if (success) {
        // Step 4: Finalizing
        updateProgress(75, 'Cleaning up database...');
        await new Promise((resolve) => setTimeout(resolve, 700));

        updateProgress(90, 'Finalizing reset...');
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Ensure minimum 5 seconds total loading time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 5000 - elapsedTime);

        if (remainingTime > 0) {
          updateProgress(95, 'Completing process...');
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }

        updateProgress(100, 'Reset complete!');
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Close modal and stop loading
        setShowClearModal(false);
        setClearing(false);

        // Show success message with automatic app restart
        Alert.alert(
          '✅ Data Cleared Successfully',
          'All data has been cleared successfully. The app will restart automatically with a fresh database.',
          [
            {
              text: 'Restart Now',
              onPress: () => {
                performFullAppReset();
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        // Ensure minimum loading time even on failure
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 2000 - elapsedTime);

        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }

        setClearing(false);
        Alert.alert(
          '❌ Error',
          'Failed to clear database. Please check your storage permissions and try again.',
          [
            { text: 'Try Again', onPress: confirmClearData },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch (_error) {
      // Ensure minimum loading time even on error
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 2000 - elapsedTime);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      setClearing(false);
      console.error('Error clearing database:', _error);

      let errorMessage = 'An unexpected error occurred while clearing the database.';
      if (_error instanceof Error) {
        errorMessage = `Database error: ${_error.message}`;
      }

      Alert.alert('❌ Critical Error', errorMessage, [
        { text: 'Retry', onPress: confirmClearData },
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report Issue',
          onPress: () => {
            // You could add error reporting here
            console.log('Error details:', _error);
          },
        },
      ]);
    }
  };

  const performFullAppReset = async () => {
    try {
      // Reset navigation to home
      router.replace('/');

      // Wait a moment for navigation
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Reload all data
      await Promise.all([loadProfile(), loadStats()]);

      // Show completion toast
      setTimeout(() => {
        Alert.alert(
          '🎉 App Reset Complete',
          'TallyKhata has been reset to a fresh state. You can now start adding your customers and transactions.',
          [{ text: 'Get Started', style: 'default' }]
        );
      }, 500);
    } catch (_error) {
      console.error('Error during app reset:', _error);
      Alert.alert(
        '⚠️ Reset Warning',
        'Data was cleared but app reload encountered issues. Please restart the app manually.',
        [{ text: 'OK' }]
      );
    }
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message:
          'Check out TallyKhata - A simple and powerful business accounting app for managing customers and transactions!',
        title: 'TallyKhata App',
      });
    } catch (_error) {
      console.error('Error sharing app:', _error);
    }
  };

  const contactSupport = () => {
    Alert.alert('Contact Support', "Choose how you'd like to contact us:", [
      {
        text: 'Email',
        onPress: () => {
          Linking.openURL('mailto:support@tallykhata.com?subject=TallyKhata Support');
        },
      },
      {
        text: 'Phone',
        onPress: () => {
          Linking.openURL('tel:+8801234567890');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const rateApp = () => {
    const url =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/app/tallykhata'
        : 'https://play.google.com/store/apps/details?id=com.tallykhata';

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open app store');
    });
  };

  const handleExportWithTimestamp = async (format: 'csv' | 'json') => {
    try {
      await exportAllData();
      Alert.alert('Success', `Data exported successfully!`);
    } catch {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const settingItems: SettingItem[] = [
    {
      id: 'editProfile',
      title: 'Edit Profile',
      description: 'Update your personal information',
      type: 'action',
      icon: 'account-edit',
      onPress: () => router.push('/profile-edit' as any),
    },
    {
      id: 'darkMode',
      title: 'Dark Mode',
      description: 'Enable dark theme',
      type: 'toggle',
      icon: 'theme-light-dark',
      value: profile?.dark_mode || false,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Receive app notifications',
      type: 'toggle',
      icon: 'bell',
      value: profile?.notifications_enabled || true,
    },
    {
      id: 'backup',
      title: 'Auto Backup',
      description: 'Automatically backup your data',
      type: 'toggle',
      icon: 'backup-restore',
      value: profile?.backup_enabled || true,
    },
    {
      id: 'exportCSV',
      title: 'Export as CSV',
      description: 'Download spreadsheet format',
      type: 'action',
      icon: 'file-table',
      onPress: () => handleExportWithTimestamp('csv'),
    },
    {
      id: 'exportJSON',
      title: 'Export as JSON',
      description: 'Download JSON format',
      type: 'action',
      icon: 'code-json',
      onPress: () => handleExportWithTimestamp('json'),
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      description: 'Read our privacy policy',
      type: 'action',
      icon: 'shield-account',
      onPress: () => Alert.alert('Privacy Policy', 'Privacy policy coming soon'),
    },
    {
      id: 'shareApp',
      title: 'Share App',
      description: 'Tell friends about TallyKhata',
      type: 'action',
      icon: 'share',
      onPress: shareApp,
    },
    {
      id: 'rateApp',
      title: 'Rate App',
      description: 'Leave a review on the app store',
      type: 'action',
      icon: 'star',
      onPress: rateApp,
    },
    {
      id: 'support',
      title: 'Support',
      description: 'Contact us for help',
      type: 'action',
      icon: 'help-circle',
      onPress: contactSupport,
    },
    {
      id: 'clearData',
      title: 'Clear All Data',
      description: '⚠️ Delete all data and reset app',
      type: 'action',
      icon: 'delete-forever',
      onPress: handleClearDatabase,
    },
    {
      id: 'appInfo',
      title: 'App Information',
      description: 'Version 1.0.0 - App Information',
      type: 'action',
      icon: 'information',
      onPress: () => router.push('/app-info' as any),
    },
  ];

  const onToggle = async (item: SettingItem) => {
    if (item.id === 'darkMode') {
      await handleToggle('dark_mode', !profile?.dark_mode);
    } else if (item.id === 'notifications') {
      await handleToggle('notifications_enabled', !profile?.notifications_enabled);
    } else if (item.id === 'backup') {
      await handleToggle('backup_enabled', !profile?.backup_enabled);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <PageTransition>
      <StatusBar style="light" />
      <ScrollView className="flex-1 bg-gray-50">
        <View className="">
          {/* Profile Header */}
          <Card
            style={{ backgroundColor: '#fe4c24', paddingTop: 50 }}
            className="mb-6 rounded-b-3xl">
            <Card.Content className="items-center py-6">
              <View>
                <Avatar.Text
                  size={80}
                  label={profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
                <IconButton
                  icon="pencil"
                  size={20}
                  iconColor="white"
                  onPress={() => router.push('/profile-edit' as any)}
                  style={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    backgroundColor: '#fe4c24',
                    margin: 0,
                  }}
                />
              </View>

              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }} className="mt-4">
                {profile?.name || 'TallyKhata User'}
              </Text>

              <Text style={{ color: 'rgba(255,255,255,0.8)' }} className="mt-1">
                {profile?.business_name || profile?.phone || 'Manage your business with ease'}
              </Text>

              {/* Quick Stats */}
              {stats && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    width: '100%',
                    marginTop: 20,
                    paddingTop: 15,
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255,255,255,0.2)',
                  }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                      {stats.totalCustomers}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Customers</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                      {stats.totalTransactions}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                      Transactions
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                      {profile?.currency}
                      {Math.abs(stats.netBalance || 0).toFixed(0)}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Balance</Text>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Settings List */}
          <Card className="mx-4 mb-6 rounded-2xl bg-white">
            {settingItems.map((item, idx) => (
              <View key={item.id}>
                {item.type === 'toggle' ? (
                  <List.Item
                    title={item.title}
                    description={item.description}
                    left={(props) =>
                      item.icon ? <List.Icon {...props} icon={item.icon} color="#fe4c24" /> : null
                    }
                    right={() => (
                      <Switch
                        value={item.value}
                        onValueChange={() => onToggle(item)}
                        color="#fe4c24"
                      />
                    )}
                    className="bg-white"
                  />
                ) : (
                  <List.Item
                    title={item.title}
                    description={item.description}
                    onPress={item.onPress}
                    className="bg-white"
                    left={(props) =>
                      item.icon ? <List.Icon {...props} icon={item.icon} color="#fe4c24" /> : null
                    }
                    right={(props) => <List.Icon {...props} icon="chevron-right" color="#ccc" />}
                  />
                )}
                {idx < settingItems.length - 1 && <Divider style={{ marginLeft: 56 }} />}
              </View>
            ))}
          </Card>

          {/* App Info */}
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 12 }}>TallyKhata v1.0.0</Text>
            <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
              Made with ❤️ for small businesses
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Custom Clear Data Confirmation Modal */}
      <Portal>
        <Modal visible={showClearModal} onDismiss={() => setShowClearModal(false)}>
          <View style={styles.modalContainer}>
            <Surface style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <IconButton
                  icon="alert-circle"
                  size={48}
                  iconColor="#F44336"
                  style={styles.warningIcon}
                />
                <Text style={styles.modalTitle}>Clear All Data</Text>
                <Text style={styles.modalSubtitle}>This action cannot be undone</Text>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.warningText}>
                  ⚠️ WARNING: This will permanently delete ALL your data including:
                </Text>

                <View style={styles.dataList}>
                  <Text style={styles.dataItem}>
                    • All customers ({stats?.totalCustomers || 0})
                  </Text>
                  <Text style={styles.dataItem}>
                    • All transactions ({stats?.totalTransactions || 0})
                  </Text>
                  <Text style={styles.dataItem}>• Profile information</Text>
                  <Text style={styles.dataItem}>• App settings and preferences</Text>
                </View>

                <Surface style={styles.dangerBox}>
                  <Text style={styles.dangerText}>
                    💡 Consider exporting your data first as a backup before proceeding.
                  </Text>
                </Surface>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowClearModal(false)}
                  style={styles.cancelButton}
                  labelStyle={styles.cancelButtonText}
                  disabled={clearing}>
                  Cancel
                </Button>

                <Button
                  mode="contained"
                  onPress={confirmClearData}
                  style={styles.confirmButton}
                  labelStyle={styles.confirmButtonText}
                  loading={clearing}
                  disabled={clearing}>
                  {clearing ? `${clearingProgress}% Complete` : 'Clear All Data'}
                </Button>
              </View>

              {/* Progress Section - Only show when clearing */}
              {clearing && (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Clearing Data...</Text>
                    <Text style={styles.progressPercent}>{clearingProgress}%</Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${clearingProgress}%` }]} />
                  </View>

                  {/* Current Message */}
                  <Text style={styles.progressMessage}>{clearingMessage}</Text>
                </View>
              )}
            </Surface>
          </View>
        </Modal>
      </Portal>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 0,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  warningIcon: {
    margin: 0,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  warningText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    fontWeight: '500',
  },
  dataList: {
    marginBottom: 16,
  },
  dataItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    paddingLeft: 8,
  },
  dangerBox: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  dangerText: {
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#F44336',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fe4c24',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fe4c24',
    borderRadius: 4,
  },
  progressMessage: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
