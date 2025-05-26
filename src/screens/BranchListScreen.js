// src/screens/BranchListScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    Platform,
    View,
    Text,
    ActivityIndicator,
    StatusBar,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { COLORS, DEFAULT_BRANCH_ICON } from '../constants';
import beuData from '../data/beuData';
import { loadCompletionStatuses, loadLastJourney, getStreakInfo } from '../helpers/helpers';
import ListItemCard from '../components/ListItemCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import { Ionicons } from '@expo/vector-icons';

const APP_VERSION = '3.0.0'; // Keep updated

const BranchListScreen = ({ navigation }) => {
    const [branches, setBranches] = useState([]);
    const [completionStatus, setCompletionStatus] = useState({});
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [lastJourney, setLastJourney] = useState(null);
    const [isLoadingJourney, setIsLoadingJourney] = useState(true);
    const [streak, setStreak] = useState(0);
    const [todayCount, setTodayCount] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);

    // --- Handlers ---
    const handleDeveloperInfoPress = useCallback(() => {
        navigation.navigate('DeveloperInfo');
    }, [navigation]);

    const handlePressBranch = useCallback(
        (branchId) => {
            navigation.navigate('Semesters', { branchId });
        },
        [navigation]
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

    const handleProfilePress = useCallback(() => {
        console.log('Profile icon pressed!');
        navigation.navigate('DeveloperInfo');
    }, [navigation]);

    // --- Effects ---
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
                const [journey, loadedBranchesResult, streakInfo] = await Promise.all([
                    loadLastJourney(),
                    Promise.resolve(beuData.branches || []),
                    getStreakInfo()
                ]);

                if (!isMounted) return;

                setLastJourney(journey);
                setIsLoadingJourney(false);
                setStreak(streakInfo.streak);
                setTodayCount(streakInfo.todayCount);
                setBestStreak(streakInfo.bestStreak);

                const loadedBranches = loadedBranchesResult;
                setBranches(loadedBranches); // Set branches state

                if (loadedBranches && loadedBranches.length > 0) { // Check if loadedBranches is valid
                     // --- CORRECTED allQuestionIds calculation ---
                    const allQuestionIds = loadedBranches.flatMap((branch) => {
                        // Ensure branch.semesters is an array before flatMapping
                        if (!branch || !Array.isArray(branch.semesters)) {
                            // console.warn(`Branch ${branch?.id} missing or has invalid semesters`);
                            return []; // Return empty array if semesters invalid/missing
                        }
                        return branch.semesters.flatMap((sem) => {
                            // Ensure sem.subjects is an array
                            if (!sem || !Array.isArray(sem.subjects)) {
                                // console.warn(`Semester ${sem?.id} missing or has invalid subjects`);
                                return []; // Return empty array if subjects invalid/missing
                            }
                            return sem.subjects.flatMap((sub) => {
                                // Ensure sub.questions is an array
                                if (!sub || !Array.isArray(sub.questions)) {
                                    // console.warn(`Subject ${sub?.id} missing or has invalid questions`);
                                    return []; // Return empty array if questions invalid/missing
                                }
                                // Map valid questions to their IDs and filter out any potential null/undefined IDs
                                return sub.questions
                                         .map((q) => q?.questionId) // Safely access questionId
                                         .filter(id => id != null);   // Ensure only valid IDs are included
                            });
                        });
                    });
                    // --- END CORRECTION ---


                    if (allQuestionIds.length > 0) {
                        const statuses = await loadCompletionStatuses(allQuestionIds);
                        if (isMounted) setCompletionStatus(statuses);
                    } else {
                         if (isMounted) setCompletionStatus({}); // Set empty if no questions found
                    }
                } else {
                     if (isMounted) setCompletionStatus({}); // Set empty if no branches
                }
                if (isMounted) setIsLoadingData(false);

            } catch (e) {
                console.error('Error loading initial data:', e); // Log the specific error
                if (isMounted) {
                    setError(`An error occurred while loading data: ${e.message}`); // Show error message
                    setIsLoadingJourney(false);
                    setIsLoadingData(false);
                }
            }
        };

        fetchData();

        const unsubscribe = navigation.addListener('focus', () => {
             getStreakInfo().then(({ streak, todayCount, bestStreak }) => {
                if (isMounted) { // Check mount status inside async callback
                    setStreak(streak);
                    setTodayCount(todayCount);
                    setBestStreak(bestStreak);
                }
            });
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [navigation]); // Dependency array


    // --- Helper Render Functions ---

    const calculateBranchProgress = useCallback((branch) => {
        let totalCount = 0;
        let completedCount = 0;
        let progress = 0;

        try {
            // Robust check for nested arrays before flatMapping
            const branchQuestionIds = Array.isArray(branch?.semesters)
                ? branch.semesters.flatMap((sem) =>
                    Array.isArray(sem?.subjects)
                        ? sem.subjects.flatMap((sub) =>
                            Array.isArray(sub?.questions)
                                ? sub.questions.map((q) => q?.questionId).filter(id => id != null)
                                : [] // Default for invalid questions
                          )
                        : [] // Default for invalid subjects
                  )
                : []; // Default for invalid semesters

            totalCount = branchQuestionIds.length;

            if (totalCount > 0 && Object.keys(completionStatus).length > 0) {
                completedCount = branchQuestionIds.filter(
                    (id) => completionStatus[id] === true // Explicit check for true
                ).length;
                progress = (completedCount / totalCount) * 100;
            }
        } catch (calcError) {
            console.error(`Error calculating progress for branch ${branch?.id}:`, calcError);
        }
        return { totalCount, completedCount, progress };
    }, [completionStatus]); // Depends only on completionStatus

    // Renders the header section
    const renderHeader = () => (
        <View style={styles.headerSection}>
            <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="person-circle-outline" size={32} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.logoRow}>
                <View style={styles.logoCircle}>
                    <Ionicons name="school-outline" size={36} color="white" />
                </View>
                <View>
                    <Text style={styles.heroTitle}>PYQDeck</Text>
                    <Text style={styles.heroTagline}>Your Personal Exam Prep Assistant</Text>
                </View>
            </View>
            <View style={styles.streakContainer}>
                <Ionicons name="flame" size={24} color={streak > 0 ? '#FF9500' : COLORS.textSecondary} style={styles.streakIcon} />
                <View>
                    <Text style={styles.streakText}>
                        {streak > 0 ? `${streak}-Day Streak!` : 'Start your streak!'}
                    </Text>
                    <Text style={styles.streakDetailText}>
                        Today: <Text style={{ fontWeight: 'bold' }}>{todayCount}</Text> solved
                        {bestStreak > 0 && ` | Best: ${bestStreak} days`}
                    </Text>
                </View>
            </View>
        </View>
    );

    // Renders the quick access cards (Resume/Bookmarks)
    const renderQuickAccess = () => (
        (!isLoadingJourney && (lastJourney || !isLoadingData)) && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Access</Text>
                {isLoadingJourney ? (
                    <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10 }} />
                ) : lastJourney ? (
                    <ListItemCard
                        title={`${lastJourney.subjectName}`}
                        subtitle={`Resume: ${lastJourney.semesterName} · ${lastJourney.branchName}`}
                        onPress={handleResumeJourney}
                        iconName="play-forward-outline"
                        iconSet="Ionicons"
                        iconColor={COLORS.secondary}
                        style={styles.quickAccessCard}
                    />
                ) : null
                }
                 <ListItemCard
                    title="Bookmarked Questions"
                    subtitle="View saved questions"
                    onPress={handleOpenBookmarks}
                    iconName="bookmark-outline"
                    iconSet="Ionicons"
                    iconColor={COLORS.primary}
                    style={styles.quickAccessCard}
                />
            </View>
        )
    );

    // Renders the feature highlights section
    const FeatureHighlight = ({ icon, color, label }) => (
        <View style={styles.featureItem}>
            <View style={[styles.featureIconCircle, { backgroundColor: color }]}>
                <Ionicons name={icon} size={24} color="#fff" />
            </View>
            <Text style={styles.featureLabel}>{label}</Text>
        </View>
    );

    const renderFeatureHighlights = () => (
        <View style={styles.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuresScroll}>
                <FeatureHighlight icon="book-outline" color={COLORS.primary} label="Practice PYQs" />
                <FeatureHighlight icon="cloud-download-outline" color="#3498db" label="Offline Access" />
                <FeatureHighlight icon="flash-outline" color={COLORS.secondary} label="Instant AI Help" />
                <FeatureHighlight icon="stats-chart-outline" color="#f39c12" label="Track Progress" />
                 <FeatureHighlight icon="search-outline" color="#9b59b6" label="Filter & Search" />
            </ScrollView>
        </View>
    );

    // Renders the main branch list section
    const renderBranchList = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>
                {lastJourney ? 'Or Explore Branches' : 'Select Your Branch'}
            </Text>
            {isLoadingData && !error ? (
                 // Show loading specific to this section if journey/header is already loaded
                 <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={{marginTop: 10, color: COLORS.textSecondary}}>Loading branches...</Text>
                 </View>
            ) : branches.length > 0 ? (
                branches.map((branch) => {
                    const { totalCount, completedCount, progress } = calculateBranchProgress(branch);
                    const hasData = totalCount > 0;
                    const branchIcon = branch.icon || DEFAULT_BRANCH_ICON;
                    const subtitle = hasData ? `${completedCount} / ${totalCount} done` : 'Coming Soon';

                    return (
                        <View key={branch.id} style={styles.branchListItem}>
                            <ListItemCard
                                title={branch.name}
                                subtitle={subtitle}
                                onPress={() => handlePressBranch(branch.id)}
                                hasData={hasData}
                                disabled={!hasData}
                                iconName={branchIcon.name}
                                iconSet={branchIcon.set}
                                iconColor={COLORS.branchIconColorDefault}
                                progress={hasData ? progress : null}
                            />
                        </View>
                    );
                })
            ) : (
                 // Only show empty state if not loading and no branches exist
                 !isLoadingData && <EmptyState message="No course data found. Please check back later." />
            )}
        </View>
    );


    // --- Main Render Logic ---

    // Handle error state first
    if (error) {
        return (
            <SafeAreaView style={styles.screen}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                <ErrorMessage message={error} />
                 <View style={styles.footerContainer}>
                    <TouchableOpacity onPress={handleDeveloperInfoPress} style={styles.footerButton}>
                        <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.footerText}>About</Text>
                    </TouchableOpacity>
                    <Text style={styles.footerVersion}>v{APP_VERSION}</Text>
                </View>
            </SafeAreaView>
        );
    }

     // Show a full-screen loader only during the absolute initial loading phase
    if (isLoadingJourney && isLoadingData && !error) { // Ensure no error before showing loader
        return <LoadingIndicator />;
    }

    // Render the main layout once initial loading is potentially done
    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false} // Hide scrollbar for cleaner look
            >
                {renderHeader()}
                {renderQuickAccess()}
                {renderFeatureHighlights()}
                {renderBranchList()}
            </ScrollView>
 
        </SafeAreaView>
    );
};

