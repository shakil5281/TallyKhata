import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { Avatar, Surface, ProgressBar } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete?: () => void;
  duration?: number;
  showProgress?: boolean;
}

export default function SplashScreen({
  onAnimationComplete,
  duration = 3000,
  showProgress = true,
}: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  // Memoize the loading steps to prevent recreation
  const loadingSteps = useMemo(
    () => [
      { text: 'Initializing TallyKhata...', progress: 0.2 },
      { text: 'Setting up secure database...', progress: 0.4 },
      { text: 'Loading your profile...', progress: 0.6 },
      { text: 'Preparing dashboard...', progress: 0.8 },
      { text: 'Ready to go!', progress: 1.0 },
    ],
    []
  );

  // Memoize the hideToast callback
  const handleAnimationComplete = useCallback(() => {
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  useEffect(() => {
    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo rotation animation
    const rotationAnimation = Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Shimmer animation
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    // Progress simulation
    let currentStep = 0;
    const stepDuration = duration / loadingSteps.length;

    const progressInterval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        setProgress(step.progress);
        setLoadingText(step.text);
        currentStep++;
      } else {
        clearInterval(progressInterval);
        // Complete animation
        setTimeout(() => {
          handleAnimationComplete();
        }, 500);
      }
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      rotationAnimation.stop();
      pulseAnimation.stop();
      shimmerAnimation.stop();
    };
  }, [
    duration,
    fadeAnim,
    scaleAnim,
    slideUpAnim,
    logoRotateAnim,
    pulseAnim,
    shimmerAnim,
    loadingSteps,
    handleAnimationComplete,
  ]);

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#fe4c24" />
      <View style={styles.container}>
        {/* Animated background */}
        <View style={styles.backgroundContainer}>
          <Animated.View
            style={[
              styles.shimmerOverlay,
              {
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          />

          {/* Floating particles */}
          <View style={styles.particlesContainer}>
            {[...Array(6)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    left: `${15 + index * 15}%`,
                    top: `${20 + (index % 3) * 20}%`,
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideUpAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: [0, (index + 1) * 10],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
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
          {/* Logo section */}
          <View style={styles.logoSection}>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ rotate: logoRotation }, { scale: pulseAnim }],
                },
              ]}>
              <Surface style={styles.logoSurface} elevation={4}>
                <Avatar.Text
                  size={120}
                  label="TK"
                  style={styles.logoAvatar}
                  labelStyle={styles.logoText}
                />
              </Surface>

              {/* Glow effect */}
              <View style={styles.glowRing} />
            </Animated.View>

            {/* Brand name */}
            <Animated.View
              style={[
                styles.brandContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideUpAnim }],
                },
              ]}>
              <Text style={styles.brandName}>TallyKhata</Text>
              <Text style={styles.tagline}>Smart Business Management</Text>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Loading section */}
        {showProgress && (
          <Animated.View
            style={[
              styles.loadingSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}>
            <Text style={styles.loadingText}>{loadingText}</Text>

            <View style={styles.progressContainer}>
              <ProgressBar progress={progress} color="white" style={styles.progressBar} />
              <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
            </View>
          </Animated.View>
        )}

        {/* Bottom section */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}>
          <Text style={styles.copyrightText}>© 2024 TallyKhata. All rights reserved.</Text>
          <Text style={styles.madeWithLove}>Made with ❤️ for small businesses</Text>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fe4c24',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  backgroundContainer: {
    position: 'absolute',
    width: width,
    height: height,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.3,
    height: height,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ skewX: '-20deg' }],
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  logoSurface: {
    borderRadius: 70,
    backgroundColor: 'white',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  logoAvatar: {
    backgroundColor: '#fe4c24',
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    top: -20,
    left: -20,
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    letterSpacing: 1,
  },
  loadingSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    width: 250,
    alignItems: 'center',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  bottomSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  madeWithLove: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
});
