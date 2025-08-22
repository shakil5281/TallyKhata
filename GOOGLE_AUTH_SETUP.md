# Google Authentication Setup Guide for TallyKhata

## Overview
This guide explains how to set up Google Sign-In authentication for the TallyKhata Android app using React Native Google Sign In.

## Prerequisites
- Google Cloud Console account
- Android development environment
- Expo development environment

## Step 1: Google Cloud Console Setup

### 1.1 Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Sign-In API

### 1.2 Configure OAuth 2.0
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Android" as application type
4. Fill in the following details:
   - Package name: `com.shakil5281.TallyKhata`
   - SHA-1 certificate fingerprint: (Get this from your keystore)

### 1.3 Get SHA-1 Certificate Fingerprint
For development:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

For production:
```bash
keytool -list -v -keystore your-release-keystore.keystore -alias your-key-alias
```

### 1.4 Create Web Application Client ID
1. In the same project, create another OAuth 2.0 Client ID
2. Choose "Web application" as application type
3. Add authorized redirect URIs if needed

## Step 2: Client IDs Configuration

The following client IDs are already configured in the app:

- **Android Client ID**: `305086174723-ebak00s0i6i27tujruih20p1lrlv87d8.apps.googleusercontent.com`
- **Web Client ID**: `305086174723-92oovinblc0a9p9oadqo99oo2jrfvagp.apps.googleusercontent.com`

## Step 3: App Configuration

### 3.1 Dependencies
The following packages are already installed:
- `@react-native-google-signin/google-signin`

### 3.2 Configuration Files
- `src/lib/googleAuth.ts` - Google Sign-In configuration
- `src/context/AuthContext.tsx` - Authentication context
- `components/GoogleSignInButton.tsx` - Sign-in button component
- `components/UserProfile.tsx` - User profile display
- `src/screen/LoginScreen.tsx` - Login screen
- `components/ProtectedRoute.tsx` - Route protection

### 3.3 App Layout Integration
The authentication system is integrated into:
- `app/_layout.tsx` - Wraps the app with AuthProvider
- `app/index.tsx` - Protects the main app with ProtectedRoute

## Step 4: Android Build Configuration

### 4.1 Update app.json
The Google Sign-In plugin is already added to the plugins array.

### 4.2 Build Commands
```bash
# Prebuild the app
npm run prebuild

# Build for Android
npm run build-android
```

## Step 5: Testing

### 5.1 Development Testing
1. Run the app in development mode
2. The app will show a login screen if not authenticated
3. Click "Sign in with Google" button
4. Choose your Google account
5. Grant necessary permissions

### 5.2 Production Testing
1. Build a release APK
2. Install on a device
3. Test the complete authentication flow

## Step 6: Troubleshooting

### Common Issues

#### 1. "Sign-in failed" Error
- Check if Google Play Services is up to date
- Verify client IDs are correct
- Ensure SHA-1 fingerprint matches

#### 2. "Developer Error" 
- Verify the package name matches exactly
- Check if the app is signed with the correct keystore
- Ensure the Google Cloud project is properly configured

#### 3. "Network Error"
- Check internet connectivity
- Verify Google services are accessible
- Check firewall settings

### Debug Steps
1. Check console logs for detailed error messages
2. Verify Google Sign-In configuration
3. Test with different Google accounts
4. Check device compatibility

## Step 7: Security Considerations

### 7.1 Token Management
- ID tokens are stored securely using Expo SecureStore
- Access tokens are managed by the Google Sign-In library
- Implement proper token refresh logic

### 7.2 User Data
- Only request necessary scopes
- Handle user data according to privacy policies
- Implement proper sign-out functionality

## Step 8: Production Deployment

### 8.1 Release Build
1. Update version numbers in app.json
2. Build release APK with proper signing
3. Test thoroughly before deployment

### 8.2 Google Play Store
1. Ensure privacy policy covers Google Sign-In
2. Add appropriate app permissions
3. Test on various Android versions

## Support

For issues related to:
- **Google Sign-In**: Check [React Native Google Sign In documentation](https://github.com/react-native-google-signin/google-signin)
- **Expo**: Refer to [Expo documentation](https://docs.expo.dev/)
- **TallyKhata**: Check the main README.md file

## Notes

- The app currently supports Android only (as per user preference)
- iOS support can be added later by configuring iOS client ID
- All authentication state is managed through React Context
- The system automatically handles token refresh and user persistence
