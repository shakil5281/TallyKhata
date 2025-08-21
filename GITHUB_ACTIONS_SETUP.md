# 🚀 GitHub Actions Setup Guide for TallyKhata

This guide explains how to set up and use the automated GitHub Actions workflows for your TallyKhata app.

## 📋 Prerequisites

1. **GitHub Repository**: Your TallyKhata project must be pushed to GitHub
2. **EAS Account**: You need an Expo Application Services (EAS) account
3. **EAS Project**: Your app must be configured with EAS

## 🔑 Required Secrets

### 1. EXPO_TOKEN
This is the most important secret you need to set up:

1. Go to [Expo Dashboard](https://expo.dev)
2. Navigate to **Account Settings** → **Access Tokens**
3. Create a new token with appropriate permissions
4. Copy the token

**Set in GitHub:**
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: Paste your Expo token
6. Click **Add secret**

## 📁 Workflow Files Created

### 1. `.github/workflows/eas-build.yml`
- **Triggers**: Push to main branch, Pull requests to main
- **Purpose**: Automated builds for Android and iOS
- **Features**: 
  - Cross-platform builds
  - Artifact uploads
  - Non-interactive builds

### 2. `.github/workflows/quality-check.yml`
- **Triggers**: Push to main branch, Pull requests to main
- **Purpose**: Code quality and security checks
- **Features**:
  - ESLint validation
  - TypeScript compilation check
  - Prettier formatting check
  - Security audit
  - Optional test execution

### 3. `.github/workflows/deploy.yml`
- **Triggers**: Git tags (e.g., v1.0.0, v1.1.0)
- **Purpose**: Production deployments and releases
- **Features**:
  - Production builds
  - GitHub release creation
  - Automated changelog

## 🚀 How It Works

### Automatic Builds
Every time you push to the `main` branch:
1. ✅ Quality checks run automatically
2. 🏗️ EAS builds start for both platforms
3. 📱 Build artifacts are uploaded
4. 📊 Build status is reported

### Pull Request Validation
For every pull request:
1. 🔍 Code quality checks run
2. 🛡️ Security audit performed
3. ✅ Build validation (optional)

### Production Releases
When you create a git tag:
1. 🏷️ Tag triggers deployment workflow
2. 🚀 Production builds start
3. 📦 GitHub release is created
4. 🎯 Release notes are generated

## 📱 Build Platforms

- **Android**: APK and AAB files
- **iOS**: IPA files (when available)
- **Cross-platform**: Universal builds

## 🔧 Customization Options

### Build Profiles
You can customize builds by modifying the EAS commands:

```yaml
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production

# Preview build
eas build --platform android --profile preview
```

### Conditional Builds
The workflows include conditional logic:

```yaml
# iOS builds only on macOS runners
if: runner.os == 'macOS'

# Continue on non-critical failures
continue-on-error: true
```

## 📊 Monitoring and Debugging

### View Workflow Runs
1. Go to your GitHub repository
2. Click **Actions** tab
3. Select the workflow you want to monitor
4. View detailed logs and status

### Common Issues and Solutions

#### Build Failures
- Check EAS token permissions
- Verify app.json configuration
- Review build logs for specific errors

#### Quality Check Failures
- Fix ESLint errors: `npm run lint --fix`
- Fix TypeScript errors: `npx tsc --noEmit`
- Fix formatting: `npm run format`

#### Secret Issues
- Verify EXPO_TOKEN is set correctly
- Check token permissions and expiration
- Ensure repository has access to secrets

## 🎯 Best Practices

### 1. Branch Protection
Set up branch protection rules:
- Require quality checks to pass
- Require pull request reviews
- Prevent direct pushes to main

### 2. Semantic Versioning
Use semantic versioning for releases:
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 3. Commit Messages
Use conventional commit messages:
```
feat: add new customer photo feature
fix: resolve database migration issue
docs: update API documentation
```

### 4. Regular Maintenance
- Keep dependencies updated
- Monitor security advisories
- Review workflow performance

## 🚀 Quick Start

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "feat: add GitHub Actions workflows"
   git push origin main
   ```

2. **Check Actions tab**
   - Go to GitHub repository
   - Click **Actions** tab
   - Watch your first workflow run

3. **Monitor build progress**
   - View real-time logs
   - Check build status
   - Download artifacts when complete

## 📞 Support

If you encounter issues:
1. Check the workflow logs for specific errors
2. Verify all secrets are properly configured
3. Ensure your EAS project is set up correctly
4. Review the [GitHub Actions documentation](https://docs.github.com/en/actions)

## 🎉 Benefits

- **Automated Quality Assurance**: Every commit is automatically checked
- **Consistent Builds**: Same build process every time
- **Faster Development**: No manual build steps
- **Better Collaboration**: Team can see build status
- **Professional Releases**: Automated release management

---

**Happy Building! 🚀**
Your TallyKhata app now has enterprise-grade CI/CD automation!
