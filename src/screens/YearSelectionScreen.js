// src/screens/YearSelectionScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, FlatList, SafeAreaView, Platform } from 'react-native';
import { COLORS } from '../constants';
import { findData, getUniqueYears } from '../helpers/helpers';
import ListItemCard from '../components/ListItemCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const YearSelectionScreen = ({ route, navigation }) => {
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
        title: `Select Year - ${subjectData.code || ''}`,
      });
      setError(null);
    } else if (dataError) {
      setError(dataError);
    } else if (!subjectData && !dataError) {
      setError('Subject data could not be loaded.');
    }
  }, [subjectData, dataError, navigation]);

  const availableYears = useMemo(() => getUniqueYears(questions), [questions]);

  const handlePressYear = useCallback(
    (year) => {
      navigation.navigate('Questions', {
        branchId,
        semId,
        subjectId,
        organizationMode: 'year',
        selectedYear: year,
      });
    },
    [navigation, branchId, semId, subjectId]
  );

  const renderYearItem = useCallback(
    ({ item: year }) => (
      <ListItemCard
        title={`${year}`}
        onPress={() => handlePressYear(year)}
        iconName="calendar-outline"
        iconSet="Ionicons"
        iconColor={COLORS.yearIconColor}
        hasData={true}
      />
    ),
    [handlePressYear]
  );

  if (error) return <ErrorMessage message={error} />;
  if (!subjectData && !error) return <LoadingIndicator />;
  if (availableYears.length === 0) {
    return (
      <EmptyState message="No questions with assigned years found for this subject." />
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={availableYears}
        renderItem={renderYearItem}
        keyExtractor={(item) => item.toString()}
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

export default YearSelectionScreen;