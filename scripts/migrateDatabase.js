#!/usr/bin/env node

/**
 * TallyKhata Database Migration Script
 *
 * This script helps migrate the database schema when new features are added.
 * Run this script whenever you need to update the database structure.
 */

const fs = require('fs');
const path = require('path');

// Handle __dirname for both CommonJS and ES modules
const __dirname = path.dirname(require.main.filename);

console.log('🔄 TallyKhata Database Migration Tool');
console.log('=====================================');

// Check if database file exists
const dbPath = path.join(__dirname, '..', 'expo-sqlite', 'tally.db');

if (fs.existsSync(dbPath)) {
  console.log('📝 Found existing database file');
  console.log('🗑️  Removing old database to apply new schema...');

  try {
    fs.unlinkSync(dbPath);
    console.log('✅ Old database removed successfully');
  } catch (error) {
    console.error('❌ Failed to remove old database:', error.message);
  }
} else {
  console.log('📝 No existing database found');
}

console.log('');
console.log('✨ Migration completed!');
console.log('🚀 Your app will now start with the new database schema including:');
console.log('   • Customer photo support');
console.log('   • Enhanced customer management');
console.log('   • Photo upload and editing capabilities');
console.log('');
console.log('💡 Start your app with: npm start');
