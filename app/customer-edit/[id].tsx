import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Button,
  TextInput,
  Text,
  Surface,
  IconButton,
  ActivityIndicator as RNActivityIndicator,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getCustomerById, updateCustomer, updateCustomerPhoto } from '~/lib/db';
import { StatusBar } from 'expo-status-bar';
import PageTransition from '../../components/PageTransition';
import { useToast } from '~/context/ToastContext';
import PhotoPicker from '../../components/PhotoPicker';

interface Customer {
  id: number;
  name: string;
  phone: string;
  type: string;
  photo?: string;
  total_balance: number;
}

export default function CustomerEditScreen() {
  const { id } = useLocalSearchParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'Customer' | 'Supplier'>('Customer');
  const [photo, setPhoto] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();
  const { showToast } = useToast();

  const isValidPhone = (num: string) => /^01[3-9]\d{8}$/.test(num);

  const loadCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const customerData = await getCustomerById(Number(id));
      if (customerData) {
        setCustomer(customerData as Customer);
        setName((customerData as Customer).name || '');
        setPhone((customerData as Customer).phone || '');
        setType((customerData as Customer).type as 'Customer' | 'Supplier');
        setPhoto((customerData as Customer).photo || '');
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      Alert.alert('Error', 'Failed to load customer data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  const validateForm = () => {
    const newErrors: any = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(phone)) {
      newErrors.phone = 'Please enter a valid Bangladeshi phone number (01XXXXXXXXX)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateCustomer = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Update customer basic info
      const success = await updateCustomer(Number(id), {
        name: name.trim(),
        phone,
        type,
      });

      if (success) {
        showToast(`Customer "${name.trim()}" updated successfully!`, 'success');

        // Small delay to show toast
        setTimeout(() => {
          router.push('/');
          router.replace('/');
        }, 100);
      } else {
        throw new Error('Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      Alert.alert('Error', 'Failed to update customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpdate = async (newPhotoUri: string) => {
    try {
      setPhoto(newPhotoUri);

      if (newPhotoUri) {
        const success = await updateCustomerPhoto(Number(id), newPhotoUri);
        if (success) {
          showToast('Customer photo updated successfully!', 'success');
        } else {
          showToast('Failed to update photo', 'error');
        }
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      showToast('Failed to update photo', 'error');
    }
  };

  const renderTypeSelector = () => (
    <Surface style={styles.typeCard}>
      <Text style={styles.sectionTitle}>Contact Type</Text>
      <View style={styles.typeButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === 'Customer' && styles.typeButtonActive,
            { backgroundColor: type === 'Customer' ? '#fe4c24' : '#f0f0f0' },
          ]}
          onPress={() => setType('Customer')}>
          <IconButton
            icon="account"
            size={24}
            iconColor={type === 'Customer' ? 'white' : '#fe4c24'}
            style={styles.typeIcon}
          />
          <Text
            style={[styles.typeButtonText, { color: type === 'Customer' ? 'white' : '#fe4c24' }]}>
            Customer
          </Text>
          <Text
            style={[
              styles.typeDescription,
              { color: type === 'Customer' ? 'rgba(255,255,255,0.8)' : '#666' },
            ]}>
            Buys from you
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            type === 'Supplier' && styles.typeButtonActive,
            { backgroundColor: type === 'Supplier' ? '#4CAF50' : '#f0f0f0' },
          ]}
          onPress={() => setType('Supplier')}>
          <IconButton
            icon="truck"
            size={24}
            iconColor={type === 'Supplier' ? 'white' : '#4CAF50'}
            style={styles.typeIcon}
          />
          <Text
            style={[styles.typeButtonText, { color: type === 'Supplier' ? 'white' : '#4CAF50' }]}>
            Supplier
          </Text>
          <Text
            style={[
              styles.typeDescription,
              { color: type === 'Supplier' ? 'rgba(255,255,255,0.8)' : '#666' },
            ]}>
            Sells to you
          </Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <RNActivityIndicator size="large" color="#fe4c24" />
        <Text style={styles.loadingText}>Loading customer...</Text>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Customer not found</Text>
        <Button
          onPress={() => {
            router.push('/');
            router.replace('/');
          }}>
          Go Back
        </Button>
      </View>
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
          onPress={() => {
            router.push('/');
            router.replace('/');
          }}
          style={styles.headerLeftAction}
        />
        <Text style={styles.headerTitle}>Edit Customer</Text>
        <IconButton
          icon={saving ? 'loading' : 'check'}
          size={24}
          iconColor="white"
          onPress={handleUpdateCustomer}
          disabled={saving}
          style={styles.headerRightAction}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic">
          {/* Photo Section */}
          <Surface style={styles.photoCard}>
            <View style={styles.photoSection}>
              <PhotoPicker
                currentPhoto={photo}
                onPhotoSelected={handlePhotoUpdate}
                size={100}
                showLabel={true}
                customerName={name || 'Customer'}
              />
              <Text style={styles.photoTitle}>Update {type} Photo</Text>
              <Text style={styles.photoSubtitle}>Tap to change or remove photo</Text>
            </View>
          </Surface>

          {/* Basic Information */}
          <Surface style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
              right={<TextInput.Icon icon="account" />}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              style={styles.input}
              error={!!errors.phone}
              keyboardType="phone-pad"
              right={<TextInput.Icon icon="phone" />}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </Surface>

          {/* Type Selector */}
          {renderTypeSelector()}

          {/* Current Balance Info */}
          <Surface style={styles.balanceCard}>
            <Text style={styles.sectionTitle}>Current Balance</Text>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Balance:</Text>
              <Text
                style={[
                  styles.balanceAmount,
                  { color: customer.total_balance >= 0 ? '#4CAF50' : '#F44336' },
                ]}>
                ৳{Math.abs(customer.total_balance || 0).toFixed(0)}
                <Text style={styles.balanceType}>
                  {customer.total_balance >= 0 ? ' (Credit)' : ' (Debit)'}
                </Text>
              </Text>
            </View>
            <Text style={styles.balanceNote}>
              Note: Balance is calculated from transactions and cannot be edited directly.
            </Text>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 16,
  },
  headerContainer: {
    backgroundColor: '#fe4c24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    elevation: 4,
  },
  headerLeftAction: {
    margin: 0,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRightAction: {
    margin: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  photoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  photoSection: {
    alignItems: 'center',
  },
  photoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 4,
  },
  photoSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  typeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  typeButtonActive: {
    elevation: 4,
  },
  typeIcon: {
    margin: 0,
    marginBottom: 8,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceType: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  balanceNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
