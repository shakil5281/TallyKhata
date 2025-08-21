import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator as RNActivityIndicator,
} from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Avatar,
  Text,
  Card,
  Switch,
  List,
  Portal,
  Modal,
  Surface,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ProfileUpdateInput, getUserProfile, updateUserProfile, getDashboardStats } from '~/lib/db';
import { StatusBar } from 'expo-status-bar';
import { useToast } from '~/context/ToastContext';

export default function ProfileEditScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState<ProfileUpdateInput>({
    name: '',
    phone: '',
    email: '',
    business_name: '',
    address: '',
    currency: '৳',
    dark_mode: false,
    notifications_enabled: true,
    backup_enabled: true,
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      if (userProfile) {
        setFormData({
          name: userProfile.name,
          phone: userProfile.phone || '',
          email: userProfile.email || '',
          business_name: userProfile.business_name || '',
          address: userProfile.address || '',
          currency: userProfile.currency,
          dark_mode: userProfile.dark_mode,
          notifications_enabled: userProfile.notifications_enabled,
          backup_enabled: userProfile.backup_enabled,
        });
      } else {
        // If no profile exists, use default values
        setFormData({
          name: 'TallyKhata User',
          phone: '',
          email: '',
          business_name: '',
          address: '',
          currency: '৳',
          dark_mode: false,
          notifications_enabled: true,
          backup_enabled: true,
        });
      }
    } catch (_error) {
      console.error('Error loading profile:', _error);
      Alert.alert('Error', 'Failed to load profile. Using default values.');
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

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    // Validate email if provided
    if (formData.email && !validateEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate phone if provided
    if (formData.phone && !validatePhone(formData.phone)) {
      Alert.alert('Error', 'Please enter a valid phone number (01XXXXXXXXX)');
      return;
    }

    setSaving(true);
    try {
      console.log('Saving profile data:', formData);

      // Quick save for smooth UX
      const success = await updateUserProfile(formData);

      if (success) {
        // Navigate back to settings
        router.push('/');
        router.replace('/');

        // Show success toast after a brief delay
        setTimeout(() => {
          showToast('Profile updated successfully!', 'success', 2000);
        }, 300);
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'An unexpected error occurred while saving the profile.');
    } finally {
      setSaving(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^01[3-9]\d{8}$/;
    return phoneRegex.test(phone);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Appbar.Header style={{ backgroundColor: '#fe4c24' }}>
        <Appbar.BackAction
          color="white"
          onPress={() => {
            router.push('/');
            router.replace('/');
          }}
        />
        <Appbar.Content title="Edit Profile" titleStyle={{ color: 'white', fontWeight: 'bold' }} />
        <Appbar.Action
          icon={saving ? 'loading' : 'check'}
          color="white"
          onPress={handleSave}
          disabled={saving}
        />
      </Appbar.Header>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileHeader}>
            <TouchableOpacity onPress={() => setShowImageModal(true)}>
              <Avatar.Text
                size={100}
                label={formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                style={styles.avatar}
              />
              <View style={styles.cameraIcon}>
                <Avatar.Icon size={30} icon="camera" style={{ backgroundColor: '#fe4c24' }} />
              </View>
            </TouchableOpacity>

            <Text variant="headlineSmall" style={styles.welcomeText}>
              Welcome back!
            </Text>

            {stats && (
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text variant="titleMedium" style={styles.statNumber}>
                    {stats.totalCustomers}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Customers
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="titleMedium" style={styles.statNumber}>
                    {stats.totalTransactions}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Transactions
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="titleMedium" style={[styles.statNumber, { color: '#4CAF50' }]}>
                    ৳{stats.netBalance?.toFixed(0)}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Net Balance
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Personal Information */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Personal Information
            </Text>

            <TextInput
              label="Full Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              mode="outlined"
              style={styles.input}
              error={!formData.name?.trim()}
            />

            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="e.g. 01712345678"
              error={formData.phone ? !validatePhone(formData.phone) : false}
            />

            <TextInput
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="e.g. john@example.com"
              error={formData.email ? !validateEmail(formData.email) : false}
            />
          </Card.Content>
        </Card>

        {/* Business Information */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Business Information
            </Text>

            <TextInput
              label="Business Name"
              value={formData.business_name}
              onChangeText={(text) => setFormData({ ...formData, business_name: text })}
              mode="outlined"
              style={styles.input}
              placeholder="Your business name"
            />

            <TextInput
              label="Business Address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="Your business address"
            />

            <TextInput
              label="Currency Symbol"
              value={formData.currency}
              onChangeText={(text) => setFormData({ ...formData, currency: text })}
              mode="outlined"
              style={styles.input}
              placeholder="e.g. ৳, $, £"
            />
          </Card.Content>
        </Card>

        {/* App Preferences */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              App Preferences
            </Text>

            <List.Item
              title="Dark Mode"
              description="Enable dark theme"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={formData.dark_mode}
                  onValueChange={(value) => setFormData({ ...formData, dark_mode: value })}
                  color="#fe4c24"
                />
              )}
            />

            <List.Item
              title="Notifications"
              description="Receive app notifications"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={formData.notifications_enabled}
                  onValueChange={(value) =>
                    setFormData({ ...formData, notifications_enabled: value })
                  }
                  color="#fe4c24"
                />
              )}
            />

            <List.Item
              title="Auto Backup"
              description="Automatically backup your data"
              left={(props) => <List.Icon {...props} icon="backup-restore" />}
              right={() => (
                <Switch
                  value={formData.backup_enabled}
                  onValueChange={(value) => setFormData({ ...formData, backup_enabled: value })}
                  color="#fe4c24"
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Save Button */}
        <Card style={styles.saveCard}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={saving || !formData.name?.trim()}
              style={styles.saveButton}
              contentStyle={styles.saveButtonContent}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Card.Content>
        </Card>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Loading Overlay */}
      <Portal>
        <Modal
          visible={saving}
          dismissable={false}
          contentContainerStyle={styles.loadingModalContainer}>
          <Surface style={styles.loadingModalContent}>
            <RNActivityIndicator size="large" color="#fe4c24" style={styles.loadingSpinner} />
            <Text variant="titleMedium" style={styles.loadingTitle}>
              Updating Profile
            </Text>
            <Text variant="bodyMedium" style={styles.loadingMessage}>
              Please wait while we save your changes...
            </Text>
          </Surface>
        </Modal>
      </Portal>

      {/* Image Selection Modal */}
      <Portal>
        <Modal
          visible={showImageModal}
          onDismiss={() => setShowImageModal(false)}
          contentContainerStyle={styles.modalContainer}>
          <Surface style={styles.modalContent}>
            <Text variant="titleMedium" style={styles.modalTitle}>
              Profile Picture
            </Text>
            <Text variant="bodyMedium" style={styles.modalDescription}>
              Profile picture feature will be available in the next update
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowImageModal(false)}
              style={styles.modalButton}>
              OK
            </Button>
          </Surface>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    margin: 16,
    marginBottom: 8,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: '#fe4c24',
    marginBottom: 10,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
  },
  welcomeText: {
    marginBottom: 20,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#fe4c24',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  sectionCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  saveCard: {
    margin: 16,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#fe4c24',
    borderRadius: 8,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  modalDescription: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalButton: {
    backgroundColor: '#fe4c24',
  },
  loadingModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingModalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 16,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingTitle: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingMessage: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
