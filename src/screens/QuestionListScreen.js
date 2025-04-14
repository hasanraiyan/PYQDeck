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
    searchGoogle,
    askAI as askAIHelper, // Renamed import
    debounce,
    getQuestionPlainText,
} from '../helpers/helpers';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import QuestionItem from '../components/QuestionItem';

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
    const [sortBy, setSortBy] = useState('default');
    const [filterCompleted, setFilterCompleted] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    const feedbackTimerRef = useRef(null);

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

        const {
            subject,
            questions: fetchedQuestions,
            error: dataError,
        } = findData({ branchId, semId, subjectId });

        if (dataError) {
            if (isMounted) {
                setError(dataError);
                setSubjectData(null);
                setLoading(false);
            }
        } else if (subject) {
            if (isMounted) {
                setSubjectData(subject);
                const validQuestions = Array.isArray(fetchedQuestions)
                    ? fetchedQuestions
                    : [];
                setQuestions(validQuestions);

                let screenTitle = subject.name || 'Questions';
                if (organizationMode === 'year' && selectedYear != null) {
                    screenTitle = `${subject.name} (${selectedYear})`;
                } else if (organizationMode === 'chapter' && selectedChapter) {
                    const chapterDisplay =
                        selectedChapter === UNCAT_CHAPTER_NAME
                            ? 'Uncategorized'
                            : selectedChapter;
                    screenTitle = `${subject.code || subject.name} (${chapterDisplay})`;
                }
                navigation.setOptions({ title: screenTitle });

                if (validQuestions.length > 0) {
                    const questionIds = validQuestions.map((q) => q.questionId);
                    loadCompletionStatuses(questionIds)
                        .then((statuses) => {
                            if (isMounted) {
                                setCompletionStatus(statuses);
                                setLoading(false);
                            }
                        })
                        .catch((err) => {
                            console.error('Error loading completion statuses:', err);
                            if (isMounted) {
                                setError('Failed to load completion status.');
                                setLoading(false);
                            }
                        });
                } else {
                    if (isMounted) setLoading(false);
                }
            }
        } else {
            if (isMounted) {
                setError('Could not load subject details.');
                setLoading(false);
            }
        }

        return () => {
            isMounted = false;
            if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        };
    }, [
        branchId,
        semId,
        subjectId,
        navigation,
        organizationMode,
        selectedYear,
        selectedChapter,
    ]);

    const displayFeedback = useCallback((message) => {
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        setFeedbackMessage(message);
        setShowFeedback(true);
        feedbackTimerRef.current = setTimeout(() => {
            setShowFeedback(false);
            setFeedbackMessage('');
            feedbackTimerRef.current = null;
        }, 1500);
    }, []);

    const handleToggleComplete = useCallback((questionId, newStatus) => {
        setCompletionStatus((prev) => ({ ...prev, [questionId]: newStatus }));
        setQuestionCompleted(questionId, newStatus);
    }, []);

    const handleCopy = useCallback(
        (text) => copyToClipboard(text, displayFeedback),
        [displayFeedback]
    );

    // handleSearch still uses plain text for better search results
    const handleSearch = useCallback(
        (plainText) => searchGoogle(plainText, displayFeedback),
        [displayFeedback]
    );

    // This function now creates the detailed prompt and calls the helper
    const handleAskAI = useCallback(
        (item) => { // Takes the full item object
            if (!subjectData || !item) {
                displayFeedback('Could not prepare AI prompt.');
                return;
            }

            // Construct the detailed prompt
            let prompt = `Help me with this question:\n\n`;
            prompt += `Subject: ${subjectData.code || subjectData.name}\n`;
            if (item.chapter && item.chapter !== UNCAT_CHAPTER_NAME) prompt += `Chapter: ${item.chapter}\n`;
            if (item.year) prompt += `Year: ${item.year}\n`;
            if (item.qNumber) prompt += `Question Number: ${item.qNumber}\n`;
            if (item.marks != null) prompt += `Marks: ${item.marks}\n`;
            prompt += `\n---\nQuestion Text:\n${item.text}\n---`; // Use original item.text

            askAIHelper(prompt, displayFeedback); // Call the helper with the full prompt
        },
        [subjectData, displayFeedback] // Depends on subjectData and displayFeedback
    );

    const processedQuestions = useMemo(() => {
        if (!Array.isArray(questions)) return [];

        let filtered = [...questions];

        // Filtering based on organization mode
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

        // Filtering based on search query
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

        // Filtering based on completion status
        if (filterCompleted !== 'all') {
            const requiredStatus = filterCompleted === 'completed';
            filtered = filtered.filter(
                (q) => !!completionStatus[q.questionId] === requiredStatus
            );
        }

        // Sorting logic
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
                    // Default sort: newest year first, then by question number
                    filtered.sort((a, b) => {
                        const yearDiff = (b.year || 0) - (a.year || 0);
                        if (yearDiff !== 0) return yearDiff;
                        // Natural sort for question numbers (e.g., Q1a, Q2, Q10)
                        return (a.qNumber || '').localeCompare(b.qNumber || '', undefined, {
                            numeric: true,
                            sensitivity: 'base',
                        });
                    });
                    break;
            }
        } else {
            // If filtered by year or chapter, sort only by question number
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

    // Pass a function to onAskAI that calls handleAskAI with the specific item
    const renderQuestionItem = useCallback(
        ({ item }) => (
            <QuestionItem
                item={item}
                isCompleted={!!completionStatus[item.questionId]}
                onToggleComplete={handleToggleComplete}
                onCopy={handleCopy}
                onSearch={handleSearch}
                onAskAI={() => handleAskAI(item)} // Pass the specific item to the handler
            />
        ),
        [ // Dependencies for renderQuestionItem callback
            completionStatus,
            handleToggleComplete, // Needed for isCompleted updates
            handleCopy,           // Needed for copy button
            handleSearch,         // Needed for search button
            handleAskAI           // Needed for ask AI button
        ]
    );

    if (error) return <ErrorMessage message={error} />;
    if (loading || !subjectData) return <LoadingIndicator />;

    const noQuestionsInitiallyForSubject = questions.length === 0;
    const noResultsAfterFilter = !noQuestionsInitiallyForSubject && processedQuestions.length === 0;

    // Determine the appropriate empty state message
    let listEmptyMessage = 'No questions available for this subject.';
    if (noResultsAfterFilter) {
        if (organizationMode === 'year') {
            listEmptyMessage = `No questions match your filters for ${selectedYear}.`;
        } else if (organizationMode === 'chapter') {
            const chapterDisplay = selectedChapter === UNCAT_CHAPTER_NAME ? 'Uncategorized' : `"${selectedChapter}"`;
            listEmptyMessage = `No questions match your filters for the ${chapterDisplay} chapter.`;
        } else {
            listEmptyMessage = 'No questions match search/filter criteria.';
        }
    } else if (organizationMode === 'year' && noQuestionsInitiallyForSubject && processedQuestions.length === 0) {
        listEmptyMessage = `No questions found for year ${selectedYear}.`;
    } else if (organizationMode === 'chapter' && noQuestionsInitiallyForSubject && processedQuestions.length === 0) {
        const chapterDisplay = selectedChapter === UNCAT_CHAPTER_NAME ? 'Uncategorized' : `"${selectedChapter}"`;
        listEmptyMessage = `No questions found for the ${chapterDisplay} chapter.`;
    }


    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.surface}
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
                                    ? (selectedChapter === UNCAT_CHAPTER_NAME ? 'Uncategorized' : `Chapter: ${selectedChapter.substring(0, 15)}${selectedChapter.length > 15 ? '...' : ''}`) // Shorten long chapter names
                                    : subjectData?.code || 'questions'
                            }...`}
                        placeholderTextColor={COLORS.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                        returnKeyType="search"
                    />
                </View>

                {!noQuestionsInitiallyForSubject && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.controlsScroll}>
                        {/* Sort Controls (only show if viewing 'all') */}
                        {organizationMode === 'all' && (
                            <>
                                <Text style={styles.controlLabel}>Sort:</Text>
                                <TouchableOpacity
                                    onPress={() => setSortBy('default')}
                                    style={[
                                        styles.controlButton,
                                        sortBy === 'default' && styles.controlButtonActive,
                                    ]}>
                                    <Text
                                        style={[
                                            styles.controlButtonText,
                                            sortBy === 'default' && styles.controlButtonTextActive,
                                        ]}>
                                        Default
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setSortBy('year_desc')}
                                    style={[
                                        styles.controlButton,
                                        sortBy === 'year_desc' && styles.controlButtonActive,
                                    ]}>
                                    <Text
                                        style={[
                                            styles.controlButtonText,
                                            sortBy === 'year_desc' && styles.controlButtonTextActive,
                                        ]}>
                                        Newest
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setSortBy('year_asc')}
                                    style={[
                                        styles.controlButton,
                                        sortBy === 'year_asc' && styles.controlButtonActive,
                                    ]}>
                                    <Text
                                        style={[
                                            styles.controlButtonText,
                                            sortBy === 'year_asc' && styles.controlButtonTextActive,
                                        ]}>
                                        Oldest
                                    </Text>
                                </TouchableOpacity>
                                <View style={styles.controlSeparator} />
                            </>
                        )}

                        {/* Filter Controls */}
                        <Text style={styles.controlLabel}>Filter:</Text>
                        <TouchableOpacity
                            onPress={() => setFilterCompleted('all')}
                            style={[
                                styles.controlButton,
                                filterCompleted === 'all' && styles.controlButtonActive,
                            ]}>
                            <Text
                                style={[
                                    styles.controlButtonText,
                                    filterCompleted === 'all' && styles.controlButtonTextActive,
                                ]}>
                                All
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setFilterCompleted('completed')}
                            style={[
                                styles.controlButton,
                                filterCompleted === 'completed' && styles.controlButtonActive,
                            ]}>
                            <Text
                                style={[
                                    styles.controlButtonText,
                                    filterCompleted === 'completed' &&
                                    styles.controlButtonTextActive,
                                ]}>
                                Done
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setFilterCompleted('incomplete')}
                            style={[
                                styles.controlButton,
                                filterCompleted === 'incomplete' && styles.controlButtonActive,
                            ]}>
                            <Text
                                style={[
                                    styles.controlButtonText,
                                    filterCompleted === 'incomplete' &&
                                    styles.controlButtonTextActive,
                                ]}>
                                Not Done
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </View>

            {/* Question List */}
            <FlatList
                data={processedQuestions}
                renderItem={renderQuestionItem}
                keyExtractor={(item) => item.questionId}
                contentContainerStyle={styles.listContentContainer}
                ListEmptyComponent={<EmptyState message={listEmptyMessage} />}
                initialNumToRender={7}
                maxToRenderPerBatch={10}
                windowSize={21}
                removeClippedSubviews={Platform.OS === 'android'} // Optimization for Android
                getItemLayout={null} // Consider using if item height is fixed/predictable
            />
        </SafeAreaView>
    );
};

// Styles remain the same as provided previously
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
    feedbackToast: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 40 : 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(40, 40, 40, 0.9)',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 6,
    },
    feedbackText: {
        color: COLORS.surface,
        fontSize: 14,
        textAlign: 'center',
    },
    controlsContainer: {
        paddingBottom: 8,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginHorizontal: 12,
        marginTop: 10,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: Platform.OS === 'ios' ? 10 : 8,
        fontSize: 15,
        color: COLORS.text,
    },
    controlsScroll: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    controlLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginRight: 8,
        marginLeft: 4,
    },
    controlButton: {
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
        backgroundColor: COLORS.background,
    },
    controlButtonActive: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primaryLight,
    },
    controlButtonText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    controlButtonTextActive: {
        color: COLORS.surface,
        fontWeight: '600',
    },
    controlSeparator: {
        width: 1,
        height: 16,
        backgroundColor: COLORS.border,
        marginHorizontal: 6,
    },
});

export default QuestionListScreen;