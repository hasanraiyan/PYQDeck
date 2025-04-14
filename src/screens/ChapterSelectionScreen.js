// src/screens/ChapterSelectionScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, FlatList, SafeAreaView, Platform } from 'react-native';
import { COLORS } from '../constants';
import { findData, getUniqueChapters } from '../helpers/helpers';
import ListItemCard from '../components/ListItemCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const ChapterSelectionScreen = ({ route, navigation }) => {
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
        title: `Select Chapter - ${subjectData.code || ''}`,
      });
      setError(null);
    } else if (dataError) {
      setError(dataError);
    } else if (!subjectData && !dataError) {
      setError('Subject data could not be loaded.');
    }
  }, [subjectData, dataError, navigation]);

  const availableChapters = useMemo(
    () => getUniqueChapters(questions),
    [questions]
  );

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

  const renderChapterItem = useCallback(
    ({ item: chapter }) => (
      <ListItemCard
        title={chapter}
        onPress={() => handlePressChapter(chapter)}
        iconName="layers-outline"
        iconSet="Ionicons"
        iconColor={COLORS.chapterIcon}
        hasData={true}
      />
    ),
    [handlePressChapter]
  );

  if (error) return <ErrorMessage message={error} />;
  if (!subjectData && !error) return <LoadingIndicator />;
  if (availableChapters.length === 0) {
    return (
      <EmptyState message="No questions with assigned chapters found for this subject." />
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={availableChapters}
        renderItem={renderChapterItem}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContentContainer}
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