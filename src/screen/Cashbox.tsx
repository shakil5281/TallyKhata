import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, Divider, List, Avatar, useTheme, Surface } from 'react-native-paper';
import { initDB, getAllTransactions } from '~/lib/db';

// Transaction type matching database schema
interface Transaction {
  id: number;
  customer_id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

const Cashbox: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const load = async () => {
      await initDB();
      const data = await getAllTransactions();
      setTransactions(data as Transaction[]);

      const creditSum = data
        .filter(tx => tx.type === 'credit')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const debitSum = data
        .filter(tx => tx.type === 'debit')
        .reduce((sum, tx) => sum + tx.amount, 0);

      setTotalCredit(creditSum);
      setTotalDebit(debitSum);
    };
    load();
  }, []);

  const balance = totalCredit - totalDebit;

  const renderItem = ({ item }: { item: Transaction }) => (
    <Card style={[styles.card, { borderRadius: 12 }]} mode="elevated">
      <List.Item
        title={`${item.type === 'credit' ? '+' : '-'} ${item.amount.toFixed(2)}`}
        description={`${item.description} • ${new Date(item.date).toLocaleDateString()}`}
        left={props => (
          <Avatar.Icon
            {...props}
            size={40}
            icon={
              item.type === 'credit'
                ? 'arrow-down-bold-circle'
                : 'arrow-up-bold-circle'
            }
            color={
              item.type === 'credit'
                ? theme.colors.primary
                : theme.colors.error
            }
            style={{ backgroundColor: 'transparent' }}
          />
        )}
      />
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>      
      <Surface style={[styles.summary, { backgroundColor: theme.colors.primary }]}>        
        <View style={styles.summaryItem}>
          <Text variant="labelLarge" style={styles.summaryLabel}>
            Total In
          </Text>
          <Text variant="headlineLarge" style={styles.summaryValue}>
            +{totalCredit.toFixed(2)}
          </Text>
        </View>
        <Divider style={styles.dividerVertical} />
        <View style={styles.summaryItem}>
          <Text variant="labelLarge" style={styles.summaryLabel}>
            Total Out
          </Text>
          <Text variant="headlineLarge" style={styles.summaryValue}>
            -{totalDebit.toFixed(2)}
          </Text>
        </View>
        <Divider style={styles.dividerVertical} />
        <View style={styles.summaryItem}>
          <Text variant="labelLarge" style={styles.summaryLabel}>
            Balance
          </Text>
          <Text variant="headlineLarge" style={styles.summaryValue}>
            {balance.toFixed(2)}
          </Text>
        </View>
      </Surface>

      <FlatList
        style={{ marginTop: 16 }}
        data={transactions}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    margin: 0,
    borderRadius: 16,
    elevation: 4,
    paddingTop: 50,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    color: '#fff',
    fontSize: 16,
  },
  summaryValue: {
    color: '#fff',
    marginTop: 4,
    fontSize: 24,
  },
  dividerVertical: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
});

export default Cashbox;
