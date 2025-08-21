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
  Surface,
  IconButton,
  Portal,
  Modal,
  ActivityIndicator as RNActivityIndicator,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { addTransaction, getCustomerTransactions, getCustomers, getUserProfile } from '~/lib/db';

import { StatusBar } from 'expo-status-bar';
import PageTransition from '../../components/PageTransition';
import { useToast } from '~/context/ToastContext';

export default function AddTransactionScreen() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<any>('credit');
  const [customer, setCustomer] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<any>({});
  const { id, transactionId } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const validateForm = () => {
    const newErrors: any = {};

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBackPress = () => {
    // Navigate back to home with refresh parameter
    router.push('/');
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
        showToast('Transaction updated successfully!', 'success');
      } else {
        await addTransaction(Number(id), type, parseFloat(amount), note);
        showToast('Transaction added successfully!', 'success');
      }

      // Small delay to show toast, then navigate back to home
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
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
          // Fetch transaction details and populate form fields
          const transactions = await getCustomerTransactions(Number(id), 100, 0);
          const txn: any = transactions.find((txn: any) => txn.id === Number(transactionId));
          if (txn) {
            setAmount(txn.amount.toString());
            setNote(txn.note || '');
            setType(txn.type);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, transactionId]);

  const renderCustomerCard = () => {
    if (!customer) return null;

    return (
      <Surface style={styles.customerCard}>
        <View style={styles.customerInfo}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerAvatarText}>{customer.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerPhone}>{customer.phone || 'No phone'}</Text>
            <Text style={styles.customerBalance}>
              Current Balance:
              <Text
                style={[
                  styles.balanceAmount,
                  { color: customer.total_balance >= 0 ? '#4CAF50' : '#F44336' },
                ]}>
                {' '}
                {profile?.currency || '৳'}
                {Math.abs(customer.total_balance || 0).toFixed(0)}
                {customer.total_balance >= 0 ? ' (Credit)' : ' (Debit)'}
              </Text>
            </Text>
          </View>
        </View>
      </Surface>
    );
  };

  const renderTransactionTypeCard = () => (
    <Surface style={styles.typeCard}>
      <Text style={styles.sectionTitle}>Transaction Type</Text>
      <View style={styles.typeButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === 'credit' && styles.typeButtonActive,
            { backgroundColor: type === 'credit' ? '#4CAF50' : '#f0f0f0' },
          ]}
          onPress={() => setType('credit')}>
          <IconButton
            icon="plus-circle"
            size={24}
            iconColor={type === 'credit' ? 'white' : '#4CAF50'}
            style={styles.typeIcon}
          />
          <Text style={[styles.typeButtonText, { color: type === 'credit' ? 'white' : '#4CAF50' }]}>
            Credit
          </Text>
          <Text
            style={[
              styles.typeDescription,
              { color: type === 'credit' ? 'rgba(255,255,255,0.8)' : '#666' },
            ]}>
            Money In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            type === 'debit' && styles.typeButtonActive,
            { backgroundColor: type === 'debit' ? '#F44336' : '#f0f0f0' },
          ]}
          onPress={() => setType('debit')}>
          <IconButton
            icon="minus-circle"
            size={24}
            iconColor={type === 'debit' ? 'white' : '#F44336'}
            style={styles.typeIcon}
          />
          <Text style={[styles.typeButtonText, { color: type === 'debit' ? 'white' : '#F44336' }]}>
            Debit
          </Text>
          <Text
            style={[
              styles.typeDescription,
              { color: type === 'debit' ? 'rgba(255,255,255,0.8)' : '#666' },
            ]}>
            Money Out
          </Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );

  if (loading) {
    return (
      <PageTransition>
        <StatusBar style="light" />
        <View style={styles.headerContainer}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="white"
            onPress={handleBackPress}
            style={styles.headerLeftAction}
          />
          <Text style={styles.headerTitle}>Add Transaction</Text>
        </View>
        <View style={styles.loadingContainer}>
          <RNActivityIndicator size="large" color="#fe4c24" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <StatusBar style="light" />

      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="white"
          onPress={handleBackPress}
          style={styles.headerLeftAction}
        />
        <Text style={styles.headerTitle}>
          {transactionId ? 'Edit Transaction' : 'Add Transaction'}
        </Text>
        <IconButton
          icon={saving ? 'loading' : 'check'}
          size={24}
          iconColor="white"
          onPress={handleSaveTransaction}
          disabled={saving}
          style={styles.headerRightAction}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          style={styles.scrollViewContainer}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic">
          {renderCustomerCard()}

          {/* Amount Input */}
          <Surface style={styles.inputCard}>
            <Text style={styles.inputLabel}>Amount ({profile?.currency || '৳'})</Text>
            <TextInput
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                if (errors.amount) {
                  setErrors({ ...errors, amount: undefined });
                }
              }}
              keyboardType="numeric"
              style={styles.amountInput}
              mode="outlined"
              placeholder="e.g. 1500, 2000.50"
              error={!!errors.amount}
              left={<TextInput.Icon icon="currency-usd" />}
              outlineColor="#e0e0e0"
              activeOutlineColor="#fe4c24"
            />
            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
          </Surface>

          {renderTransactionTypeCard()}

          {/* Note Input */}
          <Surface style={styles.inputCard}>
            <Text style={styles.inputLabel}>Note (Optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              style={styles.noteInput}
              mode="outlined"
              placeholder="e.g. Payment for goods, Advance payment, Service charge"
              multiline
              numberOfLines={3}
              left={<TextInput.Icon icon="note-text" />}
              outlineColor="#e0e0e0"
              activeOutlineColor="#fe4c24"
            />
          </Surface>

          {/* Summary Card */}
          <Surface style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Transaction Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Customer:</Text>
              <Text style={styles.summaryValue}>{customer?.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Type:</Text>
              <Text
                style={[styles.summaryValue, { color: type === 'credit' ? '#4CAF50' : '#F44336' }]}>
                {type === 'credit' ? 'Credit (Money In)' : 'Debit (Money Out)'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text
                style={[
                  styles.summaryAmount,
                  { color: type === 'credit' ? '#4CAF50' : '#F44336' },
                ]}>
                {profile?.currency || '৳'}
                {amount || '0.00'}
              </Text>
            </View>
          </Surface>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSaveTransaction}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}
            disabled={saving}
            loading={saving}>
            {saving ? 'Saving...' : transactionId ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <Portal>
        <Modal visible={saving} dismissable={false} contentContainerStyle={styles.loadingModal}>
          <Surface style={styles.loadingModalContent}>
            <RNActivityIndicator size="large" color="#fe4c24" />
            <Text style={styles.loadingModalText}>
              {transactionId ? 'Updating transaction...' : 'Adding transaction...'}
            </Text>
          </Surface>
        </Modal>
      </Portal>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 100, // Extra space for keyboard
  },

  headerContainer: {
    backgroundColor: '#fe4c24',
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 65,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  headerLeftAction: {
    position: 'absolute',
    left: 8,
    top: '50%',
    marginTop: -20,
  },
  headerRightAction: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  customerCard: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fe4c24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  customerBalance: {
    fontSize: 14,
    color: '#666',
  },
  balanceAmount: {
    fontWeight: 'bold',
  },
  inputCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: 'white',
    fontSize: 16,
  },
  noteInput: {
    backgroundColor: 'white',
    minHeight: 80,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  typeCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  typeButtonActive: {},
  typeIcon: {
    margin: 0,
    marginBottom: 4,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  typeDescription: {
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#fe4c24',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    margin: 16,
    marginTop: 8,
    marginBottom: 50,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fe4c24',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingModal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  loadingModalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingModalText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
