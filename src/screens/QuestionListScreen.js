// src/screens/QuestionListScreen.js
import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
} from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    StatusBar,
    ScrollView,
    Animated, // Import Animated
    Easing,   // Import Easing
    TextInput,
    Alert,
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { Ionicons } from '@expo/vector-icons';
import {
    COLORS,
    UNCAT_CHAPTER_NAME,
    SEARCH_DEBOUNCE_DELAY,
    ADS_ENABLED,
} from '../constants';
import {
    findData,
    loadCompletionStatuses,
    setQuestionCompleted,
    copyToClipboard,
    debounce,
    getQuestionPlainText,
    updateDailyStreak,
} from '../helpers/helpers';
import GlobalLoadingIndicator from '../components/GlobalLoadingIndicator'; // Import new
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import QuestionItem from '../components/QuestionItem';
import AIChatModal from '../components/AIChatModal';
import {
    getBookmarkedQuestions,
    toggleBookmark as toggleBookmarkHelper,
} from '../helpers/bookmarkHelpers';

// Ad Configuration
const AD_UNIT_ID = __DEV__ ? TestIds.BANNER : 'ca-app-pub-7142215738625436/1197117276'; // IMPORTANT: Replace in production
const AD_FREQUENCY = 4; // Show an ad every N questions


