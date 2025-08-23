import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton, FAB } from 'react-native-paper';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { bn } from 'date-fns/locale';
import PageTransition from '../../components/PageTransition';
import { useTheme } from '~/context/ThemeContext';
import {
  getDashboardStats,
  getDailyReport,
  getMonthlyReport,
  getMonthlySummary,
  getYearOverYearReport,
  getTopCustomersReport,
} from '~/lib/db';

const { width: screenWidth } = Dimensions.get('window');

export default function CashboxScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    'daily'
  );
  const [stats, setStats] = useState<any>(null);
  const [dailyReport, setDailyReport] = useState<any[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme.custom;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, dailyData, monthlyData, topCustomersData] = await Promise.all([
        getDashboardStats(),
        getDailyReport(format(new Date(), 'yyyy-MM-dd')),
        getMonthlyReport(new Date().getFullYear(), new Date().getMonth() + 1),
        getTopCustomersReport(),
      ]);

      setStats(statsData);
      setDailyReport(dailyData?.transactions || []);
      setMonthlyReport(monthlyData || []);
      setTopCustomers(topCustomersData || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      setStats(null);
      setDailyReport([]);
      setMonthlyReport([]);
      setTopCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddTransaction = () => router.push('/add-transaction');
  const handleViewCustomers = () => router.push('/customers-list');

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <Text style={[styles.headerTitle, { color: colors.textInverse }]}>রিপোর্ট</Text>
      <Text style={[styles.headerSubtitle, { color: colors.textInverse }]}>
        আপনার ব্যবসার আর্থিক অবস্থা দেখুন
      </Text>
    </View>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodContainer}>
      <Text style={[styles.periodLabel, { color: colors.textSecondary }]}>সময়কাল:</Text>
      <View style={styles.periodButtons}>
        {[
          { key: 'daily', label: 'দৈনিক' },
          { key: 'weekly', label: 'সাপ্তাহিক' },
          { key: 'monthly', label: 'মাসিক' },
          { key: 'yearly', label: 'বাৎসরিক' },
        ].map((period) => (
          <TouchableOpacity
            key={period.key}
            onPress={() => setSelectedPeriod(period.key as any)}
            style={[
              styles.periodButton,
              {
                backgroundColor: selectedPeriod === period.key ? colors.primary : colors.surface,
              },
            ]}>
            <Text
              style={[
                styles.periodButtonText,
                {
                  color: selectedPeriod === period.key ? colors.textInverse : colors.text,
                },
              ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOverviewCards = () => (
    <View style={styles.overviewContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>সারসংক্ষেপ</Text>
      <View style={styles.cardsRow}>
        <View style={[styles.overviewCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardValue, { color: colors.success }]}>
            +{stats?.totalCredit || 0}৳
          </Text>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>মোট পাওনা</Text>
        </View>

        <View style={[styles.overviewCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardValue, { color: colors.error }]}>{stats?.totalDebit || 0}৳</Text>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>মোট দেনা</Text>
        </View>

        <View style={[styles.overviewCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardValue, { color: colors.primary }]}>
            {stats?.netBalance || 0}৳
          </Text>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>নিট ব্যালেন্স</Text>
        </View>
      </View>
    </View>
  );

  const renderRecentTransactions = () => (
    <View style={styles.transactionsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>সাম্প্রতিক লেনদেন</Text>
        <TouchableOpacity onPress={handleAddTransaction} activeOpacity={0.8}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>নতুন লেনদেন</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsList}>
        {((selectedPeriod === 'daily' ? dailyReport : monthlyReport) || []).length > 0 ? (
          (selectedPeriod === 'daily' ? dailyReport : monthlyReport)
            ?.slice(0, 5)
            ?.map((transaction: any, index: number) => (
              <View
                key={index}
                style={[styles.transactionItem, { backgroundColor: colors.surface }]}>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionName, { color: colors.text }]} numberOfLines={1}>
                    {transaction.customer_name || 'অজানা গ্রাহক'}
                  </Text>
                  <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                    {transaction.date
                      ? format(new Date(transaction.date), 'dd MMM yyyy', { locale: bn })
                      : 'তারিখ নেই'}
                  </Text>
                </View>

                <View style={styles.transactionAmount}>
                  <Text
                    style={[
                      styles.amountText,
                      {
                        color: (transaction.amount || 0) >= 0 ? colors.success : colors.error,
                      },
                    ]}>
                    {(transaction.amount || 0) >= 0 ? '+' : ''}
                    {transaction.amount || 0}৳
                  </Text>
                  <Text style={[styles.transactionType, { color: colors.textSecondary }]}>
                    {(transaction.amount || 0) >= 0 ? 'পাওনা' : 'দেনা'}
                  </Text>
                </View>
              </View>
            ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              কোন লেনদেন পাওয়া যায়নি
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderTopCustomers = () => (
    <View style={styles.topCustomersContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>শীর্ষ গ্রাহক</Text>
        <TouchableOpacity onPress={handleViewCustomers} activeOpacity={0.8}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>সব দেখুন</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.customersList}>
        {topCustomers.slice(0, 5).map((customer, index) => (
          <View
            key={customer.id}
            style={[styles.customerItem, { backgroundColor: colors.surface }]}>
            <View style={styles.customerInfo}>
              <Text style={[styles.customerName, { color: colors.text }]} numberOfLines={1}>
                {customer.name}
              </Text>
              <Text style={[styles.customerPhone, { color: colors.textSecondary }]}>
                {customer.phone || 'ফোন নম্বর নেই'}
              </Text>
            </View>

            <View style={styles.customerBalance}>
              <Text
                style={[
                  styles.balanceText,
                  {
                    color: customer.total_balance >= 0 ? colors.success : colors.error,
                  },
                ]}>
                {customer.total_balance >= 0 ? '+' : ''}
                {customer.total_balance}৳
              </Text>
              <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>ব্যালেন্স</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>রিপোর্ট লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <PageTransition>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        {renderPeriodSelector()}

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.scrollContent}>
          {renderOverviewCards()}
          {renderRecentTransactions()}
          {renderTopCustomers()}
        </ScrollView>

        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleAddTransaction}
          color={colors.textInverse}
        />
      </View>
    </PageTransition>
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
    alignItems: 'center',
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
  periodContainer: {
    padding: 20,
    paddingBottom: 15,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  overviewContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    gap: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
    opacity: 0.7,
  },
  topCustomersContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  customersList: {
    gap: 10,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
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
    fontSize: 12,
    opacity: 0.7,
  },
  customerBalance: {
    alignItems: 'flex-end',
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  balanceLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 80,
    borderRadius: 30,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
});
