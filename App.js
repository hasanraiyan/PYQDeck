// App.js - Main UI Shell
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import 'react-native-gesture-handler';
import { Colors } from './src/styles/globalStyles'; // Only Colors needed here
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
        {/* Splash screen now uses solid background defined within its component */}
        <SplashScreen onFinish={handleSplashFinish} />
        {/* Status bar style for splash screen (assuming light background, dark content) */}
        <StatusBar style="dark" />
      </>
    );
  }

  // Main app UI
  return (
    <SafeAreaProvider>
      {/* SafeAreaView provides the main background color and safe area insets */}
      <SafeAreaView style={styles.safeAreaContainer}>
        {/* NavigationContainer hosts the AppNavigator */}
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaView>

      {/* Status Bar configured for the main light theme */}
      {/* Set translucent=false to prevent overlap on Android unless specifically desired */}
      <StatusBar style="dark" backgroundColor={Colors.surface} translucent={false} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // SafeAreaView now defines the background color for the whole app area
  safeAreaContainer: {
    flex: 1,
    backgroundColor: Colors.background, // Use the main light background color
  },
});