const QuestionListScreen = ({ route, navigation }) => {
    const {
        branchId,
        semId,
        subjectId,
        organizationMode = 'all',
        selectedYear,
        selectedChapter,
    } = route.params;

    const [subjectData, setSubjectData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [completionStatus, setCompletionStatus] = useState({});
    const [loading, setLoading] = useState(true); 
    const [loadingStatuses, setLoadingStatuses] = useState(true); // Specific loading for statuses
    const [error, setError] = useState(null);

    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const feedbackTimerRef = useRef(null);
    const qlsMountedRef = useRef(true);
    const feedbackAnim = useRef(new Animated.Value(0)).current; // For opacity and transform
    const feedbackVisible = useRef(false); // To track actual visibility for animation logic


    const [sortBy, setSortBy] = useState('default');
    const [filterCompleted, setFilterCompleted] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    const [isAIChatModalVisible, setIsAIChatModalVisible] = useState(false);
    const [currentAIQuestion, setCurrentAIQuestion] = useState(null);

    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
    const [currentBranchName, setCurrentBranchName] = useState('N/A');
    const [currentSemesterNumber, setCurrentSemesterNumber] = useState('N/A');

    useEffect(() => {
        qlsMountedRef.current = true;
        return () => {
            qlsMountedRef.current = false;
            if (feedbackTimerRef.current) {
                clearTimeout(feedbackTimerRef.current);
            }
        };
    }, []);

    // Effect to load initial bookmarks and subscribe to focus events for refresh
    useEffect(() => {
        const loadBookmarks = async () => {
            if (qlsMountedRef.current) {
                const ids = await getBookmarkedQuestions();
                if (qlsMountedRef.current) {
                    setBookmarkedIds(new Set(ids));
                }
            }
        };
        loadBookmarks(); // Initial load

        const unsubscribeFocus = navigation.addListener('focus', loadBookmarks); // Reload on focus
        return unsubscribeFocus; // Cleanup listener on unmount
    }, []);

    const subjectContextForAI = useMemo(() => {
        if (!subjectData) return null; // subjectData is from state

        let finalBranchName = currentBranchName;
        let finalSemesterNumber = currentSemesterNumber;

        // Fallback to route.params if findData (via beuData) couldn't provide the names
        if (finalBranchName === 'N/A' && route.params.branchName) {
            finalBranchName = route.params.branchName;
        }
        if (finalSemesterNumber === 'N/A' && route.params.semesterNumber) {
            finalSemesterNumber = route.params.semesterNumber.toString();
        }
        return {
            branchName: finalBranchName,
            semesterNumber: finalSemesterNumber,
            subjectName: subjectData.name,
            subjectCode: subjectData.code,
        };
    }, [subjectData, currentBranchName, currentSemesterNumber, route.params.branchName, route.params.semesterNumber]);


    const debouncedSearchHandler = useCallback(
        debounce((query) => {
            if (qlsMountedRef.current) {
                setDebouncedSearchQuery(query);
            }
        }, SEARCH_DEBOUNCE_DELAY),
        []
    );

    useEffect(() => {
        debouncedSearchHandler(searchQuery);
    }, [searchQuery, debouncedSearchHandler]);

    const loadData = useCallback(async () => {
        if (!qlsMountedRef.current) return;
        setLoading(true);
        setLoadingStatuses(true);
        setError(null);
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);

        let subject = null;
        let fetchedQuestions = [];
        let dataError = null;
        let branch = null;
        let semester = null;

        ({ subject, questions: fetchedQuestions, error: dataError, branch, semester } = findData({ branchId, semId, subjectId }));

        if (!qlsMountedRef.current) return;

        if (dataError) {
            setError(dataError);
            setSubjectData(null);
            setCurrentBranchName('N/A');
            setCurrentSemesterNumber('N/A');
            setLoading(false);
            setLoadingStatuses(false);
            return;
        }

        if (subject) {
            setSubjectData(subject);
            setQuestions(fetchedQuestions);

            let screenTitle = subject.name || 'Questions';
            if (organizationMode === 'year' && selectedYear != null) {
                screenTitle = `${subject.name} (${selectedYear})`;
            } else if (organizationMode === 'chapter' && selectedChapter) {
                const chapterDisplay =
                    selectedChapter === UNCAT_CHAPTER_NAME
                        ? 'Uncategorized'
                        : selectedChapter;
                screenTitle = `${subject.code || subject.name} (${chapterDisplay.substring(0,15)}${chapterDisplay.length > 15 ? '...' : ''})`;
            }
            setCurrentBranchName(branch?.name || 'N/A');
            setCurrentSemesterNumber(semester?.number?.toString() || 'N/A');

            navigation.setOptions({ title: screenTitle });

            if (fetchedQuestions.length > 0) {
                const questionIds = fetchedQuestions.map((q) => q.questionId);
                try {
                    const statuses = await loadCompletionStatuses(questionIds);
                    if (qlsMountedRef.current) {
                        setCompletionStatus(statuses);
                    }
                } catch (err) {
                    console.error("Error loading completion statuses in loadData:", err);
                     if (qlsMountedRef.current) {
                        setError("Failed to load completion data.");
                    }
                } finally {
                    if (qlsMountedRef.current) {
                        setLoadingStatuses(false);
                    }
                }
            } else {
                 if (qlsMountedRef.current) {
                    setCompletionStatus({});
                    setLoadingStatuses(false);
                 }
            }
        } else {
            setError("Subject data could not be loaded.");
            setSubjectData(null);
            setCurrentBranchName('N/A');
            setCurrentSemesterNumber('N/A');
        }
        if (qlsMountedRef.current) {
            setLoading(false); // Overall loading done once subject/questions are set or error occurs
        }

    }, [branchId, semId, subjectId, organizationMode, selectedYear, selectedChapter, navigation]);


    useEffect(() => {
        loadData(); // Initial load
        return () => {
            // This cleanup is from the qlsMountedRef effect, no need to duplicate here.
        };
    }, [loadData]); // Rerun if loadData identity changes (due to its deps)

    const displayFeedback = useCallback((message) => {
        if (!qlsMountedRef.current) return;
    
        setFeedbackMessage(message);
    
        // If already visible, just update message and reset timer
        if (feedbackVisible.current) {
            if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        } else {
            feedbackVisible.current = true;
            setShowFeedback(true); // Keep this to ensure the component is in the tree
            Animated.spring(feedbackAnim, { // Animate in
                toValue: 1,
                tension: 100,
                friction: 12,
                useNativeDriver: true,
            }).start();
        }
    
        feedbackTimerRef.current = setTimeout(() => {
            if (qlsMountedRef.current) {
                Animated.timing(feedbackAnim, { // Animate out
                    toValue: 0,
                    duration: 250,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }).start(() => {
                    if (qlsMountedRef.current) { // Check again after animation
                        setShowFeedback(false);
                        setFeedbackMessage('');
                        feedbackVisible.current = false;
                    }
                });
            }
        }, 2000);
    }, [feedbackAnim]); // Add feedbackAnim to dependencies
    

    const handleToggleComplete = useCallback(async (questionId, newStatus) => {
        if (!qlsMountedRef.current) return;

        setCompletionStatus((prev) => ({ ...prev, [questionId]: newStatus }));
        await setQuestionCompleted(questionId, newStatus);
        if (newStatus) {
            await updateDailyStreak();
            // Check mount status again after await before calling displayFeedback
            if (!qlsMountedRef.current) return;
            displayFeedback("Marked as Done!");
        } else {
            // Check mount status before calling displayFeedback
            if (!qlsMountedRef.current) return;
            displayFeedback("Marked as Not Done.");
        }
    }, [displayFeedback, qlsMountedRef]); // Added qlsMountedRef as it's checked

    const handleToggleBookmarkInList = useCallback(async (questionId) => {
        if (!qlsMountedRef.current) return;
        const newBookmarkedState = await toggleBookmarkHelper(questionId); // Uses the helper
        setBookmarkedIds(prevIds => {
            const newIds = new Set(prevIds); // Create a new Set to ensure state update
            if (newBookmarkedState) {
                newIds.add(questionId);
            } else {
                newIds.delete(questionId);
            }
            return newIds;
        });
        displayFeedback(newBookmarkedState ? "Bookmarked!" : "Bookmark removed.");
    }, [displayFeedback, qlsMountedRef]); // Added qlsMountedRef as it's checked

    const handleCopy = useCallback(
        (text) => copyToClipboard(getQuestionPlainText(text), displayFeedback), // Ensure plain text is copied
        [displayFeedback]
    );

    const handleAskAI = useCallback((item) => {
        if (!qlsMountedRef.current) return;
        setCurrentAIQuestion(item); 
        setIsAIChatModalVisible(true);
    }, [setCurrentAIQuestion, setIsAIChatModalVisible, qlsMountedRef]); // Added dependencies

    const closeAIChatModal = useCallback(() => {
        if (!qlsMountedRef.current) return;
        setIsAIChatModalVisible(false);
        setCurrentAIQuestion(null); // Clear the question
    }, [setIsAIChatModalVisible, setCurrentAIQuestion, qlsMountedRef]); // Added dependencies

    const { listData, finalQuestionCount } = useMemo(() => {
        if (!Array.isArray(questions)) return { listData: [], finalQuestionCount: 0 };
        let filteredAndSortedQuestions = [...questions];

        if (organizationMode === 'year' && selectedYear != null) {
            filteredAndSortedQuestions = filteredAndSortedQuestions.filter((q) => q.year === selectedYear);
        } else if (organizationMode === 'chapter' && selectedChapter) {
            if (selectedChapter === UNCAT_CHAPTER_NAME) {
                filteredAndSortedQuestions = filteredAndSortedQuestions.filter(
                    (q) => !q.chapter || typeof q.chapter !== 'string' || !q.chapter.trim()
                );
            } else {
                filteredAndSortedQuestions = filteredAndSortedQuestions.filter((q) => q.chapter === selectedChapter);
            }
        }

        const query = debouncedSearchQuery.trim().toLowerCase();
        if (query) {
            filteredAndSortedQuestions = filteredAndSortedQuestions.filter((q) => {
                const plainText = getQuestionPlainText(q.text).toLowerCase();
                const chapterText = (q.chapter || '').toLowerCase();
                const yearText = (q.year || '').toString();
                const qNumText = (q.qNumber || '').toLowerCase();
                return (
                    plainText.includes(query) ||
                    chapterText.includes(query) ||
                    yearText.includes(query) ||
                    qNumText.includes(query)
                );
            });
        }

        if (filterCompleted !== 'all') {
            const requiredStatus = filterCompleted === 'completed';
            filteredAndSortedQuestions = filteredAndSortedQuestions.filter(
                (q) => !!completionStatus[q.questionId] === requiredStatus
            );
        }

        if (organizationMode === 'all') {
            switch (sortBy) {
                case 'year_asc':
                    filteredAndSortedQuestions.sort((a, b) => (a.year || 0) - (b.year || 0));
                    break;
                case 'year_desc':
                    filteredAndSortedQuestions.sort((a, b) => (b.year || 0) - (a.year || 0));
                    break;
                case 'default':
                default:
                    filteredAndSortedQuestions.sort((a, b) => {
                        const yearDiff = (b.year || 0) - (a.year || 0);
                        if (yearDiff !== 0) return yearDiff;
                        return (a.qNumber || '').localeCompare(b.qNumber || '', undefined, { // Use filteredAndSortedQuestions
                            numeric: true,
                            sensitivity: 'base',
                        });
                    });
                    break;
            }
        } else { // For year or chapter view, sort by qNumber
            filteredAndSortedQuestions.sort((a, b) =>
                (a.qNumber || '').localeCompare(b.qNumber || '', undefined, {
                    numeric: true,
                    sensitivity: 'base',
                })
            );
        }

        const currentFinalQuestionCount = filteredAndSortedQuestions.length;

        // --- Inject Ads ---
        const itemsWithAdsList = [];
        if (filteredAndSortedQuestions.length > 0) {
            for (let i = 0; i < filteredAndSortedQuestions.length; i++) {
                itemsWithAdsList.push(filteredAndSortedQuestions[i]); // Add the question item
                // Add an ad after every AD_FREQUENCY questions,
                // but not if it's the last item in the original filtered list
                // AND only if ads are enabled
                if (ADS_ENABLED && (i + 1) % AD_FREQUENCY === 0 && i < filteredAndSortedQuestions.length - 1) {
                    itemsWithAdsList.push({
                        type: 'ad',
                        id: `ad-${Math.floor(i / AD_FREQUENCY)}`, 
                    });
                }
            }
        }
        return { listData: itemsWithAdsList, finalQuestionCount: currentFinalQuestionCount };
    }, [
        questions,
        completionStatus,
        sortBy,
        filterCompleted,
        debouncedSearchQuery,
        organizationMode,
        selectedYear,
        selectedChapter,
    ]);

    const renderListItem = useCallback(
        ({ item }) => (
            <QuestionItem
                item={item}
                isCompleted={!!completionStatus[item.questionId]}
                onToggleComplete={handleToggleComplete}
                onCopy={handleCopy}
                onAskAI={() => handleAskAI(item)}
                isBookmarked={bookmarkedIds.has(item.questionId)}
                onToggleBookmark={handleToggleBookmarkInList}
            />
        ),
        // Ensure all dependencies that affect rendering or behavior are included
        [completionStatus, handleToggleComplete, handleCopy, handleAskAI, bookmarkedIds, handleToggleBookmarkInList]
    );

    const keyExtractor = useCallback((item, index) => {
        if (item.type === 'ad') {
            return item.id; // Use the unique ad ID
        }
        return item.questionId.toString(); // Existing key for questions
    }, []);

    if (loading && !subjectData && !error) {
        return <GlobalLoadingIndicator fullscreen={true} text="Loading subject data..." />;
    }
    if (error && !loading) return <ErrorMessage message={error} onRetry={loadData} />;


    const noQuestionsInitiallyForSubject = questions.length === 0;
    const noResultsAfterFilter = !noQuestionsInitiallyForSubject && finalQuestionCount === 0;
    
    let listEmptyMessage = 'No questions available for this subject.';
    if (noResultsAfterFilter) {
        if (debouncedSearchQuery) {
            listEmptyMessage = `No questions match your search for "${debouncedSearchQuery}".`;
        } else if (filterCompleted !== 'all') {
            listEmptyMessage = `No ${filterCompleted} questions found.`;
        } else if (organizationMode === 'year') {
            listEmptyMessage = `No questions match your filters for ${selectedYear}.`;
        } else if (organizationMode === 'chapter') {
            const chapterDisplay = selectedChapter === UNCAT_CHAPTER_NAME ? 'Uncategorized' : `"${selectedChapter}"`;
            listEmptyMessage = `No questions match your filters for the ${chapterDisplay} chapter.`;
        } else {
            listEmptyMessage = 'No questions match the current filter criteria.';
        }
    } else if (noQuestionsInitiallyForSubject && finalQuestionCount === 0) {
         if (organizationMode === 'year' && selectedYear) {
            listEmptyMessage = `No questions found for year ${selectedYear}.`;
        } else if (organizationMode === 'chapter' && selectedChapter) {
            const chapterDisplay = selectedChapter === UNCAT_CHAPTER_NAME ? 'Uncategorized' : `"${selectedChapter}"`;
            listEmptyMessage = `No questions found for the ${chapterDisplay} chapter.`;
        }
    }


    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar
                barStyle={Platform.OS === "ios" ? "dark-content" : "dark-content"}
                backgroundColor={COLORS.surface}
            />
            {showFeedback && (
                <Animated.View 
                    style={[
                        styles.feedbackToast, 
                        {
                            opacity: feedbackAnim,
                            transform: [{
                                translateY: feedbackAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [50, 0] // Slide in from bottom
                                })
                            }]
                        }
                    ]} 
                    pointerEvents="none"
                >
                    <Text style={styles.feedbackText}>{feedbackMessage}</Text>
                </Animated.View>
            )}

            <View style={styles.controlsContainer}>
                 <View style={styles.searchContainer}>
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color={COLORS.textSecondary}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search in ${organizationMode === 'year'
                                ? selectedYear
                                : organizationMode === 'chapter'
                                    ? (selectedChapter === UNCAT_CHAPTER_NAME ? 'Uncategorized' : `Ch: ${selectedChapter.substring(0, 10)}${selectedChapter.length > 10 ? '...' : ''}`)
                                    : subjectData?.code || 'questions'
                            }...`}
                        placeholderTextColor={COLORS.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                        returnKeyType="search"
                    />
                </View>

                {(!noQuestionsInitiallyForSubject || loading) && ( 
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.controlsScroll}>
                        {organizationMode === 'all' && (
                            <>
                                <Text style={styles.controlLabel}>Sort:</Text>
                                <TouchableOpacity
                                    onPress={() => setSortBy('default')}
                                    style={[styles.controlButton, sortBy === 'default' && styles.controlButtonActive]}>
                                    <Text style={[styles.controlButtonText, sortBy === 'default' && styles.controlButtonTextActive]}>Default</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setSortBy('year_desc')}
                                    style={[styles.controlButton, sortBy === 'year_desc' && styles.controlButtonActive]}>
                                    <Text style={[styles.controlButtonText, sortBy === 'year_desc' && styles.controlButtonTextActive]}>Newest</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setSortBy('year_asc')}
                                    style={[styles.controlButton, sortBy === 'year_asc' && styles.controlButtonActive]}>
                                    <Text style={[styles.controlButtonText, sortBy === 'year_asc' && styles.controlButtonTextActive]}>Oldest</Text>
                                </TouchableOpacity>
                                <View style={styles.controlSeparator} />
                            </>
                        )}

                        <Text style={styles.controlLabel}>Filter:</Text>
                        <TouchableOpacity
                            onPress={() => setFilterCompleted('all')}
                            style={[styles.controlButton, filterCompleted === 'all' && styles.controlButtonActive]}>
                            <Text style={[styles.controlButtonText, filterCompleted === 'all' && styles.controlButtonTextActive]}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setFilterCompleted('completed')}
                            style={[styles.controlButton, filterCompleted === 'completed' && styles.controlButtonActive]}>
                            <Text style={[styles.controlButtonText, filterCompleted === 'completed' && styles.controlButtonTextActive]}>Done</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setFilterCompleted('incomplete')}
                            style={[styles.controlButton, filterCompleted === 'incomplete' && styles.controlButtonActive]}>
                            <Text style={[styles.controlButtonText, filterCompleted === 'incomplete' && styles.controlButtonTextActive]}>Not Done</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </View>

             {loading && subjectData && !error && ( // Show inline loader if data exists but statuses are still loading
                <GlobalLoadingIndicator
                    visible={loadingStatuses} // Control visibility based on specific loading state
                    size="small"
                    text="Loading questions..."
                    style={{paddingVertical: 20}} // Style the wrapper view
                    textStyle={{fontSize: 13}} // Customize text style if needed
                />
            )}


            <FlatList
                data={listData}
                renderItem={({ item }) => {
                    if (item.type === 'ad' && ADS_ENABLED) { // Ensure ADS_ENABLED is checked here too
                        return (
                            <View style={styles.adContainer}>
                                <BannerAd
                                    unitId={AD_UNIT_ID}
                                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                                    requestOptions={{
                                        requestNonPersonalizedAdsOnly: true, // Consider GDPR
                                    }}
                                    onAdLoaded={() => console.log('Banner Ad loaded for item:', item.id)}
                                    onAdFailedToLoad={(error) => console.error('Banner Ad failed to load for item:', item.id, error)}
                                />
                            </View>
                        );
                    }
                    // It's a question item, call the original render function
                    return renderListItem({ item });
                }}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContentContainer}
                ListEmptyComponent={(!loading && !loadingStatuses) ? <EmptyState message={listEmptyMessage} iconName="documents-outline" /> : null}
                initialNumToRender={7}
                maxToRenderPerBatch={10}
                windowSize={21}
                removeClippedSubviews={Platform.OS === 'android'} // Generally good for Android
                extraData={{ completionStatus, bookmarkedIds }} // Pass as an object if multiple dynamic props affect items
            />

            {isAIChatModalVisible && currentAIQuestion && subjectContextForAI && (
                <AIChatModal
                    visible={isAIChatModalVisible}
                    onClose={closeAIChatModal}
                    questionItem={currentAIQuestion}
                    subjectContext={subjectContextForAI}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background || '#F2F2F7',
    },
    listContentContainer: {
        paddingTop: 0, // Changed from 10 to 0 as controls container has bottom padding
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
        paddingHorizontal: 12,
    },
    feedbackToast: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 60 : 30,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(40, 40, 40, 0.95)',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    feedbackText: {
        color: COLORS.white || '#FFFFFF',
        fontSize: 14,
        textAlign: 'center',
    },
    controlsContainer: {
        paddingBottom: 8,
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border || '#E0E0E0',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background || '#F2F2F7',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginHorizontal: 12,
        marginTop: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.borderLight || '#DDD',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: Platform.OS === 'ios' ? 12 : 10,
        fontSize: 15,
        color: COLORS.text || '#000000', 
    },
    controlsScroll: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    controlLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary || '#8E8E93',
        marginRight: 8,
        marginLeft: 4,
    },
    controlButton: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: COLORS.border || '#D1D1D6',
        marginRight: 8,
        backgroundColor: COLORS.surfaceAlt || COLORS.surface,
    },
    controlButtonActive: {
        backgroundColor: COLORS.primary || '#007AFF',
        borderColor: COLORS.primary || '#007AFF',
    },
    controlButtonText: {
        fontSize: 13,
        color: COLORS.textSecondary || '#555',
        fontWeight: '500',
    },
    controlButtonTextActive: {
        color: COLORS.white || '#FFFFFF',
        fontWeight: '600',
    },
    controlSeparator: {
        width: 1,
        height: 20,
        backgroundColor: COLORS.borderLight || '#E0E0E0',
        marginHorizontal: 8,
    },
    adContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10, // Spacing around the ad
        // BannerAd with ANCHORED_ADAPTIVE_BANNER will attempt to fill available width
    },
});

export default QuestionListScreen;