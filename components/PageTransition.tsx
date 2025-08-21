import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface PageTransitionProps {
  children: React.ReactNode;
  style?: ViewStyle;
  duration?: number;
}

export default function PageTransition({ children, style, duration = 150 }: PageTransitionProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [duration, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}>
      {children}
    </Animated.View>
  );
}
