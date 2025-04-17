import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getBookmarkedQuestions } from '../helpers/bookmarkHelpers';
import beuData from '../data/beuData';
import QuestionItem from '../components/QuestionItem';
import { COLORS } from '../constants';
import { copyToClipboard, searchGoogle, askAI as askAIHelper, getQuestionPlainText, loadCompletionStatuses, setQuestionCompleted } from '../helpers/helpers';

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
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completionStatus, setCompletionStatus] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  // Feedback timer for showing messages
  const feedbackTimerRef = React.useRef(null);

  useEffect(() => {
    setAllQuestions(flattenQuestions(beuData));
    refreshBookmarks();
  }, []);

  useEffect(() => {
    // When bookmarkedIds change, fetch their completion statuses
    if (bookmarkedIds.length > 0) {
      loadCompletionStatuses(bookmarkedIds).then(setCompletionStatus);
    } else {
      setCompletionStatus({});
    }
  }, [bookmarkedIds]);

  const refreshBookmarks = useCallback(async () => {
    setLoading(true);
    const ids = await getBookmarkedQuestions();
    setBookmarkedIds(ids);
    setLoading(false);
  }, []);

  const bookmarkedQuestions = allQuestions.filter(q => bookmarkedIds.includes(q.questionId));

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
  const handleToggleComplete = useCallback((questionId, newStatus) => {
    setCompletionStatus(prev => ({ ...prev, [questionId]: newStatus }));
    setQuestionCompleted(questionId, newStatus);
  }, []);

  const handleCopy = useCallback(
    (text) => copyToClipboard(text, displayFeedback),
    [displayFeedback]
  );

  const handleSearch = useCallback(
    (plainText) => searchGoogle(plainText, displayFeedback),
    [displayFeedback]
  );

  const handleAskAI = useCallback(
    (item) => {
      askAIHelper(item, displayFeedback);
    },
    [displayFeedback]
  );

  if (loading) {
    return (
      <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>
    );
  }

  if (bookmarkedQuestions.length === 0) {
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
        data={bookmarkedQuestions}
        keyExtractor={item => item.questionId}
        renderItem={({ item }) => (
          <QuestionItem
            item={item}
            isCompleted={!!completionStatus[item.questionId]}
            onToggleComplete={(questionId, newStatus) => handleToggleComplete(questionId, newStatus)}
            onCopy={() => handleCopy(getQuestionPlainText(item.text))}
            onSearch={() => handleSearch(getQuestionPlainText(item.text))}
            onAskAI={() => handleAskAI(item)}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
      />
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
});

export default BookmarksScreen;
