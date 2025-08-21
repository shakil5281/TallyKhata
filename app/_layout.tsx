import React, { useState, useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar as RNStatusBar, Platform } from 'react-native';
import '../global.css';

import { ThemeProvider, useTheme } from '~/context/ThemeContext';
import SplashScreen from '../components/SplashScreen';
import { ToastProvider } from '~/context/ToastContext';
import { initDB, initializeDefaultProfile } from '~/lib/db';

function AppContent() {
  const { theme } = useTheme();
  const [isInitializing, setIsInitializing] = useState(true);

  // Set StatusBar immediately
  useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setBackgroundColor(theme.custom.colors.primary, true);
      RNStatusBar.setBarStyle('light-content', true);
    }
  }, [theme.custom.colors.primary]);

  // Memoize the callback to prevent infinite re-renders
  const handleAnimationComplete = useCallback(() => {
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    // Initialize app only once on startup
    let isMounted = true;

    const initializeApp = async () => {
      try {
        // Initialize database and profile
        await initDB();
        await initializeDefaultProfile();

        // Don't set isInitializing to false here - let the SplashScreen handle it
        // The SplashScreen will call onAnimationComplete when ready
      } catch (error) {
        console.error('App initialization error:', error);
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this runs only once

  if (isInitializing) {
    return (
      <PaperProvider theme={theme}>
        <RNStatusBar
          barStyle="light-content"
          backgroundColor={theme.custom.colors.primary}
          translucent={false}
        />
        <ToastProvider>
          <SplashScreen
            onAnimationComplete={handleAnimationComplete}
            showProgress={true}
            duration={1200}
          />
        </ToastProvider>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <RNStatusBar
        barStyle="light-content"
        backgroundColor={theme.custom.colors.primary}
        translucent={false}
      />
      <ToastProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
            animationTypeForReplace: 'push',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            contentStyle: { backgroundColor: 'transparent' },
            presentation: 'transparentModal',
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="add-customer/index" />
          <Stack.Screen name="add-transaction/index" />
          <Stack.Screen name="customers-list/index" />
          <Stack.Screen name="profile-edit/index" />
          <Stack.Screen name="transaction/[id]" />
          <Stack.Screen name="customer-edit/[id]" />
          <Stack.Screen name="app-info" />
        </Stack>
      </ToastProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
