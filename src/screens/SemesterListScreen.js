// src/screens/SemesterListScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, FlatList, SafeAreaView, Platform } from 'react-native';
import { COLORS } from '../constants';
import { findData } from '../helpers/helpers';
import ListItemCard from '../components/ListItemCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const SemesterListScreen = ({ route, navigation }) => {
  const { branchId } = route.params;
  const { branch: branchData, error: dataError } = useMemo(
    () => findData({ branchId }),
    [branchId]
  );
  const [error, setError] = useState(dataError);

  useEffect(() => {
    if (branchData) {
      navigation.setOptions({ title: `${branchData.name || 'Semesters'}` });
      setError(null);
    } else if (dataError) {
      setError(dataError);
    } else if (!branchData && !dataError) {
      setError('Branch data could not be loaded.');
    }
  }, [branchData, dataError, navigation]);

  const handlePressSemester = useCallback(
    (semId) => {
      navigation.navigate('Subjects', { branchId, semId });
    },
    [navigation, branchId]
  );

  const renderSemesterItem = useCallback(
    ({ item }) => {
      const hasData =
        item.subjects?.some((sub) => sub.questions?.length > 0) ?? false;
      return (
        <ListItemCard
          title={`Semester ${item.number}`}
          onPress={() => handlePressSemester(item.id)}
          hasData={hasData}
          disabled={!hasData}
          iconName="calendar-clear-outline"
          iconSet="Ionicons"
          iconColor={COLORS.semesterIconColor}
        />
      );
    },
    [handlePressSemester]
  );

  if (error) return <ErrorMessage message={error} />;
  if (!branchData && !error) return <LoadingIndicator />;
  if (!branchData?.semesters || branchData.semesters.length === 0) {
    return <EmptyState message="No semesters found for this branch." />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={branchData.semesters}
        renderItem={renderSemesterItem}
        keyExtractor={(item) => item.id}
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

export default SemesterListScreen;