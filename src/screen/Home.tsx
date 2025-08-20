import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Button, Avatar, IconButton, Surface, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getCustomers, getUserProfile, getDashboardStats } from '~/lib/db';
import { exportAllData } from '~/lib/exportData';
import { StatusBar } from 'expo-status-bar';
import { CustomerCardSkeleton } from '../../components/SkeletonLoader';

import PageTransition from '../../components/PageTransition';

export default function HomeScreen() {
  interface Customer {
    id: number;
    name: string;
    phone: string;
    type: string;
    total_balance: number;
  }
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  const handleExportData = async () => {
    try {
      Alert.alert('Export Data', 'Choose export format:', [
        {
          text: 'CSV',
          onPress: async () => {
            try {
              await exportAllData();
              Alert.alert('Success', 'Data exported successfully!');
            } catch {
              Alert.alert('Error', 'Failed to export data');
            }
          },
        },
        {
          text: 'JSON',
          onPress: async () => {
            try {
              await exportAllData();
              Alert.alert('Success', 'Data exported successfully!');
            } catch {
              Alert.alert('Error', 'Failed to export data');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all data in parallel
        const [customersResult, profileResult, statsResult] = await Promise.all([
          getCustomers(),
          getUserProfile(),
          getDashboardStats(),
        ]);

        setCustomers(customersResult as Customer[]);
        setProfile(profileResult);
        setStats(statsResult);
      } catch {
        console.error('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      onPress={() => router.push(`/transaction/${item.id}`)}
      style={styles.customerCardContainer}>
      <Surface style={styles.customerCard} elevation={0}>
        <View style={styles.customerCardContent}>
          <View style={styles.customerInfo}>
            <Avatar.Text
              size={50}
              label={item.name ? item.name.charAt(0).toUpperCase() : '?'}
              style={[
                styles.customerAvatar,
                { backgroundColor: item.type === 'Customer' ? '#fe4c24' : '#4CAF50' },
              ]}
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{item.name}</Text>
              <Text style={styles.customerPhone}>
                {item.phone || 'No phone'} • {item.type}
              </Text>
            </View>
          </View>

          <View style={styles.customerBalance}>
            <Text
              style={[
                styles.balanceAmount,
                { color: item.total_balance >= 0 ? '#4CAF50' : '#F44336' },
              ]}>
              {profile?.currency || '৳'}
              {Math.abs(item.total_balance || 0).toFixed(0)}
            </Text>
            <Text style={styles.balanceLabel}>{item.total_balance >= 0 ? 'Credit' : 'Debit'}</Text>
            <IconButton
              icon="chevron-right"
              size={20}
              iconColor="#666"
              style={styles.chevronIcon}
            />
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderDashboardHeader = () => (
    <View style={styles.dashboardHeader}>
      <View style={styles.headerTop}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{profile?.name || 'TallyKhata User'}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/profile-edit' as any)}
          style={styles.profileButton}>
          <Avatar.Text
            size={45}
            label={profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            style={styles.headerAvatar}
          />
        </TouchableOpacity>
      </View>

      {/* Dashboard Stats */}
      <View style={styles.statsContainer}>
        <Surface style={styles.statCard} elevation={0}>
          <IconButton icon="account-group" size={24} iconColor="#fe4c24" style={styles.statIcon} />
          <Text style={styles.statNumber}>{stats?.totalCustomers || 0}</Text>
          <Text style={styles.statLabel}>Customers</Text>
        </Surface>

        <Surface style={styles.statCard} elevation={0}>
          <IconButton
            icon="swap-horizontal"
            size={24}
            iconColor="#4CAF50"
            style={styles.statIcon}
          />
          <Text style={styles.statNumber}>{stats?.totalTransactions || 0}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </Surface>

        <Surface style={styles.statCard} elevation={0}>
          <IconButton icon="currency-usd" size={24} iconColor="#FF9800" style={styles.statIcon} />
          <Text
            style={[styles.statNumber, { color: stats?.netBalance >= 0 ? '#4CAF50' : '#F44336' }]}>
            {profile?.currency || '৳'}
            {Math.abs(stats?.netBalance || 0).toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Balance</Text>
        </Surface>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {/* First Column */}
        <View style={styles.quickActionsColumn}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/add-customer')}>
            <Avatar.Icon
              size={40}
              icon="account-plus"
              style={[styles.quickActionAvatar, { backgroundColor: '#fe4c24' }]}
            />
            <Text style={styles.quickActionTitle}>Add Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => {
              router.push('/(tabs)' as any);
            }}>
            <Avatar.Icon
              size={40}
              icon="chart-bar"
              style={[styles.quickActionAvatar, { backgroundColor: '#2196F3' }]}
            />
            <Text style={styles.quickActionTitle}>View Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem} onPress={() => handleExportData()}>
            <Avatar.Icon
              size={40}
              icon="download"
              style={[styles.quickActionAvatar, { backgroundColor: '#9C27B0' }]}
            />
            <Text style={styles.quickActionTitle}>Export Data</Text>
          </TouchableOpacity>
        </View>

        {/* Second Column */}
        <View style={styles.quickActionsColumn}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/add-transaction')}>
            <Avatar.Icon
              size={40}
              icon="plus-circle"
              style={[styles.quickActionAvatar, { backgroundColor: '#4CAF50' }]}
            />
            <Text style={styles.quickActionTitle}>Add Transaction</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('customers-list' as any)}>
            <Avatar.Icon
              size={40}
              icon="account-group"
              style={[styles.quickActionAvatar, { backgroundColor: '#FF9800' }]}
            />
            <Text style={styles.quickActionTitle}>All Customers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => {
              router.push('/(tabs)' as any);
            }}>
            <Avatar.Icon
              size={40}
              icon="cog"
              style={[styles.quickActionAvatar, { backgroundColor: '#607D8B' }]}
            />
            <Text style={styles.quickActionTitle}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <PageTransition>
      <StatusBar style="light" />

      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>TallyKhata</Text>
        <IconButton
          icon="bell"
          size={24}
          iconColor="white"
          onPress={() => {}}
          style={styles.headerRightAction}
        />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            {[1, 2, 3].map((item) => (
              <CustomerCardSkeleton key={item} />
            ))}
          </View>
        ) : (
          <>
            {renderDashboardHeader()}
            {renderQuickActions()}

            {/* Recent Customers */}
            <View style={styles.customersSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Customers</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/customers' as any)}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              {customers.length > 0 ? (
                customers
                  .slice(0, 5)
                  .map((item) => <View key={item.id.toString()}>{renderCustomer({ item })}</View>)
              ) : (
                <Surface style={styles.emptyState}>
                  <IconButton icon="account-plus" size={48} iconColor="#ccc" />
                  <Text style={styles.emptyStateText}>No customers yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Add your first customer to get started
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => router.push('/add-customer')}
                    style={styles.emptyStateButton}>
                    Add Customer
                  </Button>
                </Surface>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/add-customer')}
        color="white"
      />
    </PageTransition>
  );
}

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
    fontSize: 22,
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
  loadingContainer: {
    padding: 16,
  },
  dashboardHeader: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    borderRadius: 25,
  },
  headerAvatar: {
    backgroundColor: '#fe4c24',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  statIcon: {
    margin: 0,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsContainer: {
    margin: 16,
    marginTop: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  quickActionsColumn: {
    flex: 1,
    gap: 16,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 12,
  },
  quickActionAvatar: {
    margin: 0,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  customersSection: {
    margin: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#fe4c24',
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
  },
  customerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    color: '#333',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 13,
    color: '#666',
  },
  customerBalance: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  balanceLabel: {
    fontSize: 11,
    color: '#666',
    marginRight: 8,
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
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
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
