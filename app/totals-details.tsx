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
import { IconButton, Card, Chip, SegmentedButtons } from 'react-native-paper';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import {
  getDetailedTotals,
  getTotalsSummary,
  getTotalsByDateRange,
  exportTotalsData,
} from '~/lib/db';
import { useTheme } from '~/context/ThemeContext';

interface CustomerTotal {
  id: number;
  name: string;
  phone: string;
  customer_type: string;
  total_receivable: number;
  total_payable: number;
  net_balance: number;
  transaction_count: number;
}

interface DailyTotal {
  date: string;
  daily_receivable: number;
  daily_payable: number;
  transaction_count: number;
}

export default function TotalsDetailsScreen() {
  const [customers, setCustomers] = useState<CustomerTotal[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'receivable' | 'payable'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme.custom;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Set initial type based on route params
      if (type === 'receivable') {
        setSelectedType('receivable');
      } else if (type === 'payable') {
        setSelectedType('payable');
      }

      const [customersResult, summaryResult] = await Promise.all([
        getDetailedTotals(type as 'receivable' | 'payable'),
        getTotalsSummary(),
      ]);

      setCustomers(customersResult as CustomerTotal[]);
      setSummary(summaryResult);

      // Load daily totals for the selected period
      const endDate = new Date().toISOString().split('T')[0];
      let startDate = new Date();

      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const dailyResult = await getTotalsByDateRange(
        startDate.toISOString().split('T')[0],
        endDate
      );

      setDailyTotals(dailyResult as DailyTotal[]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('ত্রুটি', 'ডেটা লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, [type, selectedPeriod]);

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

  const handleCustomerPress = (customerId: number) => {
    router.push(`/customer-reports/${customerId}`);
  };

  const handleExportData = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      let startDate = new Date();

      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const exportData = await exportTotalsData(startDate.toISOString().split('T')[0], endDate);

      // For now, just show success message
      // In a real app, you would save this to a file or share it
      Alert.alert('সফল', `${Array.isArray(exportData) ? exportData.length : 0} রেকর্ড এক্সপোর্ট করা হয়েছে`, [{ text: 'ঠিক আছে' }]);

      console.log('Exported data:', exportData);
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('ত্রুটি', 'এক্সপোর্ট করতে ব্যর্থ');
    }
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value as 'all' | 'receivable' | 'payable');
    // Reload data with new filter
    loadData();
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value as 'week' | 'month' | 'year');
    // Reload data with new period
    loadData();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD').format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const getFilteredCustomers = () => {
    if (selectedType === 'all') return customers;

    return customers.filter((customer) => {
      if (selectedType === 'receivable') {
        return customer.total_receivable > 0;
      } else if (selectedType === 'payable') {
        return customer.total_payable > 0;
      }
      return true;
    });
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress} activeOpacity={0.7}>
        <IconButton icon="arrow-left" size={24} iconColor={colors.textInverse} />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: colors.textInverse }]}>মোট হিসাবের বিবরণ</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textInverse }]}>
          পাবো এবং দেবো এর বিস্তারিত
        </Text>
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={handleExportData} activeOpacity={0.7}>
        <IconButton icon="download" size={24} iconColor={colors.textInverse} />
      </TouchableOpacity>
    </View>
  );

  const renderExplanation = () => (
    <View style={styles.explanationContainer}>
      <Text style={[styles.explanationTitle, { color: colors.text }]}>কিভাবে বুঝবেন?</Text>
      <View style={styles.explanationContent}>
        <View style={styles.explanationItem}>
          <Text style={[styles.explanationIcon, { color: colors.success }]}>📥</Text>
          <View style={styles.explanationText}>
            <Text style={[styles.explanationLabel, { color: colors.text }]}>
              মোট পাবো (পণ্য বিক্রি করেছেন):
            </Text>
            <Text style={[styles.explanationDescription, { color: colors.textSecondary }]}>
              আপনি যে পণ্য বিক্রি করেছেন, তার মূল্য পরে পাবেন
            </Text>
          </View>
        </View>

        <View style={styles.explanationItem}>
          <Text style={[styles.explanationIcon, { color: colors.error }]}>📤</Text>
          <View style={styles.explanationText}>
            <Text style={[styles.explanationLabel, { color: colors.text }]}>
              মোট দেবো (মূল্য পেয়েছেন):
            </Text>
            <Text style={[styles.explanationDescription, { color: colors.textSecondary }]}>
              আপনি যে পণ্যের মূল্য পেয়েছেন, আপনার পাওনা পরিশোধ হয়েছে
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSummary = () => {
    if (!summary) return null;

    return (
      <View style={styles.summaryContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>সারসংক্ষেপ</Text>

        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                ৳{formatAmount(summary.total_receivable)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>মোট পাবো</Text>
              <Text style={[styles.statSubLabel, { color: colors.textSecondary }]}>
                (পণ্য বিক্রি করেছেন)
              </Text>
            </View>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.error }]}>
                ৳{formatAmount(summary.total_payable)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>মোট দেবো</Text>
              <Text style={[styles.statSubLabel, { color: colors.textSecondary }]}>
                (মূল্য পেয়েছেন)
              </Text>
            </View>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statContent}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: summary.net_balance >= 0 ? colors.success : colors.error,
                  },
                ]}>
                {summary.net_balance >= 0 ? '+' : ''}৳{formatAmount(Math.abs(summary.net_balance))}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>নিট ব্যালেন্স</Text>
              <Text style={[styles.statSubLabel, { color: colors.textSecondary }]}>
                {summary.net_balance >= 0 ? '(আপনার পাওনা)' : '(আপনার দেনা)'}
              </Text>
            </View>
          </Card>
        </View>
      </View>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>ফিল্টার</Text>

      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>ধরন:</Text>
        <SegmentedButtons
          value={selectedType}
          onValueChange={handleTypeChange}
          buttons={[
            { value: 'all', label: 'সব' },
            { value: 'receivable', label: 'পাবো (পণ্য বিক্রি)' },
            { value: 'payable', label: 'দেবো (মূল্য পেয়েছেন)' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>সময়কাল:</Text>
        <SegmentedButtons
          value={selectedPeriod}
          onValueChange={handlePeriodChange}
          buttons={[
            { value: 'week', label: 'সপ্তাহ' },
            { value: 'month', label: 'মাস' },
            { value: 'year', label: 'বছর' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>
    </View>
  );

  const renderCustomerList = () => {
    const filteredCustomers = getFilteredCustomers();

    if (filteredCustomers.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            কোন গ্রাহক পাওয়া যায়নি
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.customersContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>গ্রাহক তালিকা</Text>

        {filteredCustomers.map((customer) => (
          <TouchableOpacity
            key={customer.id}
            style={[styles.customerCard, { backgroundColor: colors.surface }]}
            onPress={() => handleCustomerPress(customer.id)}
            activeOpacity={0.8}>
            <View style={styles.customerHeader}>
              <View style={styles.customerInfo}>
                <Text style={[styles.customerName, { color: colors.text }]}>{customer.name}</Text>
                <Text style={[styles.customerPhone, { color: colors.textSecondary }]}>
                  {customer.phone || 'ফোন নম্বর নেই'}
                </Text>
              </View>
              <Chip
                mode="outlined"
                textStyle={{ color: colors.primary }}
                style={{ borderColor: colors.primary }}>
                {customer.customer_type || 'নিয়মিত'}
              </Chip>
            </View>

            <View style={styles.customerStats}>
              <View style={styles.customerStat}>
                <Text style={[styles.customerStatLabel, { color: colors.textSecondary }]}>
                  পাবো (পণ্য বিক্রি)
                </Text>
                <Text style={[styles.customerStatValue, { color: colors.success }]}>
                  ৳{formatAmount(customer.total_receivable)}
                </Text>
              </View>

              <View style={styles.customerStat}>
                <Text style={[styles.customerStatLabel, { color: colors.textSecondary }]}>
                  দেবো (মূল্য পেয়েছেন)
                </Text>
                <Text style={[styles.customerStatValue, { color: colors.error }]}>
                  ৳{formatAmount(customer.total_payable)}
                </Text>
              </View>

              <View style={styles.customerStat}>
                <Text style={[styles.customerStatLabel, { color: colors.textSecondary }]}>
                  নিট ব্যালেন্স
                </Text>
                <Text
                  style={[
                    styles.customerStatValue,
                    {
                      color: customer.net_balance >= 0 ? colors.success : colors.error,
                    },
                  ]}>
                  {customer.net_balance >= 0 ? '+' : ''}৳
                  {formatAmount(Math.abs(customer.net_balance))}
                </Text>
              </View>
            </View>

            <View style={styles.customerFooter}>
              <Text style={[styles.transactionCount, { color: colors.textSecondary }]}>
                {customer.transaction_count} লেনদেন
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderDailyChart = () => {
    if (dailyTotals.length === 0) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>দৈনিক প্রবণতা</Text>

        <View style={styles.chartData}>
          {dailyTotals.slice(0, 7).map((daily, index) => (
            <View key={index} style={styles.chartRow}>
              <Text style={[styles.chartDate, { color: colors.textSecondary }]}>
                {formatDate(daily.date)}
              </Text>
              <View style={styles.chartValues}>
                <Text style={[styles.chartValue, { color: colors.success }]}>
                  +{formatAmount(daily.daily_receivable)}৳
                </Text>
                <Text style={[styles.chartLabelItem, { color: colors.success }]}>(দিয়েছেন)</Text>
                <Text style={[styles.chartValue, { color: colors.error }]}>
                  -{formatAmount(daily.daily_payable)}৳
                </Text>
                <Text style={[styles.chartLabelItem, { color: colors.error }]}>(পেয়েছেন)</Text>
              </View>
            </View>
          ))}
        </View>
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
      {renderExplanation()}

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {renderSummary()}
        {renderFilters()}
        {renderCustomerList()}
        {renderDailyChart()}
        <View style={styles.bottomSpacing} />
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
  exportButton: {
    marginLeft: 16,
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
  summaryContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
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
  filtersContainer: {
    marginBottom: 24,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 16,
    minWidth: 80,
  },
  segmentedButtons: {
    flex: 1,
  },
  customersContainer: {
    marginBottom: 24,
  },
  customerCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  customerStat: {
    alignItems: 'center',
  },
  customerStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  customerStatValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  customerFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  transactionCount: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartData: {
    gap: 12,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  chartDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartValues: {
    flexDirection: 'row',
    gap: 16,
  },
  chartValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 100,
  },
  explanationContainer: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  explanationContent: {
    width: '100%',
  },
  explanationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  explanationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  explanationText: {
    flex: 1,
  },
  explanationLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  explanationDescription: {
    fontSize: 14,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  chartLabelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chartLabelText: {
    fontSize: 12,
  },
});
