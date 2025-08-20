import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import '../global.css';

import { lightTheme, darkTheme } from '~/theme/theme';
import SplashScreen from '../components/SplashScreen';
import { ToastProvider } from '~/context/ToastContext';
import { initDB, initializeDefaultProfile } from '~/lib/db';

export default function Layout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize app only once on startup
    let isMounted = true;

    const initializeApp = async () => {
      try {
        // Initialize database and profile
        await initDB();
        await initializeDefaultProfile();

        // Minimal loading time for faster startup
        await new Promise((resolve) => setTimeout(resolve, 1200));

        if (isMounted) {
          setIsInitializing(false);
        }
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
      <PaperProvider theme={isDark ? darkTheme : lightTheme}>
        <ToastProvider>
          <SplashScreen
            onAnimationComplete={() => setIsInitializing(false)}
            showProgress={true}
            duration={1200}
          />
        </ToastProvider>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={isDark ? darkTheme : lightTheme}>
      <ToastProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 200,
            animationTypeForReplace: 'push',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />
      </ToastProvider>
    </PaperProvider>
  );
}
