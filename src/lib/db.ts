import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export const initDB = async () => {
  try {
    // Ensure database is initialized only once
    if (!db) {
      db = await SQLite.openDatabaseAsync('tally.db');
      console.log('Database initialized');
    }

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        type TEXT,
        photo TEXT,
        total_balance REAL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        type TEXT,
        amount REAL,
        note TEXT,
        date TEXT DEFAULT (datetime('now', 'localtime')),
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT NOT NULL DEFAULT 'User',
        phone TEXT,
        email TEXT,
        business_name TEXT,
        address TEXT,
        profile_image TEXT,
        currency TEXT DEFAULT '৳',
        dark_mode INTEGER DEFAULT 0,
        notifications_enabled INTEGER DEFAULT 1,
        backup_enabled INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        app_version TEXT DEFAULT '1.0.0',
        language TEXT DEFAULT 'en',
        theme_color TEXT DEFAULT '#fe4c24',
        auto_backup INTEGER DEFAULT 1,
        backup_frequency TEXT DEFAULT 'daily',
        data_retention_days INTEGER DEFAULT 365,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // Run database migrations
    await runMigrations();

    // Ensure data consistency
    await ensureTransactionDataConsistency();

    // Validate database integrity
    await validateDatabaseIntegrity();

    // Initialize default profile and settings
    await initializeDefaultProfile();
    
    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw new Error('Failed to initialize database');
  }
};

