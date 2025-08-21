import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Avatar, IconButton, Surface, FAB } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { getCustomers, getUserProfile, getDashboardStats } from '~/lib/db';
import { StatusBar } from 'expo-status-bar';
import { CustomerCardSkeleton } from '../../components/SkeletonLoader';
import { useTheme } from '~/context/ThemeContext';
import PageTransition from '../../components/PageTransition';

export default function HomeScreen() {
  interface Customer {
    id: number;
    name: string;
    phone: string;
    type: string;
    photo?: string;
    total_balance: number;
  }

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const { theme, isDark } = useTheme();
  const { colors, borderRadius } = theme.custom;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Load all data in parallel
      const [customersResult, profileResult, statsResult] = await Promise.all([
        getCustomers(),
        getUserProfile(),
        getDashboardStats(),
      ]);

      setCustomers(customersResult as Customer[]);
      setProfile(profileResult);
      setStats(statsResult);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on initial mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      onPress={() => router.push(`/transaction/${item.id}`)}
      style={styles.customerCardContainer}>
      <Surface
        style={[
          styles.customerCard,
          {
            backgroundColor: 'transparent',
            borderRadius: borderRadius.md,
            borderRightWidth: 3,
            borderRightColor: colors.primary,
          },
        ]}
        elevation={0}>
        <View style={styles.customerCardContent}>
          <View style={styles.customerInfo}>
            {item.photo ? (
              <Avatar.Image size={50} source={{ uri: item.photo }} style={styles.customerAvatar} />
            ) : (
              <Avatar.Text
                size={50}
                label={item.name ? item.name.charAt(0).toUpperCase() : '?'}
                style={[
                  styles.customerAvatar,
                  { backgroundColor: item.type === 'Customer' ? colors.primary : colors.accent },
                ]}
                labelStyle={styles.avatarLabel}
              />
            )}
            <View style={styles.customerDetails}>
              <Text style={[styles.customerName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.customerPhone, { color: colors.textSecondary }]}>
                {item.phone || 'No phone'} • {item.type}
              </Text>
              <View style={styles.balanceRow}>
                <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
                  Balance:{' '}
                </Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    { color: item.total_balance >= 0 ? colors.success : colors.error },
                  ]}>
                  {profile?.currency || '৳'}
                  {Math.abs(item.total_balance || 0).toFixed(0)}
                  <Text style={[styles.balanceType, { color: colors.textTertiary }]}>
                    {item.total_balance >= 0 ? ' (Credit)' : ' (Debit)'}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
          <IconButton
            icon="chevron-right"
            size={24}
            iconColor={colors.textSecondary}
            style={styles.chevronIcon}
          />
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderWelcomeCard = () => (
    <Surface
      style={[
        styles.welcomeCard,
        {
          backgroundColor: colors.primary,
          borderRadius: borderRadius.lg,
        },
      ]}
      elevation={0}>
      <View style={styles.welcomeCardContent}>
        <View style={styles.welcomeCardHeader}>
          <View style={styles.welcomeTextSection}>
            <Text style={[styles.welcomeGreeting, { color: colors.background }]}>
              Good{' '}
              {new Date().getHours() < 12
                ? 'Morning'
                : new Date().getHours() < 18
                  ? 'Afternoon'
                  : 'Evening'}
              !
            </Text>
            <Text style={[styles.welcomeName, { color: colors.background }]}>
              {profile?.name || 'Welcome to TallyKhata'}
            </Text>
            <Text style={[styles.welcomeSubtext, { color: colors.background }]}>
              Manage your business with ease
            </Text>
          </View>
        </View>
        <View style={[styles.welcomeDecorative, { borderColor: colors.border }]}>
          <View style={[styles.decorativeDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.decorativeLine, { backgroundColor: colors.border }]} />
          <View style={[styles.decorativeDot, { backgroundColor: colors.accent }]} />
        </View>
      </View>
    </Surface>
  );

  const renderQuickStatusCard = () => (
    <Surface
      style={[
        styles.quickStatusCard,
        {
          backgroundColor: 'white',
          borderRadius: borderRadius.md,
        },
      ]}
      elevation={0}>
      <View style={styles.quickStatusContent}>
        <Text style={[styles.quickStatusTitle, { color: colors.text }]}>Quick Status</Text>
        <View style={styles.quickStatusGrid}>
          <View style={styles.quickStatusItem}>
            <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Credit</Text>
            <Text style={[styles.statusValue, { color: colors.success }]}>
              {profile?.currency || '৳'}
              {stats?.totalCredit || 0}
            </Text>
          </View>
          <View style={styles.quickStatusItem}>
            <View style={[styles.statusIndicator, { backgroundColor: colors.error }]} />
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Debit</Text>
            <Text style={[styles.statusValue, { color: colors.error }]}>
              {profile?.currency || '৳'}
              {stats?.totalDebit || 0}
            </Text>
          </View>
        </View>
      </View>
    </Surface>
  );

  if (loading) {
    return (
      <PageTransition>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.loadingContainer}>
            {[1, 2, 3, 4].map((item) => (
              <CustomerCardSkeleton key={item} />
            ))}
          </View>
        </View>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          {/* Welcome Card */}
          {renderWelcomeCard()}

          {/* Quick Status Card */}
          {renderQuickStatusCard()}

          {/* Recent Customers */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Customers</Text>
              <TouchableOpacity onPress={() => router.push('/customers-list')}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>

            {customers.length > 0 ? (
              customers
                .slice(0, 5)
                .map((item) => <View key={item.id}>{renderCustomer({ item })}</View>)
            ) : (
              <Surface
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: 'transparent',
                    borderRadius: borderRadius.md,
                  },
                ]}
                elevation={0}>
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                  No Customers Yet
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                  Start by adding your first customer to track transactions
                </Text>
                <Button
                  mode="contained"
                  onPress={() => router.push('/add-customer')}
                  style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}>
                  Add Customer
                </Button>
              </Surface>
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/add-customer')}
          color={colors.textInverse}
          label="Add Customer"
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
  scrollViewContent: {
    paddingBottom: 80, // Add padding for FAB
  },
  headerContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  welcomeText: {
    opacity: 0.9,
    marginBottom: 4,
    fontWeight: '500',
  },
  userNameText: {
    fontWeight: 'bold',
  },
  headerRightAction: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -20,
  },
  loadingContainer: {
    padding: 16,
  },
  // Welcome Card Styles
  welcomeCard: {
    margin: 16,
    marginBottom: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  welcomeCardContent: {
    flex: 1,
  },
  welcomeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTextSection: {
    flex: 1,
    marginRight: 16,
  },
  welcomeGreeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.8,
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  welcomeAvatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    borderRadius: 30,
    padding: 5,
  },
  welcomeAvatar: {
    backgroundColor: 'transparent',
  },
  welcomeAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeDecorative: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  decorativeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  decorativeLine: {
    height: 1,
    flex: 1,
    marginHorizontal: 12,
  },
  // Quick Status Card Styles
  quickStatusCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickStatusContent: {
    flex: 1,
  },
  quickStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  quickStatusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickStatusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  statsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flex: 1,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    flex: 1,
  },
  statItem: {
    alignItems: 'center',
    marginVertical: 10,
    flex: 1,
    minWidth: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionContainer: {
    margin: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customerCardContainer: {
    marginBottom: 12,
  },
  customerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    flex: 1,
  },
  customerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexShrink: 1,
  },
  customerAvatar: {
    marginRight: 12,
  },
  avatarLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 13,
    color: '#666',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  balanceLabel: {
    fontSize: 11,
    marginRight: 4,
  },
  balanceType: {
    fontSize: 11,
  },
  chevronIcon: {
    margin: 0,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#fe4c24',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fe4c24',
  },
});
