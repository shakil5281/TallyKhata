import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Text,
} from 'react-native';
import {
  Avatar,
  Button,
  TextInput,
  IconButton,
  ActivityIndicator as RNActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { addCustomer } from '~/lib/db';
import PageTransition from '../../components/PageTransition';
import { useToast } from '~/context/ToastContext';
import PhotoPicker from '../../components/PhotoPicker';
import { useTheme } from '~/context/ThemeContext';

export default function AddCustomerScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'Customer' | 'Supplier'>('Customer');
  const [photo, setPhoto] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const { colors } = theme.custom;

  const isValidPhone = (num: string) => /^01[3-9]\d{8}$/.test(num);

  const validateForm = () => {
    const newErrors: any = {};

    if (!name.trim()) {
      newErrors.name = 'নাম প্রয়োজন';
    } else if (name.trim().length < 2) {
      newErrors.name = 'নাম কমপক্ষে ২ অক্ষর হতে হবে';
    }

    if (!phone.trim()) {
      newErrors.phone = 'ফোন নম্বর প্রয়োজন';
    } else if (!isValidPhone(phone)) {
      newErrors.phone = 'সঠিক বাংলাদেশী ফোন নম্বর দিন (01XXXXXXXXX)';
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

      showToast(`${type === 'Customer' ? 'গ্রাহক' : 'সরবরাহকারী'} "${name.trim()}" সফলভাবে যোগ হয়েছে!`, 'success');

      // Small delay to show toast
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error) {
      console.error('Error adding customer:', error);
      Alert.alert('ত্রুটি', 'গ্রাহক যোগ করতে ব্যর্থ। আবার চেষ্টা করুন।');
    } finally {
      setSaving(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

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
          নতুন গ্রাহক যোগ করুন
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textInverse }]}>
          আপনার ব্যবসায় নতুন গ্রাহক যোগ করুন
        </Text>
      </View>
    </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        যোগাযোগের ধরন
      </Text>
      <View style={styles.typeButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            {
              backgroundColor: type === 'Customer' ? colors.primary : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setType('Customer')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.typeButtonText,
              {
                color: type === 'Customer' ? colors.textInverse : colors.text,
              },
            ]}>
            গ্রাহক
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.typeButton,
            {
              backgroundColor: type === 'Supplier' ? colors.primary : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setType('Supplier')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.typeButtonText,
              {
                color: type === 'Supplier' ? colors.textInverse : colors.text,
              },
            ]}>
            সরবরাহকারী
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPhotoSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        প্রোফাইল ছবি
      </Text>
      <View style={styles.photoContainer}>
        <PhotoPicker
          photo={photo}
          onPhotoChange={setPhoto}
          size={80}
          style={[
            styles.photoPicker,
            { backgroundColor: colors.surfaceSecondary },
          ]}
        />
        <Text style={[styles.photoHint, { color: colors.textSecondary }]}>
          ছবি যোগ করা ঐচ্ছিক
        </Text>
      </View>
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          গ্রাহকের তথ্য
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            নাম *
          </Text>
          <TextInput
            mode="outlined"
            value={name}
            onChangeText={setName}
            placeholder="গ্রাহকের নাম লিখুন"
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                borderColor: errors.name ? colors.error : colors.border,
              },
            ]}
            outlineStyle={[
              styles.inputOutline,
              { borderColor: errors.name ? colors.error : colors.border },
            ]}
            contentStyle={[styles.inputContent, { color: colors.text }]}
            placeholderTextColor={colors.textSecondary}
            error={!!errors.name}
          />
          {errors.name && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.name}
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            ফোন নম্বর *
          </Text>
          <TextInput
            mode="outlined"
            value={phone}
            onChangeText={setPhone}
            placeholder="01XXXXXXXXX"
            keyboardType="phone-pad"
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                borderColor: errors.phone ? colors.error : colors.border,
              },
            ]}
            outlineStyle={[
              styles.inputOutline,
              { borderColor: errors.phone ? colors.error : colors.border },
            ]}
            contentStyle={[styles.inputContent, { color: colors.text }]}
            placeholderTextColor={colors.textSecondary}
            error={!!errors.phone}
          />
          {errors.phone && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.phone}
            </Text>
          )}
        </View>
      </View>

      {renderTypeSelector()}
      {renderPhotoSection()}
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <Button
        mode="contained"
        onPress={handleAddCustomer}
        loading={saving}
        disabled={saving}
        style={[
          styles.saveButton,
          { backgroundColor: colors.primary },
        ]}
        contentStyle={styles.saveButtonContent}
        labelStyle={[styles.saveButtonText, { color: colors.textInverse }]}>
        {saving ? 'সংরক্ষণ হচ্ছে...' : 'গ্রাহক যোগ করুন'}
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
            {renderForm()}
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
  formContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
  typeButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPicker: {
    marginBottom: 12,
  },
  photoHint: {
    fontSize: 14,
    textAlign: 'center',
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
});
