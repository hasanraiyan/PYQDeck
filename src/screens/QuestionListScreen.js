// FILE: src/screens/QuestionListScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { globalStyles, Colors } from '../styles/globalStyles'; // Use updated styles/colors
import { loadCompletedQuestions, toggleQuestionCompletion } from '../utils/storage';
import QuestionCard from '../components/QuestionCard'; // Import the enhanced QuestionCard

const QuestionListScreen = ({ navigation, route }) => {
  // Extract parameters, including optional preset filters and header title
  const {
      subjectId,
      branchId,
      semesterId,
      allBranchesData,
      subjectName, // Base subject name
      presetFilters: initialFilters = { years: [], chapters: [] }, // Default to empty filters
      headerTitle // Optional specific title from navigation (e.g., chapter name)
  } = route.params;

  // State Management
  const [allQuestions, setAllQuestions] = useState([]); // Raw questions for the subject
  const [filteredQuestions, setFilteredQuestions] = useState([]); // Questions after filtering/sorting
  const [completedQuestions, setCompletedQuestions] = useState(new Set()); // IDs of completed questions
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch
  // Active filters are now directly based on initialFilters passed via route params
  // If filtering UI were added back, this would become state: `useState(initialFilters)`
  const activeFilters = initialFilters;

  // --- Data Fetching and Processing ---

  // Memoized selector for the current subject's data
  const subject = useMemo(() => {
      const branch = (allBranchesData || [])?.find(b => b.id === branchId);
      const semester = branch?.semesters?.find(s => s.id === semesterId);
      return semester?.subjects?.find(sub => sub.id === subjectId);
  }, [branchId, semesterId, subjectId, allBranchesData]);

  // Effect to initialize data: Load questions and completed status
  useEffect(() => {
      const initialize = async () => {
          setIsLoading(true); // Start loading indicator

          // Set header title based on provided param or fallback to subject name
          navigation.setOptions({ title: headerTitle || subject?.name || subjectName || 'Questions' });

          if (subject) {
              const questions = Array.isArray(subject.questions) ? subject.questions : [];
              setAllQuestions(questions); // Store raw questions

              // Load completion status from storage
              try {
                 const completed = await loadCompletedQuestions(subjectId);
                 setCompletedQuestions(completed);
              } catch (error) {
                  console.error("Failed to load completed questions:", error);
                  setCompletedQuestions(new Set()); // Default to empty set on error
              }
          } else {
              // Handle case where subject data isn't found
              setAllQuestions([]);
              console.error("Subject not found with ID:", subjectId);
              // Title might be set to 'Questions' or similar by default navigator options
          }
           setIsLoading(false); // Stop loading indicator
      };
      initialize();
      // Dependencies: Run when subject data, navigation object, IDs, or title changes
  }, [subject, navigation, subjectId, subjectName, headerTitle]);

   // Effect to apply filters and sort questions whenever dependencies change
   useEffect(() => {
      // Prevent processing before initial load or if data is invalid
      if (isLoading || !Array.isArray(allQuestions)) return;

      let result = [...allQuestions]; // Start with all questions for the subject

      // --- Filtering Logic (Based on activeFilters from route params) ---
      const hasYearFilter = activeFilters.years?.length > 0;
      const hasChapterFilter = activeFilters.chapters?.length > 0;

      if (hasYearFilter || hasChapterFilter) {
          result = result.filter(q => {
              const yearMatch = !hasYearFilter || activeFilters.years.includes(q.year);
              const chapterMatch = !hasChapterFilter || activeFilters.chapters.includes(q.chapter || 'Uncategorized');
              return yearMatch && chapterMatch;
          });
      }
      // --- End of Filtering Logic ---

      // --- Sorting Logic (Incomplete first, then Year DESC, then QNumber ASC) ---
      result.sort((a, b) => {
           // 1. Primary Sort: Completion Status (Incomplete first)
           const isACompleted = a?.questionId ? completedQuestions.has(a.questionId) : false;
           const isBCompleted = b?.questionId ? completedQuestions.has(b.questionId) : false;
           if (isACompleted !== isBCompleted) {
               return isACompleted - isBCompleted; // false (0) comes before true (1)
           }

           // 2. Secondary Sort: Year (Descending)
           const yearA = a.year || 0;
           const yearB = b.year || 0;
           if (yearB !== yearA) {
               return yearB - yearA; // Higher year first
           }

           // 3. Tertiary Sort: Question Number (Ascending, Alphanumeric)
           const qNumA = a.qNumber || '';
           const qNumB = b.qNumber || '';
           // Use localeCompare for robust sorting (e.g., "Q1a", "Q1b", "Q2", "Q10")
           return qNumA.localeCompare(qNumB, undefined, { numeric: true, sensitivity: 'base' });
       });
      // --- End of Sorting Logic ---

      setFilteredQuestions(result); // Update the state with filtered and sorted questions

      // Dependencies: Rerun when raw questions, loading state, completion status, or filters change
  }, [allQuestions, isLoading, completedQuestions, activeFilters]);

  // --- Callbacks ---

  // Toggle completion status (optimistic UI update + async storage)
   const handleToggleCompletion = useCallback(async (questionId) => {
      if (!questionId || !subjectId) {
          console.warn("Cannot toggle completion: Missing questionId or subjectId");
          return;
      }
      // Optimistic UI update: Create a new Set based on current state
      const newCompletedSet = new Set(completedQuestions);
      if (newCompletedSet.has(questionId)) {
          newCompletedSet.delete(questionId);
      } else {
          newCompletedSet.add(questionId);
      }
      // Update state immediately to trigger re-render and re-sort
      setCompletedQuestions(newCompletedSet);

      // Perform async storage update in the background
      try {
          // Note: toggleQuestionCompletion in storage.js now handles the load/modify/save logic
          await toggleQuestionCompletion(subjectId, questionId);
          // No need to setState again here unless toggleQuestionCompletion returned the *actual* set
          // and we needed to ensure consistency after the async operation. Current setup is optimistic.
      } catch (error) {
          console.error("Failed to save updated completion status:", error);
          // Optional: Revert UI state if save fails drastically
          // To do this, you'd need to store the *previous* state before the optimistic update.
          // For simplicity, we'll assume the optimistic update usually matches the intended state.
      }
  }, [subjectId, completedQuestions]); // Depends on subjectId and the current set of completed questions

  // --- Render Logic ---

  // Memoized render function for FlatList items
  const renderItem = useCallback(({ item }) => (
      <QuestionCard
          question={item}
          // Check completion status safely
          isCompleted={item?.questionId ? completedQuestions.has(item.questionId) : false}
          onToggleCompletion={handleToggleCompletion} // Pass the memoized handler
      />
  ), [completedQuestions, handleToggleCompletion]); // Dependencies for memoization

  // Loading State UI
  if (isLoading) {
      return (
         <View style={globalStyles.activityIndicatorContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
            {/* Optional: Add loading text */}
             {/* <Text style={globalStyles.loadingText}>Loading Questions...</Text> */}
         </View>
      );
  }

  // Error State: Subject data could not be loaded (e.g., invalid ID passed)
  if (!subject && !isLoading) {
       return (
            <View style={globalStyles.emptyListContainer}>
                <MaterialIcons name="error-outline" size={48} color={Colors.danger} style={globalStyles.emptyListIcon}/>
                <Text style={globalStyles.emptyListText}>Subject data could not be loaded.</Text>
                {/* Optionally add a button to navigate back */}
                 {/* <TouchableOpacity onPress={() => navigation.goBack()} style={[globalStyles.button, {marginTop: 15, backgroundColor: Colors.accent}]}>
                    <Text style={globalStyles.buttonText}>Go Back</Text>
                 </TouchableOpacity> */}
            </View>
       );
  }

  // Main Content: FlatList of Question Cards
  return (
    <View style={globalStyles.container}>
        <FlatList
          data={filteredQuestions} // Use the filtered and sorted data
          renderItem={renderItem} // Use the memoized render function
          keyExtractor={(item) => item?.questionId || `q-${Math.random()}`} // Robust key
          // Add padding to avoid content hiding under header/footer
          contentContainerStyle={[globalStyles.listContentContainer, { paddingTop: 15 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={ // Display when filteredQuestions is empty
              <View style={globalStyles.emptyListContainer}>
                 <MaterialCommunityIcons name="text-box-search-outline" size={52} color={Colors.textSecondary} style={globalStyles.emptyListIcon} />
                 <Text style={globalStyles.emptyListText}>
                    {/* Check if filters are active to show appropriate message */}
                    {(activeFilters.years.length > 0 || activeFilters.chapters.length > 0)
                        ? "No questions match the current selection."
                        : (allQuestions.length === 0 // Check if there were questions initially
                            ? "No questions found for this subject."
                            : "Something went wrong." // Fallback message
                        )
                    }
                 </Text>
                 {/* Optional: Add a button to clear filters if filter UI is re-added */}
              </View>
           }
          // Performance Optimizations
          initialNumToRender={5} // Render fewer items initially for faster perceived load
          maxToRenderPerBatch={5} // Adjust batch size based on card complexity
          windowSize={10} // Render items within viewport + buffer
          // Remove clipped subviews on Android (can improve performance but use with caution)
          removeClippedSubviews={Platform.OS === 'android'}
          // IMPORTANT: Force FlatList re-render when sorting criteria (completion status) changes
          extraData={completedQuestions}
        />
    </View>
  );
};

// Styles specific to QuestionListScreen (minimal if relying on global styles)
const styles = StyleSheet.create({
    // No specific styles needed currently, using globalStyles
});

export default QuestionListScreen;