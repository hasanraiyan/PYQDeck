
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, FlatList, SafeAreaView, Platform, View, Text } from 'react-native';
import { COLORS, DEFAULT_BRANCH_ICON } from '../constants';
import beuData from '../data/beuData';
import { loadCompletionStatuses } from '../helpers/helpers';
import ListItemCard from '../components/ListItemCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const BranchListScreen = ({ navigation }) => {

    const [branches, setBranches] = useState([]);
    const [completionStatus, setCompletionStatus] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError(null);
        setCompletionStatus({});

        try {

            const loadedBranches = beuData.branches || [];
            if (isMounted) {
                setBranches(loadedBranches);
            }


            if (loadedBranches.length > 0) {

                const allQuestionIds = loadedBranches.flatMap(
                    (branch) => branch.semesters?.flatMap(
                        (sem) => sem.subjects?.flatMap(
                            (sub) => sub.questions?.map((q) => q.questionId) ?? []
                        ) ?? []
                    ) ?? []
                );

                if (allQuestionIds.length > 0) {
                    loadCompletionStatuses(allQuestionIds)
                        .then((statuses) => {
                            if (isMounted) {
                                setCompletionStatus(statuses);
                                setIsLoading(false);
                            }
                        })
                        .catch((err) => {
                            console.error('Error loading branch completion statuses:', err);
                            if (isMounted) {
                                setError('Failed to load completion progress.');
                                setIsLoading(false);
                            }
                        });
                } else {

                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            } else {

                if (isMounted) {
                    setIsLoading(false);
                }
            }
        } catch (e) {
            console.error("Error processing branch data:", e);
            if (isMounted) {
                setError("An error occurred while loading course data.");
                setIsLoading(false);
            }
        }

        return () => { isMounted = false; };
    }, []);


    const handlePressBranch = useCallback(
        (branchId) => {
            navigation.navigate('Semesters', { branchId });
        },
        [navigation]
    );


    const renderBranchItem = useCallback(
        ({ item: branch }) => {
            let totalCount = 0;
            let completedCount = 0;
            let progress = 0;
            let branchQuestionIds = [];


            try {
                branchQuestionIds = branch.semesters?.flatMap(
                    (sem) => sem.subjects?.flatMap(
                        (sub) => sub.questions?.map((q) => q.questionId) ?? []
                    ) ?? []
                ) ?? [];
                totalCount = branchQuestionIds.length;

                if (totalCount > 0 && Object.keys(completionStatus).length > 0) {
                    completedCount = branchQuestionIds.filter(id => completionStatus[id]).length;
                    progress = (completedCount / totalCount) * 100;
                }
            } catch (calcError) {
                console.error(`Error calculating progress for branch ${branch.id}:`, calcError);

            }


            const hasData = totalCount > 0;
            const branchIcon = branch.icon || DEFAULT_BRANCH_ICON;

            const subtitle = isLoading
                ? 'Calculating progress...'
                : hasData ? `${completedCount} / ${totalCount} done` : 'No questions yet';

            return (
                <ListItemCard
                    title={branch.name}
                    subtitle={subtitle}
                    onPress={() => handlePressBranch(branch.id)}
                    hasData={hasData}
                    disabled={!hasData || isLoading}
                    iconName={branchIcon.name}
                    iconSet={branchIcon.set}
                    iconColor={COLORS.branchIconColorDefault}

                    progress={hasData ? (isLoading ? -1 : progress) : null}
                />
            );
        },
        [handlePressBranch, completionStatus, isLoading]
    );


    const ListHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Welcome to PYQDeck!</Text>
            <Text style={styles.headerSubtitle}>Select your branch to get started.</Text>
        </View>
    );


    if (isLoading && branches.length === 0) {
        return <LoadingIndicator />;
    }

    if (error) return <ErrorMessage message={error} />;

    if (!isLoading && branches.length === 0) {

        return (
            <SafeAreaView style={styles.screen}>
                <ListHeader />
                <EmptyState message="No course data found. Please check back later." />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.screen}>
            <FlatList
                data={branches}
                renderItem={renderBranchItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={ListHeader}
                contentContainerStyle={styles.listContentContainer}
                extraData={completionStatus}
                initialNumToRender={10}
                maxToRenderPerBatch={15}
                windowSize={21}



            />
            { }
            {isLoading && branches.length > 0 && (
                <View style={styles.statusLoadingIndicator}>
                    <LoadingIndicator />
                    { }
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 10,



    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 15,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 5,
    },
    listContentContainer: {
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
        paddingHorizontal: 12,
    },

    statusLoadingIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,

    }
});

export default BranchListScreen;