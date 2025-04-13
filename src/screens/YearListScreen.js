// src/screens/YearListScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { globalStyles, Colors } from '../styles/globalStyles';

const YearListScreen = ({ navigation, route }) => {
  const { branchId, semesterId, subjectId, subjectName, allBranchesData } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [years, setYears] = useState([]);

  // Set dynamic title
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: `${subjectName} - Years` });
  }, [navigation, subjectName]);

  // Extract years from the subject's questions
  const subject = useMemo(() => {
    const branch = (allBranchesData || [])?.find(b => b.id === branchId);
    const semester = branch?.semesters?.find(s => s.id === semesterId);
    return semester?.subjects?.find(sub => sub.id === subjectId);
  }, [branchId, semesterId, subjectId, allBranchesData]);

  // Extract and sort years
  useEffect(() => {
    setIsLoading(true);
    if (subject && Array.isArray(subject.questions)) {
      // Extract unique years
      const yearSet = new Set(subject.questions.map(q => q.year).filter(Boolean));
      // Convert to array, sort descending (newest first)
      const sortedYears = Array.from(yearSet).sort((a, b) => b - a);
      // Create year objects with counts
      const yearsWithCounts = sortedYears.map(year => {
        const count = subject.questions.filter(q => q.year === year).length;
        return { year, count };
      });
      setYears(yearsWithCounts);
    } else {
      setYears([]);
    }
    setIsLoading(false);
  }, [subject]);

  // Handle year selection
  const handleYearPress = useCallback((year) => {
    navigation.navigate('QuestionList', {
      branchId,
      semesterId,
      subjectId,
      subjectName,
      allBranchesData,
      // Pre-set the year filter
      presetFilters: { years: [year], chapters: [] }
    });
  }, [navigation, branchId, semesterId, subjectId, subjectName, allBranchesData]);

  // Render year item
  const renderYearItem = useCallback(({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={400}
      delay={index * 80}
      useNativeDriver
    >
      <TouchableOpacity
        style={globalStyles.listItem}
        onPress={() => handleYearPress(item.year)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text style={globalStyles.listItemText}>{item.year}</Text>
          <Text style={globalStyles.textSecondary}>{item.count} question{item.count !== 1 ? 's' : ''}</Text>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={26}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>
    </Animatable.View>
  ), [handleYearPress]);

  // Loading state
  if (isLoading) {
    return (
      <View style={globalStyles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={[globalStyles.textSecondary, { marginTop: 10 }]}>Loading years...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={years}
        renderItem={renderYearItem}
        keyExtractor={(item) => item.year.toString()}
        contentContainerStyle={[globalStyles.contentContainer, { paddingTop: 15 }]}
        ListEmptyComponent={
          <View style={globalStyles.emptyListContainer}>
            <MaterialIcons name="event-busy" size={48} color={Colors.textSecondary} style={{ marginBottom: 15 }} />
            <Text style={globalStyles.emptyListText}>No years found for this subject.</Text>
          </View>
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
      />
    </View>
  );
};

export default YearListScreen;