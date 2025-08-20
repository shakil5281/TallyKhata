import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllTransactions, getCustomers, getUserProfile } from './db';

export interface ExportData {
  profile: any;
  customers: any[];
  transactions: any[];
  exportDate: string;
}

export const exportToCSV = async (data: any[], filename: string): Promise<string> => {
  if (data.length === 0) return '';

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    ),
  ].join('\n');

  const fileUri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(fileUri, csvContent);
  return fileUri;
};

export const exportAllData = async (): Promise<boolean> => {
  try {
    // Get all data
    const profile = await getUserProfile();
    const customers = await getCustomers();
    const transactions = await getAllTransactions();

    const exportData: ExportData = {
      profile,
      customers,
      transactions,
      exportDate: new Date().toISOString(),
    };

    // Create CSV files for each data type
    const timestamp = new Date().toISOString().split('T')[0];

    const files: string[] = [];

    // Export customers
    if (customers.length > 0) {
      const customersFile = await exportToCSV(customers, `customers_${timestamp}.csv`);
      files.push(customersFile);
    }

    // Export transactions
    if (transactions.length > 0) {
      const transactionsFile = await exportToCSV(transactions, `transactions_${timestamp}.csv`);
      files.push(transactionsFile);
    }

    // Export profile
    if (profile) {
      const profileFile = await exportToCSV([profile], `profile_${timestamp}.csv`);
      files.push(profileFile);
    }

    // Create a summary JSON file
    const summaryFile = FileSystem.documentDirectory + `tallykhata_export_${timestamp}.json`;
    await FileSystem.writeAsStringAsync(summaryFile, JSON.stringify(exportData, null, 2));
    files.push(summaryFile);

    // Share the most relevant file (summary JSON)
    if (files.length > 0) {
      await Sharing.shareAsync(summaryFile, {
        mimeType: 'application/json',
        dialogTitle: 'Export TallyKhata Data',
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Export error:', error);
    return false;
  }
};

export const exportCustomerTransactions = async (
  customerId: number,
  customerName: string
): Promise<boolean> => {
  try {
    // Get transactions for specific customer
    const transactions = await getAllTransactions();
    const customerTransactions = transactions.filter((t) => t.customer_id === customerId);

    if (customerTransactions.length === 0) {
      return false;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${customerName.replace(/[^a-zA-Z0-9]/g, '_')}_transactions_${timestamp}.csv`;

    const fileUri = await exportToCSV(customerTransactions, filename);

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: `Export ${customerName} Transactions`,
    });

    return true;
  } catch (error) {
    console.error('Customer export error:', error);
    return false;
  }
};

export const getStorageInfo = async () => {
  try {
    const info = await FileSystem.getInfoAsync(FileSystem.documentDirectory!);
    return {
      exists: info.exists,
      size: info.exists ? (info as any).size || 0 : 0,
    };
  } catch (error) {
    console.error('Storage info error:', error);
    return { exists: false, size: 0 };
  }
};
