// src/screens/OrganizationSelectionScreen.js
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { globalStyles, Colors } from '../styles/globalStyles';

const OrganizationSelectionScreen = ({ navigation, route }) => {
  const { branchId, semesterId, subjectId, subjectName, allBranchesData } = route.params;

  // Set dynamic title using subjectName passed from previous screen
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: subjectName || 'View Options' });
  }, [navigation, subjectName]);

  // Handle selection of organization method
  const handleSelection = useCallback((method) => {
    if (method === 'year') {
      navigation.navigate('YearListScreen', {
        branchId,
        semesterId,
        subjectId,
        subjectName,
        allBranchesData
      });
    } else if (method === 'chapter') {
      navigation.navigate('ChapterListScreen', {
        branchId,
        semesterId,
        subjectId,
        subjectName,
        allBranchesData
      });
    }
  }, [navigation, branchId, semesterId, subjectId, subjectName, allBranchesData]);

  return (
    <View style={globalStyles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.headerText}>How would you like to view the questions?</Text>
        
        {/* Year-wise Option */}
        <Animatable.View animation="fadeInUp" duration={400} delay={100} useNativeDriver>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => handleSelection('year')}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5 name="calendar-alt" size={28} color={Colors.accent} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Year-wise</Text>
              <Text style={styles.optionDescription}>View questions organized by examination year</Text>
            </View>
            <MaterialIcons name="chevron-right" size={26} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Animatable.View>
        
        {/* Chapter-wise Option */}
        <Animatable.View animation="fadeInUp" duration={400} delay={200} useNativeDriver>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => handleSelection('chapter')}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5 name="book" size={28} color={Colors.accent} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Chapter-wise</Text>
              <Text style={styles.optionDescription}>View questions organized by chapters or modules</Text>
            </View>
            <MaterialIcons name="chevron-right" size={26} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    flex: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 25,
    textAlign: 'center',
  },
  optionCard: {
    ...globalStyles.listItem,
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.accent + '1A', // Light accent background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default OrganizationSelectionScreen;