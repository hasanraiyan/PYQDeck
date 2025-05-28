// src/components/ErrorMessage.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const ErrorMessage = ({ message, onRetry }) => (
  <View style={styles.centerContainer}>
    <Ionicons name="alert-circle-outline" size={40} color={COLORS.error} />
    <Text style={styles.errorText}>{message || 'An error occurred.'}</Text>
    {onRetry && (
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    )}
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary || '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  retryButtonText: {
    color: COLORS.white || '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorMessage;