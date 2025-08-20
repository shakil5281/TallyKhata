import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Modal } from 'react-native';
import { ActivityIndicator, Portal, Surface } from 'react-native-paper';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
  showSpinner?: boolean;
  color?: string;
}

export default function LoadingOverlay({
  visible,
  message = 'Loading...',
  transparent = true,
  showSpinner = true,
  color = '#fe4c24',
}: LoadingOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Portal>
      <Modal transparent={transparent} visible={visible} animationType="none">
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
              backgroundColor: transparent ? 'rgba(0, 0, 0, 0.5)' : 'white',
            },
          ]}>
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}>
            <Surface style={styles.surface}>
              {showSpinner && (
                <ActivityIndicator size="large" color={color} style={styles.spinner} />
              )}
              <Text style={[styles.message, { color }]}>{message}</Text>
            </Surface>
          </Animated.View>
        </Animated.View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  surface: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 160,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
