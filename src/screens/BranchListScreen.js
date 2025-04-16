import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    FlatList,
    SafeAreaView,
    Platform,
    View,
    Text,
    ActivityIndicator,
    StatusBar,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, DEFAULT_BRANCH_ICON } from '../constants';
import beuData from '../data/beuData';
import { loadCompletionStatuses, loadLastJourney, saveSemesterPYQsToSecureStore, isSemesterPYQDownloaded, getStreakInfo } from '../helpers/helpers';
import ListItemCard from '../components/ListItemCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const APP_VERSION = '2.0.3'; // Update as needed

const BranchListScreen = ({ navigation }) => {
    const [branches, setBranches] = useState([]);
    const [completionStatus, setCompletionStatus] = useState({});
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [lastJourney, setLastJourney] = useState(null);
    const [isLoadingJourney, setIsLoadingJourney] = useState(true);
    const [downloadStatus, setDownloadStatus] = useState({}); // { [branchId_semId]: 'idle'|'downloading'|'done'|'error' }
    const [streak, setStreak] = useState(0);
    const [todayCount, setTodayCount] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);

    const handleDeveloperInfoPress = useCallback(() => {
        navigation.navigate('DeveloperInfo');
    }, [navigation]);

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

    useEffect(() => {
        getStreakInfo().then(({ streak, todayCount, bestStreak }) => {
            setStreak(streak);
            setTodayCount(todayCount);
            setBestStreak(bestStreak);
        });
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
                <View style={{ paddingHorizontal: 10, marginBottom: 5 }}>
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
        [handlePressBranch, completionStatus]
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

    const handleOpenBookmarks = useCallback(() => {
        navigation.navigate('Bookmarks');
    }, [navigation]);

    const FeatureHighlight = ({ icon, color, label }) => (
        <View style={{ alignItems: 'center', marginHorizontal: 14 }}>
            <View style={{ backgroundColor: color, borderRadius: 18, padding: 12, marginBottom: 4 }}>
                <Ionicons name={icon} size={26} color="#fff" />
            </View>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'center' }}>{label}</Text>
        </View>
    );

    const ListHeader = () => (
        <>
            <View style={[styles.heroContainer, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                <View style={styles.logoCircle}>
                    <Ionicons name="school-outline" size={36} color="white" />
                </View>
                <View style={{ marginLeft: 14 }}>
                    <Text style={styles.heroTitle}>PYQDeck</Text>
                    <Text style={styles.heroTagline}>Your Personal Exam Prep Assistant</Text>
                </View>
            </View>
            
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Ionicons name="flame" size={22} color={streak > 0 ? '#FF9500' : COLORS.textSecondary} style={{ marginRight: 5 }} />
                    <Text style={{ fontWeight: 'bold', fontSize: 17, color: streak > 0 ? '#FF9500' : COLORS.textSecondary }}>
                        {streak > 0 ? `${streak}-day streak` : 'No streak yet'}
                    </Text>
                </View>
                <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                    Today: <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{todayCount}</Text> solved
                    {bestStreak > 0 && (
                        <Text style={{ color: COLORS.secondary }}>   |   Best: {bestStreak} days</Text>
                    )}
                </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuresScroll} contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 6, minWidth: 340, justifyContent: 'center', alignItems: 'center' }}>
                <FeatureHighlight icon="book-outline" color={COLORS.primary} label="Practice PYQs" />
                <FeatureHighlight icon="flash-outline" color={COLORS.secondary} label="Instant AI Help" />
                <FeatureHighlight icon="stats-chart-outline" color="#F7B731" label="Track Progress" />
            </ScrollView>
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
                            subtitle={`${lastJourney.semesterName}  ${lastJourney.branchName}`}
                            onPress={handleResumeJourney}
                            iconName="play-forward-outline"
                            iconSet="Ionicons"
                            iconColor={COLORS.secondary}
                            style={styles.resumeCard}
                        />
                        <ListItemCard
                            title="Bookmarked Questions"
                            subtitle="View all your bookmarked questions"
                            onPress={handleOpenBookmarks}
                            iconName="bookmark-outline"
                            iconSet="Ionicons"
                            iconColor={COLORS.primary}
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
                <ListHeader />
                <EmptyState message="No course data found. Please check back later." />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background}
            />
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
                ListFooterComponent={() => (
                    <View style={styles.footerContainer}>
                        <TouchableOpacity onPress={handleDeveloperInfoPress} style={styles.footerButton}>
                            <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.footerText}>About</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerVersion}>v{APP_VERSION}</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    headerTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    infoButton: {
        padding: 8,
        borderRadius: 20,
    },
    screen: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    gradientHeader: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 25,
        backgroundColor: COLORS.primaryLight
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
        paddingTop: 0,
        paddingBottom: 0,
    },
    heroContainer: {
        alignItems: 'center',
        marginTop: 28,
        marginBottom: 12,
    },
    logoCircle: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.18,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 2,
    },
    heroTagline: {
        fontSize: 15,
        color: COLORS.textSecondary,
        marginBottom: 8,
        textAlign: 'center',
    },
    featuresScroll: {
        marginBottom: 8,
        marginTop: 3,      
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderTopWidth: 0.5,
        borderTopColor: COLORS.border,
        paddingVertical: 7,
        paddingHorizontal: 0,
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 16,
        backgroundColor: 'rgba(245,245,245,0.7)',
        marginRight: 10,
    },
    footerText: {
        marginLeft: 5,
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    footerVersion: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '400',
        marginLeft: 10,
    },
});

export default BranchListScreen;