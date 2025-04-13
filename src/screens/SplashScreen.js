// src/screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Colors } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    // Set timeout to trigger navigation after splash screen
    const timer = setTimeout(() => {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Call the onFinish callback when animation completes
        if (onFinish) onFinish();
      });
    }, 2500); // Show splash for 2.5 seconds

    // Clear timeout on unmount
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.container}
    >
      <Animated.View 
        style={[styles.content, {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }]}
      >
        <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
          <MaterialCommunityIcons name="cards-outline" size={80} color={Colors.accent} />
        </Animatable.View>
        
        <Text style={styles.appName}>PYQDeck</Text>
        <Text style={styles.tagline}>Master Your Exams</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});

export default SplashScreen;