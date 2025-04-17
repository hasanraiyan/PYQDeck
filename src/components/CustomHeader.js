import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const CustomHeader = ({ title, navigation, canGoBack, rightComponent }) => {
  return (
    <View style={styles.container}>
      {canGoBack ? (
        <TouchableOpacity style={styles.left} onPress={() => navigation.goBack()}>
          <Ionicons name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} size={24} color={COLORS.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.left} />
      )}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: COLORS.surface,
    borderBottomWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0,
    borderBottomColor: COLORS.border || '#eee',
    paddingHorizontal: 12,
    elevation: Platform.OS === 'android' ? 2 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'left',
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    paddingLeft: 0
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default CustomHeader;