import * as SQLite from 'expo-sqlite';


let db: SQLite.SQLiteDatabase;

export const initDB = async () => {
  db = await SQLite.openDatabaseAsync('tally.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      type TEXT
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
    if (!db) await initDB();
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
  await db.runAsync(
    'INSERT INTO transactions (customer_id, type, amount, note) VALUES (?, ?, ?, ?)',
    [customer_id, type, amount, note]
  );
};

// export const getCustomerTransactions = async (customer_id: number) => {
//   if (!db) await initDB();
//   return await db.getAllAsync(
//     'SELECT * FROM transactions WHERE customer_id = ? ORDER BY date DESC',
//     [customer_id]
//   );
// };

export const deleteTransaction = async (transactionId: number) => {
  if (!db) await initDB();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [transactionId]);
};

// Modify this function to support pagination
export const getCustomerTransactions = async (customer_id: number, limit: number, offset: number) => {
  if (!db) await initDB();
  return await db.getAllAsync(
    'SELECT * FROM transactions WHERE customer_id = ? ORDER BY date DESC LIMIT ? OFFSET ?',
    [customer_id, limit, offset]
  );
};

export const dropCustomersTable = async () => {
  if (!db) await initDB();
  await db.execAsync('DROP TABLE IF EXISTS customers');
  console.log('✅ Customers table dropped');
};

