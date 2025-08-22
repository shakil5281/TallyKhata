import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GoogleAuthService, GoogleUser, configureGoogleSignIn } from '../lib/googleAuth';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  user: GoogleUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Google Sign-In configuration
  useEffect(() => {
    configureGoogleSignIn();
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const isSignedIn = await GoogleAuthService.isSignedIn();
      
      if (isSignedIn) {
        const currentUser = await GoogleAuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Store user data securely
          await SecureStore.setItemAsync('user', JSON.stringify(currentUser));
        }
      } else {
        // Check if we have stored user data
        const storedUser = await SecureStore.getItemAsync('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      const result = await GoogleAuthService.signIn();
      
      if (result.success && result.user) {
        setUser(result.user);
        // Store user data securely
        await SecureStore.setItemAsync('user', JSON.stringify(result.user));
        if (result.idToken) {
          await SecureStore.setItemAsync('idToken', result.idToken);
        }
      } else {
        throw new Error(result.error || 'Sign-in failed');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const result = await GoogleAuthService.signOut();
      
      if (result.success) {
        setUser(null);
        // Clear stored data
        await SecureStore.deleteItemAsync('user');
        await SecureStore.deleteItemAsync('idToken');
      } else {
        throw new Error(result.error || 'Sign-out failed');
      }
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await GoogleAuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await SecureStore.setItemAsync('user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
