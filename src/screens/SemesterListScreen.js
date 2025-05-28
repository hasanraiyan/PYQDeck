// src/screens/SemesterListScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, FlatList, SafeAreaView, Platform, StatusBar, View } from 'react-native';
import { COLORS } from '../constants';
import { findData, loadCompletionStatuses } from '../helpers/helpers';
import ListItemCard from '../components/ListItemCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
// Removed Ionicons import as it's not directly used here, ListItemCard handles its own icons.



const SemesterListScreen = ({ route, navigation }) => {
    const { branchId } = route.params;
    // State Variables
    const [branchData, setBranchData] = useState(null);
    const [completionStatus, setCompletionStatus] = useState({});
    const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
    const [error, setError] = useState(null);

    // Effect for fetching initial branch data
    useEffect(() => {
        let isMounted = true;
        setIsLoadingStatuses(true); // Reset status loading on param change
        setError(null);
        setBranchData(null);
        setCompletionStatus({});

        try {
            const { branch, error: dataError } = findData({ branchId });

            if (!isMounted) return;

            if (dataError) {
                setError(dataError);
                setIsLoadingStatuses(false); // Stop loading if branch fetch fails
            } else if (branch) {
                setBranchData(branch);
                navigation.setOptions({ title: `${branch.name || 'Semesters'}` });
                // Status loading will be handled by the next effect
            } else {
                setError('Branch data could not be loaded.');
                setIsLoadingStatuses(false); // Stop loading if branch not found
            }
        } catch (e) {
            console.error("Error fetching branch data for semester list:", e);
            if (isMounted) {
                setError("An error occurred while loading branch data.");
                setIsLoadingStatuses(false);
            }
        }

        return () => { isMounted = false; };
    }, [branchId, navigation]);

    // Effect for loading completion statuses for all semesters in the branch
    useEffect(() => {
        let isMounted = true;
        if (branchData?.semesters && branchData.semesters.length > 0) {
            setIsLoadingStatuses(true);

            // Collect all question IDs from all subjects across all semesters in this branch
            const allQuestionIds = branchData.semesters.flatMap(
                (sem) => sem.subjects?.flatMap(
                    (sub) => sub.questions?.map((q) => q.questionId) ?? []
                ) ?? []
            );

            if (allQuestionIds.length > 0) {
                loadCompletionStatuses(allQuestionIds)
                    .then((statuses) => {
                        if (isMounted) {
                            setCompletionStatus(statuses);
                            setIsLoadingStatuses(false);
                        }
                    })
                    .catch((err) => {
                        console.error('Error loading semester completion statuses:', err);
                        if (isMounted) {
                            setError('Failed to load completion progress.');
                            setIsLoadingStatuses(false);
                        }
                    });
            } else {
                // No questions in the entire branch for these semesters
                if (isMounted) {
                    setCompletionStatus({});
                    setIsLoadingStatuses(false);
                }
            }
        } else if (branchData) {
            // Branch data loaded, but no semesters or empty semesters array
            if (isMounted) {
                setIsLoadingStatuses(false);
            }
        }
        // If branchData is null, the first effect handles loading state

        return () => { isMounted = false; };
    }, [branchData]); // Depend on branchData

    // Navigation Handler
    const handlePressSemester = useCallback(
        (semId) => {
            navigation.navigate('Subjects', { branchId, semId });
        },
        [navigation, branchId]
    );

    // Render Item Function with Progress Calculation
    const renderSemesterItem = useCallback(
        ({ item: semester }) => {
            let totalCount = 0;
            let completedCount = 0;
            let progress = 0;
            let semesterQuestionIds = [];

            // Calculate progress for this specific semester
            if (semester.subjects && Array.isArray(semester.subjects)) {
                semesterQuestionIds = semester.subjects.flatMap(
                    (sub) => sub.questions?.map((q) => q.questionId) ?? []
                );
                totalCount = semesterQuestionIds.length;

                if (totalCount > 0 && !isLoadingStatuses) {
                    completedCount = semesterQuestionIds.filter(id => completionStatus[id]).length;
                    progress = (completedCount / totalCount) * 100;
                }
            }

            const hasData = totalCount > 0;
            const subtitle = isLoadingStatuses
                ? 'Calculating progress...'
                : hasData ? `${completedCount} / ${totalCount} done` : 'No questions';

            return (
                <ListItemCard
                    title={`Semester ${semester.number}`}
                    subtitle={subtitle}
                    onPress={() => handlePressSemester(semester.id)}
                    hasData={hasData}
                    disabled={!hasData}
                    iconName="calendar-clear-outline"
                    iconSet="Ionicons"
                    iconColor={COLORS.semesterIconColor}
                    progress={hasData ? (isLoadingStatuses ? -1 : progress) : null}
                    rightElement={null}
                />
            );
        },
        [handlePressSemester, completionStatus, isLoadingStatuses, branchData]
    );

    // Render Logic
    if (error) return <ErrorMessage message={error} />;
    // Show loading indicator if initial branch data OR statuses are loading
    if ((!branchData && !error) || isLoadingStatuses) return <LoadingIndicator />;

    if (!branchData?.semesters || branchData.semesters.length === 0) {
        return <EmptyState message="No semesters found for this branch." />;
    }


    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.surface}
            />
            <FlatList
                data={branchData.semesters} // Use the original semesters array
                renderItem={renderSemesterItem}
                keyExtractor={(item) => item.id}
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
        paddingBottom: Platform.OS === 'ios'
            ? 40
            : 30,
        paddingHorizontal: 12,
    },
    adBannerContainer: {
        alignItems: 'center',
        // The BannerAd with ANCHORED_ADAPTIVE_BANNER will determine its own height.
    },
});

export default SemesterListScreen;
