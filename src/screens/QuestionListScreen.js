// FILE: src/screens/QuestionListScreen.js
// src/screens/QuestionListScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { globalStyles, Colors } from '../styles/globalStyles'; // Use updated styles/colors
import { loadCompletedQuestions, toggleQuestionCompletion } from '../utils/storage';
import QuestionCard from '../components/QuestionCard';
// FilterModal import removed

const QuestionListScreen = ({ navigation, route }) => {
  const { subjectId, branchId, semesterId, allBranchesData, subjectName, presetFilters: initialFilters } = route.params;

  // State Management
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({ years: [], chapters: [] });


  // Memoized selector for subject (more robust check)
  const subject = useMemo(() => {
      const branch = (allBranchesData || [])?.find(b => b.id === branchId);
      const semester = branch?.semesters?.find(s => s.id === semesterId);
      return semester?.subjects?.find(sub => sub.id === subjectId);
  }, [branchId, semesterId, subjectId, allBranchesData]);

  // Memoized available years and chapters (no changes needed)
  const availableYears = useMemo(() => {
      if (!allQuestions || allQuestions.length === 0) return [];
      const years = new Set(allQuestions.map(q => q.year).filter(Boolean));
      return Array.from(years).sort((a, b) => b - a); // Descending sort
  }, [allQuestions]);

   const availableChapters = useMemo(() => {
      if (!allQuestions || allQuestions.length === 0) return [];
      const chapters = new Set(allQuestions.map(q => q.chapter || 'Uncategorized').filter(Boolean));
      // Optional: Improve sorting for chapters like "Module 1", "Module 10"
      return Array.from(chapters).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [allQuestions]);

  // --- Effects ---
  // Effect to initialize data and load completed status
  useEffect(() => {
      const initialize = async () => {
          setIsLoading(true);
          if (subject) {
              navigation.setOptions({ title: subject.name || subjectName || 'Questions' });
              const questions = Array.isArray(subject.questions) ? subject.questions : [];
              setAllQuestions(questions);
              try {
                 const completed = await loadCompletedQuestions(subjectId);
                 setCompletedQuestions(completed);
              } catch (error) {
                  console.error("Failed to load completed questions:", error);
                  setCompletedQuestions(new Set()); // Default to empty set on error
              }
          } else {
              setAllQuestions([]);
              navigation.setOptions({ title: 'Subject Not Found' });
              console.error("Subject not found with ID:", subjectId);
          }
           setIsLoading(false);
      };
      initialize();
      // Set initial filters from route params
      if (initialFilters) {
          setActiveFilters(initialFilters);
      }
  }, [subject, navigation, subjectId, subjectName, initialFilters]); // Add subjectName and initialFilters dependency

   // Effect to apply filters and sort questions
   useEffect(() => {
      // Guard against running before data is loaded or if data is invalid
      if (isLoading || !Array.isArray(allQuestions)) return;

      let result = [...allQuestions];

      // --- Filtering Logic ---
      if (activeFilters.years?.length > 0) {
          result = result.filter(q => activeFilters.years.includes(q.year));
      }
      if (activeFilters.chapters?.length > 0) {
          result = result.filter(q => activeFilters.chapters.includes(q.chapter || 'Uncategorized'));
      }
      // --- END OF FILTERING LOGIC ---

      // --- SORTING LOGIC (No Changes) ---
      result.sort((a, b) => {
           // 1. Primary Sort: Completion Status (Incomplete first)
           // Check if question IDs exist before checking the Set
           const isACompleted = a?.questionId ? completedQuestions.has(a.questionId) : false;
           const isBCompleted = b?.questionId ? completedQuestions.has(b.questionId) : false;

           if (isACompleted !== isBCompleted) {
               // Sort based on boolean value (false=0, true=1)
               // false comes before true, putting incomplete questions first.
               return isACompleted - isBCompleted;
           }

           // 2. Secondary Sort: Year (Descending)
           const yearA = a.year || 0; // Handle potential null/undefined years
           const yearB = b.year || 0;
           if (yearA !== yearB) {
               // yearB - yearA gives descending order (higher year first)
               return yearB - yearA;
           }

           // 3. Tertiary Sort: Question Number (Ascending, Alphanumeric)
           const qNumA = a.qNumber || '';
           const qNumB = b.qNumber || '';
           return qNumA.localeCompare(qNumB, undefined, { numeric: true, sensitivity: 'base' });
       });
      // --- END OF SORTING LOGIC (No Changes) ---

      setFilteredQuestions(result);

  }, [allQuestions, isLoading, completedQuestions, activeFilters]); // Add activeFilters dependency

  // --- Callbacks ---
  // Toggle completion status
   const handleToggleCompletion = useCallback(async (questionId) => {
      if (!questionId || !subjectId) {
          console.warn("Cannot toggle completion: Missing questionId or subjectId");
          return;
      }
      // Optimistic UI update (optional but improves perceived performance)
      const currentSet = new Set(completedQuestions);
      let optimisticSet = new Set(currentSet);
      if (optimisticSet.has(questionId)) {
          optimisticSet.delete(questionId);
      } else {
          optimisticSet.add(questionId);
      }
      setCompletedQuestions(optimisticSet); // State update triggers the sort useEffect

      // Perform async storage update
      try {
          const updatedCompletedSet = await toggleQuestionCompletion(subjectId, questionId);
          // Update state with the actual result from storage (in case of error or if optimistic update was wrong)
          // Note: Setting state again might seem redundant if toggle worked, but ensures consistency
          // If performance is critical and toggleQuestionCompletion is reliable, you could skip this set state.
          setCompletedQuestions(new Set(updatedCompletedSet));
      } catch (error) {
          console.error("Failed to toggle completion status in storage:", error);
          // Revert to original state if storage update fails
          setCompletedQuestions(currentSet);
      }
  }, [subjectId, completedQuestions]); // Dependency on subjectId and completedQuestions state

  // handleApplyFilters callback removed

  // --- Header Button ---
   React.useLayoutEffect(() => {
      navigation.setOptions({
      // HeaderRight button removed
      });
  }, [navigation]); // Re-run only if navigation changes

  // --- Render Logic ---
  // Render individual question card
  const renderItem = useCallback(({ item }) => (
      <QuestionCard
          question={item}
          // Ensure isCompleted check handles potential undefined questionId safely
          isCompleted={item?.questionId ? completedQuestions.has(item.questionId) : false}
          onToggleCompletion={handleToggleCompletion}
      />
  ), [completedQuestions, handleToggleCompletion]); // Correct dependencies

  // Loading State
  if (isLoading) { // Show loader while fetching initial subject data
      return (
         <View style={globalStyles.activityIndicatorContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
         </View>
      );
  }

  // Error State: Subject data could not be loaded
  if (!subject && !isLoading) {
       return (
            <View style={globalStyles.activityIndicatorContainer}>
                <MaterialIcons name="error-outline" size={48} color={Colors.danger} style={{ marginBottom: 15 }}/>
                <Text style={globalStyles.textSecondary}>Subject data could not be loaded.</Text>
                {/* Optionally add a button to go back */}
            </View>
       );
  }

  // Main Content
  return (
    <View style={globalStyles.container}>
        <FlatList
          data={filteredQuestions}
          renderItem={renderItem}
          keyExtractor={(item) => item?.questionId || `q-${Math.random()}`} // Robust key extractor
          contentContainerStyle={[globalStyles.contentContainer, styles.listContentContainer]} // Adjusted paddingTop
          ListEmptyComponent={
              <View style={globalStyles.emptyListContainer}>
                 <MaterialCommunityIcons name="text-box-search-outline" size={52} color={Colors.textSecondary} />
                 <Text style={globalStyles.emptyListText}>
                    {allQuestions.length === 0 // Check if there were questions initially
                        ? "No questions found for this subject."
                        : "No questions match the current filters." // Message when filters yield no results
                    }
                 </Text>
           
              </View>
           }
          // Performance Optimizations
          initialNumToRender={5} // Render fewer items initially
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'} // Can improve Android performance
          // Add extraData prop to force FlatList re-render when sorting changes due to completion toggle
          extraData={completedQuestions}
        />

        {/* Filter Modal Component Rendering removed */}
    </View>
  );
};

const styles = StyleSheet.create({
    listContentContainer: {
        paddingTop: 15, // Padding below header
    },
    // headerButton style removed
    // clearFiltersButton removed
});

export default QuestionListScreen;