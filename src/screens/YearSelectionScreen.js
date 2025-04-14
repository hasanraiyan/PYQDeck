// src/screens/YearSelectionScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, FlatList, SafeAreaView, Platform, StatusBar } from 'react-native';
import { COLORS } from '../constants';
import { findData, loadCompletionStatuses } from '../helpers/helpers'; // Import loadCompletionStatuses
import ListItemCard from '../components/ListItemCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const YearSelectionScreen = ({ route, navigation }) => {
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
                    title: `Years - ${subject.code || subject.name}`, // Updated title
                });
                // Status loading will be handled by the next effect
            } else {
                setError('Subject data could not be loaded.');
                setIsLoadingStatuses(false);
            }
        } catch (e) {
            console.error("Error fetching subject data for year selection:", e);
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
                    console.error('Error loading year completion statuses:', err);
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

    // --- Memoized calculation for year data with progress ---
    const yearDataWithProgress = useMemo(() => {
        if (!questions || questions.length === 0) {
            return [];
        }

        const yearsMap = new Map();

        // Group question IDs by year
        questions.forEach((q) => {
            // Ensure year exists and is a valid number, otherwise skip
            if (q.year != null && !isNaN(Number(q.year))) {
                const year = Number(q.year);
                if (!yearsMap.has(year)) {
                    yearsMap.set(year, {
                        year: year,
                        questionIds: [],
                    });
                }
                yearsMap.get(year).questionIds.push(q.questionId);
            }
        });

        // Calculate progress for each year
        const yearsArray = Array.from(yearsMap.values()).map(yearInfo => {
            const totalCount = yearInfo.questionIds.length;
            const completedCount = yearInfo.questionIds.filter(id => completionStatus[id]).length;
            const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

            return {
                ...yearInfo,
                totalCount,
                completedCount,
                progress,
            };
        });

        // Sort years descending
        yearsArray.sort((a, b) => b.year - a.year);

        return yearsArray;
    }, [questions, completionStatus]); // Recalculate when questions or statuses change

    // --- Navigation Handler ---
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

    // --- Render Item Function ---
    const renderYearItem = useCallback(
        ({ item: yearInfo }) => {
            const subtitle = isLoadingStatuses
                ? 'Calculating progress...'
                : `${yearInfo.completedCount} / ${yearInfo.totalCount} done`;

            return (
                <ListItemCard
                    title={`${yearInfo.year}`} // Display the year as title
                    subtitle={subtitle}
                    onPress={() => handlePressYear(yearInfo.year)}
                    iconName="calendar-outline"
                    iconSet="Ionicons"
                    iconColor={COLORS.yearIconColor}
                    hasData={yearInfo.totalCount > 0}
                    disabled={yearInfo.totalCount === 0} // Disable if year has no questions
                    progress={isLoadingStatuses ? -1 : yearInfo.progress} // Show progress, -1 indicates loading
                />
            );
        },
        [handlePressYear, isLoadingStatuses] // Depend on loading state for subtitle/progress display
    );

    // --- Render Logic ---
    if (error) return <ErrorMessage message={error} />;
    // Show loading indicator if initial data OR statuses are loading
    if ((!subjectData && !error) || isLoadingStatuses) return <LoadingIndicator />;

    if (yearDataWithProgress.length === 0) {
        return (
            <EmptyState message="No questions with assigned years found for this subject." />
        );
    }

    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.surface}
            />
            <FlatList
                data={yearDataWithProgress}
                renderItem={renderYearItem}
                keyExtractor={(item) => item.year.toString()} // Use unique year as key
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

export default YearSelectionScreen;