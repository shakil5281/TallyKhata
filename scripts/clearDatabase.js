// Clear Database Script
// Run this script to clear all database data

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 TallyKhata Database Cleaner');
console.log('===============================');

// Database file paths (typical SQLite locations for Expo)
const possibleDbPaths = [
  path.join(process.cwd(), 'tally.db'),
  path.join(process.cwd(), 'data', 'tally.db'),
  // Add more paths if needed based on your setup
];

function clearDatabase() {
  try {
    console.log('🔍 Looking for database files...');

    let foundDbFiles = false;

    possibleDbPaths.forEach((dbPath) => {
      if (fs.existsSync(dbPath)) {
        console.log(`📁 Found database at: ${dbPath}`);
        try {
          fs.unlinkSync(dbPath);
          console.log(`✅ Deleted: ${dbPath}`);
          foundDbFiles = true;
        } catch (_error) {
          console.log(`❌ Could not delete ${dbPath}: ${_error.message}`);
        }
      }
    });

    if (!foundDbFiles) {
      console.log('📝 No local database files found.');
      console.log('💡 Database will be fresh on next app start.');
    }

    console.log('\n🔄 Database cleanup complete!');
    console.log('✨ Your app will start with a clean database.');
  } catch (_error) {
    console.error('❌ Error during database cleanup:', _error.message);
  }
}

function clearExpoCache() {
  try {
    console.log('\n🧽 Clearing Expo cache...');
    execSync('expo start --clear', { stdio: 'inherit' });
  } catch (_error) {
    console.log('⚠️  Could not clear Expo cache automatically.');
    console.log('💡 Run "expo start --clear" manually to clear cache.');
  }
}

// Run the cleanup
clearDatabase();

// Ask if user wants to start the app
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\n🚀 Would you like to start the app with cleared cache? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    clearExpoCache();
  } else {
    console.log('\n✅ Database cleared. Run "npm start" when ready.');
  }
  rl.close();
});
