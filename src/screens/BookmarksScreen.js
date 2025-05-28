import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import {
    getBookmarkedQuestions,
    toggleBookmark as toggleBookmarkHelper, // Import the helper
} from '../helpers/bookmarkHelpers'; 
import beuData from '../data/beuData';
import QuestionItem from '../components/QuestionItem';
import { COLORS } from '../constants';
import { copyToClipboard, getQuestionPlainText, loadCompletionStatuses, setQuestionCompleted, findData, updateDailyStreak } from '../helpers/helpers'; // Removed askAI as askAIHelper, added findData
import { askAIWithContext } from '../helpers/openaiHelper';
import AIChatModal from '../components/AIChatModal'; // Import AIChatModal

function flattenQuestions(data) {
  // Robustly flatten all questions in the beuData tree
  let questions = [];
  if (!data) return questions;
  // If beuData is an object with a 'branches' property (array), use that
  const branches = Array.isArray(data) ? data : data.branches;
  if (!Array.isArray(branches)) return questions;
  for (const branch of branches) {
    if (!branch || !Array.isArray(branch.semesters)) continue;
    for (const sem of branch.semesters) {
      if (!sem || !Array.isArray(sem.subjects)) continue;
      for (const subject of sem.subjects) {
        if (!subject || !Array.isArray(subject.questions)) continue;
        for (const q of subject.questions) {
          questions.push({ ...q, branchId: branch.id, semId: sem.id, subjectId: subject.id });
        }
      }
    }
  }
  return questions;
}


