import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Button, RadioButton , TextInput} from 'react-native-paper';
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
        const transaction = await getCustomerTransactions(Number(id));
        const txn:any = transaction.find((txn:any) => txn.id === Number(transactionId));
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
    <View className="p-4 flex-1">
      <TextInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        className="mb-4"
      />
      <TextInput
        label="Note (Optional)"
        value={note}
        onChangeText={setNote}
        className="mb-4"
      />
      <Text className="mb-4">Transaction Type</Text>
      <RadioButton.Group onValueChange={setType} value={type}>
        <RadioButton.Item label="Credit" value="credit" />
        <RadioButton.Item label="Debit" value="debit" />
      </RadioButton.Group>
      <Button mode="contained" onPress={handleSaveTransaction}>
        {transactionId ? 'Update Transaction' : 'Add Transaction'}
      </Button>
    </View>
  );
}
