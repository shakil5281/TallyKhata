import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Text, Divider } from 'react-native-paper';
import LoadingScreen from './LoadingScreen';
import SplashScreen from './SplashScreen';
import LoadingOverlay from './LoadingOverlay';
import {
  CustomerCardSkeleton,
  TransactionCardSkeleton,
  ProfileHeaderSkeleton,
  DashboardCardSkeleton,
} from './SkeletonLoader';

export default function LoadingDemo() {
  const [showSplash, setShowSplash] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  // Auto-hide demos
  useEffect(() => {
    if (showOverlay) {
      const timer = setTimeout(() => setShowOverlay(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showOverlay]);

  useEffect(() => {
    if (showLoading) {
      const timer = setTimeout(() => setShowLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showLoading]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>TallyKhata Loading Components</Text>

      {/* Splash Screen Demo */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🚀 Splash Screen</Text>
          <Text style={styles.description}>
            Beautiful animated splash screen with progress indicator
          </Text>
          <Button mode="contained" onPress={() => setShowSplash(true)} style={styles.button}>
            Show Splash Screen
          </Button>
        </Card.Content>
      </Card>

      {/* Loading Overlay Demo */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>⏳ Loading Overlay</Text>
          <Text style={styles.description}>
            Modal overlay for actions like saving, exporting, etc.
          </Text>
          <Button mode="contained" onPress={() => setShowOverlay(true)} style={styles.button}>
            Show Loading Overlay
          </Button>
        </Card.Content>
      </Card>

      {/* Basic Loading Demo */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🔄 Basic Loading</Text>
          <Text style={styles.description}>Simple loading screen with custom messages</Text>
          <Button mode="contained" onPress={() => setShowLoading(true)} style={styles.button}>
            Show Basic Loading
          </Button>
        </Card.Content>
      </Card>

      {/* Skeleton Loaders */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>💀 Skeleton Loaders</Text>
          <Text style={styles.description}>Animated placeholders for content loading</Text>

          <Divider style={styles.divider} />

          <Text style={styles.subTitle}>Customer Card Skeleton</Text>
          <CustomerCardSkeleton />

          <Text style={styles.subTitle}>Transaction Card Skeleton</Text>
          <TransactionCardSkeleton />

          <Text style={styles.subTitle}>Dashboard Card Skeleton</Text>
          <DashboardCardSkeleton />
        </Card.Content>
      </Card>

      {/* Profile Header Skeleton */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>👤 Profile Header Skeleton</Text>
          <ProfileHeaderSkeleton />
        </Card.Content>
      </Card>

      {/* Modals */}
      {showSplash && (
        <SplashScreen onAnimationComplete={() => setShowSplash(false)} duration={2000} />
      )}

      <LoadingOverlay visible={showOverlay} message="Saving your data..." />

      {showLoading && (
        <LoadingScreen
          message="Processing..."
          subMessage="Please wait while we prepare your data"
        />
      )}


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#fe4c24',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#fe4c24',
  },
  divider: {
    marginVertical: 16,
  },
});
