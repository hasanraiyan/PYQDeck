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
    TextInput,
    Alert, // Added for potential alerts
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming Ionicons are used
import {
    COLORS,
    UNCAT_CHAPTER_NAME,
    SEARCH_DEBOUNCE_DELAY,
} from '../constants';
import {
    findData, // Fallback for local data
    loadCompletionStatuses,
    setQuestionCompleted,
    copyToClipboard,
    // searchGoogle, // This is now handled within QuestionItem via SearchWebViewModal
    debounce,
    getQuestionPlainText,
    getSemesterPYQsFromSecureStore,
    updateDailyStreak,
} from '../helpers/helpers';
import { askAIWithContext } from '../helpers/openaiHelper'; // New AI helper

import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import QuestionItem from '../components/QuestionItem';
import AIChatModal from '../components/AIChatModal'; // New AI Chat Modal

// Attempt to load beuData for context like branch/semester names for AI
// This is a simplification. In a larger app, this data might come from a context/service.
let beuDataStructure = null;
try {
    beuDataStructure = require('../data/beuData').default; // Adjust path if necessary
} catch (e) {
    console.warn("beuData.js not found or failed to load. AI context might be limited.", e);
}


const QuestionListScreen = ({ route, navigation }) => {
    const {
        branchId,
        semId,
        subjectId,
        organizationMode = 'all', // 'all', 'year', 'chapter'
        selectedYear, // for organizationMode 'year'
        selectedChapter, // for organizationMode 'chapter'
    } = route.params;

    const [subjectData, setSubjectData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [completionStatus, setCompletionStatus] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const feedbackTimerRef = useRef(null);

    const [sortBy, setSortBy] = useState('default'); // 'default', 'year_asc', 'year_desc'
    const [filterCompleted, setFilterCompleted] = useState('all'); // 'all', 'completed', 'incomplete'
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // AI Chat Modal State
    const [isAIChatModalVisible, setIsAIChatModalVisible] = useState(false);
    const [currentAIQuestion, setCurrentAIQuestion] = useState(null);
    const [aiResponseText, setAiResponseText] = useState('');
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiError, setAiError] = useState(null);

    const debouncedSearchHandler = useCallback(
        debounce((query) => {
            setDebouncedSearchQuery(query);
        }, SEARCH_DEBOUNCE_DELAY),
        []
    );

    useEffect(() => {
        debouncedSearchHandler(searchQuery);
    }, [searchQuery, debouncedSearchHandler]);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);
        setCompletionStatus({});
        setQuestions([]);
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);

        const loadData = async () => {
            let semesterData = null;
            try {
                semesterData = await getSemesterPYQsFromSecureStore(branchId, semId);
            } catch (secureStoreError) {
                console.warn("Failed to load PYQs from secure store:", secureStoreError);
            }

            let subject = null;
            let fetchedQuestions = [];
            let dataError = null;

            if (semesterData && semesterData.subjects) {
                subject = semesterData.subjects.find(sub => sub.id === subjectId);
                if (!subject) {
                    dataError = 'Subject not found in downloaded data. Trying local fallback.';
                } else {
                    fetchedQuestions = Array.isArray(subject.questions) ? subject.questions : [];
                }
            }

            if (!subject || dataError) { // Fallback to local beuData.js
                // console.log(dataError || "No data in SecureStore or subject not found, falling back to local data.");
                const fallback = findData({ branchId, semId, subjectId });
                subject = fallback.subject;
                fetchedQuestions = fallback.questions;
                dataError = fallback.error; // Overwrite error if fallback also fails
            }


            if (dataError) {
                if (isMounted) {
                    setError(dataError);
                    setSubjectData(null);
                    setLoading(false);
                }
                return;
            }

            if (subject) {
                if (isMounted) {
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
                    navigation.setOptions({ title: screenTitle });

                    if (fetchedQuestions.length > 0) {
                        const questionIds = fetchedQuestions.map((q) => q.questionId);
                        loadCompletionStatuses(questionIds)
                            .then((statuses) => {
                                if (isMounted) setCompletionStatus(statuses);
                            })
                            .finally(() => {
                                if (isMounted) setLoading(false);
                            });
                    } else {
                        if (isMounted) setLoading(false);
                    }
                }
            } else {
                 if (isMounted) {
                    setError("Subject data could not be loaded.");
                    setLoading(false);
                 }
            }
        };

        loadData();

        return () => {
            isMounted = false;
            if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        };
    }, [branchId, semId, subjectId, organizationMode, selectedYear, selectedChapter, navigation]);

    const displayFeedback = useCallback((message) => {
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        setFeedbackMessage(message);
        setShowFeedback(true);
        feedbackTimerRef.current = setTimeout(() => {
            setShowFeedback(false);
            setFeedbackMessage('');
            feedbackTimerRef.current = null;
        }, 2000); // Increased duration slightly
    }, []);

    const handleToggleComplete = useCallback(async (questionId, newStatus) => {
        setCompletionStatus((prev) => ({ ...prev, [questionId]: newStatus }));
        await setQuestionCompleted(questionId, newStatus); // Ensure await
        if (newStatus) {
            await updateDailyStreak(); // Ensure await
            displayFeedback("Marked as Done!");
        } else {
            displayFeedback("Marked as Not Done.");
        }
    }, [displayFeedback]);

    const handleCopy = useCallback(
        (text) => copyToClipboard(text, displayFeedback),
        [displayFeedback]
    );

    // AI Related Functions
    const callAIAndSetState = useCallback(async (itemToAsk) => {
        if (!subjectData || !itemToAsk) {
            displayFeedback('Cannot ask AI: Missing question or subject data.');
            setAiError('Missing context to ask AI.');
            setIsAILoading(false);
            return;
        }

        setIsAILoading(true);
        setAiResponseText('');
        setAiError(null);

        let branchName = 'N/A';
        let semesterNumber = 'N/A';

        if (beuDataStructure?.branches) {
            const currentBranch = beuDataStructure.branches.find(b => b.id === branchId);
            if (currentBranch) {
                branchName = currentBranch.name;
                if (currentBranch.semesters) {
                    const currentSemester = currentBranch.semesters.find(s => s.id === semId);
                    if (currentSemester) {
                        semesterNumber = currentSemester.number.toString(); // Ensure it's a string
                    }
                }
            }
        } else {
            // If beuDataStructure is not available, these will remain 'N/A'
            // You might pass branchName and semesterNumber via route.params if available
            if (route.params.branchName) branchName = route.params.branchName;
            if (route.params.semesterNumber) semesterNumber = route.params.semesterNumber.toString();
        }


        const subjectContext = {
            branchName,
            semesterNumber,
            subjectName: subjectData.name,
            subjectCode: subjectData.code,
        };

        try {
            const response = await askAIWithContext(itemToAsk, subjectContext, displayFeedback);
            setAiResponseText(response);
        } catch (error) {
            console.error("AI Call Error in Screen:", error);
            setAiError(error.message || "An unexpected error occurred with the AI service.");
            // Optionally display an alert too
            // Alert.alert("AI Error", error.message || "Could not get response from AI.");
        } finally {
            setIsAILoading(false);
        }
    }, [subjectData, displayFeedback, branchId, semId, route.params.branchName, route.params.semesterNumber]); // Added dependencies

    const handleAskAI = useCallback((item) => {
        setCurrentAIQuestion(item);
        setIsAIChatModalVisible(true);
        callAIAndSetState(item); // Initial call when modal opens
    }, [callAIAndSetState]);

    const handleRegenerateAIResponse = useCallback(() => {
        if (currentAIQuestion) {
            callAIAndSetState(currentAIQuestion);
        }
    }, [currentAIQuestion, callAIAndSetState]);

    const closeAIChatModal = useCallback(() => {
        setIsAIChatModalVisible(false);
        // Optional: Reset AI state when closing
        // setCurrentAIQuestion(null);
        // setAiResponseText('');
        // setAiError(null);
        // setIsAILoading(false); // Ensure loading is false if modal is closed while loading
    }, []);

    const processedQuestions = useMemo(() => {
        if (!Array.isArray(questions)) return [];
        let filtered = [...questions];

        if (organizationMode === 'year' && selectedYear != null) {
            filtered = filtered.filter((q) => q.year === selectedYear);
        } else if (organizationMode === 'chapter' && selectedChapter) {
            if (selectedChapter === UNCAT_CHAPTER_NAME) {
                filtered = filtered.filter(
                    (q) => !q.chapter || typeof q.chapter !== 'string' || !q.chapter.trim()
                );
            } else {
                filtered = filtered.filter((q) => q.chapter === selectedChapter);
            }
        }

        const query = debouncedSearchQuery.trim().toLowerCase();
        if (query) {
            filtered = filtered.filter((q) => {
                const plainText = getQuestionPlainText(q.text).toLowerCase();
                const chapterText = (q.chapter || '').toLowerCase();
                const yearText = (q.year || '').toString(); // Ensure year is string for includes
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
            filtered = filtered.filter(
                (q) => !!completionStatus[q.questionId] === requiredStatus
            );
        }

        if (organizationMode === 'all') {
            switch (sortBy) {
                case 'year_asc':
                    filtered.sort((a, b) => (a.year || 0) - (b.year || 0));
                    break;
                case 'year_desc':
                    filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
                    break;
                case 'default':
                default:
                    filtered.sort((a, b) => {
                        const yearDiff = (b.year || 0) - (a.year || 0);
                        if (yearDiff !== 0) return yearDiff;
                        return (a.qNumber || '').localeCompare(b.qNumber || '', undefined, {
                            numeric: true,
                            sensitivity: 'base',
                        });
                    });
                    break;
            }
        } else {
            filtered.sort((a, b) =>
                (a.qNumber || '').localeCompare(b.qNumber || '', undefined, {
                    numeric: true,
                    sensitivity: 'base',
                })
            );
        }
        return filtered;
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

    const renderQuestionItem = useCallback(
        ({ item }) => (
            <QuestionItem
                item={item}
                isCompleted={!!completionStatus[item.questionId]}
                onToggleComplete={handleToggleComplete}
                onCopy={handleCopy}
                // onSearch prop is removed as QuestionItem now handles search via SearchWebViewModal internally
                onAskAI={() => handleAskAI(item)}
            />
        ),
        [completionStatus, handleToggleComplete, handleCopy, handleAskAI]
    );

    if (loading && !subjectData && !error) return <LoadingIndicator />; // Show full screen loader only if no data and no error yet
    if (error) return <ErrorMessage message={error} onRetry={loadData} />; // Pass loadData to onRetry if ErrorMessage supports it


    const noQuestionsInitiallyForSubject = questions.length === 0;
    const noResultsAfterFilter = !noQuestionsInitiallyForSubject && processedQuestions.length === 0;

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
    } else if (noQuestionsInitiallyForSubject && processedQuestions.length === 0) {
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
                backgroundColor={COLORS.surface} // For Android status bar background
            />
            {showFeedback && (
                <View style={styles.feedbackToast} pointerEvents="none">
                    <Text style={styles.feedbackText}>{feedbackMessage}</Text>
                </View>
            )}

            {/* Search and Filter Controls */}
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

                {(!noQuestionsInitiallyForSubject || loading) && ( // Show controls if questions exist or still loading them
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

            {loading && subjectData && <LoadingIndicator style={{marginTop: 20}} />}

            <FlatList
                data={processedQuestions}
                renderItem={renderQuestionItem}
                keyExtractor={(item) => item.questionId.toString()} // Ensure key is string
                contentContainerStyle={styles.listContentContainer}
                ListEmptyComponent={!loading ? <EmptyState message={listEmptyMessage} iconName="documents-outline" /> : null}
                initialNumToRender={7}
                maxToRenderPerBatch={10}
                windowSize={21}
                removeClippedSubviews={Platform.OS === 'android'}
            />

            <AIChatModal
                visible={isAIChatModalVisible}
                onClose={closeAIChatModal}
                questionItem={currentAIQuestion}
                aiResponse={aiResponseText}
                isLoading={isAILoading}
                error={aiError}
                onRegenerate={handleRegenerateAIResponse}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background || '#F2F2F7', // Default background
    },
    listContentContainer: {
        paddingTop: 0, // Adjusted as controls container provides spacing
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
        paddingHorizontal: 12,
    },
    feedbackToast: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 60 : 30, // Adjusted position
        left: 20,
        right: 20,
        backgroundColor: 'rgba(40, 40, 40, 0.95)', // Slightly more opaque
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 25, // Fully rounded
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
        backgroundColor: COLORS.surface || '#FFFFFF', // Surface color for controls background
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border || '#E0E0E0', // Border color
        // Removed shadow to make it feel more integrated with the list
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background || '#F2F2F7', // Background color for search input
        borderRadius: 10, // Slightly more rounded
        paddingHorizontal: 12, // Increased padding
        marginHorizontal: 12,
        marginTop: 10,
        marginBottom: 8, // Adjusted margin
        borderWidth: 1,
        borderColor: COLORS.borderLight || '#DDD', // Lighter border for search
    },
    searchIcon: {
        marginRight: 10, // Increased spacing
    },
    searchInput: {
        flex: 1,
        paddingVertical: Platform.OS === 'ios' ? 12 : 10, // Adjusted padding
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
        paddingVertical: 6, // Adjusted padding
        paddingHorizontal: 14, // Adjusted padding
        borderRadius: 18, // More rounded
        borderWidth: 1.5, // Slightly thicker border
        borderColor: COLORS.border || '#D1D1D6',
        marginRight: 8,
        backgroundColor: COLORS.surfaceAlt || COLORS.surface, // Alt surface or surface
    },
    controlButtonActive: {
        backgroundColor: COLORS.primary || '#007AFF',
        borderColor: COLORS.primary || '#007AFF',
    },
    controlButtonText: {
        fontSize: 13, // Slightly larger
        color: COLORS.textSecondary || '#555',
        fontWeight: '500',
    },
    controlButtonTextActive: {
        color: COLORS.white || '#FFFFFF',
        fontWeight: '600',
    },
    controlSeparator: {
        width: 1,
        height: 20, // Increased height
        backgroundColor: COLORS.borderLight || '#E0E0E0',
        marginHorizontal: 8, // Increased margin
    },
});

export default QuestionListScreen;