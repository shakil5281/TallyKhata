import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export const initDB = async () => {
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
      total_balance REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      type TEXT,
      amount REAL,
      note TEXT,
      date TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);
};


type CustomerInput = {
  name: string;
  phone: string;
  type: 'Customer' | 'Supplier';
};

export const addCustomer = async ({ name, phone, type }: CustomerInput) => {
  try {
    if (!db) await initDB(); // Ensure DB is initialized

    // Insert the customer into the database
    await db.runAsync(
      'INSERT INTO customers (name, phone, type) VALUES (?, ?, ?)',
      [name, phone, type]
    );

    console.log('Customer added successfully');
  } catch (err) {
    console.error('Failed to add customer:', err);
  }
};


export const getCustomers = async () => {
  if (!db) await initDB();
  return await db.getAllAsync('SELECT * FROM customers');
};

export const addTransaction = async (
  customer_id: number,
  type: 'credit' | 'debit',
  amount: number,
  note: string
) => {
  if (!db) await initDB();

  try {
    // Insert the new transaction
    await db.runAsync(
      'INSERT INTO transactions (customer_id, type, amount, note) VALUES (?, ?, ?, ?)',
      [customer_id, type, amount, note]
    );

    // Update the customer's total balance
    const balanceUpdateQuery =
      type === 'credit'
        ? 'UPDATE customers SET total_balance = total_balance + ? WHERE id = ?'
        : 'UPDATE customers SET total_balance = total_balance - ? WHERE id = ?';

    await db.runAsync(balanceUpdateQuery, [amount, customer_id]);

    console.log('Transaction added and balance updated successfully');
  } catch (err) {
    console.error('Failed to add transaction or update balance:', err);
  }
};

export const deleteTransaction = async (transactionId: number) => {
  if (!db) await initDB();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [transactionId]);
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
