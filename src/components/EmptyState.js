// src/components/EmptyState.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const EmptyState = ({ message }) => (
  <View style={styles.centerContainer}>
    <Ionicons name="file-tray-outline" size={40} color={COLORS.textSecondary} />
    <Text style={styles.emptyText}>{message || 'No items found.'}</Text>
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
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default EmptyState;