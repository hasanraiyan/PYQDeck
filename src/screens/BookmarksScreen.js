import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getBookmarkedQuestions } from '../helpers/bookmarkHelpers';
import beuData from '../data/beuData';
import QuestionItem from '../components/QuestionItem';
import { COLORS } from '../constants';

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

  useEffect(() => {
    setAllQuestions(flattenQuestions(beuData));
    refreshBookmarks();
  }, []);

  const refreshBookmarks = useCallback(async () => {
    setLoading(true);
    const ids = await getBookmarkedQuestions();
    setBookmarkedIds(ids);
    setLoading(false);
  }, []);

  const bookmarkedQuestions = allQuestions.filter(q => bookmarkedIds.includes(q.questionId));

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
      <FlatList
        data={bookmarkedQuestions}
        keyExtractor={item => item.questionId}
        renderItem={({ item }) => (
          <QuestionItem
            item={item}
            isCompleted={false}
            onToggleComplete={() => {}}
            onCopy={() => {}}
            onSearch={() => {}}
            onAskAI={() => {}}
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
