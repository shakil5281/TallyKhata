import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator as RNActivityIndicator,
  Text,
} from 'react-native';
import { TextInput, Button, Avatar, Switch, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ProfileUpdateInput, getUserProfile, updateUserProfile, getDashboardStats } from '~/lib/db';
import { useToast } from '~/context/ToastContext';
import { useTheme } from '~/context/ThemeContext';
import PageTransition from '../../components/PageTransition';

export default function ProfileEditScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const { colors } = theme.custom;

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
      Alert.alert('ত্রুটি', 'প্রোফাইল লোড করতে ব্যর্থ। ডিফল্ট মান ব্যবহার করা হচ্ছে।');
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
      Alert.alert('ত্রুটি', 'নাম প্রয়োজন');
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile(formData);
      showToast('প্রোফাইল সফলভাবে আপডেট হয়েছে!', 'success');

      // Small delay to show toast
      setTimeout(() => {
        router.back();
      }, 100);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('ত্রুটি', 'প্রোফাইল আপডেট করতে ব্যর্থ। আবার চেষ্টা করুন।');
    } finally {
      setSaving(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress} activeOpacity={0.7}>
        <IconButton icon="arrow-left" size={24} iconColor={colors.textInverse} />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: colors.textInverse }]}>
          প্রোফাইল সম্পাদনা করুন
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textInverse }]}>
          আপনার ব্যবসার তথ্য আপডেট করুন
        </Text>
      </View>
    </View>
  );

  const renderProfileInfo = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>প্রোফাইল তথ্য</Text>

      <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={60}
            label={formData.name?.charAt(0).toUpperCase() || 'U'}
            style={[styles.profileAvatar, { backgroundColor: colors.primary }]}
            labelStyle={[styles.avatarText, { color: colors.textInverse }]}
          />
          <View style={styles.profileDetails}>
            <Text style={[styles.profileName, { color: colors.text }]}>{formData.name}</Text>
            <Text style={[styles.profileBusiness, { color: colors.textSecondary }]}>
              {formData.business_name || 'ব্যবসার নাম নেই'}
            </Text>
          </View>
        </View>

        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {stats.totalCustomers}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>গ্রাহক</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {stats.totalTransactions}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>লেনদেন</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.info }]}>
                {formData.currency}
                {stats.totalBalance}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>ব্যালেন্স</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>মূল তথ্য</Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>নাম *</Text>
        <TextInput
          mode="outlined"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="আপনার নাম লিখুন"
          style={[
            styles.textInput,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          outlineStyle={[styles.inputOutline, { borderColor: colors.border }]}
          contentStyle={[styles.inputContent, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>ফোন নম্বর</Text>
        <TextInput
          mode="outlined"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          placeholder="ফোন নম্বর লিখুন"
          keyboardType="phone-pad"
          style={[
            styles.textInput,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          outlineStyle={[styles.inputOutline, { borderColor: colors.border }]}
          contentStyle={[styles.inputContent, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>ইমেইল</Text>
        <TextInput
          mode="outlined"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder="ইমেইল লিখুন"
          keyboardType="email-address"
          style={[
            styles.textInput,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          outlineStyle={[styles.inputOutline, { borderColor: colors.border }]}
          contentStyle={[styles.inputContent, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
        />
      </View>
    </View>
  );

  const renderBusinessInfo = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>ব্যবসার তথ্য</Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>ব্যবসার নাম</Text>
        <TextInput
          mode="outlined"
          value={formData.business_name}
          onChangeText={(text) => setFormData({ ...formData, business_name: text })}
          placeholder="ব্যবসার নাম লিখুন"
          style={[
            styles.textInput,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          outlineStyle={[styles.inputOutline, { borderColor: colors.border }]}
          contentStyle={[styles.inputContent, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>ঠিকানা</Text>
        <TextInput
          mode="outlined"
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          placeholder="ঠিকানা লিখুন"
          multiline
          numberOfLines={3}
          style={[
            styles.textInput,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          outlineStyle={[styles.inputOutline, { borderColor: colors.border }]}
          contentStyle={[styles.inputContent, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>মুদ্রা</Text>
        <TextInput
          mode="outlined"
          value={formData.currency}
          onChangeText={(text) => setFormData({ ...formData, currency: text })}
          placeholder="৳"
          style={[
            styles.textInput,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          outlineStyle={[styles.inputOutline, { borderColor: colors.border }]}
          contentStyle={[styles.inputContent, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
        />
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>সেটিংস</Text>

      <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>ডার্ক মোড</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              অ্যাপের থিম পরিবর্তন করুন
            </Text>
          </View>
          <Switch
            value={formData.dark_mode}
            onValueChange={(value) => setFormData({ ...formData, dark_mode: value })}
            color={colors.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>বিজ্ঞপ্তি</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              বিজ্ঞপ্তি সক্রিয় করুন
            </Text>
          </View>
          <Switch
            value={formData.notifications_enabled}
            onValueChange={(value) => setFormData({ ...formData, notifications_enabled: value })}
            color={colors.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>স্বয়ংক্রিয় ব্যাকআপ</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              ডেটা স্বয়ংক্রিয়ভাবে ব্যাকআপ করুন
            </Text>
          </View>
          <Switch
            value={formData.backup_enabled}
            onValueChange={(value) => setFormData({ ...formData, backup_enabled: value })}
            color={colors.primary}
          />
        </View>
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        contentStyle={styles.saveButtonContent}
        labelStyle={[styles.saveButtonText, { color: colors.textInverse }]}>
        {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
      </Button>

      <TouchableOpacity
        style={[styles.cancelButton, { borderColor: colors.border }]}
        onPress={handleBackPress}
        activeOpacity={0.7}>
        <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>বাতিল</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <RNActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <PageTransition>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {renderProfileInfo()}
          {renderBasicInfo()}
          {renderBusinessInfo()}
          {renderSettings()}
        </ScrollView>

        {renderActions()}
      </View>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileBusiness: {
    fontSize: 16,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
  },
  inputOutline: {
    borderRadius: 10,
  },
  inputContent: {
    fontSize: 16,
  },
  settingsCard: {
    borderRadius: 12,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    borderRadius: 25,
    marginBottom: 12,
    elevation: 2,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
});
