import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, Alert, StyleSheet } from 'react-native';
import { Button, IconButton, Surface, FAB, Chip, Avatar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getCustomers, getCustomerTransactions, getUserProfile } from '~/lib/db';

import { StatusBar } from 'expo-status-bar';
import PageTransition from '../../components/PageTransition';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function CustomerTransactionScreen() {
  interface Transaction {
    id: number;
    customer_id: number;
    type: 'credit' | 'debit';
    amount: number;
    note: string;
    date: string;
    customer_name: string;
  }
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      if (id) {
        const [customersResult, profileResult, transactionsResult] = await Promise.all([
          getCustomers(),
          getUserProfile(),
          getCustomerTransactions(Number(id), limit, 0),
        ]);

        const foundCustomer = customersResult.find((c: any) => c.id === Number(id));
        setCustomer(foundCustomer);
        setProfile(profileResult);
        setTransactions(transactionsResult as Transaction[]);
        setHasMore(transactionsResult.length === limit);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [id, limit]);

  const loadMoreTransactions = async () => {
    if (!hasMore || loading) return;

    try {
      const newOffset = transactions.length;
      const result = await getCustomerTransactions(Number(id), limit, newOffset);
      setTransactions((prev) => [...prev, ...(result as Transaction[])]);
      setHasMore(result.length === limit);
    } catch (error) {
      console.error('Error loading more transactions:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await getCustomerTransactions(Number(id), limit, 0);
      setTransactions(result as Transaction[]);
      setHasMore(result.length === limit);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [id, loadInitialData]);

  const calculateBalance = () => {
    return transactions.reduce(
      (sum, txn) => (txn.type === 'credit' ? sum + txn.amount : sum - txn.amount),
      0
    );
  };

  const generatePDF = async () => {
    try {
      const balance = calculateBalance();
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #fe4c24; text-align: center; }
              .header { text-align: center; margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .credit { color: #4CAF50; font-weight: bold; }
              .debit { color: #F44336; font-weight: bold; }
              .summary { margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Transaction Report</h1>
              <h2>${customer?.name || 'Customer'}</h2>
              <p>Phone: ${customer?.phone || 'N/A'} | Type: ${customer?.type || 'N/A'}</p>
            </div>
            
            <div class="summary">
              <h3>Summary</h3>
              <p><strong>Total Transactions:</strong> ${transactions.length}</p>
              <p><strong>Current Balance:</strong> ${profile?.currency || '৳'}${Math.abs(balance).toFixed(2)} ${balance >= 0 ? '(Credit)' : '(Debit)'}</p>
            </div>
            
            <table>
          <thead>
            <tr>
              <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map(
                (txn: any) => `
                <tr>
                      <td>${new Date(txn.date).toLocaleDateString()}</td>
                      <td class="${txn.type}">${txn.type === 'credit' ? 'Credit' : 'Debit'}</td>
                      <td class="${txn.type}">${profile?.currency || '৳'}${txn.amount.toFixed(2)}</td>
                      <td>${txn.note || 'No note'}</td>
                </tr>
              `
              )
              .join('')}
          </tbody>
        </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF report');
    }
  };

  const renderCustomerHeader = () => {
    if (!customer) return null;

    const balance = calculateBalance();

    return (
      <Surface style={styles.customerHeader}>
        <View style={styles.customerInfo}>
          <Avatar.Text
            size={60}
            label={customer.name.charAt(0).toUpperCase()}
            style={[
              styles.customerAvatar,
              { backgroundColor: customer.type === 'Customer' ? '#fe4c24' : '#4CAF50' },
            ]}
          />
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerPhone}>{customer.phone || 'No phone'}</Text>
            <View style={styles.customerTypeContainer}>
              <Chip
                style={[
                  styles.customerTypeChip,
                  { backgroundColor: customer.type === 'Customer' ? '#ffe5e5' : '#e8f5e8' },
                ]}
                textStyle={[
                  styles.customerTypeText,
                  { color: customer.type === 'Customer' ? '#fe4c24' : '#4CAF50' },
                ]}>
                {customer.type}
              </Chip>
            </View>
          </View>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={[styles.balanceAmount, { color: balance >= 0 ? '#4CAF50' : '#F44336' }]}>
            {profile?.currency || '৳'}
            {Math.abs(balance).toFixed(0)}
          </Text>
          <Text style={[styles.balanceStatus, { color: balance >= 0 ? '#4CAF50' : '#F44336' }]}>
            {balance >= 0 ? 'Credit' : 'Debit'}
          </Text>
        </View>
      </Surface>
    );
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Surface style={styles.transactionCard}>
      <View style={styles.transactionContent}>
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.transactionTypeIcon,
              { backgroundColor: item.type === 'credit' ? '#e8f5e8' : '#ffebee' },
            ]}>
            <IconButton
              icon={item.type === 'credit' ? 'plus-circle' : 'minus-circle'}
              size={20}
              iconColor={item.type === 'credit' ? '#4CAF50' : '#F44336'}
              style={styles.transactionIcon}
            />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionNote}>{item.note || 'No note'}</Text>
            <Text style={styles.transactionDate}>
              {new Date(item.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              { color: item.type === 'credit' ? '#4CAF50' : '#F44336' },
            ]}>
            {item.type === 'credit' ? '+' : '-'}
            {profile?.currency || '৳'}
            {item.amount.toFixed(0)}
          </Text>
          <Text
            style={[
              styles.transactionType,
              { color: item.type === 'credit' ? '#4CAF50' : '#F44336' },
            ]}>
            {item.type === 'credit' ? 'Credit' : 'Debit'}
          </Text>
        </View>
      </View>
    </Surface>
  );

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <IconButton icon="swap-horizontal" size={64} iconColor="#ccc" />
      <Text style={styles.emptyStateTitle}>No transactions yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Start by adding the first transaction for {customer?.name}
      </Text>
      <Button
        mode="contained"
        onPress={() => router.push(`/add-transaction?id=${id}`)}
        style={styles.emptyStateButton}>
        Add Transaction
      </Button>
    </Surface>
  );

  if (loading) {
    return (
      <PageTransition>
        <StatusBar style="light" />
        <View style={styles.headerContainer}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="white"
            onPress={() => router.back()}
            style={styles.headerLeftAction}
          />
          <Text style={styles.headerTitle}>Transactions</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <StatusBar style="light" />

      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="white"
          onPress={() => router.back()}
          style={styles.headerLeftAction}
        />
        <Text style={styles.headerTitle}>{customer?.name || 'Transactions'}</Text>
        <IconButton
          icon="download"
          size={24}
          iconColor="white"
          onPress={generatePDF}
          style={styles.headerRightAction}
        />
      </View>

      <View style={styles.container}>
        {renderCustomerHeader()}

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Total Transactions</Text>
          </Surface>

          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>
              {transactions.filter((t) => t.type === 'credit').length}
            </Text>
            <Text style={styles.statLabel}>Credits</Text>
          </Surface>

          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>
              {transactions.filter((t) => t.type === 'debit').length}
            </Text>
            <Text style={styles.statLabel}>Debits</Text>
          </Surface>
        </View>

        {/* Transactions List */}
        {transactions.length > 0 ? (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTransaction}
            showsVerticalScrollIndicator={false}
            style={styles.transactionsList}
            contentContainerStyle={styles.transactionsListContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onEndReached={loadMoreTransactions}
            onEndReachedThreshold={0.5}
          />
        ) : (
          renderEmptyState()
        )}
      </View>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push(`/add-transaction?id=${id}`)}
        color="white"
        label="Add Transaction"
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
    fontSize: 19,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  headerLeftAction: {
    position: 'absolute',
    left: 8,
    top: '50%',
    marginTop: -20,
  },
  headerRightAction: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  customerHeader: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerAvatar: {
    marginRight: 16,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  customerTypeContainer: {
    flexDirection: 'row',
  },
  customerTypeChip: {
    height: 28,
  },
  customerTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  balanceContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  balanceStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
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
  transactionsList: {
    flex: 1,
    marginHorizontal: 16,
  },
  transactionsListContent: {
    paddingBottom: 100,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIcon: {
    margin: 0,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#666',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
    fontWeight: '600',
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
