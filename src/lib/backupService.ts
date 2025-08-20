import * as SecureStore from 'expo-secure-store';
import { Share, Alert } from 'react-native';
import { getCustomers, getAllTransactions, getUserProfile } from './db';

interface BackupData {
  timestamp: string;
  version: string;
  user: {
    email: string;
    name: string;
  };
  data: {
    customers: any[];
    transactions: any[];
    profile: any;
  };
}

// Store keys
const LAST_BACKUP_KEY = 'last_backup_timestamp';
const AUTO_BACKUP_ENABLED_KEY = 'auto_backup_enabled';

export class BackupService {
  static async createBackup(userEmail: string, userName: string): Promise<BackupData> {
    try {
      // Get all data
      const customers = await getCustomers();
      const transactions = await getAllTransactions();
      const profile = await getUserProfile();

      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        user: {
          email: userEmail,
          name: userName,
        },
        data: {
          customers: customers || [],
          transactions: transactions || [],
          profile: profile || {},
        },
      };

      return backupData;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup data');
    }
  }

  static async shareBackup(userEmail: string, userName: string): Promise<void> {
    try {
      const backupData = await this.createBackup(userEmail, userName);
      const backupJson = JSON.stringify(backupData, null, 2);

      const date = new Date().toLocaleDateString();

      await Share.share({
        message: `TallyKhata Backup - ${date}\n\nAccount: ${userEmail}\nCustomers: ${backupData.data.customers.length}\nTransactions: ${backupData.data.transactions.length}\n\nGenerated on ${new Date().toLocaleString()}`,
        title: `TallyKhata Backup - ${date}`,
        url: `data:application/json;base64,${btoa(backupJson)}`,
      });

      // Update last backup timestamp
      await SecureStore.setItemAsync(LAST_BACKUP_KEY, new Date().toISOString());

      Alert.alert(
        'Backup Created',
        'Your data has been successfully backed up. You can save it to your email, cloud storage, or share it as needed.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error sharing backup:', error);
      throw new Error('Failed to create or share backup');
    }
  }

  static async sendBackupEmail(userEmail: string, userName: string): Promise<void> {
    try {
      const backupData = await this.createBackup(userEmail, userName);
      const date = new Date().toLocaleDateString();

      // In a real app, you would send this via your backend API
      // For now, we'll use the share functionality
      const backupJson = JSON.stringify(backupData, null, 2);

      const emailBody = `Dear ${userName},

Your TallyKhata backup has been created successfully.

Backup Details:
- Date: ${date}
- Account: ${userEmail}
- Customers: ${backupData.data.customers.length}
- Transactions: ${backupData.data.transactions.length}

Please save this backup file in a secure location. You can restore your data using this backup if needed.

Best regards,
TallyKhata Team

---
Backup Data:
${backupJson}`;

      await Share.share({
        message: emailBody,
        title: `TallyKhata Backup - ${date}`,
      });

      await SecureStore.setItemAsync(LAST_BACKUP_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error sending backup email:', error);
      throw new Error('Failed to send backup email');
    }
  }

  static async getLastBackupTime(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(LAST_BACKUP_KEY);
    } catch (error) {
      console.error('Error getting last backup time:', error);
      return null;
    }
  }

  static async isAutoBackupEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(AUTO_BACKUP_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking auto backup setting:', error);
      return false;
    }
  }

  static async setAutoBackupEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(AUTO_BACKUP_ENABLED_KEY, enabled.toString());
    } catch (error) {
      console.error('Error setting auto backup:', error);
      throw new Error('Failed to update auto backup setting');
    }
  }

  static async checkAndPerformAutoBackup(userEmail: string, userName: string): Promise<void> {
    try {
      const isEnabled = await this.isAutoBackupEnabled();
      if (!isEnabled) return;

      const lastBackup = await this.getLastBackupTime();
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      if (!lastBackup || new Date(lastBackup) < oneDayAgo) {
        console.log('Performing auto backup...');
        await this.sendBackupEmail(userEmail, userName);
        console.log('Auto backup completed');
      }
    } catch (error) {
      console.error('Auto backup failed:', error);
      // Don't throw error for auto backup to avoid disrupting user experience
    }
  }

  static async restoreFromBackup(backupData: BackupData): Promise<boolean> {
    try {
      // Validate backup data
      if (!backupData.data || !backupData.timestamp) {
        throw new Error('Invalid backup data format');
      }

      // In a real implementation, you would:
      // 1. Clear existing data
      // 2. Import customers
      // 3. Import transactions
      // 4. Import profile
      // 5. Verify data integrity

      console.log('Backup restoration would restore:', {
        customers: backupData.data.customers.length,
        transactions: backupData.data.transactions.length,
        timestamp: backupData.timestamp,
      });

      Alert.alert(
        'Backup Restoration',
        'Backup restoration feature will be implemented in the next version. Your backup data is valid and ready for restoration.',
        [{ text: 'OK' }]
      );

      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw new Error('Failed to restore backup data');
    }
  }
}
