// App.js (Root Component)
import React from 'react';
import { StatusBar, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants'; // For status bar styling

export default function App() {
  return (
    <>
      {/* Configure the status bar */}
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'} // Use dark text for light backgrounds
        backgroundColor={COLORS.surface} // Match header background
        translucent={false} // Optional: Set based on design preference
      />
      {/* Render the main navigation stack */}
      <AppNavigator />
    </>
  );
}