// src/screens/ChapterListScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { globalStyles, Colors } from '../styles/globalStyles';
import { loadCompletedQuestions } from '../utils/storage'; // Import loading function

const ChapterListScreen = ({ navigation, route }) => {
  const { branchId, semesterId, subjectId, subjectName, allBranchesData } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [chaptersWithData, setChaptersWithData] = useState([]); // Renamed state
  const [completedQuestions, setCompletedQuestions] = useState(new Set()); // State for completion data
  const [isCompletionLoading, setIsCompletionLoading] = useState(true); // Separate loading for completion

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
          console.error("Failed to load completed questions in ChapterListScreen:", error);
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
        isActive = false; // Cleanup function
      };
    }, [subjectId]) // Dependency: subjectId
  );

  // Extract, process, calculate progress, and sort chapters when subject or completion data changes
  useEffect(() => {
    // Wait for both subject data and completion status to load
    if (!subject || isCompletionLoading) {
        setIsLoading(true); // Keep main loading indicator true
        return;
    }

    setIsLoading(true); // Start processing
    if (subject && Array.isArray(subject.questions)) {
      // Use a Map to aggregate data per chapter efficiently
      const chapterMap = new Map();
      subject.questions.forEach(q => {
          if (q.questionId) { // Ensure questionId exists
            const chapterName = q.chapter || 'Uncategorized'; // Handle uncategorized
            const isCompleted = completedQuestions.has(q.questionId);
            const currentData = chapterMap.get(chapterName) || { totalCount: 0, completedCount: 0 };

            chapterMap.set(chapterName, {
                totalCount: currentData.totalCount + 1,
                completedCount: currentData.completedCount + (isCompleted ? 1 : 0)
            });
          }
      });

      // Convert Map entries to an array of objects and calculate progress
      const chaptersArray = Array.from(chapterMap.entries()).map(([name, counts]) => {
          const progress = counts.totalCount > 0
              ? Math.round((counts.completedCount / counts.totalCount) * 100)
              : 0;
          return {
              chapter: name,
              displayName: name.replace(/^Module\s*\d+[:\-]?\s*/i, '').trim() || name,
              totalCount: counts.totalCount,
              completedCount: counts.completedCount,
              progress: progress,
          };
      });

      // Sort chapters (Uncategorized last, then alphanumeric)
      chaptersArray.sort((a, b) => {
        if (a.chapter === 'Uncategorized') return 1;
        if (b.chapter === 'Uncategorized') return -1;
        return a.chapter.localeCompare(b.chapter, undefined, { numeric: true, sensitivity: 'base' });
      });

      setChaptersWithData(chaptersArray);
    } else {
      setChaptersWithData([]); // Set empty if no subject or questions
    }
    setIsLoading(false); // Finish processing
  }, [subject, completedQuestions, isCompletionLoading]); // Rerun when subject or completion data changes

  // Handle navigation when a chapter is pressed
  const handleChapterPress = useCallback((chapterData) => {
    navigation.navigate('QuestionList', {
      branchId,
      semesterId,
      subjectId,
      subjectName,
      allBranchesData,
      presetFilters: { years: [], chapters: [chapterData.chapter] },
      headerTitle: chapterData.displayName || chapterData.chapter,
    });
  }, [navigation, branchId, semesterId, subjectId, subjectName, allBranchesData]);

  // Determine an appropriate icon based on chapter name
  const getChapterIcon = (chapterName) => {
    const name = chapterName.toLowerCase();
    if (name.includes('module')) return 'book-open';
    if (name.includes('intro') || name.includes('basic')) return 'layer-group';
    if (name.includes('advanc')) return 'brain';
    if (name.includes('practic') || name.includes('lab') || name.includes('implem')) return 'tools';
    if (name.includes('theor')) return 'lightbulb';
    if (name === 'uncategorized') return 'question-circle';
    if (name.includes('overload') || name.includes('inherit')) return 'code-branch';
    if (name.includes('pointer') || name.includes('memory')) return 'memory';
    if (name.includes('file') || name.includes('i/o')) return 'file-alt';
    if (name.includes('exception')) return 'exclamation-triangle';
    if (name.includes('tree') || name.includes('graph')) return 'project-diagram';
    if (name.includes('sort') || name.includes('search')) return 'search';
    if (name.includes('stack') || name.includes('queue')) return 'stream';
    return 'bookmark';
  };

  // Render each chapter item in the list, including progress bar
  const renderChapterItem = useCallback(({ item, index }) => {
    return (
      <Animatable.View
        animation="fadeInUp"
        duration={350}
        delay={index * 70}
        useNativeDriver
      >
        <TouchableOpacity
          style={[globalStyles.listItem,{flexDirection: 'col'}]} // Consistent list item styling
          onPress={() => handleChapterPress(item)}
          activeOpacity={0.75}
        >
          {/* Content Container */}
          <View style={styles.itemContent}>
             {/* Icon */}
             <View style={styles.iconContainer}>
               <FontAwesome5
                 name={getChapterIcon(item.chapter)}
                 size={20}
                 color={Colors.accent}
               />
             </View>
             {/* Text Content (Chapter Name and Count) */}
             <View style={styles.textContainer}>
               <Text style={globalStyles.listItemText} numberOfLines={2}>{item.displayName}</Text>
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
    );
  }, [handleChapterPress]); // Dependency injection

  // Loading state display
  if (isLoading) { // Use the main isLoading state
    return (
      <View style={globalStyles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={globalStyles.loadingText}>Loading chapters...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={chaptersWithData}
        renderItem={renderChapterItem}
        keyExtractor={(item) => item.chapter} // Use original chapter name as key
        contentContainerStyle={[globalStyles.listContentContainer, { paddingTop: 15 }]}
        ListEmptyComponent={
          <View style={globalStyles.emptyListContainer}>
            <FontAwesome5 name="book-reader" size={48} color={Colors.textSecondary} style={globalStyles.emptyListIcon} />
            <Text style={globalStyles.emptyListText}>No chapters found for this subject.</Text>
          </View>
        }
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={11}
        extraData={completedQuestions} // Ensure list re-renders if completion changes
      />
    </View>
  );
};

// Local styles for this screen
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

export default ChapterListScreen;