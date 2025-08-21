import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { IconButton, Card, Chip } from 'react-native-paper';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getCustomerById, updateCustomer } from '~/lib/db';
import { useTheme } from '~/context/ThemeContext';

interface Customer {
  id: number;
  name: string;
  phone: string;
  type: string;
  photo?: string;
  total_balance: number;
}

interface UpgradeOption {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  price: number;
  color: string;
}

export default function CustomerUpgradeScreen() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [upgrading, setUpgrading] = useState(false);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme.custom;

  const upgradeOptions: UpgradeOption[] = [
    {
      id: 'premium',
      name: 'প্রিমিয়াম গ্রাহক',
      description: 'উচ্চমানের সেবা এবং বিশেষ সুবিধা',
      benefits: [
        'অগ্রাধিকার সেবা',
        'বিশেষ ছাড়',
        'দ্রুত লেনদেন প্রক্রিয়াকরণ',
        '২৪/৭ সেবা'
      ],
      price: 500,
      color: '#FFD700'
    },
    {
      id: 'vip',
      name: 'ভিআইপি গ্রাহক',
      description: 'সর্বোচ্চ স্তরের সেবা এবং বিশেষ সুবিধা',
      benefits: [
        'সর্বোচ্চ অগ্রাধিকার সেবা',
        'বিশেষ ছাড় এবং অফার',
        'ব্যক্তিগত অ্যাকাউন্ট ম্যানেজার',
        'বিশেষ ইভেন্টে আমন্ত্রণ'
      ],
      price: 1000,
      color: '#C0C0C0'
    },
    {
      id: 'enterprise',
      name: 'এন্টারপ্রাইজ গ্রাহক',
      description: 'ব্যবসায়িক গ্রাহকদের জন্য বিশেষ সেবা',
      benefits: [
        'ব্যবসায়িক অগ্রাধিকার সেবা',
        'বাল্ক লেনদেন সুবিধা',
        'বিশেষ রিপোর্টিং',
        'ডেডিকেটেড সাপোর্ট'
      ],
      price: 2000,
      color: '#CD7F32'
    }
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const customerResult = await getCustomerById(Number(id));
      setCustomer(customerResult as Customer);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('ত্রুটি', 'ডেটা লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleBackPress = () => {
    router.back();
  };

  const handleUpgrade = async () => {
    if (!selectedUpgrade || !customer) {
      Alert.alert('ত্রুটি', 'অনুগ্রহ করে একটি আপগ্রেড অপশন নির্বাচন করুন');
      return;
    }

    const upgrade = upgradeOptions.find(u => u.id === selectedUpgrade);
    if (!upgrade) {
      Alert.alert('ত্রুটি', 'অনুগ্রহ করে একটি বৈধ আপগ্রেড অপশন নির্বাচন করুন');
      return;
    }

    setUpgrading(true);
    
    try {
      // Update customer type
      const success = await updateCustomer(customer.id, {
        ...customer,
        type: upgrade.id
      });

      if (success) {
        Alert.alert(
          'সফল আপগ্রেড',
          `${customer.name} কে ${upgrade.name} হিসেবে আপগ্রেড করা হয়েছে!`,
          [
            { 
              text: 'ঠিক আছে', 
              onPress: () => {
                setSelectedUpgrade(null);
                setCustomNote('');
                loadData(); // Refresh data
              }
            }
          ]
        );
      } else {
        Alert.alert('ত্রুটি', 'গ্রাহক আপগ্রেড করতে ব্যর্থ');
      }
    } catch (error) {
      console.error('Error upgrading customer:', error);
      Alert.alert('ত্রুটি', 'গ্রাহক আপগ্রেড করতে ব্যর্থ');
    } finally {
      setUpgrading(false);
    }
  };

  const getCurrentUpgradeLevel = () => {
    if (!customer) return null;
    
    const currentUpgrade = upgradeOptions.find(u => u.id === customer.type);
    if (currentUpgrade) {
      return currentUpgrade;
    }
    
    // Default customer type
    return {
      id: 'regular',
      name: 'নিয়মিত গ্রাহক',
      description: 'সাধারণ সেবা এবং সুবিধা',
      benefits: ['মৌলিক সেবা', 'সাধারণ ছাড়'],
      price: 0,
      color: '#6B7280'
    };
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
          গ্রাহক আপগ্রেড
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textInverse }]}>
          {customer?.name || 'গ্রাহক'}
        </Text>
      </View>
    </View>
  );

  const renderCurrentStatus = () => {
    const currentUpgrade = getCurrentUpgradeLevel();
    
    return (
      <View style={styles.currentStatusContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          বর্তমান অবস্থা
        </Text>
        
        <Card style={[styles.currentStatusCard, { backgroundColor: colors.surface }]}>
          <View style={styles.currentStatusContent}>
            <View style={[styles.statusBadge, { backgroundColor: currentUpgrade?.color }]}>
              <Text style={styles.statusBadgeText}>
                {currentUpgrade?.name}
              </Text>
            </View>
            
            <Text style={[styles.statusDescription, { color: colors.textSecondary }]}>
              {currentUpgrade?.description}
            </Text>
            
            <View style={styles.benefitsList}>
              {currentUpgrade?.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Text style={[styles.benefitText, { color: colors.text }]}>
                    • {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card>
      </View>
    );
  };

  const renderUpgradeOptions = () => (
    <View style={styles.upgradeOptionsContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        আপগ্রেড অপশন
      </Text>
      
      {upgradeOptions.map((option) => {
        const isCurrent = customer?.type === option.id;
        const isSelected = selectedUpgrade === option.id;
        
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.upgradeOptionCard,
              { backgroundColor: colors.surface },
              isCurrent && styles.currentUpgradeCard,
              isSelected && styles.selectedUpgradeCard
            ]}
            onPress={() => !isCurrent && setSelectedUpgrade(option.id)}
            activeOpacity={0.7}
            disabled={isCurrent}>
            
            <View style={styles.upgradeOptionHeader}>
              <View style={[styles.upgradeBadge, { backgroundColor: option.color }]}>
                <Text style={styles.upgradeBadgeText}>
                  {option.name}
                </Text>
              </View>
              
              {isCurrent && (
                <Chip 
                  mode="outlined" 
                  textStyle={{ color: colors.primary }}
                  style={{ borderColor: colors.primary }}>
                  বর্তমান
                </Chip>
              )}
              
              {!isCurrent && (
                <Text style={[styles.upgradePrice, { color: colors.primary }]}>
                  ৳{option.price}
                </Text>
              )}
            </View>
            
            <Text style={[styles.upgradeDescription, { color: colors.textSecondary }]}>
              {option.description}
            </Text>
            
            <View style={styles.benefitsList}>
              {option.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Text style={[styles.benefitText, { color: colors.text }]}>
                    • {benefit}
                  </Text>
                </View>
              ))}
            </View>
            
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <IconButton
                  icon="check-circle"
                  size={24}
                  iconColor={colors.success}
                />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderUpgradeForm = () => {
    if (!selectedUpgrade) return null;
    
    const upgrade = upgradeOptions.find(u => u.id === selectedUpgrade);
    if (!upgrade) return null;
    
    return (
      <View style={styles.upgradeFormContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          আপগ্রেড ফর্ম
        </Text>
        
        <Card style={[styles.upgradeFormCard, { backgroundColor: colors.surface }]}>
          <View style={styles.formContent}>
            <Text style={[styles.selectedUpgradeText, { color: colors.text }]}>
              নির্বাচিত: {upgrade.name}
            </Text>
            
            <Text style={[styles.upgradePriceText, { color: colors.primary }]}>
              মূল্য: ৳{upgrade.price}
            </Text>
            
            <View style={styles.noteContainer}>
              <Text style={[styles.noteLabel, { color: colors.text }]}>
                নোট (ঐচ্ছিক)
              </Text>
              <TextInput
                style={[styles.noteInput, { 
                  backgroundColor: colors.surfaceSecondary,
                  color: colors.text,
                  borderColor: colors.border
                }]}
                value={customNote}
                onChangeText={setCustomNote}
                placeholder="আপগ্রেড সম্পর্কে নোট দিন"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                { backgroundColor: colors.primary },
                upgrading && { opacity: 0.7 }
              ]}
              onPress={handleUpgrade}
              disabled={upgrading}
              activeOpacity={0.8}>
              <Text style={[styles.upgradeButtonText, { color: colors.textInverse }]}>
                {upgrading ? 'আপগ্রেড হচ্ছে...' : 'আপগ্রেড করুন'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          লোড হচ্ছে...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView style={styles.content}>
        {renderCurrentStatus()}
        {renderUpgradeOptions()}
        {renderUpgradeForm()}
      </ScrollView>
    </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  currentStatusContainer: {
    marginBottom: 24,
  },
  currentStatusCard: {
    elevation: 2,
  },
  currentStatusContent: {
    padding: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusBadgeText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitText: {
    fontSize: 14,
    lineHeight: 20,
  },
  upgradeOptionsContainer: {
    marginBottom: 24,
  },
  upgradeOptionCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  currentUpgradeCard: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  selectedUpgradeCard: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  upgradeOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  upgradeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeBadgeText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  upgradePrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  upgradeDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  upgradeFormContainer: {
    marginBottom: 24,
  },
  upgradeFormCard: {
    elevation: 2,
  },
  formContent: {
    padding: 20,
  },
  selectedUpgradeText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  upgradePriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noteContainer: {
    marginBottom: 20,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  upgradeButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 100,
  },
});
