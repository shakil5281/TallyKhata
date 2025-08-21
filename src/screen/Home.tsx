import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Surface, IconButton, Avatar, Chip, FAB, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '~/context/ThemeContext';
import { getCustomers, getUserProfile, getDashboardStats, getTotalsSummary } from '~/lib/db';

interface Customer {
  id: number;
  name: string;
  phone: string;
  type: string;
  photo?: string;
  total_balance: number;
}
import PageTransition from '../../components/PageTransition';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme.custom;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Load all data in parallel
      const [customersResult, profileResult, statsResult, totalsResult] = await Promise.all([
        getCustomers(),
        getUserProfile(),
        getDashboardStats(),
        getTotalsSummary(),
      ]);

      setCustomers(customersResult as Customer[]);
      setProfile(profileResult);
      setStats(statsResult);
      
      // Merge totals with stats
      setStats({
        ...statsResult,
        ...totalsResult
      });
    } catch (error) {
      console.error('Error loading data:', error);
      // Set fallback values to prevent crashes
      setCustomers([]);
      setProfile(null);
      setStats(null);
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

  const handleAddCustomer = () => router.push('/add-customer');
  const handleAddTransaction = () => router.push('/add-transaction');
  const handleViewCustomers = () => router.push('/customers-list');
  const handleViewReports = () => router.push('/cashbox');
  const handleProfilePress = () => router.push('/profile-edit');
  const handleUserTransactions = () => router.push('/cashbox');
  const handleSettingsPress = () => router.push('/settings');

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
    <LinearGradient
      colors={[colors.primary, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}>
      <View style={styles.headerContent}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.8}>
            <Avatar.Text
              size={60}
              label={profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              style={[styles.profileAvatar, { backgroundColor: colors.textInverse + '20' }]}
              labelStyle={[styles.profileAvatarText, { color: colors.textInverse }]}
            />
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={[styles.greeting, { color: colors.textInverse }]}>
              {new Date().getHours() < 12
                ? 'সুপ্রভাত'
                : new Date().getHours() < 18
                  ? 'সুন্দর বিকাল'
                  : 'শুভ সন্ধ্যা'}
            </Text>
            <Text style={[styles.userName, { color: colors.textInverse }]}>
              {profile?.name || 'স্বাগতম'}
            </Text>
            {profile?.business_name && (
              <Text style={[styles.businessName, { color: colors.textInverse + '80' }]}>
                {profile.business_name}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={handleSettingsPress} activeOpacity={0.8}>
          <IconButton
            icon="cog"
            size={28}
            iconColor={colors.textInverse}
            style={[styles.settingsButton, { backgroundColor: colors.textInverse + '20' }]}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <Surface style={[styles.statCard, { backgroundColor: colors.surface }]} elevation={0}>
          <View style={[styles.statIcon, { backgroundColor: colors.secondary + '20' }]}>
            <Text style={styles.statIconText}>👥</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {customers.length || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>গ্রাহক</Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: colors.surface }]} elevation={0}>
          <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
            <Text style={styles.statIconText}>💰</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats?.total_balance || 0}৳
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>মোট ব্যালেন্স</Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: colors.surface }]} elevation={0}>
          <View style={[styles.statIcon, { backgroundColor: colors.warning + '20' }]}>
            <Text style={styles.statIconText}>📊</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats?.total_transactions || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>লেনদেন</Text>
        </Surface>
      </View>
    </View>
  );

  const renderTotalsSection = () => {
    const { total_receivable, total_payable, net_balance } = stats;
    
    return (
      <View style={styles.totalsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          মোট হিসাব
        </Text>
        
        <View style={styles.totalsGrid}>
          <Card style={[styles.totalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.totalContent}>
              <Text style={[styles.totalValue, { color: colors.success }]}>
                ৳{formatAmount(total_receivable)}
              </Text>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                মোট পাবো
              </Text>
              <Text style={[styles.totalSubLabel, { color: colors.textSecondary }]}>
                (পণ্য বিক্রি করেছেন)
              </Text>
            </View>
          </Card>
          
          <Card style={[styles.totalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.totalContent}>
              <Text style={[styles.totalValue, { color: colors.error }]}>
                ৳{formatAmount(total_payable)}
              </Text>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                মোট দেবো
              </Text>
              <Text style={[styles.totalSubLabel, { color: colors.textSecondary }]}>
                (মূল্য পেয়েছেন)
              </Text>
            </View>
          </Card>
        </View>
        
        <Card style={[styles.balanceCard, { backgroundColor: colors.surface }]}>
          <View style={styles.balanceContent}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
              নিট ব্যালেন্স
            </Text>
            <Text style={[styles.balanceValue, { 
              color: net_balance >= 0 ? colors.success : colors.error 
            }]}>
              {net_balance >= 0 ? '+' : ''}৳{formatAmount(Math.abs(net_balance))}
            </Text>
            <Text style={[styles.balanceSubLabel, { color: colors.textSecondary }]}>
              {net_balance >= 0 
                ? `আপনি ${formatAmount(net_balance)}৳ পাবেন` 
                : `আপনার ${formatAmount(Math.abs(net_balance))}৳ দেনা আছে`
              }
            </Text>
          </View>
        </Card>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.actionsContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>দ্রুত কাজ</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.secondary }]}
          onPress={handleAddCustomer}
          activeOpacity={0.8}>
          <IconButton icon="account-plus" size={32} iconColor={colors.textInverse} />
          <Text style={[styles.actionText, { color: colors.textInverse }]}>নতুন গ্রাহক</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.success }]}
          onPress={handleAddTransaction}
          activeOpacity={0.8}>
          <IconButton icon="cash-plus" size={32} iconColor={colors.textInverse} />
          <Text style={[styles.actionText, { color: colors.textInverse }]}>নতুন লেনদেন</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.warning }]}
          onPress={handleViewCustomers}
          activeOpacity={0.8}>
          <IconButton icon="account-group" size={32} iconColor={colors.textInverse} />
          <Text style={[styles.actionText, { color: colors.textInverse }]}>সব গ্রাহক</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.info }]}
          onPress={handleViewReports}
          activeOpacity={0.8}>
          <IconButton icon="chart-line" size={32} iconColor={colors.textInverse} />
          <Text style={[styles.actionText, { color: colors.textInverse }]}>রিপোর্ট</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/totals-details')}
          activeOpacity={0.8}>
          <IconButton icon="calculator" size={32} iconColor={colors.textInverse} />
          <Text style={[styles.actionText, { color: colors.textInverse }]}>মোট হিসাব</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentCustomers = () => (
    <View style={styles.customersContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>সাম্প্রতিক গ্রাহক</Text>
        <TouchableOpacity onPress={handleViewCustomers} activeOpacity={0.8}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>সব দেখুন</Text>
        </TouchableOpacity>
      </View>

      {customers.length > 0 ? (
        <View style={styles.customersList}>
          {customers.slice(0, 5).map((customer) => (
            <TouchableOpacity
              key={customer.id}
              style={[styles.customerCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push(`/transaction/${customer.id}`)}
              activeOpacity={0.8}>
              <View style={styles.customerCardContent}>
                <Avatar.Text
                  size={40}
                  label={customer.name.charAt(0).toUpperCase()}
                  style={[styles.customerAvatar, { backgroundColor: colors.secondary }]}
                  labelStyle={styles.customerAvatarText}
                />
                <View style={styles.customerInfo}>
                  <Text style={[styles.customerName, { color: colors.text }]} numberOfLines={1}>
                    {customer.name}
                  </Text>
                  <Text style={[styles.customerPhone, { color: colors.textSecondary }]}>
                    {customer.phone || 'ফোন নম্বর নেই'}
                  </Text>
                </View>
                <Chip
                  mode="outlined"
                  textStyle={[
                    styles.balanceChip,
                    {
                      color: customer.total_balance >= 0 ? colors.success : colors.error,
                    },
                  ]}>
                  {customer.total_balance >= 0 ? '+' : ''}{customer.total_balance}৳
                </Chip>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            এখনও কোন গ্রাহক নেই
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            প্রথম গ্রাহক যোগ করুন
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <PageTransition>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {renderHeader()}
          {renderQuickStats()}
          {renderTotalsSection()}
          {renderQuickActions()}
          {renderRecentCustomers()}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: colors.secondary }]}
          onPress={handleAddCustomer}
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
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  businessName: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  settingsButton: {
    margin: 0,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconText: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (screenWidth - 56) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  customersContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customersList: {
    gap: 12,
  },
  customerCard: {
    borderRadius: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  customerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  customerAvatar: {
    marginRight: 16,
  },
  customerAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  customerInfo: {
    flex: 1,
    marginRight: 16,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  balanceChip: {
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
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
  totalsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  totalsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  totalCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  totalContent: {
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  totalSubLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  totalsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  balanceCard: {
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  balanceContent: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceSubLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
