import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Card, Appbar, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getCustomers, getCustomerTransactions, initDB } from '~/lib/db';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function CustomerTransactionScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0); // Pagination offset
  const [limit] = useState(10); // Limit number of transactions per fetch
  const [userName, setUserName] = useState<string>(''); // To store customer name
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get the customer id from the route params

  useEffect(() => {
    const loadTransactionsAndCustomerName = async () => {
      setLoading(true);
      await initDB();
      if (id) {
        // Fetch transactions
        const result = await getCustomerTransactions(Number(id), limit, offset);
        setTransactions((prev) => [...prev, ...result]); // Append results

        // Fetch customer name
        const customers = await getCustomers(); // Get all customers
        const customer = customers.find((customer: any) => customer.id === Number(id)); // Find the specific customer
        if (customer) {
          // @ts-ignore
          setUserName(customer.name); // Set the customer name
        }
      }
      setLoading(false);
    };

    loadTransactionsAndCustomerName();
  }, [id, offset]);

  // Function to generate and download PDF
  const generatePDF = async () => {
    try {
      const htmlContent = `
        <h1>Transactions for ${userName}</h1>
        <table border="1" cellpadding="10" cellspacing="0" style="width: 100%; margin-top: 20px; text-align: left;">
          <thead>
            <tr>
              <th>Date</th>
              <th>Note</th>
              <th>Amount</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map(
                (txn: any) => `
                <tr>
                  <td>${txn.date}</td>
                  <td>${txn.note}</td>
                  <td>${txn.amount}</td>
                  <td>${txn.type === 'credit' ? 'Credit' : 'Debit'}</td>
                </tr>
              `
              )
              .join('')}
          </tbody>
        </table>
      `;

      // Generate PDF from HTML content
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      console.log('PDF generated at: ', uri);

      // Share the generated PDF
      await Sharing.shareAsync(uri);

    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: '#fe4c24' }}>
        <Appbar.BackAction color='white' onPress={() => router.back()} />
        <Appbar.Content title={userName || 'Loading...'} titleStyle={styles.headerTitle} />
        <Appbar.Action
          icon="download"
          color='white'
          onPress={generatePDF}
          style={styles.downloadButtonContainer}
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
                <Text style={styles.tableCell}>{item.date}</Text>
                <Text style={styles.tableCell}>{item.note}</Text>
                <Text style={[styles.tableCell, item.type === 'credit' ? styles.credit : styles.debit]}>
                  ৳{item.amount}
                </Text>
                <Text style={styles.tableCell}>{item.type === 'credit' ? 'Credit' : 'Debit'}</Text>
              </View>
            </Card>
          )}
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
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
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
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  floatingButton: {
    backgroundColor: 'red',
    borderRadius: 30,
    padding: 6,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    fontSize: 20,
  },
  downloadButtonContainer: {
    marginTop: 20,
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
  },
});
