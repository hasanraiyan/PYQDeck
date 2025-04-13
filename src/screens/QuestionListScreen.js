// src/screens/QuestionListScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { globalStyles, Colors } from '../styles/globalStyles';
import { loadCompletedQuestions, toggleQuestionCompletion } from '../utils/storage';
import QuestionCard from '../components/QuestionCard';
import FilterModal from '../components/FilterModal'; // We'll create this next

const QuestionListScreen = ({ navigation, route }) => {
  const { subjectId, branchId, semesterId, allBranchesData } = route.params;

  // State Management
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ years: [], chapters: [] });
  // Add sorting state later if needed -> const [activeSort, setActiveSort] = useState('year_desc');

  // Memoized selectors for data extraction
  const subject = useMemo(() => {
      const branch = allBranchesData?.find(b => b.id === branchId);
      const semester = branch?.semesters.find(s => s.id === semesterId);
      return semester?.subjects.find(sub => sub.id === subjectId);
  }, [branchId, semesterId, subjectId, allBranchesData]);

  const availableYears = useMemo(() => {
      if (!allQuestions || allQuestions.length === 0) return [];
      const years = new Set(allQuestions.map(q => q.year).filter(Boolean)); // Filter out null/undefined years
      return Array.from(years).sort((a, b) => b - a); // Descending
  }, [allQuestions]);

   const availableChapters = useMemo(() => {
      if (!allQuestions || allQuestions.length === 0) return [];
      const chapters = new Set(allQuestions.map(q => q.chapter || 'Uncategorized').filter(Boolean));
      return Array.from(chapters).sort(); // Alphabetical
  }, [allQuestions]);

  // --- Effects ---

  // Effect to load initial data and set title
  useEffect(() => {
      const initialize = async () => {
          setIsLoading(true);
          if (subject) {
              navigation.setOptions({ title: subject.name || 'Questions' });
              // Ensure questions is an array
              const questions = Array.isArray(subject.questions) ? subject.questions : [];
              setAllQuestions(questions);
              const completed = await loadCompletedQuestions(subjectId);
              setCompletedQuestions(completed);
          } else {
              setAllQuestions([]);
              navigation.setOptions({ title: 'Subject Not Found' });
              console.error("Subject not found with ID:", subjectId);
          }
           setIsLoading(false);
      };
      initialize();
  }, [subject, navigation, subjectId]); // Depend on subject object

  // Effect to apply filters and sorting whenever source data or filters change
   useEffect(() => {
      if (isLoading || !Array.isArray(allQuestions)) return; // Don't filter while loading or if data is invalid

      let result = [...allQuestions]; // Start with all questions for this subject

      // --- Apply Filters ---
      // Year Filter
      if (activeFilters.years.length > 0) {
          const yearSet = new Set(activeFilters.years);
          result = result.filter(q => yearSet.has(q.year));
      }

      // Chapter Filter
       if (activeFilters.chapters.length > 0) {
          const chapterSet = new Set(activeFilters.chapters);
          result = result.filter(q => chapterSet.has(q.chapter || 'Uncategorized'));
      }

       // --- Apply Sorting --- (Example: by Year then Question Number)
       result.sort((a, b) => {
           // Primary sort: Year descending
           if (a.year !== b.year) {
               return (b.year || 0) - (a.year || 0); // Handle potential undefined years
           }
           // Secondary sort: Question number (treat as strings for now)
           return (a.qNumber || '').localeCompare(b.qNumber || '');
       });


      setFilteredQuestions(result);
  }, [allQuestions, activeFilters, isLoading]); // Rerun when data, filters, or loading state change


  // --- Callbacks ---

   // Memoized callback for toggling completion status
   const handleToggleCompletion = useCallback(async (questionId) => {
      const updatedCompletedSet = await toggleQuestionCompletion(subjectId, questionId);
      // Ensure the update state comes from the result of the async storage operation
      setCompletedQuestions(new Set(updatedCompletedSet));
  }, [subjectId]); // Only depends on subjectId

  // Callback to apply filters from modal
  const handleApplyFilters = useCallback((newFilters) => {
      setActiveFilters(newFilters);
      setFilterModalVisible(false); // Close modal after applying
  }, []); // No dependencies needed if only setting state


  // --- Header Button Setup ---
   React.useLayoutEffect(() => {
      navigation.setOptions({
      headerRight: () => (
        <Pressable
            onPress={() => setFilterModalVisible(true)}
            hitSlop={10} // Increases tap area
            style={({ pressed }) => [ // Style for pressed state
                { marginRight: 15, opacity: pressed ? 0.5 : 1 }
            ]}
        >
          <MaterialCommunityIcons name="filter-variant" size={26} color={Colors.textLight} />
        </Pressable>
      ),
      });
  }, [navigation]);


  // --- Render Logic ---

  // Memoized render item function for FlatList
  const renderItem = useCallback(({ item }) => (
      <QuestionCard
          question={item}
          isCompleted={completedQuestions.has(item.questionId)}
          onToggleCompletion={handleToggleCompletion} // Pass the memoized callback
      />
  ), [completedQuestions, handleToggleCompletion]); // Re-render items only if completion status or callback changes


  // Loading State UI
  if (isLoading) {
      return (
         <View style={globalStyles.activityIndicatorContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
         </View>
      );
  }

  // Error State UI (Subject not found)
  if (!subject) {
       return (
            <View style={globalStyles.activityIndicatorContainer}>
                <Text style={globalStyles.textSecondary}>Subject data could not be loaded.</Text>
            </View>
       );
  }

  // Main Content UI
  return (
    <View style={globalStyles.container}>
        <FlatList
          data={filteredQuestions}
          renderItem={renderItem}
          keyExtractor={(item) => item.questionId}
          contentContainerStyle={globalStyles.contentContainer}
          ListEmptyComponent={
              <View style={globalStyles.emptyListContainer}>
                 <Text style={globalStyles.emptyListText}>
                    {allQuestions.length === 0
                        ? "No questions found for this subject."
                        : "No questions match the current filters."
                    }
                 </Text>
              </View>
           }
          initialNumToRender={10} // Optimize initial load
          maxToRenderPerBatch={10} // Optimize scrolling performance
          windowSize={11} // Optimize memory usage
        />

        <FilterModal
           isVisible={filterModalVisible}
           onClose={() => setFilterModalVisible(false)}
           availableYears={availableYears}
           availableChapters={availableChapters}
           currentFilters={activeFilters}
           onApplyFilters={handleApplyFilters} // Pass the memoized callback
        />
    </View>
  );
};

export default QuestionListScreen;