const BookmarksScreen = ({ navigation }) => {
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set()); // Use Set
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completionStatus, setCompletionStatus] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  // Feedback timer for showing messages
  const feedbackTimerRef = React.useRef(null);

  // AI Modal State
  const [isAIChatModalVisible, setIsAIChatModalVisible] = useState(false);
  const [currentAIQuestionItem, setCurrentAIQuestionItem] = useState(null);
  const [currentAISubjectContext, setCurrentAISubjectContext] = useState(null);
  const bookmarksScreenMountedRef = React.useRef(true);

  useEffect(() => {
    // This runs once on mount
    setAllQuestions(flattenQuestions(beuData));

    // Listener for focus events
    const unsubscribeFocus = navigation.addListener('focus', () => {
      refreshBookmarks();
    });

    refreshBookmarks(); // Initial load of bookmarks

    // Cleanup function
    return () => {
      unsubscribeFocus();
      // bookmarksScreenMountedRef.current = false; // Moved to its own useEffect for clarity
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, [navigation, refreshBookmarks]); // refreshBookmarks is a useCallback, navigation is stable

  useEffect(() => {
    bookmarksScreenMountedRef.current = true;
    return () => {
      bookmarksScreenMountedRef.current = false;
    };
  }, []); // Runs once on mount and cleans up on unmount

  useEffect(() => {
    // When bookmarkedIds change, fetch their completion statuses
    if (bookmarkedIds.size > 0) { // If using Set
      loadCompletionStatuses(Array.from(bookmarkedIds)).then(setCompletionStatus); // Convert Set to Array for helper
    } else {
      setCompletionStatus({});
    }
  }, [bookmarkedIds]);

  const refreshBookmarks = useCallback(async () => {
    if (!feedbackTimerRef.current) { /* Only set loading if not already in a feedback cycle that might clear it */ }
    setLoading(true);
    const idsArray = await getBookmarkedQuestions();
    setBookmarkedIds(new Set(idsArray)); // Store as Set
    setLoading(false);
  }, []);

  // Feedback display logic
  const displayFeedback = useCallback((message) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedbackMessage(message);
    setShowFeedback(true);
    feedbackTimerRef.current = setTimeout(() => {
      setShowFeedback(false);
      setFeedbackMessage('');
      feedbackTimerRef.current = null;
    }, 1500);
  }, []);

  // Completion toggle (persisted)
  const handleToggleComplete = useCallback(async (questionId, newStatus) => {
    setCompletionStatus(prev => ({ ...prev, [questionId]: newStatus }));
    await setQuestionCompleted(questionId, newStatus);
    if (newStatus) {
        await updateDailyStreak();
        // Check mount status again after await before calling displayFeedback
        if (!bookmarksScreenMountedRef.current) return;
        displayFeedback("Marked as Done!");
    }
    // No feedback for "Marked as Not Done" here to keep it concise, or add if desired.
  }, []);

  // Handler for toggling a bookmark from the BookmarksScreen
  const handleToggleBookmarkOnBookmarksScreen = useCallback(async (questionId) => {
    if (!bookmarksScreenMountedRef.current) return;

    const newBookmarkedState = await toggleBookmarkHelper(questionId);

    if (!bookmarksScreenMountedRef.current) return; // Check again after await

    // Update local state based on the new state from the helper
    // This ensures the item is removed from the displayed list if unbookmarked
    setBookmarkedIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newBookmarkedState) {
        // This case (item becoming bookmarked from this screen) is unlikely
        // as items are already bookmarked to appear here.
        // However, including for structural consistency with QuestionListScreen.
        newIds.add(questionId);
      } else {
        newIds.delete(questionId); // This is the primary expected path
      }
      return newIds;
    });
    displayFeedback(newBookmarkedState ? "Bookmarked!" : "Bookmark removed.");
  }, [displayFeedback, bookmarksScreenMountedRef]); // displayFeedback is already a useCallback

  const handleCopy = useCallback(
    (text) => copyToClipboard(text, displayFeedback),
    [displayFeedback]
  );

  const handleAskAI = useCallback(async (item) => {
    if (!bookmarksScreenMountedRef.current) return;

    // Derive context for this specific item
    const { branch, semester, subject: subjectDetails, error: findDataError } = findData({
        branchId: item.branchId,
        semId: item.semId,
        subjectId: item.subjectId,
    });

    if (findDataError) {
        if (bookmarksScreenMountedRef.current) displayFeedback("Error: Could not load context for AI.");
        console.error("Error finding data for AI context:", findDataError);
        return;
    }

    const context = {
        branchName: branch?.name || 'N/A',
        semesterNumber: semester?.number?.toString() || 'N/A',
        subjectName: subjectDetails?.name || 'N/A',
        subjectCode: subjectDetails?.code || 'N/A',
    };
    if (bookmarksScreenMountedRef.current) {
      setCurrentAIQuestionItem(item);
      setCurrentAISubjectContext(context);
      setBookmarkedIds(prevIds => {
        const newIds = new Set(prevIds);
        // Ensure the item is still considered bookmarked locally if it was just added
        // This part of the logic was from the previous diff, let's ensure it's correct.
        // The primary action here is to show the AI modal.
        // The `setBookmarkedIds` update here seems out of place for `handleAskAI`.
        // It should be primarily in `handleToggleBookmarkOnBookmarksScreen`.
        // Let's remove the `setBookmarkedIds` from `handleAskAI`.
        return newIds; // Keep the existing IDs
      });
      setIsAIChatModalVisible(true);
    }
  }, [displayFeedback, bookmarksScreenMountedRef, setCurrentAIQuestionItem, setCurrentAISubjectContext, setIsAIChatModalVisible]);

  const closeAIChatModal = useCallback(() => {
    if (!bookmarksScreenMountedRef.current) return;
    setIsAIChatModalVisible(false);
    setCurrentAIQuestionItem(null);
    setCurrentAISubjectContext(null);
  }, [bookmarksScreenMountedRef, setIsAIChatModalVisible, setCurrentAIQuestionItem, setCurrentAISubjectContext]);

  // Memoize the list of bookmarked questions with ads injected
  const listDataWithAds = React.useMemo(() => {
    const bookmarkedQuestions = allQuestions.filter(q => bookmarkedIds.has(q.questionId));
    return bookmarkedQuestions;
  }, [allQuestions, bookmarkedIds]);

  const keyExtractor = useCallback((item, index) => {
    return item.questionId.toString();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>
    );
  }
  // Check after loading is complete
  if (!loading && listDataWithAds.filter(item => item.type !== 'ad').length === 0) {
    return (
      <View style={styles.centered}><Text style={styles.emptyText}>No bookmarked questions yet.</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Feedback message */}
      {showFeedback && (
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: COLORS.primary, fontSize: 15 }}>{feedbackMessage}</Text>
        </View>
      )}
      <FlatList
        data={listDataWithAds} // Use the list with ads
        keyExtractor={keyExtractor}
        renderItem={({ item }) => {
          // It's a question item (ads are removed)
          return (
            <QuestionItem
              item={item}
              isCompleted={!!completionStatus[item.questionId]}
              onToggleComplete={handleToggleComplete}
              onCopy={() => handleCopy(getQuestionPlainText(item.text))}
              onAskAI={() => handleAskAI(item)}
              isBookmarked={bookmarkedIds.has(item.questionId)}
              onToggleBookmark={handleToggleBookmarkOnBookmarksScreen}
            />
          );
        }}
        contentContainerStyle={styles.listContentContainer}
        initialNumToRender={7}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews={Platform.OS === 'android'}
        extraData={{ completionStatus, bookmarkedIds }} // bookmarkedIds (Set) ensures re-render if an item is removed
      />
      {isAIChatModalVisible && currentAIQuestionItem && currentAISubjectContext && (
        <AIChatModal
          visible={isAIChatModalVisible}
          onClose={closeAIChatModal}
          questionItem={currentAIQuestionItem}
          subjectContext={currentAISubjectContext}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  adContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  listContentContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
});

export default BookmarksScreen;
