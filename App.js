// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import 'react-native-gesture-handler';
import { LogBox } from 'react-native';

// Ignore specific warnings that might come from libraries
LogBox.ignoreLogs(['Warning: ...']); // Customize this based on warnings you want to ignore

export default function App() {
  return (
    // SafeAreaProvider is needed for useSafeAreaInsets hook and safe area handling
    <SafeAreaProvider>
      {/* Main navigation stack */}
      <AppNavigator />
      
      <StatusBar style="light" backgroundColor="#4f46e5" />
    </SafeAreaProvider>
  );
}