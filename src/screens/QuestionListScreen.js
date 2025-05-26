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
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    COLORS,
    UNCAT_CHAPTER_NAME,
    SEARCH_DEBOUNCE_DELAY,
} from '../constants';
import {
    findData,
    loadCompletionStatuses,
    setQuestionCompleted,
    copyToClipboard,
    debounce,
    getQuestionPlainText,
    getSemesterPYQsFromSecureStore,
    updateDailyStreak,
} from '../helpers/helpers';
// REMOVE: askAIWithContext, REQUEST_TYPES (not directly used by QuestionListScreen anymore for initial call)

import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import QuestionItem from '../components/QuestionItem';
import AIChatModal from '../components/AIChatModal';

let beuDataStructure = null;
try {
    beuDataStructure = require('../data/beuData').default;
} catch (e) {
    console.warn("beuData.js not found or failed to load. AI context might be limited.", e);
}


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
    const [error, setError] = useState(null);

    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const feedbackTimerRef = useRef(null);

    const [sortBy, setSortBy] = useState('default');
    const [filterCompleted, setFilterCompleted] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // AI Chat Modal State
    const [isAIChatModalVisible, setIsAIChatModalVisible] = useState(false);
    const [currentAIQuestion, setCurrentAIQuestion] = useState(null);
    // REMOVE: initialAiResponse, isAILoading, aiError from QuestionListScreen state
    // These are now managed within AIChatModal

    // Derived subject context for AI
    const subjectContextForAI = useMemo(() => {
        if (!subjectData) return null;

        let branchName = 'N/A';
        let semesterNumber = 'N/A';

        if (beuDataStructure?.branches) {
            const currentBranch = beuDataStructure.branches.find(b => b.id === branchId);
            if (currentBranch) {
                branchName = currentBranch.name;
                if (currentBranch.semesters) {
                    const currentSemester = currentBranch.semesters.find(s => s.id === semId);
                    if (currentSemester) {
                        semesterNumber = currentSemester.number.toString();
                    }
                }
            }
        } else {
            if (route.params.branchName) branchName = route.params.branchName;
            if (route.params.semesterNumber) semesterNumber = route.params.semesterNumber.toString();
        }
        
        return {
            branchName,
            semesterNumber,
            subjectName: subjectData.name,
            subjectCode: subjectData.code,
        };
    }, [subjectData, branchId, semId, route.params.branchName, route.params.semesterNumber]);


    const debouncedSearchHandler = useCallback(
        debounce((query) => {
            setDebouncedSearchQuery(query);
        }, SEARCH_DEBOUNCE_DELAY),
        []
    );

    useEffect(() => {
        debouncedSearchHandler(searchQuery);
    }, [searchQuery, debouncedSearchHandler]);

    const loadData = useCallback(async () => {
        let isMounted = true;
        setLoading(true);
        setError(null);
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);

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

        if (!subject || dataError) {
            const fallback = findData({ branchId, semId, subjectId });
            subject = fallback.subject;
            fetchedQuestions = fallback.questions;
            dataError = fallback.error;
        }

        if (dataError && isMounted) {
            setError(dataError);
            setSubjectData(null);
            setLoading(false);
            return;
        }

        if (subject && isMounted) {
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
        } else if (isMounted) {
            setError("Subject data could not be loaded.");
            setSubjectData(null);
            setLoading(false);
        }
        return () => { isMounted = false; };
    }, [branchId, semId, subjectId, organizationMode, selectedYear, selectedChapter, navigation]);


    useEffect(() => {
        const cleanup = loadData();
        return () => {
            if (typeof cleanup === 'function') cleanup();
            if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        };
    }, [loadData]);

    const displayFeedback = useCallback((message) => {
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        setFeedbackMessage(message);
        setShowFeedback(true);
        feedbackTimerRef.current = setTimeout(() => {
            setShowFeedback(false);
            setFeedbackMessage('');
            feedbackTimerRef.current = null;
        }, 2000);
    }, []);

    const handleToggleComplete = useCallback(async (questionId, newStatus) => {
        setCompletionStatus((prev) => ({ ...prev, [questionId]: newStatus }));
        await setQuestionCompleted(questionId, newStatus);
        if (newStatus) {
            await updateDailyStreak();
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
    const handleAskAI = useCallback((item) => {
        setCurrentAIQuestion(item); // Set the question context for the modal
        setIsAIChatModalVisible(true); // Open the modal
        // DO NOT call AI here anymore. Modal will handle user's choice.
    }, []); 

    const closeAIChatModal = useCallback(() => {
        setIsAIChatModalVisible(false);
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
                onAskAI={() => handleAskAI(item)}
            />
        ),
        [completionStatus, handleToggleComplete, handleCopy, handleAskAI]
    );

    if (loading && !subjectData && !error) return <LoadingIndicator />;
    if (error && !loading) return <ErrorMessage message={error} onRetry={loadData} />;


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
                backgroundColor={COLORS.surface}
            />
            {showFeedback && (
                <View style={styles.feedbackToast} pointerEvents="none">
                    <Text style={styles.feedbackText}>{feedbackMessage}</Text>
                </View>
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

            {loading && subjectData && <LoadingIndicator style={{marginTop: 20}} />}

            <FlatList
                data={processedQuestions}
                renderItem={renderQuestionItem}
                keyExtractor={(item) => item.questionId.toString()}
                contentContainerStyle={styles.listContentContainer}
                ListEmptyComponent={!loading ? <EmptyState message={listEmptyMessage} iconName="documents-outline" /> : null}
                initialNumToRender={7}
                maxToRenderPerBatch={10}
                windowSize={21}
                removeClippedSubviews={Platform.OS === 'android'}
            />

            {isAIChatModalVisible && currentAIQuestion && subjectContextForAI && (
                <AIChatModal
                    visible={isAIChatModalVisible}
                    onClose={closeAIChatModal}
                    questionItem={currentAIQuestion}
                    subjectContext={subjectContextForAI}
                    // REMOVED: initialAiResponse, initialIsLoading, initialError, onRegenerateAnswer props
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
        paddingTop: 0,
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
        color: COLORS.text || '#000000', // Ensure color is defined
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
});

export default QuestionListScreen;