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

  // Set dynamic title
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: `${subjectName} - Chapters` });
  }, [navigation, subjectName]);

  // Extract subject data
  const subject = useMemo(() => {
    const branch = (allBranchesData || [])?.find(b => b.id === branchId);
    const semester = branch?.semesters?.find(s => s.id === semesterId);
    return semester?.subjects?.find(sub => sub.id === subjectId);
  }, [branchId, semesterId, subjectId, allBranchesData]);

  // Extract and sort chapters
  useEffect(() => {
    setIsLoading(true);
    if (subject && Array.isArray(subject.questions)) {
      // Extract unique chapters, handle null/undefined with 'Uncategorized'
      const chapterSet = new Set(
        subject.questions.map(q => q.chapter || 'Uncategorized').filter(Boolean)
      );
      
      // Convert to array and sort alphabetically with numeric awareness
      const sortedChapters = Array.from(chapterSet).sort((a, b) => 
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );
      
      // Create chapter objects with counts
      const chaptersWithCounts = sortedChapters.map(chapter => {
        const count = subject.questions.filter(q => 
          (q.chapter || 'Uncategorized') === chapter
        ).length;
        return { chapter, count };
      });
      
      setChapters(chaptersWithCounts);
    } else {
      setChapters([]);
    }
    setIsLoading(false);
  }, [subject]);

  // Handle chapter selection
  const handleChapterPress = useCallback((chapter) => {
    navigation.navigate('QuestionList', {
      branchId,
      semesterId,
      subjectId,
      subjectName,
      allBranchesData,
      // Pre-set the chapter filter
      presetFilters: { years: [], chapters: [chapter] }
    });
  }, [navigation, branchId, semesterId, subjectId, subjectName, allBranchesData]);

  // Get appropriate icon for chapter
  const getChapterIcon = (chapterName) => {
    const name = chapterName.toLowerCase();
    if (name.includes('module')) return 'book-open';
    if (name.includes('basic')) return 'layer-group';
    if (name.includes('advanced')) return 'brain';
    if (name.includes('practical')) return 'tools';
    if (name.includes('theory')) return 'lightbulb';
    if (name === 'uncategorized') return 'question-circle';
    return 'bookmark'; // Default icon
  };

  // Render chapter item
  const renderChapterItem = useCallback(({ item, index }) => {
    // Clean up chapter name for display (remove Module X: prefix)
    const displayName = item.chapter.replace(/^Module\s*\d+:\s*/i, '');
    
    return (
      <Animatable.View
        animation="fadeInUp"
        duration={400}
        delay={index * 80}
        useNativeDriver
      >
        <TouchableOpacity
          style={globalStyles.listItem}
          onPress={() => handleChapterPress(item.chapter)}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5
              name={getChapterIcon(item.chapter)}
              size={22}
              color={Colors.accent}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={globalStyles.listItemText}>{displayName}</Text>
            <Text style={globalStyles.textSecondary}>{item.count} question{item.count !== 1 ? 's' : ''}</Text>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={26}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </Animatable.View>
    );
  }, [handleChapterPress]);

  // Loading state
  if (isLoading) {
    return (
      <View style={globalStyles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={[globalStyles.textSecondary, { marginTop: 10 }]}>Loading chapters...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={chapters}
        renderItem={renderChapterItem}
        keyExtractor={(item) => item.chapter}
        contentContainerStyle={[globalStyles.contentContainer, { paddingTop: 15 }]}
        ListEmptyComponent={
          <View style={globalStyles.emptyListContainer}>
            <FontAwesome5 name="book" size={48} color={Colors.textSecondary} style={{ marginBottom: 15 }} />
            <Text style={globalStyles.emptyListText}>No chapters found for this subject.</Text>
          </View>
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent + '1A', // Very light accent background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
});

export default ChapterListScreen;