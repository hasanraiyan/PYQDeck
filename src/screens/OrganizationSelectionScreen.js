// src/screens/OrganizationSelectionScreen.js
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { globalStyles, Colors } from '../styles/globalStyles';

const OrganizationSelectionScreen = ({ navigation, route }) => {
  const { branchId, semesterId, subjectId, subjectName, allBranchesData } = route.params;

  // Title is set globally by AppNavigator using subjectName

  // Navigate based on user's choice (Year or Chapter)
  const handleSelection = useCallback((method) => {
    const commonParams = {
      branchId,
      semesterId,
      subjectId,
      subjectName,
      allBranchesData
    };
    if (method === 'year') {
      navigation.navigate('YearListScreen', commonParams);
    } else if (method === 'chapter') {
      navigation.navigate('ChapterListScreen', commonParams);
    }
  }, [navigation, branchId, semesterId, subjectId, subjectName, allBranchesData]);

  return (
    <View style={globalStyles.container}>
      <View style={styles.contentContainer}>
        {/* Instruction Text */}
        <Text style={styles.headerText}>How would you like to view questions?</Text>

        {/* Option Card: Year-wise */}
        <Animatable.View animation="fadeInUp" duration={400} delay={100} useNativeDriver>
          <TouchableOpacity
            style={styles.optionCard} // Use styled card for the option
            onPress={() => handleSelection('year')}
            activeOpacity={0.75}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <FontAwesome5 name="calendar-alt" size={24} color={Colors.accent} />
            </View>
            {/* Text */}
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>By Year</Text>
              <Text style={styles.optionDescription}>Organized by examination year</Text>
            </View>
            {/* Chevron */}
            <MaterialIcons name="chevron-right" size={26} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Animatable.View>

        {/* Option Card: Chapter-wise */}
        <Animatable.View animation="fadeInUp" duration={400} delay={200} useNativeDriver>
          <TouchableOpacity
            style={styles.optionCard} // Use the same card style
            onPress={() => handleSelection('chapter')}
            activeOpacity={0.75}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <FontAwesome5 name="book-open" size={24} color={Colors.accent} />
            </View>
            {/* Text */}
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>By Chapter</Text>
              <Text style={styles.optionDescription}>Organized by module or topic</Text>
            </View>
            {/* Chevron */}
            <MaterialIcons name="chevron-right" size={26} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Animatable.View>

         {/* Option Card: View All (Added) */}
         <Animatable.View animation="fadeInUp" duration={400} delay={300} useNativeDriver>
          <TouchableOpacity
            style={styles.optionCard} // Use the same card style
            onPress={() => navigation.navigate('QuestionList', { // Navigate directly to QuestionList without preset filters
                    branchId,
                    semesterId,
                    subjectId,
                    subjectName,
                    allBranchesData,
                    headerTitle: `${subjectName} - All`, // Set a specific title
                    presetFilters: { years: [], chapters: [] } // Ensure filters are empty
                 })}
            activeOpacity={0.75}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <FontAwesome5 name="list-ul" size={24} color={Colors.accent} />
            </View>
            {/* Text */}
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>View All</Text>
              <Text style={styles.optionDescription}>Show all questions for this subject</Text>
            </View>
            {/* Chevron */}
            <MaterialIcons name="chevron-right" size={26} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Animatable.View>


      </View>
    </View>
  );
};

// Styles for the Organization Selection Screen
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30, // More padding at the top
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 30, // Increased space below header
    textAlign: 'center',
  },
  // Style for the tappable option cards - visually distinct from simple list items
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface, // Use surface color (white)
    padding: 10,
    marginBottom: 18, // Space between cards
    borderRadius: 12, // Rounded corners
    borderWidth: 1,
    borderColor: Colors.border,
    // Use consistent shadow from globalStyles.card or define locally
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  iconContainer: { // Consistent icon container style
    width: 48, // Slightly larger for visual emphasis
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent + '1A', // Light accent background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18, // More spacing
  },
  textContainer: {
    flex: 1, // Take remaining space
  },
  optionTitle: {
    fontSize: 17, // Slightly larger title
    fontWeight: '600', // Bold title
    color: Colors.textPrimary,
    marginBottom: 3, // Space between title and description
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary, // Secondary color for description
  },
});

export default OrganizationSelectionScreen;