// Database migration function
const runMigrations = async () => {
  try {
    // Check if photo column exists in customers table
    const tableInfo = await db.getAllAsync('PRAGMA table_info(customers)');
    const hasPhotoColumn = tableInfo.some((col: any) => col.name === 'photo');

    if (!hasPhotoColumn) {
      console.log('🔄 Running database migration: Adding photo column to customers table');
      await db.execAsync('ALTER TABLE customers ADD COLUMN photo TEXT');
      console.log('✅ Migration completed: photo column added');
    }

    // Check if created_at column exists in transactions table
    const transactionTableInfo = await db.getAllAsync('PRAGMA table_info(transactions)');
    const hasCreatedAtColumn = transactionTableInfo.some((col: any) => col.name === 'created_at');

    if (!hasCreatedAtColumn) {
      console.log('🔄 Running database migration: Adding created_at column to transactions table');
      
      try {
        // Add the column without default value
        await db.execAsync('ALTER TABLE transactions ADD COLUMN created_at TEXT');
        
        // Update existing records to have created_at = date
        await db.execAsync('UPDATE transactions SET created_at = date WHERE created_at IS NULL');
        
        // Set default value for any remaining NULL records
        await db.execAsync('UPDATE transactions SET created_at = datetime("now", "localtime") WHERE created_at IS NULL');
        
        console.log('✅ Migration completed: created_at column added to transactions');
      } catch (migrationError) {
        console.error('❌ Migration failed for created_at column:', migrationError);
        // Continue with other migrations even if this one fails
      }
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    // If migration fails, recreate the table
    console.log('🔄 Recreating customers table with new schema...');
    await db.execAsync('DROP TABLE IF EXISTS customers');
    await db.execAsync(`
      CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        type TEXT,
        photo TEXT,
        total_balance REAL DEFAULT 0
      )
    `);
    console.log('✅ Customers table recreated with photo column');
  }
};

type CustomerInput = {
  name: string;
  phone: string;
  type: string;
  photo?: string;
};

export const addCustomer = async ({ name, phone, type, photo }: CustomerInput) => {
  try {
    if (!db) await initDB(); // Ensure DB is initialized

    // Insert the customer into the database
    const result = await db.runAsync('INSERT INTO customers (name, phone, type, photo) VALUES (?, ?, ?, ?)', [
      name,
      phone,
      type,
      photo || null,
    ]);

    console.log('Customer added successfully');
    return result.lastInsertRowId;
  } catch (err) {
    console.error('Failed to add customer:', err);
    throw new Error('Failed to add customer');
  }
};

export const getCustomers = async () => {
  if (!db) await initDB();
  
  try {
    return await db.getAllAsync('SELECT * FROM customers');
  } catch (err) {
    console.error('Failed to get customers:', err);
    return [];
  }
};

export const getCustomerById = async (id: number) => {
  if (!db) await initDB();
  
  try {
    return await db.getFirstAsync('SELECT * FROM customers WHERE id = ?', [id]);
  } catch (err) {
    console.error('Failed to get customer by ID:', err);
    return null;
  }
};

export const updateCustomerPhoto = async (customerId: number, photoUri: string) => {
  try {
    if (!db) await initDB();

    await db.runAsync('UPDATE customers SET photo = ? WHERE id = ?', [photoUri, customerId]);
    console.log('Customer photo updated successfully');
    return true;
  } catch (err) {
    console.error('Failed to update customer photo:', err);
    return false;
  }
};

export const updateCustomer = async (customerId: number, updates: Partial<CustomerInput>) => {
  try {
    if (!db) await initDB();

    const updateKeys = Object.keys(updates).filter(
      (key) => updates[key as keyof CustomerInput] !== undefined
    );

    if (updateKeys.length === 0) {
      console.log('No updates to apply');
      return true;
    }

    const setClause = updateKeys.map((key) => `${key} = ?`).join(', ');
    const values = updateKeys
      .map((key) => updates[key as keyof CustomerInput])
      .filter((value) => value !== undefined) as (string | number)[];

    const query = `UPDATE customers SET ${setClause} WHERE id = ?`;
    await db.runAsync(query, [...values, customerId]);

    console.log('Customer updated successfully');
    return true;
  } catch (err) {
    console.error('Failed to update customer:', err);
    return false;
  }
};

export const addTransaction = async (
  customer_id: number,
  type: 'credit' | 'debit',
  amount: number,
  note: string
) => {
  if (!db) await initDB();

  try {
    // Validate inputs
    if (!customer_id || customer_id <= 0) {
      throw new Error('Invalid customer ID');
    }
    
    if (!type || !['credit', 'debit'].includes(type)) {
      throw new Error('Invalid transaction type');
    }
    
    if (!amount || amount <= 0 || isNaN(amount)) {
      throw new Error('Invalid amount');
    }

    // Insert the new transaction
    await db.runAsync(
      'INSERT INTO transactions (customer_id, type, amount, note, created_at) VALUES (?, ?, ?, ?, datetime("now", "localtime"))',
      [customer_id, type, amount, note]
    );

    // Update the customer's total balance
    const balanceUpdateQuery =
      type === 'credit'
        ? 'UPDATE customers SET total_balance = total_balance + ? WHERE id = ?'
        : 'UPDATE customers SET total_balance = total_balance - ? WHERE id = ?';

    await db.runAsync(balanceUpdateQuery, [amount, customer_id]);

    console.log('Transaction added and balance updated successfully');
    return true;
  } catch (err) {
    console.error('Failed to add transaction or update balance:', err);
    throw err;
  }
};

export const deleteTransaction = async (transactionId: number) => {
  if (!db) await initDB();
  
  try {
    // First get the transaction details to update balance
    const transaction = await db.getFirstAsync(
      'SELECT customer_id, type, amount FROM transactions WHERE id = ?',
      [transactionId]
    );
    
    if (transaction) {
      // Delete the transaction
      await db.runAsync('DELETE FROM transactions WHERE id = ?', [transactionId]);
      
      // Update the customer's total balance (reverse the transaction)
      const balanceUpdateQuery =
        transaction.type === 'credit'
          ? 'UPDATE customers SET total_balance = total_balance - ? WHERE id = ?'
          : 'UPDATE customers SET total_balance = total_balance + ? WHERE id = ?';

      await db.runAsync(balanceUpdateQuery, [transaction.amount, transaction.customer_id]);
      
      console.log('Transaction deleted and balance updated successfully');
    }
  } catch (err) {
    console.error('Failed to delete transaction:', err);
    throw err;
  }
};

// Modify this function to support pagination
export const getCustomerTransactions = async (
  customer_id: number,
  limit: number,
  offset: number
) => {
  if (!db) await initDB();
  // Perform a JOIN between transactions and customers to get the customer's name
  return await db.getAllAsync(
    `SELECT t.id, t.customer_id, t.type, t.amount, t.note, t.date, c.name AS customer_name
     FROM transactions t
     INNER JOIN customers c ON t.customer_id = c.id
     WHERE t.customer_id = ? 
     ORDER BY t.date DESC 
     LIMIT ? OFFSET ?`,
    [customer_id, limit, offset]
  );
};

export const dropCustomersTable = async () => {
  if (!db) await initDB();
  await db.execAsync('DROP TABLE IF EXISTS customers');
  console.log('✅ Customers table dropped');
};

export const dropTables = async () => {
  if (!db) await initDB();
  try {
    await db.execAsync('DROP TABLE IF EXISTS customers');
    await db.execAsync('DROP TABLE IF EXISTS transactions');
    console.log('✅ Customers and Transactions tables dropped successfully');
  } catch (err) {
    console.error('Failed to drop tables:', err);
  }
};

export const clearTables = async () => {
  if (!db) await initDB();
  try {
    await db.runAsync('DELETE FROM customers');
    await db.runAsync('DELETE FROM transactions');
    console.log('✅ All rows deleted from customers and transactions tables');
  } catch (err) {
    console.error('Failed to delete rows from tables:', err);
  }
};

export const clearAndDropTables = async () => {
  if (!db) await initDB();

  try {
    // First, delete all rows from the tables
    await db.runAsync('DELETE FROM customers');
    await db.runAsync('DELETE FROM transactions');
    console.log('✅ All rows deleted from customers and transactions tables');

    // Then, drop the tables completely
    await db.execAsync('DROP TABLE IF EXISTS customers');
    await db.execAsync('DROP TABLE IF EXISTS transactions');
    console.log('✅ Customers and Transactions tables dropped successfully');
  } catch (err) {
    console.error('Failed to clear or drop tables:', err);
  }
};

// Clear ALL database data including profile and settings
export const clearAllDatabaseData = async () => {
  try {
    if (!db) await initDB();

    console.log('🧹 Starting complete database cleanup...');

    // Delete all data from all tables
    await db.runAsync('DELETE FROM customers');
    await db.runAsync('DELETE FROM transactions');
    await db.runAsync('DELETE FROM user_profile');
    await db.runAsync('DELETE FROM app_settings');

    console.log('✅ All data deleted from all tables');

    // Drop all tables
    await db.execAsync('DROP TABLE IF EXISTS customers');
    await db.execAsync('DROP TABLE IF EXISTS transactions');
    await db.execAsync('DROP TABLE IF EXISTS user_profile');
    await db.execAsync('DROP TABLE IF EXISTS app_settings');

    console.log('✅ All tables dropped successfully');

    // Close and reinitialize database
    if (db) {
      // Clear the db reference so it gets reinitialized
      db = null as any;
    }

    console.log('🔄 Database cleared and ready for reinitialization');
    return true;
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    return false;
  }
};

// Reset database to fresh state with comprehensive validation
export const resetDatabaseToFresh = async (): Promise<boolean> => {
  try {
    console.log('🔄 Starting database reset process...');

    // Ensure database is initialized
    if (!db) {
      console.log('📋 Initializing database before reset...');
      await initDB();
    }

    // Validate database connection
    if (!db) {
      throw new Error('Database connection failed');
    }

    // Step 1: Clear all existing data
    console.log('🗑️ Clearing all existing data...');
    const cleared = await clearAllDatabaseData();

    if (!cleared) {
      throw new Error('Failed to clear database data');
    }

    // Step 2: Reinitialize fresh database structure
    console.log('🔧 Reinitializing database structure...');
    await initDB();

    // Step 3: Initialize default profile
    console.log('👤 Setting up default profile...');
    await initializeDefaultProfile();

    // Step 4: Validate reset was successful
    console.log('✅ Validating database reset...');
    const customers = await getCustomers();
    const stats = await getDashboardStats();

    if (!customers || !stats) {
      throw new Error('Database validation failed after reset');
    }

    // Ensure empty state
    if (customers.length > 0) {
      throw new Error('Database still contains customer data after reset');
    }

    console.log('🎉 Database reset completed successfully!');
    console.log(
      `📊 Validation: ${customers.length} customers, ${stats.totalTransactions} transactions`
    );

    return true;
  } catch (error) {
    console.error('❌ Critical error during database reset:', error);

    // Try to recover by reinitializing
    try {
      console.log('🔄 Attempting recovery...');
      await initDB();
      await initializeDefaultProfile();
      console.log('✅ Recovery attempt completed');
    } catch (recoveryError) {
      console.error('❌ Recovery failed:', recoveryError);
    }

    return false;
  }
};

// Safe database reset function
export const safeResetDatabase = async () => {
  if (!db) await initDB();

  try {
    console.log('🔄 Starting safe database reset...');
    
    // Start transaction
    await db.execAsync('BEGIN TRANSACTION');
    
    try {
      // Clear all data
      await db.execAsync('DELETE FROM transactions');
      await db.execAsync('DELETE FROM customers');
      await db.execAsync('DELETE FROM user_profile');
      await db.execAsync('DELETE FROM app_settings');
      
      // Reset auto-increment counters
      await db.execAsync('DELETE FROM sqlite_sequence');
      
      // Commit transaction
      await db.execAsync('COMMIT');
      
      // Reinitialize default profile and settings
      await initializeDefaultProfile();
      
      console.log('✅ Safe database reset completed successfully');
      return true;
    } catch (resetError) {
      // Rollback on error
      await db.execAsync('ROLLBACK');
      throw resetError;
    }
  } catch (error) {
    console.error('❌ Safe database reset failed:', error);
    return false;
  }
};

// --- at the end of your db.ts file:

// Shape of a returned transaction
export type Transaction = {
  id: number;
  customer_id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string | null;
  date: string;
};

// 1. Get ALL transactions
export const getAllTransactions = async (): Promise<Transaction[]> => {
  if (!db) await initDB();
  return await db.getAllAsync(
    `SELECT 
       id, 
       customer_id, 
       type, 
       amount, 
       note    AS description, 
       date 
     FROM transactions 
     ORDER BY date DESC;`
  );
};

// 2. Get transactions with optional filters
export const getAllTransactionsFiltered = async (
  filters: {
    customerId?: number;
    type?: 'credit' | 'debit';
    startDate?: string; // format: 'YYYY-MM-DD'
    endDate?: string; // format: 'YYYY-MM-DD'
    limit?: number;
    offset?: number;
  } = {}
): Promise<Transaction[]> => {
  if (!db) await initDB();

  const clauses: string[] = [];
  const params: any[] = [];

  if (filters.customerId != null) {
    clauses.push(`customer_id = ?`);
    params.push(filters.customerId);
  }
  if (filters.type) {
    clauses.push(`type = ?`);
    params.push(filters.type);
  }
  if (filters.startDate) {
    clauses.push(`date(date) >= date(?)`);
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    clauses.push(`date(date) <= date(?)`);
    params.push(filters.endDate);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  let limitOffset = '';
  if (filters.limit != null) limitOffset += ` LIMIT ${filters.limit}`;
  if (filters.offset != null) limitOffset += ` OFFSET ${filters.offset}`;

  const sql = `
    SELECT 
      id, 
      customer_id, 
      type, 
      amount, 
      note    AS description, 
      date 
    FROM transactions
    ${where}
    ORDER BY date DESC
    ${limitOffset};
  `;

  return await db.getAllAsync(sql, params);
};

// =================== PROFILE MANAGEMENT ===================

export interface UserProfile {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  business_name?: string;
  address?: string;
  profile_image?: string;
  currency: string;
  dark_mode: boolean;
  notifications_enabled: boolean;
  backup_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateInput {
  name?: string;
  phone?: string;
  email?: string;
  business_name?: string;
  address?: string;
  profile_image?: string;
  currency?: string;
  dark_mode?: boolean;
  notifications_enabled?: boolean;
  backup_enabled?: boolean;
}

export interface AppSettings {
  id: number;
  app_version: string;
  language: string;
  theme_color: string;
  auto_backup: boolean;
  backup_frequency: string;
  data_retention_days: number;
  created_at: string;
  updated_at: string;
}

// Initialize default profile if not exists
export const initializeDefaultProfile = async () => {
  if (!db) return; // Don't call initDB here to avoid recursion

  try {
    const existingProfile = await db.getFirstAsync('SELECT * FROM user_profile WHERE id = 1');

    if (!existingProfile) {
      await db.runAsync(`
        INSERT OR IGNORE INTO user_profile (id, name, currency) 
        VALUES (1, 'TallyKhata User', '৳')
      `);
      console.log('Default profile created');
    }

    const existingSettings = await db.getFirstAsync('SELECT * FROM app_settings WHERE id = 1');

    if (!existingSettings) {
      await db.runAsync(`
        INSERT OR IGNORE INTO app_settings (id, app_version, language, theme_color) 
        VALUES (1, '1.0.0', 'en', '#fe4c24')
      `);
      console.log('Default app settings created');
    }
  } catch (error) {
    console.error('Error initializing default profile:', error);
  }
};

// Get user profile
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    if (!db) await initDB();

    // Ensure profile exists
    await initializeDefaultProfile();

    const profile = (await db.getFirstAsync('SELECT * FROM user_profile WHERE id = 1')) as any;

    if (profile) {
      return {
        ...profile,
        dark_mode: Boolean(profile.dark_mode),
        notifications_enabled: Boolean(profile.notifications_enabled),
        backup_enabled: Boolean(profile.backup_enabled),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (updates: ProfileUpdateInput): Promise<boolean> => {
  try {
    if (!db) await initDB();

    // Ensure profile exists first
    await initializeDefaultProfile();

    const updateKeys = Object.keys(updates).filter(
      (key) => updates[key as keyof ProfileUpdateInput] !== undefined
    );

    if (updateKeys.length === 0) {
      console.log('No updates to apply');
      return true;
    }

    const setClause = updateKeys.map((key) => `${key} = ?`).join(', ');

    const values = updateKeys
      .map((key) => {
        const value = updates[key as keyof ProfileUpdateInput];
        if (value === undefined) return null;
        return typeof value === 'boolean' ? (value ? 1 : 0) : value;
      })
      .filter((v) => v !== undefined);

    const query = `
      UPDATE user_profile 
      SET ${setClause}, updated_at = datetime('now', 'localtime')
      WHERE id = 1
    `;

    await db.runAsync(query, values);

    console.log('Profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
};

// Get app settings
export const getAppSettings = async (): Promise<AppSettings | null> => {
  if (!db) await initDB();

  try {
    const settings = (await db.getFirstAsync('SELECT * FROM app_settings WHERE id = 1')) as any;

    if (settings) {
      return {
        ...settings,
        auto_backup: Boolean(settings.auto_backup),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting app settings:', error);
    return null;
  }
};

// Update app settings
export const updateAppSettings = async (updates: Partial<AppSettings>): Promise<boolean> => {
  if (!db) await initDB();

  try {
    const setClause = Object.keys(updates)
      .filter((key) => key !== 'id' && key !== 'created_at')
      .map((key) => `${key} = ?`)
      .join(', ');

    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'created_at')
      .map(([_, value]) => (typeof value === 'boolean' ? (value ? 1 : 0) : value));

    await db.runAsync(
      `
      UPDATE app_settings 
      SET ${setClause}, updated_at = datetime('now', 'localtime')
      WHERE id = 1
    `,
      values
    );

    console.log('App settings updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating app settings:', error);
    return false;
  }
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    if (!db) await initDB();

    const totalCustomers = (await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM customers'
    )) as any;
    const totalTransactions = (await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM transactions'
    )) as any;
    const totalCredit = (await db.getFirstAsync(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = "credit"'
    )) as any;
    const totalDebit = (await db.getFirstAsync(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = "debit"'
    )) as any;
    const totalBalance = (await db.getFirstAsync(
      'SELECT COALESCE(SUM(total_balance), 0) as total FROM customers'
    )) as any;

    return {
      totalCustomers: totalCustomers?.count || 0,
      totalTransactions: totalTransactions?.count || 0,
      totalCredit: totalCredit?.total || 0,
      totalDebit: totalDebit?.total || 0,
      totalBalance: totalBalance?.total || 0,
      netBalance: (totalCredit?.total || 0) - (totalDebit?.total || 0),
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      totalCustomers: 0,
      totalTransactions: 0,
      totalCredit: 0,
      totalDebit: 0,
      totalBalance: 0,
      netBalance: 0,
    };
  }
};

// =================== REPORTS MANAGEMENT ===================

export interface ReportData {
  date: string;
  totalTransactions: number;
  totalCredit: number;
  totalDebit: number;
  netAmount: number;
  customers: number;
}

export interface DetailedReportData {
  transactions: any[];
  summary: {
    totalTransactions: number;
    totalCredit: number;
    totalDebit: number;
    netAmount: number;
    uniqueCustomers: number;
  };
}

// Get daily report data
export const getDailyReport = async (date: string): Promise<DetailedReportData> => {
  if (!db) await initDB();

  try {
    // Get all transactions for the specific date
    const transactions = await db.getAllAsync(
      `
      SELECT 
        t.id,
        t.customer_id,
        t.type,
        t.amount,
        t.note,
        t.date,
        c.name as customer_name,
        c.phone as customer_phone,
        c.type as customer_type
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE date(t.date) = date(?)
      ORDER BY t.date DESC
    `,
      [date]
    );

    // Calculate summary
    const summary = transactions.reduce(
      (
        acc: {
          totalTransactions: number;
          totalCredit: number;
          totalDebit: number;
          netAmount: number;
          uniqueCustomers: number;
        },
        transaction: any
      ) => {
        acc.totalTransactions++;
        if (transaction.type === 'credit') {
          acc.totalCredit += transaction.amount;
        } else {
          acc.totalDebit += transaction.amount;
        }
        return acc;
      },
      {
        totalTransactions: 0,
        totalCredit: 0,
        totalDebit: 0,
        netAmount: 0,
        uniqueCustomers: 0,
      }
    );

    summary.netAmount = summary.totalCredit - summary.totalDebit;

    // Count unique customers
    const uniqueCustomerIds = new Set(transactions.map((t: any) => t.customer_id));
    summary.uniqueCustomers = uniqueCustomerIds.size;

    return {
      transactions,
      summary,
    };
  } catch (error) {
    console.error('Error getting daily report:', error);
    return {
      transactions: [],
      summary: {
        totalTransactions: 0,
        totalCredit: 0,
        totalDebit: 0,
        netAmount: 0,
        uniqueCustomers: 0,
      },
    };
  }
};

// Get monthly report data
export const getMonthlyReport = async (year: number, month: number): Promise<ReportData[]> => {
  if (!db) await initDB();

  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const dailyData = await db.getAllAsync(
      `
      SELECT 
        date(date) as report_date,
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credit,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debit,
        COUNT(DISTINCT customer_id) as customers
      FROM transactions
      WHERE date(date) >= date(?) AND date(date) <= date(?)
      GROUP BY date(date)
      ORDER BY date(date)
    `,
      [startDate, endDate]
    );

    return dailyData.map((day: any) => ({
      date: day.report_date,
      totalTransactions: day.total_transactions,
      totalCredit: day.total_credit || 0,
      totalDebit: day.total_debit || 0,
      netAmount: (day.total_credit || 0) - (day.total_debit || 0),
      customers: day.customers,
    }));
  } catch (error) {
    console.error('Error getting monthly report:', error);
    return [];
  }
};

// Get monthly summary
export const getMonthlySummary = async (year: number, month: number) => {
  if (!db) await initDB();

  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const summary = await db.getFirstAsync(
      `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credit,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debit,
        COUNT(DISTINCT customer_id) as unique_customers,
        COUNT(DISTINCT date(date)) as active_days
      FROM transactions
      WHERE date(date) >= date(?) AND date(date) <= date(?)
    `,
      [startDate, endDate]
    );

    return {
      totalTransactions: (summary as any)?.total_transactions || 0,
      totalCredit: (summary as any)?.total_credit || 0,
      totalDebit: (summary as any)?.total_debit || 0,
      netAmount: ((summary as any)?.total_credit || 0) - ((summary as any)?.total_debit || 0),
      uniqueCustomers: (summary as any)?.unique_customers || 0,
      activeDays: (summary as any)?.active_days || 0,
    };
  } catch (error) {
    console.error('Error getting monthly summary:', error);
    return {
      totalTransactions: 0,
      totalCredit: 0,
      totalDebit: 0,
      netAmount: 0,
      uniqueCustomers: 0,
      activeDays: 0,
    };
  }
};

// Get year-over-year comparison
export const getYearOverYearReport = async (year: number): Promise<any[]> => {
  if (!db) await initDB();

  try {
    const monthlyData = await db.getAllAsync(
      `
      SELECT 
        strftime('%m', date) as month,
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credit,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debit,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM transactions
      WHERE strftime('%Y', date) = ?
      GROUP BY strftime('%m', date)
      ORDER BY strftime('%m', date)
    `,
      [year.toString()]
    );

    return monthlyData.map((month: any) => ({
      month: parseInt(month.month),
      monthName: new Date(year, parseInt(month.month) - 1).toLocaleString('default', {
        month: 'long',
      }),
      totalTransactions: month.total_transactions,
      totalCredit: month.total_credit || 0,
      totalDebit: month.total_debit || 0,
      netAmount: (month.total_credit || 0) - (month.total_debit || 0),
      uniqueCustomers: month.unique_customers,
    }));
  } catch (error) {
    console.error('Error getting year over year report:', error);
    return [];
  }
};

// Get top customers report
export const getTopCustomersReport = async (startDate?: string, endDate?: string, limit = 10) => {
  if (!db) await initDB();

  try {
    let whereClause = '';
    const params: any[] = [];

    if (startDate && endDate) {
      whereClause = 'WHERE date(t.date) >= date(?) AND date(t.date) <= date(?)';
      params.push(startDate, endDate);
    }

    params.push(limit);

    const topCustomers = await db.getAllAsync(
      `
      SELECT 
        c.id,
        c.name,
        c.phone,
        c.type,
        COUNT(t.id) as transaction_count,
        SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END) as total_credit,
        SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END) as total_debit,
        SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END) as net_amount
      FROM customers c
      LEFT JOIN transactions t ON c.id = t.customer_id
      ${whereClause}
      GROUP BY c.id, c.name, c.phone, c.type
      HAVING transaction_count > 0
      ORDER BY transaction_count DESC, ABS(net_amount) DESC
      LIMIT ?
    `,
      params
    );

    return topCustomers;
  } catch (error) {
    console.error('Error getting top customers report:', error);
    return [];
  }
};

// Get transactions by customer ID
export const getTransactionsByCustomerId = async (customerId: number) => {
  if (!db) await initDB();

  try {
    // Validate customer ID
    if (!customerId || customerId <= 0) {
      console.warn('Invalid customer ID provided:', customerId);
      return [];
    }

    const transactions = await db.getAllAsync(
      `SELECT 
        id,
        customer_id as customerId,
        type,
        amount,
        note,
        COALESCE(created_at, date) as createdAt
      FROM transactions 
      WHERE customer_id = ? 
      ORDER BY COALESCE(created_at, date) DESC`,
      [customerId]
    );

    // Ensure all transactions have valid data
    return transactions.map(transaction => ({
      ...transaction,
      createdAt: transaction.createdAt || new Date().toISOString(),
      amount: parseFloat(transaction.amount) || 0,
      type: transaction.type || 'credit'
    }));
  } catch (error) {
    console.error('Error getting transactions by customer ID:', error);
    return [];
  }
};

// Delete customer and all associated transactions
export const deleteCustomer = async (customerId: number): Promise<boolean> => {
  if (!db) await initDB();

  try {
    console.log(`🗑️ Deleting customer with ID: ${customerId}`);
    
    // Start transaction
    await db.execAsync('BEGIN TRANSACTION');
    
    // Delete all transactions for this customer
    await db.runAsync(
      'DELETE FROM transactions WHERE customer_id = ?',
      [customerId]
    );
    
    // Delete the customer
    await db.runAsync(
      'DELETE FROM customers WHERE id = ?',
      [customerId]
    );
    
    // Commit transaction
    await db.execAsync('COMMIT');
    
    console.log(`✅ Customer ${customerId} and all transactions deleted successfully`);
    return true;
    
  } catch (error) {
    console.error('❌ Error deleting customer:', error);
    
    // Rollback transaction on error
    try {
      await db.execAsync('ROLLBACK');
    } catch (rollbackError) {
      console.error('❌ Error rolling back transaction:', rollbackError);
    }
    
    throw new Error('Failed to delete customer');
  }
};

// Clear all database data
export const clearDatabase = async (): Promise<void> => {
  if (!db) await initDB();

  try {
    console.log('🗑️ Starting database clear...');
    
    // Clear all tables
    await db.execAsync('DELETE FROM transactions');
    await db.execAsync('DELETE FROM customers');
    await db.execAsync('DELETE FROM user_profile');
    await db.execAsync('DELETE FROM app_settings');
    
    console.log('✅ All data cleared from database');
    
    // Reset auto-increment counters
    await db.execAsync('DELETE FROM sqlite_sequence');
    
    // Reinitialize default profile and settings
    await initializeDefaultProfile();
    
    console.log('✅ Database reset complete with default profile');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw new Error('Failed to clear database');
  }
};

// Ensure data consistency for transactions
export const ensureTransactionDataConsistency = async () => {
  if (!db) await initDB();

  try {
    console.log('🔄 Ensuring transaction data consistency...');
    
    // Update any transactions without created_at to use date
    await db.execAsync(`
      UPDATE transactions 
      SET created_at = date 
      WHERE created_at IS NULL AND date IS NOT NULL
    `);
    
    // Update any remaining transactions without created_at to use current time
    await db.execAsync(`
      UPDATE transactions 
      SET created_at = datetime('now', 'localtime') 
      WHERE created_at IS NULL
    `);
    
    console.log('✅ Transaction data consistency ensured');
  } catch (error) {
    console.error('❌ Error ensuring transaction data consistency:', error);
  }
};

// Database recovery function
export const recoverDatabase = async () => {
  if (!db) await initDB();

  try {
    console.log('🔄 Starting database recovery...');
    
    // Check and repair customers table
    const customerCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM customers');
    console.log(`📊 Customers table: ${customerCount?.count || 0} records`);
    
    // Check and repair transactions table
    const transactionCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM transactions');
    console.log(`📊 Transactions table: ${transactionCount?.count || 0} records`);
    
    // Ensure all transactions have valid created_at values
    await ensureTransactionDataConsistency();
    
    // Check for orphaned transactions (transactions without valid customers)
    const orphanedTransactions = await db.getAllAsync(`
      SELECT t.id FROM transactions t 
      LEFT JOIN customers c ON t.customer_id = c.id 
      WHERE c.id IS NULL
    `);
    
    if (orphanedTransactions.length > 0) {
      console.log(`⚠️ Found ${orphanedTransactions.length} orphaned transactions, cleaning up...`);
      await db.execAsync('DELETE FROM transactions WHERE customer_id NOT IN (SELECT id FROM customers)');
    }
    
    console.log('✅ Database recovery completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Database recovery failed:', error);
    return false;
  }
};

// Validate database integrity
export const validateDatabaseIntegrity = async () => {
  if (!db) await initDB();

  try {
    console.log('🔍 Validating database integrity...');
    
    const issues: string[] = [];
    
    // Check customers table
    try {
      const customerCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM customers');
      if (customerCount?.count !== undefined) {
        console.log(`✅ Customers table: ${customerCount.count} records`);
      }
    } catch (error) {
      issues.push('Customers table access failed');
    }
    
    // Check transactions table
    try {
      const transactionCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM transactions');
      if (transactionCount?.count !== undefined) {
        console.log(`✅ Transactions table: ${transactionCount.count} records`);
      }
    } catch (error) {
      issues.push('Transactions table access failed');
    }
    
    // Check for orphaned transactions
    try {
      const orphanedCount = await db.getFirstAsync(`
        SELECT COUNT(*) as count FROM transactions t 
        LEFT JOIN customers c ON t.customer_id = c.id 
        WHERE c.id IS NULL
      `);
      
      if (orphanedCount?.count > 0) {
        issues.push(`${orphanedCount.count} orphaned transactions found`);
      }
    } catch (error) {
      issues.push('Orphaned transaction check failed');
    }
    
    // Check for transactions without created_at
    try {
      const missingCreatedAt = await db.getFirstAsync(`
        SELECT COUNT(*) as count FROM transactions 
        WHERE created_at IS NULL
      `);
      
      if (missingCreatedAt?.count > 0) {
        issues.push(`${missingCreatedAt.count} transactions missing created_at`);
      }
    } catch (error) {
      issues.push('Created_at validation failed');
    }
    
    if (issues.length === 0) {
      console.log('✅ Database integrity validation passed');
      return { valid: true, issues: [] };
    } else {
      console.warn('⚠️ Database integrity validation found issues:', issues);
      return { valid: false, issues };
    }
  } catch (error) {
    console.error('❌ Database integrity validation failed:', error);
    return { valid: false, issues: ['Validation process failed'] };
  }
};

// Get totals summary for home page
export const getTotalsSummary = async () => {
  try {
    const result = await db.getAllAsync(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as total_receivable,
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as total_payable
      FROM transactions
    `);
    
    if (result && result.length > 0) {
      const row = result[0];
      const receivable = row.total_receivable || 0;
      const payable = row.total_payable || 0;
      const netBalance = receivable - payable;
      
      return {
        total_receivable: receivable,  // দিলাম - আপনি পণ্য বিক্রি করেছেন, টাকা পাবেন
        total_payable: payable,        // পেলাম - আপনি পণ্যের মূল্য পেয়েছেন
        net_balance: netBalance        // নিট ব্যালেন্স
      };
    }
    
    return { total_receivable: 0, total_payable: 0, net_balance: 0 };
  } catch (error) {
    console.error('Error getting totals summary:', error);
    return { total_receivable: 0, total_payable: 0, net_balance: 0 };
  }
};

// Get detailed totals by customer
export const getDetailedTotals = async (type?: 'receivable' | 'payable') => {
  try {
    let query = `
      SELECT 
        c.id,
        c.name,
        c.phone,
        c.type as customer_type,
        COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) as total_receivable,
        COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as total_payable,
        (COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) - 
         COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0)) as net_balance
      FROM customers c
      LEFT JOIN transactions t ON c.id = t.customer_id
      GROUP BY c.id, c.name, c.phone, c.type
    `;
    
    if (type === 'receivable') {
      query += ` HAVING total_receivable > total_payable`; // দিলাম বেশি - আপনি টাকা পাবেন
    } else if (type === 'payable') {
      query += ` HAVING total_payable > total_receivable`; // পেলাম বেশি - আপনার পাওনা পরিশোধ হয়েছে
    }
    
    query += ` ORDER BY net_balance DESC`;
    
    const result = await db.getAllAsync(query);
    return result || [];
  } catch (error) {
    console.error('Error getting detailed totals:', error);
    return [];
  }
};

// Get daily totals for charts
export const getTotalsByDateRange = async (startDate: string, endDate: string) => {
  try {
    const result = await db.getAllAsync(`
      SELECT 
        DATE(COALESCE(t.created_at, t.date)) as date,
        COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) as daily_receivable,
        COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as daily_payable
      FROM transactions t
      WHERE DATE(COALESCE(t.created_at, t.date)) BETWEEN ? AND ?
      GROUP BY DATE(COALESCE(t.created_at, t.date))
      ORDER BY date ASC
    `, [startDate, endDate]);
    
    return result || [];
  } catch (error) {
    console.error('Error getting daily totals:', error);
    return [];
  }
};

// Export totals data for reports
export const exportTotalsData = async (startDate?: string, endDate: string) => {
  try {
    let query = `
      SELECT 
        c.id,
        c.name,
        c.phone,
        c.type as customer_type,
        COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) as total_receivable,
        COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as total_payable,
        (COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) - 
         COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0)) as net_balance
      FROM customers c
      LEFT JOIN transactions t ON c.id = t.customer_id
    `;
    
    const params: any[] = [];
    if (startDate && endDate) {
      query += ` WHERE DATE(COALESCE(t.created_at, t.date)) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }
    
    query += ` GROUP BY c.id, c.name, c.phone, c.type ORDER BY net_balance DESC`;
    
    const customers = await db.getAllAsync(query, params);
    
    // Get overall summary
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) as total_receivable,
        COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as total_payable
      FROM transactions t
    `;
    
    const summaryParams: any[] = [];
    if (startDate && endDate) {
      summaryQuery += ` WHERE DATE(COALESCE(t.created_at, t.date)) BETWEEN ? AND ?`;
      summaryParams.push(startDate, endDate);
    }
    
    const summaryResult = await db.getAllAsync(summaryQuery, summaryParams);
    const summary = summaryResult?.[0] || { total_receivable: 0, total_payable: 0 };
    
    return {
      summary: {
        total_receivable: summary.total_receivable,  // দিলাম - পণ্য বিক্রি, টাকা পাবেন
        total_payable: summary.total_payable,        // পেলাম - মূল্য পেয়েছেন
        net_balance: summary.total_receivable - summary.total_payable
      },
      customers: customers || []
    };
  } catch (error) {
    console.error('Error exporting totals data:', error);
    return { summary: { total_receivable: 0, total_payable: 0, net_balance: 0 }, customers: [] };
  }
};
