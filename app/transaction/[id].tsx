import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getCustomerById, addTransaction, deleteCustomer } from '~/lib/db';
import { useTheme } from '~/context/ThemeContext';

interface Customer {
  id: number;
  name: string;
  phone: string;
  type: string;
}

export default function CustomerTransactionScreen() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [dilamAmount, setDilamAmount] = useState('');
  const [pelamAmount, setPelamAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeInput, setActiveInput] = useState<'dilam' | 'pelam' | null>(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme.custom;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const customerResult = await getCustomerById(Number(id));
      setCustomer(customerResult as Customer);
    } catch (error) {
      console.error('Error loading data:', error);
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

  // New Calculation System Functions
  const [calculationExpression, setCalculationExpression] = useState('');

  const updateInputWithCalculation = (expression: string) => {
    console.log('Updating input with expression:', expression);
    console.log('Current activeInput:', activeInput);
    
    // Update the active input field with the calculation expression in real-time
    if (activeInput === 'dilam') {
      console.log('Setting dilamAmount to:', expression);
      setDilamAmount(expression);
    } else if (activeInput === 'pelam') {
      console.log('Setting pelamAmount to:', expression);
      setPelamAmount(expression);
    } else {
      console.log('No active input field');
    }
  };

  const inputDigit = (digit: string) => {
    let newExpression = calculationExpression;
    
    // If expression is empty or just "0", start fresh
    if (newExpression === '' || newExpression === '0') {
      newExpression = digit;
    } else {
      // Check if last character is an operator
      const lastChar = newExpression.slice(-1);
      if (['+', '-', '×', '÷'].includes(lastChar)) {
        // If last character is operator, add digit after it
        newExpression = newExpression + digit;
      } else {
        // If last character is a number, append digit
        newExpression = newExpression + digit;
      }
    }
    
    setCalculationExpression(newExpression);
    updateInputWithCalculation(newExpression);
  };

  const inputDecimal = () => {
    let newExpression = calculationExpression;
    
    // If expression is empty, start with "0."
    if (newExpression === '' || newExpression === '0') {
      newExpression = '0.';
    } else {
      // Check if last character is an operator
      const lastChar = newExpression.slice(-1);
      if (['+', '-', '×', '÷'].includes(lastChar)) {
        // If last character is operator, add "0."
        newExpression = newExpression + '0.';
      } else {
        // Find the last number in the expression
        const parts = newExpression.split(/[+\-×÷]/);
        const lastNumber = parts[parts.length - 1];
        
        // Only add decimal if the last number doesn't already have one
        if (lastNumber.indexOf('.') === -1) {
          newExpression = newExpression + '.';
        }
      }
    }
    
    setCalculationExpression(newExpression);
    updateInputWithCalculation(newExpression);
  };

  const clearAll = () => {
    setCalculationExpression('');
    
    // Clear the active input field completely
    if (activeInput === 'dilam') {
      setDilamAmount('0');
    } else if (activeInput === 'pelam') {
      setPelamAmount('0');
    }
  };

  const backspace = () => {
    let newExpression = calculationExpression;
    
    if (newExpression.length > 0) {
      newExpression = newExpression.slice(0, -1);
      
      // If expression becomes empty, set to "0"
      if (newExpression === '') {
        newExpression = '0';
      }
      
      setCalculationExpression(newExpression);
      updateInputWithCalculation(newExpression);
    }
  };

  const performOperation = (nextOperation: string) => {
    let newExpression = calculationExpression;
    
    // Check if expression is empty or ends with an operator
    if (newExpression === '' || newExpression === '0') {
      return; // Don't add operator if no number
    }
    
    const lastChar = newExpression.slice(-1);
    
    // If last character is already an operator, replace it
    if (['+', '-', '×', '÷'].includes(lastChar)) {
      newExpression = newExpression.slice(0, -1) + nextOperation;
    } else {
      // Add operator after the number
      newExpression = newExpression + nextOperation;
    }
    
    setCalculationExpression(newExpression);
    updateInputWithCalculation(newExpression);
  };

  const calculateResult = () => {
    if (calculationExpression === '' || calculationExpression === '0') {
      return;
    }
    
    // Check if expression ends with an operator
    const lastChar = calculationExpression.slice(-1);
    if (['+', '-', '×', '÷'].includes(lastChar)) {
      Alert.alert('ত্রুটি', 'অসম্পূর্ণ অভিব্যক্তি। শেষে একটি সংখ্যা দিন।');
      return;
    }
    
    try {
      // Replace × with * and ÷ with / for evaluation
      let expressionToEvaluate = calculationExpression
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      
      // Evaluate the expression
      const result = eval(expressionToEvaluate);
      
      // Validate result
      if (!isFinite(result)) {
        Alert.alert('ত্রুটি', 'অবৈধ গণনা');
        return;
      }
      
      if (Math.abs(result) > 1e15) {
        Alert.alert('ত্রুটি', 'সংখ্যাটি খুব বড়');
        return;
      }
      
      // Format result
      const formattedResult = result % 1 === 0 ? result.toString() : result.toFixed(2);
      
      setCalculationExpression(formattedResult);
      updateInputWithCalculation(formattedResult);
      
    } catch (error) {
      Alert.alert('ত্রুটি', 'গণনা করতে ব্যর্থ');
    }
  };

  const percentage = () => {
    if (calculationExpression === '' || calculationExpression === '0') {
      return;
    }
    
    // Check if expression ends with an operator
    const lastChar = calculationExpression.slice(-1);
    if (['+', '-', '×', '÷'].includes(lastChar)) {
      return; // Don't calculate percentage if expression ends with operator
    }
    
    try {
      // Replace × with * and ÷ with / for evaluation
      let expressionToEvaluate = calculationExpression
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      
      // Evaluate the expression
      const result = eval(expressionToEvaluate);
      
      // Calculate percentage
      const percentageResult = result / 100;
      
      // Format result
      const formattedResult = percentageResult % 1 === 0 ? percentageResult.toString() : percentageResult.toFixed(2);
      
      setCalculationExpression(formattedResult);
      updateInputWithCalculation(formattedResult);
      
    } catch (error) {
      Alert.alert('ত্রুটি', 'শতকরা হার গণনা করতে ব্যর্থ');
    }
  };

  const handleInputFocus = (inputType: 'dilam' | 'pelam') => {
    console.log('Input focus triggered for:', inputType);
    console.log('Current activeInput:', activeInput);
    
    // Always switch to the clicked input field
    setActiveInput(inputType);
    setShowCalculator(true);
    
    // Initialize calculator with current input value
    let currentValue = '0';
    if (inputType === 'dilam') {
      currentValue = dilamAmount || '0';
      console.log('Setting dilam value:', currentValue);
    } else if (inputType === 'pelam') {
      currentValue = pelamAmount || '0';
      console.log('Setting pelam value:', currentValue);
    }
    
    setCalculationExpression(currentValue);
    console.log('Calculator expression set to:', currentValue);
  };







  // Dropdown Menu Functions
  const handleViewUserDetails = () => {
    setShowDropdown(false);
    // Navigate to user details page or show modal
    Alert.alert(
      'ব্যবহারকারীর বিবরণ',
      `নাম: ${customer?.name}\nফোন: ${customer?.phone}\nধরন: ${customer?.type}`
    );
  };

  const handleViewUserReports = () => {
    setShowDropdown(false);
    // Navigate to user reports page
    router.push(`/customer-reports/${id}`);
  };

  const handleUpdateUser = () => {
    setShowDropdown(false);
    // Navigate to user edit page
    router.push(`/customer-edit/${id}`);
  };

  const handleDeleteUser = () => {
    setShowDropdown(false);
    Alert.alert('ব্যবহারকারী মুছুন', `আপনি কি নিশ্চিত যে আপনি ${customer?.name} কে মুছতে চান?`, [
      { text: 'না', style: 'cancel' },
      {
        text: 'হ্যাঁ, মুছুন',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCustomer(Number(id));
            Alert.alert('সফল', 'ব্যবহারকারী মুছে ফেলা হয়েছে', [
              { text: 'ঠিক আছে', onPress: () => router.push('/customers-list') },
            ]);
          } catch (error) {
            Alert.alert('ত্রুটি', 'ব্যবহারকারী মুছতে ব্যর্থ');
          }
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // Validate that at least one amount is provided
    if (
      (!dilamAmount || parseFloat(dilamAmount) <= 0) &&
      (!pelamAmount || parseFloat(pelamAmount) <= 0)
    ) {
      Alert.alert('ত্রুটি', 'অন্তত একটি পরিমাণ (দিলাম বা পেলাম) দিতে হবে');
      return;
    }

    setSubmitting(true);

    try {
      // Add dilam transaction (credit - you gave money, so you will receive)
      if (dilamAmount && parseFloat(dilamAmount) > 0) {
        const success = await addTransaction(
          Number(id),
          'credit',
          parseFloat(dilamAmount),
          note || 'দিলাম (আপনি দিয়েছেন)'
        );
        if (!success) {
          Alert.alert('ত্রুটি', 'দিলাম লেনদেন যোগ করতে ব্যর্থ');
          return;
        }
      }

      // Add pelam transaction (debit - you received money, so you owe them)
      if (pelamAmount && parseFloat(pelamAmount) > 0) {
        const success = await addTransaction(
          Number(id),
          'debit',
          parseFloat(pelamAmount),
          note || 'পেলাম (আপনি পেয়েছেন)'
        );
        if (!success) {
          Alert.alert('ত্রুটি', 'পেলাম লেনদেন যোগ করতে ব্যর্থ');
          return;
        }
      }

      // Success message
      const message = [];
      if (dilamAmount && parseFloat(dilamAmount) > 0) {
        message.push(`দিলাম: ${dilamAmount}৳`);
      }
      if (pelamAmount && parseFloat(pelamAmount) > 0) {
        message.push(`পেলাম: ${pelamAmount}৳`);
      }

      Alert.alert('সফল', `লেনদেন যোগ করা হয়েছে:\n${message.join('\n')}`, [
        {
          text: 'ঠিক আছে',
          onPress: () => {
            // Reset form
            setDilamAmount('');
            setPelamAmount('');
            setNote('');
            setShowCalculator(false);
            setActiveInput(null);
          },
        },
      ]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('ত্রুটি', 'লেনদেন যোগ করতে ব্যর্থ');
    } finally {
      setSubmitting(false);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      {/* First: Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress} activeOpacity={0.7}>
        <IconButton icon="arrow-left" size={24} iconColor={colors.textInverse} />
      </TouchableOpacity>

      {/* Second: User Avatar */}
      <View style={styles.avatarContainer}>
        <View style={[styles.userAvatar, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.avatarText, { color: colors.textInverse }]}>
            {customer?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
      </View>

      {/* Third: User Name */}
      <View style={styles.userInfoContainer}>
        <Text style={[styles.userName, { color: colors.textInverse }]}>
          {customer?.name || 'গ্রাহক'}
        </Text>

        {/* Fourth: User Mobile Number */}
        <Text style={[styles.userMobile, { color: colors.textInverse }]}>
          {customer?.phone || 'ফোন নম্বর নেই'}
        </Text>
      </View>

      {/* Fifth: Dropdown Menu Button */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowDropdown(!showDropdown)}
        activeOpacity={0.5}>
        <IconButton icon="dots-vertical" size={24} iconColor={colors.textInverse} />
      </TouchableOpacity>
    </View>
  );

  const renderTransactionForm = () => (
    <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>


      {/* First Row - Two Columns */}
      <View style={styles.inputRow}>
        <View style={styles.inputColumn}>
          {/* <Text style={[styles.inputLabel, { color: colors.text }]}>দিলাম / বেচা</Text> */}
                      <TextInput
              mode="outlined"
              label='দিলাম / বেচা'
              value={dilamAmount}
              onChangeText={setDilamAmount}
              keyboardType="numeric"
              disabled={submitting}
              onFocus={() => handleInputFocus('dilam')}
              showSoftInputOnFocus={false}
              editable={true}
            />
        </View>

        <View style={styles.inputColumn}>
          {/* <Text style={[styles.inputLabel, { color: colors.text }]}>পেলাম</Text> */}
                      <TextInput
              mode="outlined"
              label="পেলাম"
              value={pelamAmount}
              onChangeText={setPelamAmount}
              keyboardType="numeric"
              disabled={submitting}
              onFocus={() => handleInputFocus('pelam')}
              showSoftInputOnFocus={false}
              editable={true}
            />
        </View>
      </View>

      {/* Second Row - One Column */}
      <View style={styles.inputContainer}>
        {/* <Text style={[styles.inputLabel, { color: colors.text }]}>বিবরণ</Text> */}
        <TextInput
          mode="outlined"
          label="বিবরণ"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={4}
          disabled={submitting}
          onFocus={() => {
            if (showCalculator) {
              setShowCalculator(false);
              setActiveInput(null);
            }
          }}
        />
      </View>



      {/* Submit Button */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              opacity: submitting ? 0.7 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}>
          <Text style={[styles.submitButtonText, { color: colors.textInverse }]}>
            {submitting ? 'যোগ হচ্ছে...' : 'লেনদেন যোগ করুন'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      {renderTransactionForm()}

                {/* Calculator Keyboard - Footer Position */}
      {showCalculator && (
        <View style={styles.calculatorFooter}>
          <View style={[styles.calculatorContainer]}>
            <View style={styles.calculatorButtons}>
              {/* First Row */}
              <View style={styles.calculatorRow}>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={clearAll}
                  activeOpacity={0.3}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>AC</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={clearAll}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>C</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={percentage}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.calcButton,
                    {
                      backgroundColor: '#FFF',
                      elevation: 8,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    },
                  ]}
                  onPress={() => performOperation('÷')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>÷</Text>
                </TouchableOpacity>
              </View>

              {/* Second Row */}
              <View style={styles.calculatorRow}>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={() => inputDigit('7')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>7</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={() => inputDigit('8')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>8</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={() => inputDigit('9')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>9</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.calcButton,
                    {
                      backgroundColor: '#FFF',
                      elevation: 8,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    },
                  ]}
                  onPress={() => performOperation('×')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Third Row */}
              <View style={styles.calculatorRow}>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={() => inputDigit('4')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>4</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={() => inputDigit('5')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>5</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={() => inputDigit('6')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>6</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.calcButton,
                    {
                      backgroundColor: '#FFF',
                      elevation: 8,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    },
                  ]}
                  onPress={() => performOperation('+')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Fourth Row */}
              <View style={styles.calculatorRow}>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={() => inputDigit('1')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={() => inputDigit('2')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={() => inputDigit('3')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.calcButton,
                    {
                      backgroundColor: '#FFF',
                      elevation: 8,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    },
                  ]}
                  onPress={() => performOperation('-')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>-</Text>
                </TouchableOpacity>
              </View>

              {/* Fifth Row */}
              <View style={styles.calculatorRow}>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={() => inputDigit('0')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={inputDecimal}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>.</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: '#FFF' }]}
                  onPress={backspace}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>⌫</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.calcButton,
                    {
                      backgroundColor: '#FFF',
                      elevation: 8,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    },
                  ]}
                  onPress={calculateResult}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: '#000' }]}>=</Text>
                </TouchableOpacity>
              </View>
              

            </View>
          </View>
        </View>
      )}

      {/* Dropdown Menu Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}>
          <View style={[styles.dropdownMenu, { backgroundColor: colors.surface }]}>
            {/* Dropdown Header */}
            <View style={[styles.dropdownHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.dropdownTitle, { color: colors.text }]}>ব্যবহারকারী অপশন</Text>
              <TouchableOpacity
                style={styles.dropdownCloseButton}
                onPress={() => setShowDropdown(false)}>
                <Text style={[styles.dropdownCloseText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              onPress={handleViewUserDetails}
              activeOpacity={0.7}>
              <IconButton icon="account-details" size={20} iconColor={colors.primary} />
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                ব্যবহারকারীর বিবরণ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              onPress={handleViewUserReports}
              activeOpacity={0.7}>
              <IconButton icon="chart-line" size={20} iconColor={colors.info} />
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                ব্যবহারকারীর রিপোর্ট
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              onPress={handleUpdateUser}
              activeOpacity={0.7}>
              <IconButton icon="pencil" size={20} iconColor={colors.warning} />
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>আপডেট করুন</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setShowDropdown(false);
                router.push(`/customer-upgrade/${id}`);
              }}
              activeOpacity={0.7}>
              <IconButton icon="star" size={20} iconColor={colors.accent} />
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>আপগ্রেড করুন</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownItem]}
              onPress={handleDeleteUser}
              activeOpacity={0.7}>
              <IconButton icon="delete" size={20} iconColor={colors.error} />
              <Text style={[styles.dropdownItemText, { color: colors.error }]}>মুছুন</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#2196F3',
  },
  backButton: {
    marginRight: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userMobile: {
    fontSize: 14,
    opacity: 0.9,
  },
  dropdownButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputColumn: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputSubLabel: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  inputWithCalculator: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    marginTop: 8,
  },

  calculatorButton: {
    padding: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  buttonRow: {
    alignItems: 'center',
    marginTop: 20,
  },
  submitButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },

  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 100,
  },
  instructionsContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryContent: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    width: '80%',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownCloseButton: {
    padding: 8,
  },
  dropdownCloseText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  calculatorFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    transform: [{ translateY: 0 }],
  },
  calculatorContainer: {
    margin: 0,
    borderRadius: 0,
    elevation: 8,
    overflow: 'hidden',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  calculatorDisplay: {
    padding: 20,
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  calculatorValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  calculatorOperation: {
    fontSize: 18,
    opacity: 0.7,
  },
  calculatorButtons: {
    padding: 0,
  },

  calculatorRow: {
    flexDirection: 'row',
    marginBottom: 0,
    gap: 0,
  },
  calcButton: {
    flex: 1,
    height: 50,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
    borderWidth: 0,
  },
  calcButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  calcButtonPressed: {
    backgroundColor: '#333333',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  applyButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

});
