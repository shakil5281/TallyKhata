import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Alert } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getCustomerTransactions, initDB, deleteTransaction } from '~/lib/db';

export default function CustomerTransactionScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0); // Pagination offset
  const [limit] = useState(10); // Limit number of transactions per fetch
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      await initDB();
      if (id) {
        const result = await getCustomerTransactions(Number(id), limit, offset);
        setTransactions((prev) => [...prev, ...result]); // Append results
      }
      setLoading(false);
    };
    loadTransactions();
  }, [id, offset, limit]);

  const handleDeleteTransaction = async (transactionId: number) => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          await deleteTransaction(transactionId);
          setTransactions((prevTransactions) =>
            prevTransactions.filter((txn) => txn.id !== transactionId)
          );
        },
      },
    ]);
  };

  const loadMoreTransactions = () => {
    setOffset((prevOffset) => prevOffset + limit); // Increase the offset to load more
  };

  return (
    <View style={styles.container}>
      {/* Balance Header */}
      <Text style={styles.balanceText}>
        Balance:{' '}
        {transactions.reduce(
          (sum, txn) => (txn.type === 'credit' ? sum + txn.amount : sum - txn.amount),
          0
        )}
      </Text>

      {/* Add Transaction Button */}
      <Button
        mode="contained"
        onPress={() => router.push(`/add-transaction?id=${id}`)}
        style={styles.addTransactionButton}
        labelStyle={styles.buttonText}>
        Add Transaction
      </Button>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.transactionType}>
              {item.type === 'credit' ? 'Credit' : 'Debit'}
            </Text>
            <Text style={styles.transactionAmount}>৳{item.amount}</Text>
            <Text style={styles.transactionNote}>{item.note}</Text>
            <Text style={styles.transactionDate}>{item.date}</Text>

            <Button
              mode="outlined"
              onPress={() => handleDeleteTransaction(item.id)}
              style={styles.deleteButton}
              labelStyle={styles.buttonText}>
              Delete
            </Button>
          </Card>
        )}
        ListFooterComponent={
          <Button
            mode="contained"
            onPress={loadMoreTransactions}
            style={styles.loadMoreButton}
            disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        }
      />

      {/* Floating Add Button */}
      <View style={styles.floatingButtonContainer}>
        <Button
          style={styles.floatingButton}
          icon="account-plus"
          mode="contained"
          onPress={() => router.push('/add-transaction')}
          labelStyle={styles.floatingButtonLabel}>
          Add Transaction
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  addTransactionButton: {
    marginBottom: 20,
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 15,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  transactionType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#FF5722',
  },
  transactionNote: {
    fontSize: 16,
    color: '#757575',
    marginTop: 10,
  },
  transactionDate: {
    fontSize: 12,
    color: '#B0BEC5',
    marginTop: 5,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#FF5252',
  },
  loadMoreButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  floatingButton: {
    backgroundColor: '#FF5722',
    borderRadius: 50,
    padding: 10,
  },
  floatingButtonLabel: {
    color: 'white',
  },
});
