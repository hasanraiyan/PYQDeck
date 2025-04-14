
import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    FlatList,
    SafeAreaView,
    Platform,
    View,
    Text,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, DEFAULT_BRANCH_ICON } from '../constants';
import beuData from '../data/beuData';
import { loadCompletionStatuses, loadLastJourney } from '../helpers/helpers';
import ListItemCard from '../components/ListItemCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const BranchListScreen = ({ navigation }) => {
    const [branches, setBranches] = useState([]);
    const [completionStatus, setCompletionStatus] = useState({});
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [lastJourney, setLastJourney] = useState(null);
    const [isLoadingJourney, setIsLoadingJourney] = useState(true);

    useEffect(() => {
        let isMounted = true;

        setIsLoadingData(true);
        setIsLoadingJourney(true);
        setError(null);
        setCompletionStatus({});
        setBranches([]);
        setLastJourney(null);

        const fetchData = async () => {
            try {

                const [journey, loadedBranchesResult] = await Promise.all([
                    loadLastJourney(),
                    Promise.resolve(beuData.branches || []),
                ]);

                if (!isMounted) return;

                setLastJourney(journey);
                setIsLoadingJourney(false);

                const loadedBranches = loadedBranchesResult;
                setBranches(loadedBranches);

                if (loadedBranches.length > 0) {

                    const allQuestionIds = loadedBranches.flatMap(
                        (branch) =>
                            branch.semesters?.flatMap(
                                (sem) =>
                                    sem.subjects?.flatMap(
                                        (sub) => sub.questions?.map((q) => q.questionId) ?? []
                                    ) ?? []
                            ) ?? []
                    );

                    if (allQuestionIds.length > 0) {
                        const statuses = await loadCompletionStatuses(allQuestionIds);
                        if (isMounted) setCompletionStatus(statuses);
                    }
                    if (isMounted) setIsLoadingData(false);
                } else {

                    if (isMounted) setIsLoadingData(false);
                }
            } catch (e) {
                console.error('Error loading initial data:', e);
                if (isMounted) {
                    setError('An error occurred while loading data.');

                    setIsLoadingJourney(false);
                    setIsLoadingData(false);
                }
            }

        };

        fetchData();

        return () => {
            isMounted = false;
        };
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
                branchQuestionIds =
                    branch.semesters?.flatMap(
                        (sem) =>
                            sem.subjects?.flatMap(
                                (sub) => sub.questions?.map((q) => q.questionId) ?? []
                            ) ?? []
                    ) ?? [];
                totalCount = branchQuestionIds.length;

                if (totalCount > 0 && Object.keys(completionStatus).length > 0) {
                    completedCount = branchQuestionIds.filter(
                        (id) => completionStatus[id]
                    ).length;
                    progress = (completedCount / totalCount) * 100;
                }
            } catch (calcError) {
                console.error(
                    `Error calculating progress for branch ${branch.id}:`,
                    calcError
                );
            }

            const hasData = totalCount > 0;
            const branchIcon = branch.icon || DEFAULT_BRANCH_ICON;


            const subtitle = isLoadingData
                ? 'Calculating progress...'
                : hasData
                    ? `${completedCount} / ${totalCount} done`
                    : 'No questions yet';

            return (
                <View style={{paddingHorizontal: 10}}>
                    <ListItemCard
                        title={branch.name}
                        subtitle={subtitle}
                        onPress={() => handlePressBranch(branch.id)}
                        hasData={hasData}
                        disabled={!hasData || isLoadingData}
                        iconName={branchIcon.name}
                        iconSet={branchIcon.set}
                        iconColor={COLORS.branchIconColorDefault}
                        progress={hasData ? (isLoadingData ? -1 : progress) : null}
                    />
                </View>

            );
        },
        [handlePressBranch, completionStatus, isLoadingData]
    );


    const handleResumeJourney = useCallback(() => {
        if (lastJourney) {
            navigation.navigate('OrganizationSelection', {
                branchId: lastJourney.branchId,
                semId: lastJourney.semId,
                subjectId: lastJourney.subjectId,
            });
        }
    }, [navigation, lastJourney]);


    const ListHeader = () => (
        <>
            { }
            <LinearGradient
                colors={[COLORS.primaryLight, COLORS.primary]}
                style={styles.gradientHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <Text style={styles.headerTitle}>Welcome to PYQDeck!</Text>
                <Text style={styles.headerSubtitle}>
                    Your Pocket Guide to Past Questions
                </Text>
            </LinearGradient>

            { }
            <View style={styles.resumeSection}>
                {isLoadingJourney ? (
                    <ActivityIndicator
                        size="small"
                        color={COLORS.primary}
                        style={{ marginVertical: 15 }}
                    />
                ) : lastJourney ? (
                    <>
                        <Text style={styles.sectionTitle}>Resume Last Session</Text>
                        <ListItemCard

                            title={`${lastJourney.subjectName}`}
                            subtitle={`(${lastJourney.semesterName}, ${lastJourney.branchName})`}
                            onPress={handleResumeJourney}
                            iconName="play-forward-outline"
                            iconSet="Ionicons"
                            iconColor={COLORS.secondary}

                            style={styles.resumeCard}
                        />
                        <Text style={styles.sectionTitle}>Or select a branch:</Text>
                    </>
                ) : (

                    !isLoadingData && branches.length > 0 && (
                        <Text style={styles.sectionTitle}>Select your branch to begin:</Text>
                    )
                )}
            </View>
        </>
    );




    if (isLoadingJourney || (isLoadingData && branches.length === 0 && !error)) {
        return <LoadingIndicator />;
    }

    if (error) return <ErrorMessage message={error} />;


    if (!isLoadingData && branches.length === 0) {
        return (
            <SafeAreaView style={styles.screen}>
                { }
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
                extraData={{ completionStatus, isLoadingData }}
                initialNumToRender={10}
                maxToRenderPerBatch={15}
                windowSize={21}
            />
            { }
            { }
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    gradientHeader: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 25,




    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.surface,
        textAlign: 'center',
        marginBottom: 5,

        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    headerSubtitle: {
        fontSize: 16,
        color: COLORS.surface,
        textAlign: 'center',
        opacity: 0.9,
    },
    resumeSection: {
        paddingHorizontal: 12,
        paddingTop: 15,
        paddingBottom: 10,
        backgroundColor: COLORS.background,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,

        paddingLeft: 4,
    },
    resumeCard: {
    },
    listContentContainer: {
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,

    },
});

export default BranchListScreen;