import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  Button,
  Avatar,
  IconButton,
  Text,
  Searchbar,
  Surface,
  FAB,
  Chip,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getCustomers, getUserProfile } from '~/lib/db';
import { StatusBar } from 'expo-status-bar';
import { CustomerCardSkeleton } from '../../components/SkeletonLoader';
import PageTransition from '../../components/PageTransition';

interface Customer {
  id: number;
  name: string;
  phone: string;
  type: string;
  total_balance: number;
}

export default function CustomersListScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersResult, profileResult] = await Promise.all([
          getCustomers(),
          getUserProfile(),
        ]);
        setCustomers(customersResult as Customer[]);
        setFilteredCustomers(customersResult as Customer[]);
        setProfile(profileResult);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = customers;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery)
      );
    }

    // Apply type filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter((customer) => customer.type === selectedFilter);
    }

    setFilteredCustomers(filtered);
  }, [searchQuery, customers, selectedFilter]);

  const handlePressIn = (id: number) => {
    setActiveCard(id.toString());
  };

  const handlePressOut = () => {
    setActiveCard(null);
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      onPressIn={() => handlePressIn(item.id)}
      onPressOut={handlePressOut}
      onPress={() => router.push(`/transaction/${item.id}`)}
      style={styles.customerCardContainer}>
      <Surface
        style={[
          styles.customerCard,
          activeCard === item.id.toString() && styles.customerCardActive,
        ]}>
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
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Balance: </Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    { color: item.total_balance >= 0 ? '#4CAF50' : '#F44336' },
                  ]}>
                  {profile?.currency || '৳'}
                  {Math.abs(item.total_balance || 0).toFixed(0)}
                  <Text style={styles.balanceType}>
                    {item.total_balance >= 0 ? ' (Credit)' : ' (Debit)'}
                  </Text>
                </Text>
              </View>
            </View>
          </View>

          <IconButton icon="chevron-right" size={24} iconColor="#666" style={styles.chevronIcon} />
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderFilterChips = () => {
    const filters = ['All', 'Customer', 'Supplier'];
    const customerCount = customers.filter((c) => c.type === 'Customer').length;
    const supplierCount = customers.filter((c) => c.type === 'Supplier').length;
    const counts = { All: customers.length, Customer: customerCount, Supplier: supplierCount };

    return (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filters.map((filter) => (
            <Chip
              key={filter}
              selected={selectedFilter === filter}
              onPress={() => setSelectedFilter(filter)}
              style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
              textStyle={[
                styles.filterChipText,
                selectedFilter === filter && styles.filterChipTextActive,
              ]}>
              {filter} ({counts[filter as keyof typeof counts]})
            </Chip>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>All Customers</Text>
        <TouchableOpacity onPress={() => router.push('/add-customer')} style={styles.addButton}>
          <IconButton icon="plus" size={20} iconColor="white" style={styles.addButtonIcon} />
        </TouchableOpacity>
      </View>

      <Searchbar
        placeholder="Search by name, phone or type..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor="#fe4c24"
      />

      {renderFilterChips()}

      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredCustomers.length} of {customers.length} customers
        </Text>
        {searchQuery && <Text style={styles.searchInfo}>Search: &quot;{searchQuery}&quot;</Text>}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <IconButton icon="account-search" size={64} iconColor="#ccc" />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No customers found' : 'No customers yet'}
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {searchQuery
          ? `Try adjusting your search &quot;${searchQuery}&quot;`
          : 'Add your first customer to get started'}
      </Text>
      {!searchQuery && (
        <Button
          mode="contained"
          onPress={() => router.push('/add-customer')}
          style={styles.emptyStateButton}>
          Add Customer
        </Button>
      )}
    </Surface>
  );

  return (
    <PageTransition>
      <StatusBar style="light" />

      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitleText}>All Customers</Text>
        <IconButton
          icon="filter-variant"
          size={24}
          iconColor="white"
          onPress={() => {}}
          style={styles.headerRightAction}
        />
      </View>

      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            {renderHeader()}
            {[1, 2, 3, 4].map((item) => (
              <CustomerCardSkeleton key={item} />
            ))}
          </View>
        ) : (
          <>
            {renderHeader()}

            {filteredCustomers.length > 0 ? (
              <FlatList
                data={filteredCustomers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCustomer}
                showsVerticalScrollIndicator={false}
                style={styles.customersList}
                contentContainerStyle={styles.customersListContent}
              />
            ) : (
              renderEmptyState()
            )}
          </>
        )}
      </View>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/add-customer')}
        color="white"
        label="Add Customer"
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
  headerTitleText: {
    fontSize: 20,
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
  headerSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#fe4c24',
    borderRadius: 20,
    padding: 4,
  },
  addButtonIcon: {
    margin: 0,
  },
  searchBar: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: '#fe4c24',
  },
  filterChipText: {
    color: '#666',
    fontSize: 14,
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  searchInfo: {
    fontSize: 12,
    color: '#fe4c24',
    fontStyle: 'italic',
  },
  customersList: {
    flex: 1,
  },
  customersListContent: {
    padding: 16,
    paddingBottom: 100,
  },
  customerCardContainer: {
    marginBottom: 12,
  },
  customerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  customerCardActive: {
    borderColor: '#fe4c24',
    borderWidth: 2,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceType: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  chevronIcon: {
    margin: 0,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    margin: 16,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyStateButton: {
    backgroundColor: '#fe4c24',
    borderRadius: 25,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fe4c24',
  },
});
