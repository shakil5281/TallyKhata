import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Button,
  TextInput,
  IconButton,
  ActivityIndicator as RNActivityIndicator,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { addTransaction, getCustomerTransactions, getCustomers, getUserProfile } from '~/lib/db';
import PageTransition from '../../components/PageTransition';
import { useToast } from '~/context/ToastContext';
import { useTheme } from '~/context/ThemeContext';

export default function AddTransactionScreen() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [customer, setCustomer] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<any>({});
  const { id, transactionId } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const { colors } = theme.custom;

  const validateForm = () => {
    const newErrors: any = {};

    if (!amount.trim()) {
      newErrors.amount = 'টাকার পরিমাণ প্রয়োজন';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'সঠিক টাকার পরিমাণ দিন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleSaveTransaction = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      if (transactionId) {
        // Edit existing transaction
        // (You would add your update logic here)
        showToast('লেনদেন সফলভাবে আপডেট হয়েছে!', 'success');
      } else {
        await addTransaction(Number(id), type, parseFloat(amount), note);
        showToast('লেনদেন সফলভাবে যোগ হয়েছে!', 'success');
      }

      // Small delay to show toast, then navigate back to home
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('ত্রুটি', 'লেনদেন সংরক্ষণ করতে ব্যর্থ। আবার চেষ্টা করুন।');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersResult, profileResult] = await Promise.all([
          getCustomers(),
          getUserProfile(),
        ]);

        const foundCustomer = customersResult.find((c: any) => c.id === Number(id));
        setCustomer(foundCustomer);
        setProfile(profileResult);

        if (transactionId) {
          // Load existing transaction data for editing
          // You would implement this based on your needs
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, transactionId]);

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        activeOpacity={0.7}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.textInverse}
        />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: colors.textInverse }]}>
          নতুন লেনদেন যোগ করুন
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textInverse }]}>
          {customer?.name || 'গ্রাহক'} এর জন্য নতুন লেনদেন
        </Text>
      </View>
    </View>
  );

  const renderCustomerInfo = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        গ্রাহকের তথ্য
      </Text>
      
      {customer && (
        <View style={[styles.customerCard, { backgroundColor: colors.surface }]}>
          <View style={styles.customerInfo}>
            <View style={[styles.customerAvatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.textInverse }]}>
                {customer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.customerDetails}>
              <Text style={[styles.customerName, { color: colors.text }]}>
                {customer.name}
              </Text>
              <Text style={[styles.customerPhone, { color: colors.textSecondary }]}>
                {customer.phone || 'ফোন নম্বর নেই'}
              </Text>
              <Text style={[styles.customerType, { color: colors.textSecondary }]}>
                {customer.type === 'Customer' ? 'গ্রাহক' : 'সরবরাহকারী'}
              </Text>
            </View>
          </View>
          
          <View style={styles.balanceInfo}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
              বর্তমান ব্যালেন্স
            </Text>
            <Text
              style={[
                styles.balanceAmount,
                {
                  color: customer.total_balance >= 0 ? colors.success : colors.error,
                },
              ]}>
              {customer.total_balance >= 0 ? '+' : ''}{customer.total_balance}৳
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderTransactionType = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        লেনদেনের ধরন
      </Text>
      
      <View style={styles.typeButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            {
              backgroundColor: type === 'credit' ? colors.success : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setType('credit')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.typeButtonText,
              {
                color: type === 'credit' ? colors.textInverse : colors.text,
              },
            ]}>
            পাওনা (+)
          </Text>
          <Text
            style={[
              styles.typeDescription,
              {
                color: type === 'credit' ? colors.textInverse + '80' : colors.textSecondary,
              },
            ]}>
            গ্রাহক থেকে টাকা পাবেন
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.typeButton,
            {
              backgroundColor: type === 'debit' ? colors.error : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setType('debit')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.typeButtonText,
              {
                color: type === 'debit' ? colors.textInverse : colors.text,
              },
            ]}>
            দেনা (-)
          </Text>
          <Text
            style={[
              styles.typeDescription,
              {
                color: type === 'debit' ? colors.textInverse + '80' : colors.textSecondary,
              },
            ]}>
            গ্রাহককে টাকা দেবেন
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTransactionForm = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        লেনদেনের বিবরণ
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          টাকার পরিমাণ *
        </Text>
        <TextInput
          mode="outlined"
          value={amount}
          onChangeText={setAmount}
          placeholder="টাকার পরিমাণ লিখুন"
          keyboardType="numeric"
          style={[
            styles.textInput,
            {
              backgroundColor: colors.surface,
              borderColor: errors.amount ? colors.error : colors.border,
            },
          ]}
          outlineStyle={[
            styles.inputOutline,
            { borderColor: errors.amount ? colors.error : colors.border },
          ]}
          contentStyle={[styles.inputContent, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
          error={!!errors.amount}
          left={<TextInput.Icon icon="currency-bdt" />}
        />
        {errors.amount && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.amount}
          </Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          নোট (ঐচ্ছিক)
        </Text>
        <TextInput
          mode="outlined"
          value={note}
          onChangeText={setNote}
          placeholder="লেনদেনের কারণ বা নোট লিখুন"
          multiline
          numberOfLines={3}
          style={[
            styles.textInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          outlineStyle={[
            styles.inputOutline,
            { borderColor: colors.border },
          ]}
          contentStyle={[styles.inputContent, { color: colors.text }]}
          placeholderTextColor={colors.textSecondary}
        />
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <Button
        mode="contained"
        onPress={handleSaveTransaction}
        loading={saving}
        disabled={saving}
        style={[
          styles.saveButton,
          { backgroundColor: colors.primary },
        ]}
        contentStyle={styles.saveButtonContent}
        labelStyle={[styles.saveButtonText, { color: colors.textInverse }]}>
        {saving ? 'সংরক্ষণ হচ্ছে...' : 'লেনদেন সংরক্ষণ করুন'}
      </Button>
      
      <TouchableOpacity
        style={[
          styles.cancelButton,
          { borderColor: colors.border },
        ]}
        onPress={handleBackPress}
        activeOpacity={0.7}>
        <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
          বাতিল
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <RNActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          লোড হচ্ছে...
        </Text>
      </View>
    );
  }

  return (
    <PageTransition>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {renderCustomerInfo()}
            {renderTransactionType()}
            {renderTransactionForm()}
          </ScrollView>
        </KeyboardAvoidingView>
        
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
  keyboardContainer: {
    flex: 1,
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
  customerCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  customerType: {
    fontSize: 12,
    opacity: 0.7,
  },
  balanceInfo: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 12,
    textAlign: 'center',
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
  errorText: {
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
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
