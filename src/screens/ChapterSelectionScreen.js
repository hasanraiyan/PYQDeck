// src/screens/ChapterSelectionScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, FlatList, SafeAreaView, Platform, Text } from 'react-native';
import { COLORS, UNCAT_CHAPTER_NAME } from '../constants';
import { findData, loadCompletionStatuses } from '../helpers/helpers'; // Import loadCompletionStatuses
import ListItemCard from '../components/ListItemCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const ChapterSelectionScreen = ({ route, navigation }) => {
  const { branchId, semId, subjectId } = route.params;

  // --- State Variables ---
  const [subjectData, setSubjectData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [completionStatus, setCompletionStatus] = useState({});
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
  const [error, setError] = useState(null);

  // --- Effect for fetching initial data ---
  useEffect(() => {
    let isMounted = true;
    setIsLoadingStatuses(true); // Reset status loading on param change
    setError(null);
    setSubjectData(null);
    setQuestions([]);
    setCompletionStatus({});

    try {
      const {
        subject,
        questions: fetchedQuestions,
        error: dataError,
      } = findData({ branchId, semId, subjectId });

      if (!isMounted) return;

      if (dataError) {
        setError(dataError);
        setIsLoadingStatuses(false);
      } else if (subject) {
        setSubjectData(subject);
        const validQuestions = Array.isArray(fetchedQuestions) ? fetchedQuestions : [];
        setQuestions(validQuestions);
        navigation.setOptions({
          title: `Chapters - ${subject.code || subject.name}`,
        });
        // Status loading will be handled by the next effect
      } else {
        setError('Subject data could not be loaded.');
        setIsLoadingStatuses(false);
      }
    } catch (e) {
      console.error("Error fetching subject data:", e);
      if (isMounted) {
        setError("An error occurred while loading subject data.");
        setIsLoadingStatuses(false);
      }
    }

    return () => { isMounted = false; };
  }, [branchId, semId, subjectId, navigation]);

  // --- Effect for loading completion statuses ---
  useEffect(() => {
    let isMounted = true;
    if (questions.length > 0) {
      setIsLoadingStatuses(true);
      const questionIds = questions.map((q) => q.questionId);

      loadCompletionStatuses(questionIds)
        .then((statuses) => {
          if (isMounted) {
            setCompletionStatus(statuses);
            setIsLoadingStatuses(false);
          }
        })
        .catch((err) => {
          console.error('Error loading chapter completion statuses:', err);
          if (isMounted) {
            setError('Failed to load completion progress.');
            setIsLoadingStatuses(false);
          }
        });
    } else {
      // No questions, no statuses to load
      if (isMounted) {
        setCompletionStatus({});
        setIsLoadingStatuses(false);
      }
    }
    return () => { isMounted = false; };
  }, [questions]); // Depend only on questions array

  // --- Memoized calculation for chapter data with progress ---
  const chapterDataWithProgress = useMemo(() => {
    if (!questions || questions.length === 0) {
      return [];
    }

    const chaptersMap = new Map();

    questions.forEach((q) => {
      const chapterName = (q.chapter && typeof q.chapter === 'string' && q.chapter.trim())
                          ? q.chapter.trim()
                          : UNCAT_CHAPTER_NAME;

      if (!chaptersMap.has(chapterName)) {
        chaptersMap.set(chapterName, {
          name: chapterName,
          questionIds: [],
        });
      }
      chaptersMap.get(chapterName).questionIds.push(q.questionId);
    });

    const chaptersArray = Array.from(chaptersMap.values()).map(chapterInfo => {
      const totalCount = chapterInfo.questionIds.length;
      const completedCount = chapterInfo.questionIds.filter(id => completionStatus[id]).length;
      const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      return {
        ...chapterInfo,
        totalCount,
        completedCount,
        progress,
      };
    });

    // Sort chapters: Module numbers first, then alphabetically, Uncategorized last
    chaptersArray.sort((a, b) => {
        if (a.name === UNCAT_CHAPTER_NAME) return 1; // Uncategorized always last
        if (b.name === UNCAT_CHAPTER_NAME) return -1;

        const matchA = a.name.match(/^Module\s+(\d+)/i);
        const matchB = b.name.match(/^Module\s+(\d+)/i);

        if (matchA && matchB) {
            return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
        } else if (matchA) {
            return -1; // Module A comes before non-module B
        } else if (matchB) {
            return 1; // Non-module A comes after module B
        } else {
            return a.name.localeCompare(b.name); // Alphabetical for non-modules
        }
    });


    return chaptersArray;
  }, [questions, completionStatus]); // Recalculate when questions or statuses change

  // --- Navigation Handler ---
  const handlePressChapter = useCallback(
    (chapterName) => {
      navigation.navigate('Questions', {
        branchId,
        semId,
        subjectId,
        organizationMode: 'chapter',
        selectedChapter: chapterName,
      });
    },
    [navigation, branchId, semId, subjectId]
  );

  // --- Render Item Function ---
  const renderChapterItem = useCallback(
    ({ item: chapter }) => {
      const subtitle = isLoadingStatuses
        ? 'Calculating progress...'
        : `${chapter.completedCount} / ${chapter.totalCount} done`;

      return (
        <ListItemCard
          title={chapter.name}
          subtitle={subtitle}
          onPress={() => handlePressChapter(chapter.name)}
          iconName="layers-outline"
          iconSet="Ionicons"
          iconColor={COLORS.chapterIcon}
          hasData={chapter.totalCount > 0}
          disabled={chapter.totalCount === 0} // Disable if chapter has no questions
          progress={isLoadingStatuses ? -1 : chapter.progress} // Show progress, -1 indicates loading
        />
      );
    },
    [handlePressChapter, isLoadingStatuses] // Depend on loading state for subtitle/progress display
  );

  // --- Render Logic ---
  if (error) return <ErrorMessage message={error} />;
  // Show loading indicator if initial data OR statuses are loading
  if ((!subjectData && !error) || isLoadingStatuses) return <LoadingIndicator />;

  if (chapterDataWithProgress.length === 0) {
    return (
      <EmptyState message="No chapters or questions found for this subject." />
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={chapterDataWithProgress}
        renderItem={renderChapterItem}
        keyExtractor={(item) => item.name} // Use unique chapter name as key
        contentContainerStyle={styles.listContentContainer}
        extraData={completionStatus} // Ensure re-render when statuses change
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContentContainer: {
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingHorizontal: 12,
  },
});

export default ChapterSelectionScreen;