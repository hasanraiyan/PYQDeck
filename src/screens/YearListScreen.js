// src/screens/YearListScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons'; // Added FontAwesome5
import * as Animatable from 'react-native-animatable';
import { globalStyles, Colors } from '../styles/globalStyles';

const YearListScreen = ({ navigation, route }) => {
  const { branchId, semesterId, subjectId, subjectName, allBranchesData } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [yearsWithCounts, setYearsWithCounts] = useState([]);

  // Header title is set globally by AppNavigator

  // Extract subject data using useMemo for efficiency
  const subject = useMemo(() => {
    const branch = (allBranchesData || [])?.find(b => b.id === branchId);
    const semester = branch?.semesters?.find(s => s.id === semesterId);
    return semester?.subjects?.find(sub => sub.id === subjectId);
  }, [branchId, semesterId, subjectId, allBranchesData]);

  // Extract, count, and sort years when subject data changes
  useEffect(() => {
    setIsLoading(true);
    if (subject && Array.isArray(subject.questions)) {
      // Use a Map to count questions per year efficiently
      const yearMap = new Map();
      subject.questions.forEach(q => {
          if (q.year) { // Only count questions with a valid year
            yearMap.set(q.year, (yearMap.get(q.year) || 0) + 1);
          }
      });

      // Convert Map entries to an array of objects
      const yearsArray = Array.from(yearMap.entries()).map(([year, count]) => ({ year, count }));

      // Sort years in descending order (newest first)
      yearsArray.sort((a, b) => b.year - a.year);

      setYearsWithCounts(yearsArray);
    } else {
      setYearsWithCounts([]); // Set empty if no subject or questions
    }
    setIsLoading(false);
  }, [subject]); // Rerun effect if the subject data changes

  // Handle navigation when a year is pressed
  const handleYearPress = useCallback((yearData) => {
    navigation.navigate('QuestionList', {
      branchId,
      semesterId,
      subjectId,
      subjectName,
      allBranchesData,
      // Pass the selected year as a preset filter
      presetFilters: { years: [yearData.year], chapters: [] },
      // Optionally set a more specific header title for the QuestionList screen
      headerTitle: `${subjectName} - ${yearData.year}`,
    });
  }, [navigation, branchId, semesterId, subjectId, subjectName, allBranchesData]);

  // Render each year item in the list
  const renderYearItem = useCallback(({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={350}
      delay={index * 70}
      useNativeDriver
    >
      <TouchableOpacity
        style={globalStyles.listItem} // Consistent list item styling
        onPress={() => handleYearPress(item)}
        activeOpacity={0.75}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <FontAwesome5 name="calendar-check" size={20} color={Colors.accent} />
        </View>
        {/* Text Content (Year and Count) */}
        <View style={styles.textContainer}>
          <Text style={globalStyles.listItemText}>{item.year}</Text>
          <Text style={globalStyles.listItemSubtitle}>{item.count} question{item.count !== 1 ? 's' : ''}</Text>
        </View>
        {/* Chevron */}
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>
    </Animatable.View>
  ), [handleYearPress]); // Dependency injection

  // Loading state display
  if (isLoading) {
    return (
      <View style={globalStyles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={globalStyles.loadingText}>Loading years...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={yearsWithCounts}
        renderItem={renderYearItem}
        keyExtractor={(item) => item.year.toString()} // Use year as key
        // Add padding top to avoid content going under the header
        contentContainerStyle={[globalStyles.listContentContainer, { paddingTop: 15 }]}
        ListEmptyComponent={ // Consistent empty state
          <View style={globalStyles.emptyListContainer}>
            <FontAwesome5 name="calendar-day" size={48} color={Colors.textSecondary} style={globalStyles.emptyListIcon} />
            <Text style={globalStyles.emptyListText}>No questions found by year</Text>
          </View>
        }
        // Performance optimizations
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
      />
    </View>
  );
};

// Local styles for YearListScreen
const styles = StyleSheet.create({
  iconContainer: { // Copied from BranchSelection for consistency
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent + '1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: { // Copied from BranchSelection for consistency
    flex: 1,
    justifyContent: 'center',
  },
});


export default YearListScreen;