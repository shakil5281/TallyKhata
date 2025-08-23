import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { IconButton, Card, Chip } from 'react-native-paper';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getCustomerById, getTransactionsByCustomerId, deleteCustomer } from '~/lib/db';
import { useTheme } from '~/context/ThemeContext';

interface Customer {
  id: number;
  name: string;
  phone: string;
  type: string;
}

interface Transaction {
  id: number;
  customerId: number;
  type: 'debit' | 'credit';
  amount: number;
  note: string;
  createdAt: string;
}

export default function CustomerReportsScreen() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'week'>('all');
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme.custom;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const customerResult = await getCustomerById(Number(id));
      const transactionsResult = await getTransactionsByCustomerId(Number(id));

      setCustomer(customerResult as Customer);
      setTransactions(transactionsResult as Transaction[]);
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleBackPress = () => {
    router.back();
  };

  const handleEditCustomer = () => {
    router.push(`/customer-edit/${id}`);
  };

  const handleDeleteCustomer = () => {
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

  const getFilteredTransactions = () => {
    if (selectedPeriod === 'all') return transactions;

    const now = new Date();
    const filterDate = new Date();

    if (selectedPeriod === 'month') {
      filterDate.setMonth(now.getMonth() - 1);
    } else if (selectedPeriod === 'week') {
      filterDate.setDate(now.getDate() - 7);
    }

    return transactions.filter((t) => new Date(t.createdAt) >= filterDate);
  };

  const calculateStats = () => {
    const filtered = getFilteredTransactions();

    // Fix: Correct calculation logic
    // totalDebit = money you received (debit transactions)
    // totalCredit = money you gave (credit transactions)
    const totalDebit = filtered
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalCredit = filtered
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    // Balance: Credit (given) - Debit (received)
    // Positive = you have net money to receive
    // Negative = you have net money to pay
    const balance = totalCredit - totalDebit;

    return {
      totalDebit, // Money you received
      totalCredit, // Money you gave
      balance, // Net balance
      transactionCount: filtered.length,
    };
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'অবৈধ তারিখ';
      }
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'অবৈধ তারিখ';
    }
  };

  const formatAmount = (amount: number) => {
    try {
      if (isNaN(amount) || !isFinite(amount)) {
        return '0';
      }
      return new Intl.NumberFormat('bn-BD').format(amount);
    } catch (error) {
      return '0';
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress} activeOpacity={0.7}>
        <IconButton icon="arrow-left" size={24} iconColor={colors.textInverse} />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: colors.textInverse }]}>গ্রাহকের রিপোর্ট</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textInverse }]}>
          {customer?.name || 'গ্রাহক'}
        </Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/customer-upgrade/${id}`)}
          activeOpacity={0.7}>
          <IconButton icon="star" size={20} iconColor={colors.accent} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEditCustomer}
          activeOpacity={0.7}>
          <IconButton icon="pencil" size={20} iconColor={colors.textInverse} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDeleteCustomer}
          activeOpacity={0.7}>
          <IconButton icon="delete" size={20} iconColor={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStats = () => {
    const stats = calculateStats();

    return (
      <View style={styles.statsContainer}>
        {/* Explanation Section */}
        <View style={styles.explanationContainer}>
          <Text style={[styles.explanationTitle, { color: colors.text }]}>কিভাবে বুঝবেন?</Text>
          <View style={styles.explanationContent}>
            <View style={styles.explanationItem}>
              <Text style={[styles.explanationIcon, { color: colors.success }]}>📥</Text>
              <View style={styles.explanationText}>
                <Text style={[styles.explanationLabel, { color: colors.text }]}>
                  মোট দিলাম (আপনি দিয়েছেন):
                </Text>
                <Text style={[styles.explanationDescription, { color: colors.textSecondary }]}>
                  আপনি যে টাকা দিয়েছেন, যা পরে ফেরত পাবেন
                </Text>
              </View>
            </View>

            <View style={styles.explanationItem}>
              <Text style={[styles.explanationIcon, { color: colors.error }]}>📤</Text>
              <View style={styles.explanationText}>
                <Text style={[styles.explanationLabel, { color: colors.text }]}>
                  মোট পেলাম (আপনি পেয়েছেন):
                </Text>
                <Text style={[styles.explanationDescription, { color: colors.textSecondary }]}>
                  আপনি যে টাকা পেয়েছেন, যা পরে ফেরত দিতে হবে
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>সারসংক্ষেপ</Text>

        {/* Period Summary */}
        <View style={styles.periodSummary}>
          <Text style={[styles.periodText, { color: colors.textSecondary }]}>
            {selectedPeriod === 'all'
              ? 'সব সময়ের লেনদেন'
              : selectedPeriod === 'month'
                ? 'গত মাসের লেনদেন'
                : 'গত সপ্তাহের লেনদেন'}
          </Text>
          <Text style={[styles.periodCount, { color: colors.primary }]}>
            {stats.transactionCount} টি লেনদেন
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {formatAmount(stats.totalCredit)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>মোট দিলাম</Text>
              <Text style={[styles.statSubLabel, { color: colors.textSecondary }]}>
                (আপনি দিয়েছেন)
              </Text>
            </View>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {formatAmount(stats.totalDebit)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>মোট পেলাম</Text>
              <Text style={[styles.statSubLabel, { color: colors.textSecondary }]}>
                (আপনি পেয়েছেন)
              </Text>
            </View>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statContent}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: stats.balance >= 0 ? colors.success : colors.error,
                  },
                ]}>
                {formatAmount(Math.abs(stats.balance))}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {stats.balance >= 0 ? 'বাকি পাবো' : 'বাকি দেবো'}
              </Text>
              <Text style={[styles.statSubLabel, { color: colors.textSecondary }]}>
                {stats.balance >= 0 ? '(আপনার পাওনা)' : '(আপনার দেনা)'}
              </Text>
            </View>
          </Card>

          {/* Balance Explanation */}
          <View style={styles.balanceExplanation}>
            <Text style={[styles.balanceExplanationText, { color: colors.textSecondary }]}>
              {stats.balance >= 0
                ? `আপনি ${formatAmount(stats.balance)}৳ পাবেন (দিয়েছেন ${formatAmount(stats.totalCredit)}৳, পেয়েছেন ${formatAmount(stats.totalDebit)}৳)`
                : `আপনি ${formatAmount(Math.abs(stats.balance))}৳ দেবেন (দিয়েছেন ${formatAmount(stats.totalCredit)}৳, পেয়েছেন ${formatAmount(stats.totalDebit)}৳)`}
            </Text>
          </View>

          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.info }]}>
                {stats.transactionCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>লেনদেন</Text>
            </View>
          </Card>
        </View>
      </View>
    );
  };

  const renderPeriodFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>সময়কাল</Text>

      <View style={styles.filterChips}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedPeriod === 'all' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSelectedPeriod('all')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterChipText,
              { color: selectedPeriod === 'all' ? colors.textInverse : colors.text },
            ]}>
            সব
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedPeriod === 'month' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSelectedPeriod('month')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterChipText,
              { color: selectedPeriod === 'month' ? colors.textInverse : colors.text },
            ]}>
            গত মাস
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedPeriod === 'week' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setSelectedPeriod('week')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterChipText,
              { color: selectedPeriod === 'week' ? colors.textInverse : colors.text },
            ]}>
            গত সপ্তাহ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTransactions = () => {
    const filteredTransactions = getFilteredTransactions();

    if (filteredTransactions.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            কোন লেনদেন পাওয়া যায়নি
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.transactionsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>লেনদেনের তালিকা</Text>

        {filteredTransactions.map((transaction, index) => (
          <Card
            key={transaction.id}
            style={[styles.transactionCard, { backgroundColor: colors.surface }]}>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionType}>
                <View
                  style={[
                    styles.typeIndicator,
                    {
                      backgroundColor: transaction.type === 'debit' ? colors.error : colors.success,
                    },
                  ]}
                />
                <Text style={[styles.transactionTypeText, { color: colors.text }]}>
                  {transaction.type === 'debit' ? 'পেলাম (আপনি পেয়েছেন)' : 'দিলাম (আপনি দিয়েছেন)'}
                </Text>
              </View>
              <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                {formatDate(transaction.createdAt)}
              </Text>
            </View>

            <View style={styles.transactionDetails}>
              <Text style={[styles.transactionAmount, { color: colors.text }]}>
                ৳{formatAmount(transaction.amount)}
              </Text>
              {transaction.note && (
                <Text style={[styles.transactionNote, { color: colors.textSecondary }]}>
                  {transaction.note}
                </Text>
              )}
            </View>
          </Card>
        ))}
      </View>
    );
  };

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

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {renderStats()}
        {renderPeriodFilter()}
        {renderTransactions()}
      </ScrollView>
    </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
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
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    elevation: 2,
  },
  statContent: {
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  filterContainer: {
    marginBottom: 24,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsContainer: {
    marginBottom: 24,
  },
  transactionCard: {
    marginBottom: 12,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  transactionType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  transactionTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionDetails: {
    padding: 16,
    paddingTop: 8,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transactionNote: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 100,
  },
  // New styles for explanation section
  explanationContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F5F5F5', // Light background for explanation
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  explanationContent: {
    gap: 12,
  },
  explanationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  explanationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  explanationText: {
    flex: 1,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  explanationDescription: {
    fontSize: 13,
  },
  // New styles for period summary
  periodSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  periodText: {
    fontSize: 14,
  },
  periodCount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // New styles for balance explanation
  balanceExplanation: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 12,
  },
  balanceExplanationText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
