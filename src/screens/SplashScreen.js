// src/screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Colors } from '../styles/globalStyles'; // Import new colors

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  // Use useRef for animation values to avoid recreation on re-renders
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Start slightly smaller

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900, // Slightly longer fade-in
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5, // Adjust spring properties
        tension: 60,
        useNativeDriver: true,
      })
    ]).start();

    // Timeout to start fade-out and trigger finish callback
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500, // Faster fade-out
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish(); // Call callback after fade-out completes
      });
    }, 2200); // Total splash duration approx 2.2s + 0.5s fade-out

    // Cleanup timeout on unmount
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]); // Include dependencies

  return (
    // Use a standard View with the surface color (white)
    <View style={styles.container}>
      <Animated.View
        style={[styles.content, {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }]}
      >
        {/* Use Animatable for the icon pulse */}
        <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite" duration={1800}>
          {/* Use Accent color for the main icon */}
          <MaterialCommunityIcons name="cards-outline" size={80} color={Colors.accent} />
        </Animatable.View>

        {/* App Name - Use Primary Text color */}
        <Text style={styles.appName}>PYQDeck</Text>
        {/* Tagline - Use Secondary Text color */}
        <Text style={styles.tagline}>Master Your Exams</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface, // White background
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 40, // Slightly smaller font size
    fontWeight: 'bold',
    color: Colors.textPrimary, // Dark text color
    marginTop: 25, // Increased margin
    // Remove text shadow for a flatter look
  },
  tagline: {
    fontSize: 17, // Slightly smaller font size
    color: Colors.textSecondary, // Medium gray text color
    marginTop: 8,
  },
});

export default SplashScreen;