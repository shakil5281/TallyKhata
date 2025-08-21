#!/usr/bin/env node

/**
 * GitHub Actions Setup Script for TallyKhata
 * 
 * This script helps verify and set up GitHub Actions workflows.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 TallyKhata GitHub Actions Setup');
console.log('===================================');

// Check if workflows directory exists
const workflowsDir = path.join(__dirname, '..', '.github', 'workflows');
if (!fs.existsSync(workflowsDir)) {
  console.log('❌ .github/workflows directory not found');
  console.log('💡 Make sure you have pushed the workflows to GitHub');
  process.exit(1);
}

// List workflow files
const workflowFiles = fs.readdirSync(workflowsDir);
console.log('✅ Found workflow files:');
workflowFiles.forEach(file => {
  console.log(`   📁 ${file}`);
});

// Check package.json scripts
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('\n📦 Package.json scripts:');
  Object.keys(packageJson.scripts).forEach(script => {
    console.log(`   🔧 ${script}: ${packageJson.scripts[script]}`);
  });
}

// Check EAS configuration
const easJsonPath = path.join(__dirname, '..', 'eas.json');
if (fs.existsSync(easJsonPath)) {
  console.log('\n🏗️  EAS configuration found');
} else {
  console.log('\n⚠️  EAS configuration not found');
  console.log('💡 Run: eas build:configure');
}

console.log('\n📋 Next Steps:');
console.log('1. Push your code to GitHub:');
console.log('   git add .');
console.log('   git commit -m "feat: add GitHub Actions workflows"');
console.log('   git push origin main');
console.log('');
console.log('2. Set up EXPO_TOKEN in GitHub Secrets:');
console.log('   - Go to your GitHub repository');
console.log('   - Settings → Secrets and variables → Actions');
console.log('   - Add EXPO_TOKEN with your Expo access token');
console.log('');
console.log('3. Check the Actions tab to see workflows running');
console.log('');
console.log('4. For production releases, create git tags:');
console.log('   git tag v1.0.0');
console.log('   git push origin v1.0.0');
console.log('');
console.log('📚 See GITHUB_ACTIONS_SETUP.md for detailed instructions');
console.log('');
console.log('✨ Happy building! 🚀');
