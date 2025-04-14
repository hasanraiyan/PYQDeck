// src/components/ErrorMessage.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const ErrorMessage = ({ message }) => (
  <View style={styles.centerContainer}>
    <Ionicons name="alert-circle-outline" size={40} color={COLORS.error} />
    <Text style={styles.errorText}>{message || 'An error occurred.'}</Text>
  </View>
);

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
});

export default ErrorMessage;