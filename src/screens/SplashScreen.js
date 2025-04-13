// src/screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Use appropriate icons
import * as Animatable from 'react-native-animatable';
import { Colors } from '../styles/globalStyles'; // Import updated colors

// Get screen dimensions (optional, might not be needed for this layout)
// const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  // Use useRef for animation values to prevent recreation on re-renders
  const fadeAnim = useRef(new Animated.Value(0)).current; // Controls opacity
  const scaleAnim = useRef(new Animated.Value(0.85)).current; // Controls scale, start slightly smaller

  useEffect(() => {
    // Entrance Animation: Fade in and scale up simultaneously
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, // Fade in fully
        duration: 800, // Duration for fade-in
        useNativeDriver: true, // Use native driver for performance
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, // Scale to normal size
        friction: 4, // Controls bounciness (lower is more bouncy)
        tension: 50, // Controls speed
        useNativeDriver: true,
      })
    ]).start(); // Start the parallel animations

    // Set timeout to trigger the finish callback after a delay
    const displayDuration = 1800; // How long the splash screen stays visible (milliseconds)
    const fadeOutDuration = 400; // Duration for fade-out animation

    const timer = setTimeout(() => {
      // Start fade-out animation
      Animated.timing(fadeAnim, {
        toValue: 0, // Fade out fully
        duration: fadeOutDuration,
        useNativeDriver: true,
      }).start(() => {
        // Call the onFinish callback *after* fade-out completes
        if (onFinish) onFinish();
      });
    }, displayDuration); // Start fade-out after displayDuration

    // Cleanup function: Clear the timeout if the component unmounts early
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]); // Dependencies for the effect

  return (
    // Main container filling the screen with the surface color
    <View style={styles.container}>
      {/* Animated content container */}
      <Animated.View
        style={[styles.content, {
          opacity: fadeAnim, // Apply fade animation
          transform: [{ scale: scaleAnim }] // Apply scale animation
        }]}
      >
        {/* Icon with subtle pulse animation */}
        <Animatable.View
            animation="pulse" // Use built-in pulse animation
            easing="ease-in-out" // Smooth easing
            iterationCount="infinite" // Repeat indefinitely
            duration={1500} // Duration of one pulse cycle
        >
          {/* Use Accent color for the main icon */}
          <MaterialCommunityIcons name="cards-outline" size={85} color={Colors.accent} />
        </Animatable.View>

        {/* App Name - Use Primary Text color */}
        <Text style={styles.appName}>PYQDeck</Text>
        {/* Tagline - Use Secondary Text color */}
        <Text style={styles.tagline}>Master Your Exams</Text>
      </Animated.View>
    </View>
  );
};

// Styles for the SplashScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    backgroundColor: Colors.surface, // Use white surface background
  },
  content: {
    alignItems: 'center', // Align items (icon, text) in the center
    justifyContent: 'center',
  },
  appName: {
    fontSize: 38, // Adjusted font size
    fontWeight: 'bold',
    color: Colors.textPrimary, // Dark text color
    marginTop: 28, // Increased margin from icon
    // Consider adding letter spacing for style
    // letterSpacing: 1,
  },
  tagline: {
    fontSize: 16, // Adjusted font size
    color: Colors.textSecondary, // Medium gray text color
    marginTop: 8, // Spacing from app name
  },
});

export default SplashScreen;