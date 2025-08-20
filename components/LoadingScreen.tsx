import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { Avatar, Surface } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  showLogo?: boolean;
}

export default function LoadingScreen({
  message = 'TallyKhata',
  subMessage = 'Managing your business with ease',
  showLogo = true,
}: LoadingScreenProps) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Pulsing dots animation
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createDotAnimation(dotAnim1, 0).start();
    createDotAnimation(dotAnim2, 200).start();
    createDotAnimation(dotAnim3, 400).start();

    return () => {
      rotateAnimation.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getDotStyle = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1.2],
        }),
      },
    ],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#fe4c24" />
      <View style={styles.container}>
        {/* Background gradient effect */}
        <View style={styles.backgroundGradient}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>

        {/* Main content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          {showLogo && (
            <View style={styles.logoContainer}>
              {/* Main logo with rotation */}
              <Animated.View style={[styles.logoWrapper, { transform: [{ rotate: spin }] }]}>
                <Surface style={styles.logoSurface} elevation={4}>
                  <Avatar.Text
                    size={100}
                    label="TK"
                    style={styles.logoAvatar}
                    labelStyle={styles.logoText}
                  />
                </Surface>
              </Animated.View>

              {/* Outer ring */}
              <View style={styles.outerRing} />

              {/* Pulsing dots */}
              <View style={styles.dotsContainer}>
                <Animated.View style={[styles.dot, getDotStyle(dotAnim1)]} />
                <Animated.View style={[styles.dot, getDotStyle(dotAnim2)]} />
                <Animated.View style={[styles.dot, getDotStyle(dotAnim3)]} />
              </View>
            </View>
          )}

          {/* Text content */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}>
            <Text style={styles.mainTitle}>{message}</Text>
            <Text style={styles.subtitle}>{subMessage}</Text>

            {/* Loading indicator */}
            <View style={styles.loadingContainer}>
              <View style={styles.loadingBar}>
                <Animated.View
                  style={[
                    styles.loadingProgress,
                    {
                      opacity: fadeAnim,
                    },
                  ]}
                />
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Bottom branding */}
        <Animated.View
          style={[
            styles.bottomBranding,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <Text style={styles.brandingText}>Powered by Innovation</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fe4c24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    width: width,
    height: height,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: 100,
    left: -30,
  },
  circle3: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    top: '50%',
    left: '50%',
    marginTop: -150,
    marginLeft: -150,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSurface: {
    borderRadius: 60,
    backgroundColor: 'white',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoAvatar: {
    backgroundColor: '#fe4c24',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  outerRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  dotsContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: 'center',
    width: 200,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  bottomBranding: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  brandingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
