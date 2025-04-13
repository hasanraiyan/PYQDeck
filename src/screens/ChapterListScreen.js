// src/screens/ChapterListScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { globalStyles, Colors } from '../styles/globalStyles';

const ChapterListScreen = ({ navigation, route }) => {
  const { branchId, semesterId, subjectId, subjectName, allBranchesData } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [chapters, setChapters] = useState([]);

  // Set dynamic title (already handled by AppNavigator config, but keep for potential overrides)
  // React.useLayoutEffect(() => {
  //   navigation.setOptions({ title: `${subjectName || 'Subject'} - Chapters` });
  // }, [navigation, subjectName]);

  // Extract subject data using useMemo for efficiency
  const subject = useMemo(() => {
    const branch = (allBranchesData || [])?.find(b => b.id === branchId);
    const semester = branch?.semesters?.find(s => s.id === semesterId);
    return semester?.subjects?.find(sub => sub.id === subjectId);
  }, [branchId, semesterId, subjectId, allBranchesData]);

  // Extract, process, and sort chapters when subject data changes
  useEffect(() => {
    setIsLoading(true);
    if (subject && Array.isArray(subject.questions)) {
      // Use a Map to store chapter names and their counts efficiently
      const chapterMap = new Map();
      subject.questions.forEach(q => {
          const chapterName = q.chapter || 'Uncategorized';
          chapterMap.set(chapterName, (chapterMap.get(chapterName) || 0) + 1);
      });

      // Convert Map entries to an array of objects
      const chaptersArray = Array.from(chapterMap.entries()).map(([name, count]) => ({
          chapter: name,
          count: count,
          // Clean name for sorting and display
          displayName: name.replace(/^Module\s*\d+[:\-]?\s*/i, '').trim() || name,
      }));

      // Sort chapters: Handle "Uncategorized" specifically, then sort others alphanumerically
      chaptersArray.sort((a, b) => {
          if (a.chapter === 'Uncategorized') return 1; // Push Uncategorized to the end
          if (b.chapter === 'Uncategorized') return -1;
          // Use localeCompare for robust alphanumeric sorting (handles "Module 1", "Module 10")
          return a.chapter.localeCompare(b.chapter, undefined, { numeric: true, sensitivity: 'base' });
      });

      setChapters(chaptersArray);
    } else {
      setChapters([]); // Set empty if no subject or questions
    }
    setIsLoading(false);
  }, [subject]); // Rerun effect if the subject data changes

  // Handle navigation when a chapter is pressed
  const handleChapterPress = useCallback((chapterData) => {
    navigation.navigate('QuestionList', {
      branchId,
      semesterId,
      subjectId,
      subjectName,
      allBranchesData,
      // Pass the selected chapter as a preset filter
      presetFilters: { years: [], chapters: [chapterData.chapter] },
      // Optionally set a more specific header title for the QuestionList screen
      headerTitle: chapterData.displayName || chapterData.chapter,
    });
  }, [navigation, branchId, semesterId, subjectId, subjectName, allBranchesData]);

  // Determine an appropriate icon based on chapter name
  const getChapterIcon = (chapterName) => {
    const name = chapterName.toLowerCase();
    if (name.includes('module')) return 'book-open';
    if (name.includes('intro') || name.includes('basic')) return 'layer-group';
    if (name.includes('advanc')) return 'brain'; // Matches advanced, advance etc.
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
    return 'bookmark'; // Default icon
  };

  // Render each chapter item in the list
  const renderChapterItem = useCallback(({ item, index }) => {
    return (
      <Animatable.View
        animation="fadeInUp"
        duration={350}
        delay={index * 70}
        useNativeDriver
      >
        <TouchableOpacity
          style={globalStyles.listItem} // Consistent list item styling
          onPress={() => handleChapterPress(item)}
          activeOpacity={0.75}
        >
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
    );
  }, [handleChapterPress]); // Dependency injection

  // Loading state display
  if (isLoading) {
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
        data={chapters}
        renderItem={renderChapterItem}
        keyExtractor={(item) => item.chapter} // Use original chapter name as key
        // Add padding top to avoid content going under the header
        contentContainerStyle={[globalStyles.listContentContainer, { paddingTop: 15 }]}
        ListEmptyComponent={ // Consistent empty state
          <View style={globalStyles.emptyListContainer}>
            <FontAwesome5 name="book-reader" size={48} color={Colors.textSecondary} style={globalStyles.emptyListIcon} />
            <Text style={globalStyles.emptyListText}>No chapters found for this subject.</Text>
          </View>
        }
        // Performance optimizations
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={11}
      />
    </View>
  );
};

// Local styles for this screen
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

export default ChapterListScreen;