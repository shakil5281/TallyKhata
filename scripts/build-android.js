#!/usr/bin/env node

/**
 * Android Build Script for TallyKhata
 * 
 * This script helps build Android apps locally using EAS.
 */

const { execSync } = require('child_process');
const readline = require('readline');

console.log('🤖 TallyKhata Android Build Script');
console.log('===================================');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function buildAndroid() {
  try {
    console.log('\n📱 Available build profiles:');
    console.log('1. Development (APK) - For testing');
    console.log('2. Preview (APK) - For internal testing');
    console.log('3. Production (AAB) - For Play Store');
    
    rl.question('\n🎯 Select build profile (1-3): ', async (answer) => {
      let profile;
      let description;
      
      switch(answer) {
        case '1':
          profile = 'development';
          description = 'Development APK';
          break;
        case '2':
          profile = 'preview';
          description = 'Preview APK';
          break;
        case '3':
          profile = 'production';
          description = 'Production AAB';
          break;
        default:
          console.log('❌ Invalid selection. Using preview profile.');
          profile = 'preview';
          description = 'Preview APK';
      }
      
      console.log(`\n🚀 Building ${description}...`);
      console.log(`📋 Profile: ${profile}`);
      
      try {
        // Check if EAS CLI is installed
        execSync('eas --version', { stdio: 'pipe' });
        console.log('✅ EAS CLI found');
        
        // Check if logged in
        try {
          execSync('eas whoami', { stdio: 'pipe' });
          console.log('✅ EAS login verified');
        } catch (error) {
          console.log('⚠️  Not logged in to EAS');
          console.log('💡 Run: eas login');
          rl.close();
          return;
        }
        
        // Start the build
        console.log(`\n🏗️  Starting build with profile: ${profile}`);
        console.log('⏳ This may take 10-20 minutes...');
        
        execSync(`eas build --platform android --profile ${profile}`, { 
          stdio: 'inherit' 
        });
        
        console.log('\n🎉 Build completed successfully!');
        console.log('📱 Check your EAS dashboard for the build');
        
      } catch (error) {
        console.error('\n❌ Build failed:', error.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Check your internet connection');
        console.log('2. Verify EAS project configuration');
        console.log('3. Check app.json and eas.json');
        console.log('4. Run: eas build:configure');
      }
      
      rl.close();
    });
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
    rl.close();
  }
}

// Check if running in correct directory
const fs = require('fs');
const path = require('path');

if (!fs.existsSync('eas.json')) {
  console.log('❌ EAS configuration not found');
  console.log('💡 Run: eas build:configure');
  process.exit(1);
}

if (!fs.existsSync('app.json')) {
  console.log('❌ Expo configuration not found');
  console.log('💡 Make sure you are in the TallyKhata project directory');
  process.exit(1);
}

buildAndroid();
