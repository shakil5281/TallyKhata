import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { IconButton, Button } from 'react-native-paper';
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
  const [calculatorValue, setCalculatorValue] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
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

  // Calculator Functions
  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setCalculatorValue(digit);
      setWaitingForOperand(false);
    } else {
      // Prevent leading zeros for multi-digit numbers
      if (calculatorValue === '0' && digit !== '0') {
        setCalculatorValue(digit);
      } else if (calculatorValue !== '0' || digit !== '0') {
        setCalculatorValue(calculatorValue + digit);
      }
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setCalculatorValue('0.');
      setWaitingForOperand(false);
    } else if (calculatorValue.indexOf('.') === -1) {
      setCalculatorValue(calculatorValue + '.');
    }
  };

  const clearAll = () => {
    setCalculatorValue('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setCalculatorValue('0');
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(calculatorValue);
    
    // Validate input
    if (isNaN(inputValue)) {
      Alert.alert('ত্রুটি', 'অবৈধ সংখ্যা');
      return;
    }

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let newValue: number;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          if (inputValue === 0) {
            Alert.alert('ত্রুটি', 'শূন্য দিয়ে ভাগ করা যাবে না');
            return;
          }
          newValue = currentValue / inputValue;
          break;
        default:
          newValue = inputValue;
      }

      // Handle very large or small numbers
      if (Math.abs(newValue) > 1e15) {
        Alert.alert('ত্রুটি', 'সংখ্যাটি খুব বড়');
        return;
      }

      setCalculatorValue(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculateResult = () => {
    if (!previousValue || !operation) return;

    const inputValue = parseFloat(calculatorValue);
    
    // Validate input
    if (isNaN(inputValue)) {
      Alert.alert('ত্রুটি', 'অবৈধ সংখ্যা');
      return;
    }
    
    let newValue: number;

    switch (operation) {
      case '+':
        newValue = previousValue + inputValue;
        break;
      case '-':
        newValue = previousValue - inputValue;
        break;
      case '×':
        newValue = previousValue * inputValue;
        break;
      case '÷':
        if (inputValue === 0) {
          Alert.alert('ত্রুটি', 'শূন্য দিয়ে ভাগ করা যাবে না');
          return;
        }
        newValue = previousValue / inputValue;
        break;
      default:
        newValue = inputValue;
    }

    // Handle very large or small numbers
    if (Math.abs(newValue) > 1e15) {
      Alert.alert('ত্রুটি', 'সংখ্যাটি খুব বড়');
      return;
    }

    setCalculatorValue(String(newValue));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const percentage = () => {
    const currentValue = parseFloat(calculatorValue);
    if (isNaN(currentValue)) {
      setCalculatorValue('0');
      return;
    }
    const newValue = currentValue / 100;
    
    // Handle very small numbers
    if (Math.abs(newValue) < 1e-10) {
      setCalculatorValue('0');
    } else {
      setCalculatorValue(String(newValue));
    }
  };

  const handleInputFocus = (inputType: 'dilam' | 'pelam') => {
    setActiveInput(inputType);
    setShowCalculator(true);
    setCalculatorValue('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const applyCalculatorResult = () => {
    if (activeInput === 'dilam') {
      setDilamAmount(calculatorValue);
    } else if (activeInput === 'pelam') {
      setPelamAmount(calculatorValue);
    }
    setShowCalculator(false);
    setActiveInput(null);
  };

  const backspace = () => {
    if (calculatorValue.length > 1) {
      setCalculatorValue(calculatorValue.slice(0, -1));
    } else {
      setCalculatorValue('0');
    }
  };

  const getCalculatorTitle = () => {
    if (activeInput === 'dilam') {
      return 'দিলাম/বেচা - ক্যালকুলেটর (আপনি দিয়েছেন)';
    } else if (activeInput === 'pelam') {
      return 'পেলাম - ক্যালকুলেটর (আপনি পেয়েছেন)';
    }
    return 'ক্যালকুলেটর';
  };

  const formatDisplayValue = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    
    // Format large numbers
    if (Math.abs(num) >= 1e6) {
      return num.toExponential(2);
    }
    
    // Format with appropriate decimal places
    if (value.includes('.')) {
      return parseFloat(value).toFixed(Math.min(2, value.split('.')[1]?.length || 0));
    }
    
    return value;
  };

  // Dropdown Menu Functions
  const handleViewUserDetails = () => {
    setShowDropdown(false);
    // Navigate to user details page or show modal
    Alert.alert('ব্যবহারকারীর বিবরণ', `নাম: ${customer?.name}\nফোন: ${customer?.phone}\nধরন: ${customer?.type}`);
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
    Alert.alert(
      'ব্যবহারকারী মুছুন',
      `আপনি কি নিশ্চিত যে আপনি ${customer?.name} কে মুছতে চান?`,
      [
        { text: 'না', style: 'cancel' },
        { 
          text: 'হ্যাঁ, মুছুন', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer(Number(id));
              Alert.alert('সফল', 'ব্যবহারকারী মুছে ফেলা হয়েছে', [
                { text: 'ঠিক আছে', onPress: () => router.push('/customers-list') }
              ]);
            } catch (error) {
              Alert.alert('ত্রুটি', 'ব্যবহারকারী মুছতে ব্যর্থ');
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // Validate that at least one amount is provided
    if ((!dilamAmount || parseFloat(dilamAmount) <= 0) && 
        (!pelamAmount || parseFloat(pelamAmount) <= 0)) {
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

      Alert.alert(
        'সফল',
        `লেনদেন যোগ করা হয়েছে:\n${message.join('\n')}`,
        [
          {
            text: 'ঠিক আছে',
            onPress: () => {
              // Reset form
              setDilamAmount('');
              setPelamAmount('');
              setNote('');
              setShowCalculator(false);
              setActiveInput(null);
              setCalculatorValue('0');
              setPreviousValue(null);
              setOperation(null);
              setWaitingForOperand(false);
            }
          }
        ]
      );

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
        activeOpacity={0.7}>
        <IconButton
          icon="dots-vertical"
          size={24}
          iconColor={colors.textInverse}
        />
      </TouchableOpacity>
    </View>
  );

  const renderTransactionForm = () => (
    <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={[styles.instructionsTitle, { color: colors.text }]}>
          কিভাবে লেনদেন করবেন?
        </Text>
        <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
          আপনি শুধু দিলাম, শুধু পেলাম, অথবা দুটোই করতে পারেন। অন্তত একটি পরিমাণ দিতে হবে।
        </Text>
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          দিলাম/বেচা (আপনি দিয়েছেন) *
        </Text>
        <Text style={[styles.inputSubLabel, { color: colors.textSecondary }]}>
          আপনি যে পণ্য বিক্রি করেছেন (ঐচ্ছিক)
        </Text>
        <View style={styles.inputWithCalculator}>
          <TextInput
            style={[styles.inputField, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
              flex: 1
            }]}
            placeholder="টাকার পরিমাণ লিখুন"
            placeholderTextColor={colors.textSecondary}
            value={dilamAmount}
            onChangeText={setDilamAmount}
            keyboardType="numeric"
            editable={!submitting}
          />
          <TouchableOpacity
            style={styles.calculatorButton}
            onPress={() => {
              setActiveInput('dilam');
              setShowCalculator(true);
            }}
            activeOpacity={0.7}>
            <IconButton icon="calculator" size={20} iconColor={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          পেলাম (আপনি পেয়েছেন) *
        </Text>
        <Text style={[styles.inputSubLabel, { color: colors.textSecondary }]}>
          আপনি যে পণ্যের মূল্য পেয়েছেন (ঐচ্ছিক)
        </Text>
        <View style={styles.inputWithCalculator}>
          <TextInput
            style={[styles.inputField, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
              flex: 1
            }]}
            placeholder="টাকার পরিমাণ লিখুন"
            placeholderTextColor={colors.textSecondary}
            value={pelamAmount}
            onChangeText={setPelamAmount}
            keyboardType="numeric"
            editable={!submitting}
          />
          <TouchableOpacity
            style={styles.calculatorButton}
            onPress={() => {
              setActiveInput('pelam');
              setShowCalculator(true);
            }}
            activeOpacity={0.7}>
            <IconButton icon="calculator" size={20} iconColor={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Note Input */}
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          নোট (ঐচ্ছিক)
        </Text>
        <TextInput
          style={[styles.textInput, { 
            backgroundColor: colors.surfaceSecondary,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={note}
          onChangeText={setNote}
          placeholder="লেনদেনের নোট দিন"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Transaction Summary */}
      {(dilamAmount || pelamAmount) && (
        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            লেনদেনের সারসংক্ষেপ
          </Text>
          <View style={styles.summaryContent}>
            {dilamAmount && parseFloat(dilamAmount) > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  দিলাম (আপনি দিয়েছেন):
                </Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  {dilamAmount}৳
                </Text>
              </View>
            )}
            {pelamAmount && parseFloat(pelamAmount) > 0 && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  পেলাম (আপনি পেয়েছেন):
                </Text>
                <Text style={[styles.summaryValue, { color: colors.error }]}>
                  {pelamAmount}৳
                </Text>
              </View>
            )}
            {note && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  নোট:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {note}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
      
      {/* Submit Button */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.clearButton, { 
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border
          }]}
          onPress={() => {
            setDilamAmount('');
            setPelamAmount('');
            setNote('');
          }}
          activeOpacity={0.8}>
          <Text style={[styles.clearButtonText, { color: colors.text }]}>
            পরিষ্কার করুন
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.submitButton, { 
            backgroundColor: colors.primary,
            opacity: submitting ? 0.7 : 1
          }]}
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
        <Text style={[styles.loadingText, { color: colors.text }]}>
          লোড হচ্ছে...
        </Text>
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
          <View style={[styles.calculatorContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.calculatorDisplay}>
              <Text style={[styles.calculatorValue, { color: colors.text }]}>
                {formatDisplayValue(calculatorValue)}
              </Text>
              {operation && previousValue !== null && (
                <Text style={[styles.calculatorOperation, { color: colors.textSecondary }]}>
                  {formatDisplayValue(String(previousValue))} {operation}
                </Text>
              )}
              {!operation && !waitingForOperand && (
                <Text style={[styles.calculatorOperation, { color: colors.textSecondary }]}>
                  {getCalculatorTitle().split(' - ')[0]}
                </Text>
              )}
            </View>
            
            <View style={styles.calculatorButtons}>
              {/* Calculator Header with Close Button */}
              <View style={styles.calculatorHeader}>
                <Text style={[styles.calculatorTitle, { color: colors.text }]}>
                  {getCalculatorTitle()}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowCalculator(false)}>
                  <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
                </TouchableOpacity>
              </View>
              {/* First Row */}
              <View style={styles.calculatorRow}>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.error }]}
                  onPress={clearAll}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.textInverse }]}>AC</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.warning }]}
                  onPress={clearEntry}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.textInverse }]}>C</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.warning }]}
                  onPress={percentage}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.textInverse }]}>%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { 
                    backgroundColor: operation === '÷' ? colors.primary : colors.secondary 
                  }]}
                  onPress={() => performOperation('÷')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.textInverse }]}>÷</Text>
                </TouchableOpacity>
              </View>

              {/* Second Row */}
              <View style={styles.calculatorRow}>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => inputDigit('7')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.text }]}>7</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => inputDigit('8')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.text }]}>8</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => inputDigit('9')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.text }]}>9</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { 
                    backgroundColor: operation === '×' ? colors.primary : colors.secondary 
                  }]}
                  onPress={() => performOperation('×')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.textInverse }]}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Third Row */}
              <View style={styles.calculatorRow}>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => inputDigit('4')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.text }]}>4</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => inputDigit('5')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.text }]}>5</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => inputDigit('6')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.text }]}>6</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { 
                    backgroundColor: operation === '+' ? colors.primary : colors.secondary 
                  }]}
                  onPress={() => performOperation('+')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.textInverse }]}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Fourth Row */}
              <View style={styles.calculatorRow}>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => inputDigit('1')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.text }]}>1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => inputDigit('2')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.text }]}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => inputDigit('3')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.text }]}>3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { 
                    backgroundColor: operation === '-' ? colors.primary : colors.secondary 
                  }]}
                  onPress={() => performOperation('-')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.textInverse }]}>-</Text>
                </TouchableOpacity>
              </View>

              {/* Fifth Row */}
              <View style={styles.calculatorRow}>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => inputDigit('0')}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.text }]}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={inputDecimal}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.text }]}>.</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={backspace}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.text }]}>⌫</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.calcButton, { backgroundColor: colors.primary }]}
                  onPress={calculateResult}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.textInverse }]}>=</Text>
                </TouchableOpacity>
              </View>

              {/* Sixth Row - Apply Result Button */}
              <View style={styles.calculatorRow}>
                <TouchableOpacity
                  style={[styles.applyButton, { backgroundColor: colors.success }]}
                  onPress={applyCalculatorResult}
                  activeOpacity={0.7}>
                  <Text style={[styles.calcButtonText, { color: colors.textInverse }]}>✓ প্রয়োগ করুন</Text>
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
              <Text style={[styles.dropdownTitle, { color: colors.text }]}>
                ব্যবহারকারী অপশন
              </Text>
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
              <IconButton
                icon="account-details"
                size={20}
                iconColor={colors.primary}
              />
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                ব্যবহারকারীর বিবরণ
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              onPress={handleViewUserReports}
              activeOpacity={0.7}>
              <IconButton
                icon="chart-line"
                size={20}
                iconColor={colors.info}
              />
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                ব্যবহারকারীর রিপোর্ট
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              onPress={handleUpdateUser}
              activeOpacity={0.7}>
              <IconButton
                icon="pencil"
                size={20}
                iconColor={colors.warning}
              />
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                আপডেট করুন
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setShowDropdown(false);
                router.push(`/customer-upgrade/${id}`);
              }}
              activeOpacity={0.7}>
              <IconButton
                icon="star"
                size={20}
                iconColor={colors.accent}
              />
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                আপগ্রেড করুন
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.dropdownItem]}
              onPress={handleDeleteUser}
              activeOpacity={0.7}>
              <IconButton
                icon="delete"
                size={20}
                iconColor={colors.error}
              />
              <Text style={[styles.dropdownItemText, { color: colors.error }]}>
                মুছুন
              </Text>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
  inputField: {
    height: 50,
    borderWidth: 0,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
    backgroundColor: 'transparent',
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
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  clearButtonText: {
    fontSize: 16,
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
  },
  calculatorContainer: {
    margin: 0,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    padding: 16,
  },
  calculatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calculatorRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  calcButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  calcButtonText: {
    fontSize: 18,
    fontWeight: '600',
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

