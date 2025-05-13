import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Card, Appbar, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getCustomerTransactions, initDB, deleteTransaction } from '~/lib/db';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { captureScreen } from 'react-native-view-shot';

export default function CustomerTransactionScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0); // Pagination offset
  const [limit] = useState(10); // Limit number of transactions per fetch
  const [userName, setUserName] = useState('John Doe'); // Hardcoded for now; you can fetch from user data
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
  }, [id, offset]);

  const handleDeleteTransaction = async (transactionId: number) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
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
      ]
    );
  };

  const loadMoreTransactions = () => {
    setOffset((prevOffset) => prevOffset + limit); // Increase the offset to load more
  };

  const downloadPDF = async () => {
    try {
      const uri = await captureScreen({
        format: 'png',
        quality: 0.8,
      });
      const fileUri = FileSystem.documentDirectory + 'transactions.png';
      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });
      Alert.alert('Success', 'PDF saved successfully!');
    } catch (error) {
      console.error('Error capturing screen:', error);
      Alert.alert('Error', 'Failed to capture screen');
    }
  };

  return (
    <>
      {/* Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.Content title={userName} titleStyle={styles.headerTitle} />
        <IconButton
          icon="download"
          // color="white"
          size={24}
          onPress={downloadPDF}
        />
      </Appbar.Header>

      {/* Main content */}
      <View style={styles.container}>
        <Text style={styles.balanceText}>
          Total Balance: ৳
          {transactions.reduce(
            (sum, txn) => (txn.type === 'credit' ? sum + txn.amount : sum - txn.amount),
            0
          )}
        </Text>

        {/* Transactions Table */}
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.tableCell}>{item.note}</Text>
                <Text style={[styles.tableCell, item.type === 'credit' ? styles.credit : styles.debit]}>
                  ৳{item.amount}
                </Text>
                <Text style={styles.tableCell}>{item.type === 'credit' ? 'Credit' : 'Debit'}</Text>
                <Text style={styles.tableCell}>{item.date}</Text>
                <Button
                  mode="outlined"
                  onPress={() => handleDeleteTransaction(item.id)}
                  style={styles.deleteButton}
                >
                  Delete
                </Button>
              </View>
            </Card>
          )}
          ListFooterComponent={
            <Button
              mode="contained"
              onPress={loadMoreTransactions}
              style={styles.loadMoreButton}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          }
        />

        {/* Floating Add Button */}
        <View style={styles.floatingButtonContainer}>
          <Button
            style={styles.floatingButton}
            icon="plus"
            mode="contained"
            onPress={() => router.push(`/add-transaction?id=${id}`)}
          >
            Add Transaction
          </Button>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2563eb',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
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
  card: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  tableCell: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  debit: {
    color: '#F44336', // Red for debit
  },
  credit: {
    color: '#4CAF50', // Green for credit
  },
  deleteButton: {
    marginLeft: 10,
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
    elevation: 5,
  },
});
