import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Searchbar,
  IconButton,
  Avatar,
  FAB,
  Divider,
} from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '~/context/ThemeContext';
import { getCustomers } from '~/lib/db';
import PageTransition from '../../components/PageTransition';

const { width: screenWidth } = Dimensions.get('window');

interface Customer {
  id: number;
  name: string;
  phone: string;
  type: string;
  photo?: string;
  total_balance: number;
}

export default function CustomersListScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme.custom;

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const customersData = await getCustomers();
      setCustomers(customersData as Customer[]);
      setFilteredCustomers(customersData as Customer[]);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  }, [loadCustomers]);

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [loadCustomers])
  );

  useEffect(() => {
    let filtered = [...customers];

    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((customer) => {
        const name = customer.name?.toLowerCase() || '';
        const phone = customer.phone?.toLowerCase() || '';
        return name.includes(query) || phone.includes(query);
      });
    }

    if (selectedFilter === 'credit') {
      filtered = filtered.filter((customer) => customer.total_balance > 0);
    } else if (selectedFilter === 'debit') {
      filtered = filtered.filter((customer) => customer.total_balance < 0);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchQuery, selectedFilter]);

  const handleCustomerPress = (customer: Customer) => {
    router.push(`/customer-edit/${customer.id}`);
  };

  const handleTransactionPress = (customer: Customer) => {
    router.push(`/transaction/${customer.id}`);
  };

  const handleAddCustomer = () => {
    router.push('/add-customer');
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <Text style={[styles.headerTitle, { color: colors.textInverse }]}>
        গ্রাহক তালিকা
      </Text>
      <Text style={[styles.headerSubtitle, { color: colors.textInverse }]}>
        {customers.length} জন গ্রাহক
      </Text>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="নাম বা ফোন নম্বর খুঁজুন..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: colors.surface }]}
        inputStyle={[styles.searchInput, { color: colors.text }]}
        iconColor={colors.textSecondary}
        placeholderTextColor={colors.textSecondary}
        elevation={2}
      />
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filterContainer}>
      <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
        ফিল্টার:
      </Text>
      <View style={styles.filterButtons}>
        {[
          { key: 'all', label: 'সবাই', count: customers.length },
          { key: 'credit', label: 'পাওনাদার', count: customers.filter(c => c.total_balance > 0).length },
          { key: 'debit', label: 'দেনাদার', count: customers.filter(c => c.total_balance < 0).length },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setSelectedFilter(filter.key as any)}
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === filter.key ? colors.primary : colors.surface,
              },
            ]}>
            <Text
              style={[
                styles.filterButtonText,
                {
                  color: selectedFilter === filter.key ? colors.textInverse : colors.text,
                },
              ]}>
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={[styles.customerItem, { backgroundColor: colors.surface }]}
      onPress={() => handleCustomerPress(item)}
      activeOpacity={0.7}>
      
      <View style={styles.customerInfo}>
        <Avatar.Text
          size={50}
          label={item.name.charAt(0).toUpperCase()}
          style={[
            styles.customerAvatar,
            {
              backgroundColor: item.total_balance >= 0 ? colors.success : colors.error,
            },
          ]}
          labelStyle={styles.avatarText}
        />
        
        <View style={styles.customerDetails}>
          <Text style={[styles.customerName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.customerPhone, { color: colors.textSecondary }]}>
            {item.phone || 'ফোন নম্বর নেই'}
          </Text>
          <Text style={[styles.customerType, { color: colors.textSecondary }]}>
            {item.type === 'Customer' ? 'গ্রাহক' : 'সরবরাহকারী'}
          </Text>
        </View>
      </View>

      <View style={styles.customerActions}>
        <View style={styles.balanceSection}>
          <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
            ব্যালেন্স
          </Text>
          <Text
            style={[
              styles.balanceAmount,
              {
                color: item.total_balance >= 0 ? colors.success : colors.error,
              },
            ]}>
            {item.total_balance >= 0 ? '+' : ''}{item.total_balance}৳
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.transactionButton, { backgroundColor: colors.secondary }]}
          onPress={() => handleTransactionPress(item)}
          activeOpacity={0.8}>
          <IconButton
            icon="cash-plus"
            size={20}
            iconColor={colors.textInverse}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
      <IconButton
        icon="account-group-outline"
        size={80}
        iconColor={colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        কোন গ্রাহক পাওয়া যায়নি
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        নতুন গ্রাহক যোগ করে শুরু করুন
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={handleAddCustomer}
        activeOpacity={0.8}>
        <Text style={[styles.emptyButtonText, { color: colors.textInverse }]}>
          গ্রাহক যোগ করুন
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          লোড হচ্ছে...
        </Text>
      </View>
    );
  }

  return (
    <PageTransition>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        {renderSearchBar()}
        {renderFilters()}
        
        <FlatList
          data={filteredCustomers}
          renderItem={renderCustomerItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState()}
        />
        
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: colors.primary }]}
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
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchBar: {
    borderRadius: 10,
  },
  searchInput: {
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
  },
  customerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  customerType: {
    fontSize: 12,
    opacity: 0.7,
  },
  customerActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  balanceSection: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionButton: {
    borderRadius: 20,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 2,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
});