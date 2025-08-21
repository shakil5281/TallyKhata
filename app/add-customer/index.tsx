import React, { useState } from 'react';
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
  Avatar,
  Button,
  TextInput,
  Text,
  Surface,
  IconButton,
  Portal,
  Modal,
  ActivityIndicator as RNActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { addCustomer } from '~/lib/db';
import { StatusBar } from 'expo-status-bar';
import PageTransition from '../../components/PageTransition';
import { useToast } from '~/context/ToastContext';
import PhotoPicker from '../../components/PhotoPicker';

export default function AddCustomerScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'Customer' | 'Supplier'>('Customer');
  const [photo, setPhoto] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();
  const { showToast } = useToast();

  const isValidPhone = (num: string) => /^01[3-9]\d{8}$/.test(num);

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

  const handleAddCustomer = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const data = await addCustomer({ name: name.trim(), phone, type, photo });
      console.log('Customer added:', data);

      showToast(`${type} "${name.trim()}" added successfully!`, 'success');

      // Small delay to show toast
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error) {
      console.error('Error adding customer:', error);
      Alert.alert('Error', 'Failed to add customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // useEffect(() => {
  //   dropCustomersTable().then(() => {
  //     initDB(); // Recreate with correct columns
  //     dropTables();
  //     clearTables();
  //     clearAndDropTables()
  //   });
  // }, []);

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

  return (
    <PageTransition>
      <StatusBar style="light" />

      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="white"
          onPress={() => router.push('/')}
          style={styles.headerLeftAction}
        />
        <Text style={styles.headerTitle}>Add Customer</Text>
        <IconButton
          icon={saving ? 'loading' : 'check'}
          size={24}
          iconColor="white"
          onPress={handleAddCustomer}
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
          {/* Avatar Section */}
          <Surface style={styles.avatarCard}>
            <View style={styles.avatarSection}>
              <PhotoPicker
                currentPhoto={photo}
                onPhotoSelected={setPhoto}
                size={80}
                showLabel={true}
                customerName={name || 'Customer'}
              />
              <Text style={styles.avatarTitle}>Add New {type}</Text>
              <Text style={styles.avatarSubtitle}>Fill in the details below</Text>
            </View>
          </Surface>

          {/* Name Input */}
          <Surface style={styles.inputCard}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) {
                  setErrors({ ...errors, name: undefined });
                }
              }}
              mode="outlined"
              style={styles.input}
              placeholder="e.g. John Doe, ABC Company"
              error={!!errors.name}
              left={<TextInput.Icon icon="account" />}
              outlineColor="#e0e0e0"
              activeOutlineColor={type === 'Customer' ? '#fe4c24' : '#4CAF50'}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </Surface>

          {/* Phone Input */}
          <Surface style={styles.inputCard}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) {
                  setErrors({ ...errors, phone: undefined });
                }
              }}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              placeholder="e.g. 01712345678"
              error={!!errors.phone}
              left={<TextInput.Icon icon="phone" />}
              outlineColor="#e0e0e0"
              activeOutlineColor={type === 'Customer' ? '#fe4c24' : '#4CAF50'}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            <Text style={styles.helperText}>Enter a valid Bangladeshi phone number</Text>
          </Surface>

          {renderTypeSelector()}

          {/* Preview Card */}
          <Surface style={styles.previewCard}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewContent}>
              <Avatar.Text
                size={45}
                label={name ? name.charAt(0).toUpperCase() : '?'}
                style={[
                  styles.previewAvatar,
                  { backgroundColor: type === 'Customer' ? '#fe4c24' : '#4CAF50' },
                ]}
              />
              <View style={styles.previewDetails}>
                <Text style={styles.previewName}>{name || 'Name'}</Text>
                <Text style={styles.previewPhone}>
                  {phone || 'Phone number'} • {type}
                </Text>
              </View>
            </View>
          </Surface>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleAddCustomer}
            style={[
              styles.submitButton,
              { backgroundColor: type === 'Customer' ? '#fe4c24' : '#4CAF50' },
            ]}
            labelStyle={styles.submitButtonText}
            disabled={saving}
            loading={saving}>
            {saving ? 'Adding...' : `Add ${type}`}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <Portal>
        <Modal visible={saving} dismissable={false} contentContainerStyle={styles.loadingModal}>
          <Surface style={styles.loadingModalContent}>
            <RNActivityIndicator size="large" color="#fe4c24" />
            <Text style={styles.loadingModalText}>Adding {type.toLowerCase()}...</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 100, // Extra space for keyboard
  },
  avatarCard: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 16,
  },
  avatarLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  avatarSubtitle: {
    fontSize: 14,
    color: '#666',
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
  input: {
    backgroundColor: 'white',
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
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
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#fe4c24',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewAvatar: {
    marginRight: 12,
  },
  previewDetails: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  previewPhone: {
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    margin: 16,
    marginTop: 8,
    marginBottom: 50,
    paddingVertical: 12,
    borderRadius: 12,
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
