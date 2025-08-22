import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { isLoading } = useAuth();

  const handleSignInSuccess = () => {
    console.log('Google Sign-In successful');
  };

  const handleSignInError = (error: string) => {
    console.error('Google Sign-In error:', error);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/mainLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>TallyKhata</Text>
          <Text style={styles.tagline}>Digital Ledger & Accounting</Text>
        </View>

        <View style={styles.authSection}>
          <Text style={styles.welcomeText}>Welcome to TallyKhata</Text>
          <Text style={styles.descriptionText}>
            Sign in with your Google account to access your digital ledger and manage your business accounts.
          </Text>
          
          <View style={styles.buttonContainer}>
            <GoogleSignInButton
              onSuccess={handleSignInSuccess}
              onError={handleSignInError}
              style={styles.signInButton}
            />
          </View>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fe4c24',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  authSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  signInButton: {
    width: '100%',
  },
  footerSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;
