import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, IconButton, Chip, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, parseISO } from 'date-fns';
import PageTransition from '../../components/PageTransition';
import {
  getDailyReport,
  getMonthlyReport,
  getMonthlySummary,
  getYearOverYearReport,
  getTopCustomersReport,
  getUserProfile,
} from '~/lib/db';

interface ReportSummary {
  totalTransactions: number;
  totalCredit: number;
  totalDebit: number;
  netAmount: number;
  uniqueCustomers: number;
  activeDays?: number;
}

const Cashbox: React.FC = () => {
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly' | 'top-customers'>(
    'daily'
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Report data states
  const [dailyData, setDailyData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<ReportSummary | null>(null);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const today = format(selectedDate, 'yyyy-MM-dd');
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;

      switch (reportType) {
        case 'daily':
          const daily = await getDailyReport(today);
          setDailyData(daily);
          break;

        case 'monthly':
          const monthly = await getMonthlyReport(year, month);
          const summary = await getMonthlySummary(year, month);
          setMonthlyData(monthly);
          setMonthlySummary(summary);
          break;

        case 'yearly':
          const yearly = await getYearOverYearReport(year);
          setYearlyData(yearly);
          break;

        case 'top-customers':
          const startOfCurrentMonth = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
          const endOfCurrentMonth = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
          const customers = await getTopCustomersReport(startOfCurrentMonth, endOfCurrentMonth, 10);
          setTopCustomers(customers);
          break;
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, reportType]);

  useEffect(() => {
    loadProfile();
    loadReports();
  }, [selectedDate, reportType, loadReports]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (reportType === 'daily') {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      setSelectedDate(newDate);
    } else if (reportType === 'monthly' || reportType === 'top-customers') {
      const newDate =
        direction === 'next' ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1);
      setSelectedDate(newDate);
    } else if (reportType === 'yearly') {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
      setSelectedDate(newDate);
    }
  };

  const getDateDisplayText = () => {
    switch (reportType) {
      case 'daily':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      case 'monthly':
      case 'top-customers':
        return format(selectedDate, 'MMMM yyyy');
      case 'yearly':
        return format(selectedDate, 'yyyy');
      default:
        return '';
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Reports & Analytics</Text>
      <IconButton
        icon="refresh"
        size={24}
        iconColor="white"
        onPress={loadReports}
        style={styles.headerRightAction}
      />
    </View>
  );

  const renderDateNavigation = () => (
    <Surface style={styles.dateNavigation} elevation={0}>
      <IconButton
        icon="chevron-left"
        size={24}
        onPress={() => navigateDate('prev')}
        iconColor="#fe4c24"
      />
      <Text style={styles.dateText}>{getDateDisplayText()}</Text>
      <IconButton
        icon="chevron-right"
        size={24}
        onPress={() => navigateDate('next')}
        iconColor="#fe4c24"
      />
    </Surface>
  );

  const renderReportTypeSelector = () => (
    <View style={styles.chipContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['daily', 'monthly', 'yearly', 'top-customers'].map((type) => (
          <Chip
            key={type}
            selected={reportType === type}
            onPress={() => setReportType(type as any)}
            style={[styles.chip, reportType === type && styles.chipSelected]}
            textStyle={[styles.chipText, reportType === type && styles.chipTextSelected]}>
            {type === 'top-customers'
              ? 'Top Customers'
              : `${type.charAt(0).toUpperCase()}${type.slice(1)}`}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderSummaryCard = (
    title: string,
    value: string | number,
    icon: string,
    color: string
  ) => (
    <Surface style={styles.summaryCard} elevation={0}>
      <IconButton icon={icon} size={24} iconColor={color} style={styles.summaryIcon} />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{title}</Text>
    </Surface>
  );

  const renderDailySummary = () => {
    if (!dailyData) return null;

    const { summary } = dailyData;
    const currency = profile?.currency || '৳';

    return (
      <View style={styles.summaryContainer}>
        {renderSummaryCard('Transactions', summary.totalTransactions, 'swap-horizontal', '#2196F3')}
        {renderSummaryCard(
          'Credit',
          `${currency}${summary.totalCredit.toFixed(0)}`,
          'plus-circle',
          '#4CAF50'
        )}
        {renderSummaryCard(
          'Debit',
          `${currency}${summary.totalDebit.toFixed(0)}`,
          'minus-circle',
          '#F44336'
        )}
        {renderSummaryCard(
          'Net Amount',
          `${currency}${summary.netAmount.toFixed(0)}`,
          'currency-usd',
          summary.netAmount >= 0 ? '#4CAF50' : '#F44336'
        )}
      </View>
    );
  };

  const renderMonthlySummary = () => {
    if (!monthlySummary) return null;

    const currency = profile?.currency || '৳';

    return (
      <View style={styles.summaryContainer}>
        {renderSummaryCard(
          'Transactions',
          monthlySummary.totalTransactions,
          'swap-horizontal',
          '#2196F3'
        )}
        {renderSummaryCard(
          'Credit',
          `${currency}${monthlySummary.totalCredit.toFixed(0)}`,
          'plus-circle',
          '#4CAF50'
        )}
        {renderSummaryCard(
          'Debit',
          `${currency}${monthlySummary.totalDebit.toFixed(0)}`,
          'minus-circle',
          '#F44336'
        )}
        {renderSummaryCard('Active Days', monthlySummary.activeDays || 0, 'calendar', '#FF9800')}
      </View>
    );
  };

  const renderDailyTransactions = () => {
    if (!dailyData?.transactions.length) {
      return (
        <Surface style={styles.emptyCard} elevation={0}>
          <Text style={styles.emptyText}>No transactions found for this date</Text>
        </Surface>
      );
    }

    return (
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Transactions</Text>
        {dailyData.transactions.map((transaction: any, index: number) => (
          <Surface key={index} style={styles.transactionCard} elevation={0}>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionCustomer}>
                {transaction.customer_name || 'Unknown'}
              </Text>
              <Text style={styles.transactionNote}>{transaction.note || 'No description'}</Text>
              <Text style={styles.transactionTime}>
                {format(parseISO(transaction.date), 'HH:mm')}
              </Text>
            </View>
            <View style={styles.transactionAmount}>
              <Text
                style={[
                  styles.transactionAmountText,
                  { color: transaction.type === 'credit' ? '#4CAF50' : '#F44336' },
                ]}>
                {transaction.type === 'credit' ? '+' : '-'}
                {profile?.currency || '৳'}
                {transaction.amount.toFixed(0)}
              </Text>
              <Text style={styles.transactionType}>
                {transaction.type === 'credit' ? 'Credit' : 'Debit'}
              </Text>
            </View>
          </Surface>
        ))}
      </View>
    );
  };

  const renderMonthlyChart = () => {
    if (!monthlyData.length) {
      return (
        <Surface style={styles.emptyCard} elevation={0}>
          <Text style={styles.emptyText}>No data available for this month</Text>
        </Surface>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Daily Breakdown</Text>
        {monthlyData.map((day, index) => (
          <Surface key={index} style={styles.chartItem} elevation={0}>
            <View style={styles.chartDate}>
              <Text style={styles.chartDateText}>{format(parseISO(day.date), 'dd')}</Text>
              <Text style={styles.chartDayText}>{format(parseISO(day.date), 'EEE')}</Text>
            </View>
            <View style={styles.chartData}>
              <Text style={styles.chartTransactions}>{day.totalTransactions} transactions</Text>
              <View style={styles.chartAmounts}>
                <Text style={styles.chartCredit}>
                  +{profile?.currency || '৳'}
                  {day.totalCredit.toFixed(0)}
                </Text>
                <Text style={styles.chartDebit}>
                  -{profile?.currency || '৳'}
                  {day.totalDebit.toFixed(0)}
                </Text>
              </View>
            </View>
            <Text style={[styles.chartNet, { color: day.netAmount >= 0 ? '#4CAF50' : '#F44336' }]}>
              {day.netAmount >= 0 ? '+' : ''}
              {profile?.currency || '৳'}
              {day.netAmount.toFixed(0)}
            </Text>
          </Surface>
        ))}
      </View>
    );
  };

  const renderYearlyChart = () => {
    if (!yearlyData.length) {
      return (
        <Surface style={styles.emptyCard} elevation={0}>
          <Text style={styles.emptyText}>No data available for this year</Text>
        </Surface>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
        {yearlyData.map((month, index) => (
          <Surface key={index} style={styles.chartItem} elevation={0}>
            <View style={styles.chartDate}>
              <Text style={styles.chartDateText}>{month.monthName.substring(0, 3)}</Text>
              <Text style={styles.chartDayText}>Month</Text>
            </View>
            <View style={styles.chartData}>
              <Text style={styles.chartTransactions}>{month.totalTransactions} transactions</Text>
              <View style={styles.chartAmounts}>
                <Text style={styles.chartCredit}>
                  +{profile?.currency || '৳'}
                  {month.totalCredit.toFixed(0)}
                </Text>
                <Text style={styles.chartDebit}>
                  -{profile?.currency || '৳'}
                  {month.totalDebit.toFixed(0)}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.chartNet, { color: month.netAmount >= 0 ? '#4CAF50' : '#F44336' }]}>
              {month.netAmount >= 0 ? '+' : ''}
              {profile?.currency || '৳'}
              {month.netAmount.toFixed(0)}
            </Text>
          </Surface>
        ))}
      </View>
    );
  };

  const renderTopCustomers = () => {
    if (!topCustomers.length) {
      return (
        <Surface style={styles.emptyCard} elevation={0}>
          <Text style={styles.emptyText}>No customer data available for this period</Text>
        </Surface>
      );
    }

    return (
      <View style={styles.topCustomersContainer}>
        <Text style={styles.sectionTitle}>Top Customers</Text>
        {topCustomers.map((customer, index) => (
          <Surface key={index} style={styles.customerCard} elevation={0}>
            <View style={styles.customerRank}>
              <Text style={styles.customerRankText}>#{index + 1}</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerPhone}>{customer.phone || 'No phone'}</Text>
              <Text style={styles.customerTransactions}>
                {customer.transaction_count} transactions
              </Text>
            </View>
            <View style={styles.customerAmounts}>
              <Text style={styles.customerCredit}>
                +{profile?.currency || '৳'}
                {customer.total_credit.toFixed(0)}
              </Text>
              <Text style={styles.customerDebit}>
                -{profile?.currency || '৳'}
                {customer.total_debit.toFixed(0)}
              </Text>
              <Text
                style={[
                  styles.customerNet,
                  { color: customer.net_amount >= 0 ? '#4CAF50' : '#F44336' },
                ]}>
                Net: {customer.net_amount >= 0 ? '+' : ''}
                {profile?.currency || '৳'}
                {customer.net_amount.toFixed(0)}
              </Text>
            </View>
          </Surface>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fe4c24" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      );
    }

    switch (reportType) {
      case 'daily':
        return (
          <>
            {renderDailySummary()}
            {renderDailyTransactions()}
          </>
        );
      case 'monthly':
        return (
          <>
            {renderMonthlySummary()}
            {renderMonthlyChart()}
          </>
        );
      case 'yearly':
        return renderYearlyChart();
      case 'top-customers':
        return renderTopCustomers();
      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <StatusBar style="light" />

      {renderHeader()}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderReportTypeSelector()}
        {renderDateNavigation()}
        {renderContent()}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </PageTransition>
  );
};

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
  headerRightAction: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -20,
  },
  chipContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  chipSelected: {
    backgroundColor: '#fe4c24',
  },
  chipText: {
    color: '#666',
  },
  chipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  summaryIcon: {
    margin: 0,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  transactionsContainer: {
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    marginBottom: 16,
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  chartDate: {
    alignItems: 'center',
    width: 60,
  },
  chartDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chartDayText: {
    fontSize: 12,
    color: '#666',
  },
  chartData: {
    flex: 1,
    marginLeft: 16,
  },
  chartTransactions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  chartAmounts: {
    flexDirection: 'row',
  },
  chartCredit: {
    fontSize: 14,
    color: '#4CAF50',
    marginRight: 12,
  },
  chartDebit: {
    fontSize: 14,
    color: '#F44336',
  },
  chartNet: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    minWidth: 80,
  },
  topCustomersContainer: {
    marginBottom: 16,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  customerRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fe4c24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  customerRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  customerTransactions: {
    fontSize: 12,
    color: '#999',
  },
  customerAmounts: {
    alignItems: 'flex-end',
  },
  customerCredit: {
    fontSize: 12,
    color: '#4CAF50',
  },
  customerDebit: {
    fontSize: 12,
    color: '#F44336',
  },
  customerNet: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  emptyCard: {
    padding: 32,
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default Cashbox;
