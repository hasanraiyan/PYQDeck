// App.js - Main UI Shell
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import 'react-native-gesture-handler';
import { Colors } from './src/styles/globalStyles'; // Import updated Colors
import { LogBox } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'NativeSyntaxHighlighter: Support for defaultProps',
  // Add any other warnings you want to ignore below
  // 'Warning: ...',
]);

export default function App() {
  // State to control splash screen visibility
  const [showSplash, setShowSplash] = useState(true);

  // Handle splash screen completion
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // If showing splash screen
  if (showSplash) {
    return (
      <>
        <SplashScreen onFinish={handleSplashFinish} />
        <StatusBar style="light" backgroundColor={Colors.gradientStart} translucent={false} />
      </>
    );
  }

  // Main app UI
  return (
    <SafeAreaProvider>
      {/* Gradient background covering the whole app */}
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.gradientBackground}
      >
        {/* SafeAreaView for handling notches/insets */}
        <SafeAreaView style={styles.safeAreaContainer}>
          {/* NavigationContainer hosts the AppNavigator */}
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </LinearGradient>

      {/* Status Bar configured for the dark theme */}
      <StatusBar style="light" backgroundColor={Colors.gradientStart} translucent={false} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1, // Ensure gradient fills the screen
  },
  safeAreaContainer: {
    flex: 1,
    // No background color here, gradient provides it
  },
});