// src/screens/OrganizationSelectionScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView, Platform } from 'react-native';
import { COLORS } from '../constants';
import { findData, getUniqueYears, getUniqueChapters } from '../helpers/helpers';
import ListItemCard from '../components/ListItemCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const OrganizationSelectionScreen = ({ route, navigation }) => {
  const { branchId, semId, subjectId } = route.params;
  const {
    subject: subjectData,
    questions,
    error: dataError,
  } = useMemo(
    () => findData({ branchId, semId, subjectId }),
    [branchId, semId, subjectId]
  );
  const [error, setError] = useState(dataError);

  useEffect(() => {
    if (subjectData) {
      navigation.setOptions({
        title: subjectData.name || 'Organize Questions',
      });
      setError(null);
    } else if (dataError) {
      setError(dataError);
    } else if (!subjectData && !dataError) {
      setError('Subject data could not be loaded.');
    }
  }, [subjectData, dataError, navigation]);

  const navigateToQuestionsAll = useCallback(() => {
    navigation.navigate('Questions', {
      branchId,
      semId,
      subjectId,
      organizationMode: 'all',
    });
  }, [navigation, branchId, semId, subjectId]);

  const navigateToChapterSelection = useCallback(() => {
    navigation.navigate('ChapterSelection', { branchId, semId, subjectId });
  }, [navigation, branchId, semId, subjectId]);

  const navigateToYearSelection = useCallback(() => {
    navigation.navigate('YearSelection', { branchId, semId, subjectId });
  }, [navigation, branchId, semId, subjectId]);

  if (error) return <ErrorMessage message={error} />;
  if (!subjectData && !error) return <LoadingIndicator />;

  const hasQuestions = Array.isArray(questions) && questions.length > 0;
  const uniqueYears = hasQuestions ? getUniqueYears(questions) : [];
  const uniqueChapters = hasQuestions ? getUniqueChapters(questions) : [];
  const canViewByYear = hasQuestions && uniqueYears.length > 0;
  const canViewByChapter = hasQuestions && uniqueChapters.length > 0;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.listContentContainer}>
        <ListItemCard
          title="View All (Default Sort)"
          subtitle="See all questions, newest first"
          onPress={navigateToQuestionsAll}
          iconName="list-outline"
          iconSet="Ionicons"
          iconColor={COLORS.primaryLight}
          hasData={hasQuestions}
          disabled={!hasQuestions}
        />
        <ListItemCard
          title="View By Chapter"
          subtitle="Select a chapter to view its questions"
          onPress={navigateToChapterSelection}
          iconName="folder-open-outline"
          iconSet="Ionicons"
          iconColor={COLORS.secondary}
          hasData={canViewByChapter}
          disabled={!canViewByChapter}
        />
        <ListItemCard
          title="View By Year"
          subtitle="Filter questions by specific year"
          onPress={navigateToYearSelection}
          iconName="calendar-number-outline"
          iconSet="Ionicons"
          iconColor={COLORS.yearIconColor}
          hasData={canViewByYear}
          disabled={!canViewByYear}
        />
        {!hasQuestions && (
          <EmptyState message="No questions available for this subject yet." />
        )}
      </View>
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

export default OrganizationSelectionScreen;