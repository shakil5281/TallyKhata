import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Button, RadioButton, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { addTransaction, getCustomerTransactions, initDB } from '~/lib/db';
import { useLocalSearchParams } from 'expo-router';

export default function AddTransactionScreen() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<any>('credit');
  const { id, transactionId } = useLocalSearchParams();
  const router = useRouter();

  const handleSaveTransaction = async () => {
    if (amount.trim()) {
      if (transactionId) {
        // Edit existing transaction
        // (You would add your update logic here)
      } else {
        await addTransaction(Number(id), type, parseFloat(amount), note);
      }
      router.push(`/transaction/${id}`);
    }
  };

  useEffect(() => {
    if (transactionId) {
      // Fetch transaction details and populate form fields
      const loadTransaction = async () => {
        await initDB();
        const transaction = await getCustomerTransactions(Number(id), Number(transactionId), Number(id));
        const txn: any = transaction.find((txn: any) => txn.id === Number(transactionId));
        if (txn) {
          setAmount(txn.amount.toString());
          setNote(txn.note || '');
          setType(txn.type);
        }
      };
      loadTransaction();
    }
  }, [transactionId]);

  return (
<>
    <Appbar.Header style={{ backgroundColor: '#fe4c24' }}>
      <Appbar.BackAction color='white' onPress={() => router.push('/')} />
      <Appbar.Content color='white' title={transactionId ? 'Edit Transaction' : 'Add Transaction'} />
      <Appbar.Action color='white' icon="check" onPress={handleSaveTransaction} />
    </Appbar.Header>
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
        placeholder="Enter transaction amount"
      />
      <TextInput
        label="Note (Optional)"
        value={note}
        onChangeText={setNote}
        style={styles.input}
        mode="outlined"
        placeholder="Add a note (optional)"
      />
      <Text style={styles.transactionTypeLabel}>Transaction Type</Text>
      <RadioButton.Group onValueChange={setType} value={type}>
        <RadioButton.Item label="Credit" value="credit" />
        <RadioButton.Item label="Debit" value="debit" />
      </RadioButton.Group>
      <Button
        mode="contained"
        onPress={handleSaveTransaction}
        style={styles.submitButton}
        labelStyle={styles.submitButtonText}
      >
        {transactionId ? 'Update Transaction' : 'Add Transaction'}
      </Button>
    </ScrollView>
</>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  transactionTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  radioGroup: {
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fe4c24', // Button background color
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
  },
});