// Styles remain largely the same as the previous version
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        paddingBottom: 20, // Space before footer
    },
    headerSection: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 25 : 15,
        paddingBottom: 20,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        position: 'relative',
    },
    profileButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 20 : 15, // Adjusted slightly
        right: 15,
        padding: 5,
        zIndex: 10,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingRight: 40, // Added padding to prevent overlap with absolute positioned icon
    },
    logoCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    heroTagline: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    streakIcon: {
        marginRight: 12,
    },
    streakText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    streakDetailText: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    section: {
        marginTop: 20, // Increased space between sections
        marginBottom: 10, // Increased space between sections
        paddingHorizontal: 15,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 15, // Increased space after title
        marginLeft: 5,
    },
    quickAccessCard: {
        marginBottom: 12,
    },
    featuresScroll: {
        paddingBottom: 10,
        paddingLeft: 5, // Ensure first item has breathing room
    },
    featureItem: {
        alignItems: 'center',
        marginRight: 20,
        width: 90,
    },
    featureIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8, // Increased space
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
    },
    featureLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
        textAlign: 'center',
    },
    branchListItem: {
         marginBottom: 0,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingVertical: 12, // Increased padding
        paddingHorizontal: 20,
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6, // Increased padding
        paddingHorizontal: 14, // Increased padding
        borderRadius: 18, // Slightly larger radius
        backgroundColor: COLORS.surface,
        marginRight: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    footerText: {
        marginLeft: 6,
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    footerVersion: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
});

export default BranchListScreen;