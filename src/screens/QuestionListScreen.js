// src/screens/QuestionListScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { globalStyles, Colors } from '../styles/globalStyles'; // Use updated styles/colors
import { loadCompletedQuestions, toggleQuestionCompletion } from '../utils/storage';
import QuestionCard from '../components/QuestionCard';
import FilterModal from '../components/FilterModal';

const QuestionListScreen = ({ navigation, route }) => {
  const { subjectId, branchId, semesterId, allBranchesData } = route.params;

  // State Management
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ years: [], chapters: [] });

  // Memoized selectors
  const subject = useMemo(() => {
      const branch = (allBranchesData || [])?.find(b => b.id === branchId);
      const semester = branch?.semesters.find(s => s.id === semesterId);
      return semester?.subjects.find(sub => sub.id === subjectId);
  }, [branchId, semesterId, subjectId, allBranchesData]);

  const availableYears = useMemo(() => {
      if (!allQuestions || allQuestions.length === 0) return [];
      const years = new Set(allQuestions.map(q => q.year).filter(Boolean));
      return Array.from(years).sort((a, b) => b - a);
  }, [allQuestions]);

   const availableChapters = useMemo(() => {
      if (!allQuestions || allQuestions.length === 0) return [];
      const chapters = new Set(allQuestions.map(q => q.chapter || 'Uncategorized').filter(Boolean));
      return Array.from(chapters).sort();
  }, [allQuestions]);

  // --- Effects ---
  useEffect(() => {
      const initialize = async () => {
          setIsLoading(true);
          if (subject) {
              navigation.setOptions({ title: subject.name || 'Questions' });
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
  }, [subject, navigation, subjectId]);

   useEffect(() => {
      if (isLoading || !Array.isArray(allQuestions)) return;
      let result = [...allQuestions];
      // Filtering logic
      if (activeFilters.years.length > 0) {
          const yearSet = new Set(activeFilters.years);
          result = result.filter(q => yearSet.has(q.year));
      }
       if (activeFilters.chapters.length > 0) {
          const chapterSet = new Set(activeFilters.chapters);
          result = result.filter(q => chapterSet.has(q.chapter || 'Uncategorized'));
      }
      // Sorting logic
       result.sort((a, b) => {
           if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
           return (a.qNumber || '').localeCompare(b.qNumber || '');
       });
      setFilteredQuestions(result);
  }, [allQuestions, activeFilters, isLoading]);

  // --- Callbacks ---
   const handleToggleCompletion = useCallback(async (questionId) => {
      if (!questionId) return; // Guard against missing ID
      const updatedCompletedSet = await toggleQuestionCompletion(subjectId, questionId);
      setCompletedQuestions(new Set(updatedCompletedSet));
  }, [subjectId]); // Dependency only on subjectId

  const handleApplyFilters = useCallback((newFilters) => {
      setActiveFilters(newFilters);
      // FilterModal now closes itself on Apply/Reset
      // setFilterModalVisible(false);
  }, []);

  // --- Header Button ---
   React.useLayoutEffect(() => {
      navigation.setOptions({
      headerRight: () => (
        <Pressable
            onPress={() => setFilterModalVisible(true)}
            hitSlop={15}
            style={({ pressed }) => [
                { marginRight: 15, opacity: pressed ? 0.6 : 1 }
            ]}
        >
          <MaterialCommunityIcons name="filter-variant" size={28} color={Colors.textPrimary} />
        </Pressable>
      ),
      // Disable headerLargeTitle on iOS if needed
      // headerLargeTitle: false,
      });
  }, [navigation]);

  // --- Render Logic ---
  const renderItem = useCallback(({ item }) => (
      <QuestionCard
          question={item}
          isCompleted={completedQuestions.has(item.questionId)}
          onToggleCompletion={handleToggleCompletion}
      />
  ), [completedQuestions, handleToggleCompletion]); // Correct dependencies

  // Loading State
  if (isLoading && !subject) {
      return (
         <View style={globalStyles.activityIndicatorContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
         </View>
      );
  }

  // Error State
  if (!isLoading && !subject) {
       return (
            <View style={globalStyles.activityIndicatorContainer}>
                <MaterialIcons name="error-outline" size={48} color={Colors.danger} style={{ marginBottom: 15 }}/>
                <Text style={globalStyles.textSecondary}>Subject data could not be loaded.</Text>
            </View>
       );
  }

  // Main Content
  return (
    <View style={globalStyles.container}>
        <FlatList
          data={filteredQuestions}
          renderItem={renderItem}
          keyExtractor={(item) => item.questionId || `q-${Math.random()}`} // Ensure key exists
           // Add padding for transparent header + extra space at bottom
          contentContainerStyle={{ paddingTop: 90, paddingBottom: 30, paddingHorizontal: 15 }} // Adjust paddingTop
          ListEmptyComponent={
              <View style={globalStyles.emptyListContainer}>
                 <MaterialCommunityIcons name="text-box-search-outline" size={48} color={Colors.textSecondary} />
                 <Text style={globalStyles.emptyListText}>
                    {allQuestions.length === 0
                        ? "No questions found for this subject."
                        : "No questions match the current filters."
                    }
                 </Text>
              </View>
           }
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={10}
        />

        <FilterModal
           isVisible={filterModalVisible}
           onClose={() => setFilterModalVisible(false)}
           availableYears={availableYears}
           availableChapters={availableChapters}
           currentFilters={activeFilters}
           onApplyFilters={handleApplyFilters}
        />
    </View>
  );
};

export default QuestionListScreen;