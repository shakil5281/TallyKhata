import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface SkeletonLoaderProps {
  height?: number;
  width?: number | string;
  borderRadius?: number;
  style?: any;
}

export function SkeletonItem({
  height = 20,
  width = '100%',
  borderRadius = 4,
  style,
}: SkeletonLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, typeof width === 'string' ? 200 : width],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          height,
          width,
          borderRadius,
        },
        style,
      ]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

export function CustomerCardSkeleton() {
  return (
    <View style={styles.customerCard}>
      <View style={styles.customerCardContent}>
        <SkeletonItem height={50} width={50} borderRadius={25} />
        <View style={styles.customerInfo}>
          <SkeletonItem height={18} width="60%" />
          <SkeletonItem height={14} width="40%" style={{ marginTop: 8 }} />
        </View>
        <View style={styles.customerBalance}>
          <SkeletonItem height={16} width={60} />
          <SkeletonItem height={20} width={20} borderRadius={10} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
}

export function TransactionCardSkeleton() {
  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionContent}>
        <SkeletonItem height={16} width="30%" />
        <SkeletonItem height={14} width="50%" style={{ marginTop: 8 }} />
        <View style={styles.transactionAmount}>
          <SkeletonItem height={18} width={80} />
          <SkeletonItem height={14} width={60} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <View style={styles.profileHeader}>
      <SkeletonItem height={80} width={80} borderRadius={40} />
      <SkeletonItem height={24} width="50%" style={{ marginTop: 16 }} />
      <SkeletonItem height={16} width="30%" style={{ marginTop: 8 }} />

      <View style={styles.statsContainer}>
        {[1, 2, 3].map((_, index) => (
          <View key={index} style={styles.statItem}>
            <SkeletonItem height={20} width={40} />
            <SkeletonItem height={12} width={60} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function DashboardCardSkeleton() {
  return (
    <View style={styles.dashboardCard}>
      <View style={styles.cardHeader}>
        <SkeletonItem height={20} width={20} borderRadius={10} />
        <SkeletonItem height={18} width="60%" style={{ marginLeft: 12 }} />
      </View>
      <SkeletonItem height={32} width="40%" style={{ marginTop: 16 }} />
      <SkeletonItem height={14} width="30%" style={{ marginTop: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    width: 50,
  },
  customerCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  customerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  customerBalance: {
    alignItems: 'flex-end',
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    padding: 15,
    elevation: 1,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  profileHeader: {
    backgroundColor: '#fe4c24',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  dashboardCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
