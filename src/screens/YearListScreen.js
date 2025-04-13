// src/screens/YearListScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { globalStyles, Colors } from '../styles/globalStyles';
import { loadCompletedQuestions } from '../utils/storage'; // Import loading function

const YearListScreen = ({ navigation, route }) => {
  const { branchId, semesterId, subjectId, subjectName, allBranchesData } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [yearsWithData, setYearsWithData] = useState([]); // Renamed state
  const [completedQuestions, setCompletedQuestions] = useState(new Set()); // State for completion data
  const [isCompletionLoading, setIsCompletionLoading] = useState(true); // Separate loading for completion

  // Header title is set globally by AppNavigator

  // Extract subject data using useMemo for efficiency
  const subject = useMemo(() => {
    const branch = (allBranchesData || [])?.find(b => b.id === branchId);
    const semester = branch?.semesters?.find(s => s.id === semesterId);
    return semester?.subjects?.find(sub => sub.id === subjectId);
  }, [branchId, semesterId, subjectId, allBranchesData]);

  // Load completed questions when the screen focuses
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setIsCompletionLoading(true); // Indicate start of loading completion data

      const fetchCompleted = async () => {
        try {
          const completedSet = await loadCompletedQuestions(subjectId);
          if (isActive) {
            setCompletedQuestions(completedSet);
          }
        } catch (error) {
          console.error("Failed to load completed questions in YearListScreen:", error);
          if (isActive) {
            setCompletedQuestions(new Set()); // Reset on error
          }
        } finally {
          if (isActive) {
            setIsCompletionLoading(false); // Finish loading completion data
          }
        }
      };

      fetchCompleted();

      return () => {
        isActive = false; // Cleanup function to prevent state update on unmounted component
      };
    }, [subjectId]) // Dependency: subjectId
  );

  // Extract, count, calculate progress, and sort years when subject data or completion data changes
  useEffect(() => {
    // Wait for both subject data and completion status to load
    if (!subject || isCompletionLoading) {
        setIsLoading(true); // Keep main loading indicator true until everything is ready
        return;
    }

    setIsLoading(true); // Start processing
    if (subject && Array.isArray(subject.questions)) {
      // Use a Map to aggregate data per year efficiently
      const yearMap = new Map();
      subject.questions.forEach(q => {
          if (q.year && q.questionId) { // Ensure year and questionId exist
            const year = q.year;
            const isCompleted = completedQuestions.has(q.questionId);
            const currentData = yearMap.get(year) || { totalCount: 0, completedCount: 0 };

            yearMap.set(year, {
                totalCount: currentData.totalCount + 1,
                completedCount: currentData.completedCount + (isCompleted ? 1 : 0)
            });
          }
      });

      // Convert Map entries to an array of objects and calculate progress
      const yearsArray = Array.from(yearMap.entries()).map(([year, counts]) => {
          const progress = counts.totalCount > 0
              ? Math.round((counts.completedCount / counts.totalCount) * 100)
              : 0;
          return {
              year,
              totalCount: counts.totalCount,
              completedCount: counts.completedCount,
              progress: progress,
          };
      });

      // Sort years in descending order (newest first)
      yearsArray.sort((a, b) => b.year - a.year);

      setYearsWithData(yearsArray);
    } else {
      setYearsWithData([]); // Set empty if no subject or questions
    }
    setIsLoading(false); // Finish processing
  }, [subject, completedQuestions, isCompletionLoading]); // Rerun when subject or completion data changes

  // Handle navigation when a year is pressed
  const handleYearPress = useCallback((yearData) => {
    navigation.navigate('QuestionList', {
      branchId,
      semesterId,
      subjectId,
      subjectName,
      allBranchesData,
      presetFilters: { years: [yearData.year], chapters: [] },
      headerTitle: `${subjectName} - ${yearData.year}`,
    });
  }, [navigation, branchId, semesterId, subjectId, subjectName, allBranchesData]);

  // Render each year item in the list, including progress bar
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
        {/* Content Container */}
        <View style={styles.itemContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <FontAwesome5 name="calendar-check" size={20} color={Colors.accent} />
          </View>
          {/* Text Content (Year and Count) */}
          <View style={styles.textContainer}>
            <Text style={globalStyles.listItemText}>{item.year}</Text>
            {/* Display Count and Completed */}
            <Text style={globalStyles.listItemSubtitle}>
                {item.completedCount} / {item.totalCount} Completed
            </Text>
          </View>
          {/* Chevron */}
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={Colors.textSecondary}
          />
        </View>

        {/* Progress Bar Container */}
        <View style={styles.progressBarContainer}>
          {/* Progress Indicator */}
          <View style={[styles.progressBarIndicator, { width: `${item.progress}%` }]} />
        </View>
      </TouchableOpacity>
    </Animatable.View>
  ), [handleYearPress]); // Dependency injection

  // Loading state display
  if (isLoading) { // Use the main isLoading state which waits for completion data too
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
        data={yearsWithData}
        renderItem={renderYearItem}
        keyExtractor={(item) => item.year.toString()} // Use year as key
        contentContainerStyle={[globalStyles.listContentContainer, { paddingTop: 15 }]}
        ListEmptyComponent={
          <View style={globalStyles.emptyListContainer}>
            <FontAwesome5 name="calendar-day" size={48} color={Colors.textSecondary} style={globalStyles.emptyListIcon} />
            <Text style={globalStyles.emptyListText}>No questions found by year</Text>
          </View>
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
        extraData={completedQuestions} // Ensure list re-renders if completion changes
      />
    </View>
  );
};

// Local styles for YearListScreen
const styles = StyleSheet.create({
  itemContent: { // Wrap original content to place progress bar below
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%', // Take full width
      marginBottom: 8, // Space between content and progress bar
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent + '1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  progressBarContainer: {
    height: 6, // Height of the progress bar track
    backgroundColor: Colors.disabledBg, // Light grey background for the track
    borderRadius: 3, // Rounded corners for the track
    width: '100%', // Take full width of the list item
    overflow: 'hidden', // Ensure indicator stays within bounds
  },
  progressBarIndicator: {
    height: '100%', // Take full height of the container
    backgroundColor: Colors.success, // Green color for progress
    borderRadius: 3, // Rounded corners for the indicator
    // Width is set dynamically inline
  },
});

export default YearListScreen;