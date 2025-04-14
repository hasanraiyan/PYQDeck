// src/screens/BranchListScreen.js
import React, { useMemo, useCallback } from 'react';
import { StyleSheet, FlatList, SafeAreaView, Platform } from 'react-native';
import { COLORS, DEFAULT_BRANCH_ICON } from '../constants';
import beuData from '../data/beuData'; // Directly access data here
import ListItemCard from '../components/ListItemCard';
import EmptyState from '../components/EmptyState';

const BranchListScreen = ({ navigation }) => {
  const branches = useMemo(() => beuData.branches || [], []);

  const handlePressBranch = useCallback(
    (branchId) => {
      navigation.navigate('Semesters', { branchId });
    },
    [navigation]
  );

  const renderBranchItem = useCallback(
    ({ item }) => {
      const hasData =
        item.semesters?.some((sem) =>
          sem.subjects?.some((sub) => sub.questions?.length > 0)
        ) ?? false;
      const branchIcon = item.icon || DEFAULT_BRANCH_ICON;
      return (
        <ListItemCard
          title={item.name}
          onPress={() => handlePressBranch(item.id)}
          hasData={hasData}
          disabled={!hasData}
          iconName={branchIcon.name}
          iconSet={branchIcon.set}
          iconColor={COLORS.branchIconColorDefault}
        />
      );
    },
    [handlePressBranch]
  );

  if (!branches.length) {
    return <EmptyState message="No branches available in the data." />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={branches}
        renderItem={renderBranchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        initialNumToRender={10}
        maxToRenderPerBatch={15}
        windowSize={21}
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

export default BranchListScreen;