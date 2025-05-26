// src/components/AIChatModal.js
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Platform,
    Alert,
    Pressable,
} from 'react-native';
import Icon from './Icon';
import { COLORS } from '../constants';
// getQuestionPlainText is not used directly in this version of the modal, but can be kept if needed elsewhere.
// import { getQuestionPlainText } from '../helpers/helpers';
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';
import generateHTML from '../helpers/generateHTML';
import { askAIWithContext, REQUEST_TYPES } from '../helpers/openaiHelper'; // MODIFIED

const AIChatModal = React.memo(({
    visible,
    onClose,
    questionItem,
    subjectContext, // ADDED: { branchName, semesterNumber, subjectName, subjectCode }
    aiResponse: initialAiResponse, // RENAMED for clarity
    isLoading: initialIsLoading,   // RENAMED for clarity
    error: initialError,           // RENAMED for clarity
    onRegenerate: onRegenerateAnswer, // RENAMED: This prop is for regenerating the *answer*
}) => {
    const [contentType, setContentType] = useState(REQUEST_TYPES.SOLVE_QUESTION);
    const [currentResponse, setCurrentResponse] = useState(null);
    const [currentIsLoading, setCurrentIsLoading] = useState(false);
    const [currentError, setCurrentError] = useState(null);
    const [modalTitle, setModalTitle] = useState("AI Assistant");

    const [isActionsMenuVisible, setIsActionsMenuVisible] = useState(false);
    const [isWebViewLoading, setIsWebViewLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            // When modal becomes visible, if we are in "answer" mode, sync with props from parent.
            if (contentType === REQUEST_TYPES.SOLVE_QUESTION) {
                setCurrentResponse(initialAiResponse);
                setCurrentIsLoading(initialIsLoading);
                setCurrentError(initialError);
                setModalTitle("AI Assistant");
            }
            // If currentResponse is null (e.g., modal just opened or reset) and initialAiResponse is available,
            // ensure we are in SOLVE_QUESTION mode and display it.
            if (currentResponse === null && initialAiResponse && contentType !== REQUEST_TYPES.EXPLAIN_CONCEPTS) {
                 setCurrentResponse(initialAiResponse);
                 setContentType(REQUEST_TYPES.SOLVE_QUESTION);
                 setModalTitle("AI Assistant");
            }
        } else {
            // Reset states when modal is closed
            setContentType(REQUEST_TYPES.SOLVE_QUESTION); // Default to answer mode for next open
            setCurrentResponse(null);
            setCurrentIsLoading(false);
            setCurrentError(null);
            setModalTitle("AI Assistant");
            setIsActionsMenuVisible(false); // Close menu if open
            setIsWebViewLoading(true); // Reset WebView loader
        }
    }, [visible, initialAiResponse, initialIsLoading, initialError, contentType]);


    const generateAndSetResponse = useCallback(async (requestedType) => {
        if (!questionItem || !subjectContext) {
            setCurrentError("Missing question or subject context to ask AI.");
            setCurrentIsLoading(false);
            return;
        }
        if (currentIsLoading && requestedType === contentType) return; // Prevent re-triggering same request if already loading

        setIsActionsMenuVisible(false); // Close menu
        setCurrentIsLoading(true);
        setCurrentError(null);
        setCurrentResponse(null); // Clear previous response for new fetch
        setContentType(requestedType);
        setModalTitle(requestedType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "AI Explains Concepts" : "AI Assistant");
        setIsWebViewLoading(true); // Show WebView loader for new content

        try {
            // `displayFeedback` for askAIWithContext can be a toast/snackbar in future
            const response = await askAIWithContext(requestedType, questionItem, subjectContext, (feedbackMsg) => console.log("AI Info:", feedbackMsg));
            setCurrentResponse(response);
        } catch (e) {
            setCurrentError(e.message || `Failed to get AI response for ${requestedType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? 'concepts' : 'answer'}.`);
            setCurrentResponse(null);
        } finally {
            setCurrentIsLoading(false);
        }
    }, [questionItem, subjectContext, currentIsLoading, contentType]); // Added contentType

    const handleRegenerateCurrentView = useCallback(() => {
        if (currentIsLoading) return;

        if (contentType === REQUEST_TYPES.SOLVE_QUESTION) {
            if (typeof onRegenerateAnswer === 'function') {
                setIsActionsMenuVisible(false);
                // Parent handles fetching answer and updates props (initialAiResponse, etc.)
                // useEffect will then sync these props to internal state.
                onRegenerateAnswer();
            } else {
                // Fallback if parent doesn't provide onRegenerateAnswer
                generateAndSetResponse(REQUEST_TYPES.SOLVE_QUESTION);
            }
        } else if (contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS) {
            generateAndSetResponse(REQUEST_TYPES.EXPLAIN_CONCEPTS);
        }
    }, [contentType, generateAndSetResponse, onRegenerateAnswer, currentIsLoading]);

    const handleExplainConcepts = useCallback(() => {
        if (currentIsLoading) return;
        generateAndSetResponse(REQUEST_TYPES.EXPLAIN_CONCEPTS);
    }, [generateAndSetResponse, currentIsLoading]);

    const handleShowAnswer = useCallback(() => {
        if (currentIsLoading) return;
        setIsActionsMenuVisible(false);
        setContentType(REQUEST_TYPES.SOLVE_QUESTION); // Switch mode
        // useEffect will pick up initialAiResponse. If it's null and onRegenerateAnswer exists,
        // parent might need to be triggered or user clicks regenerate.
        // For a better UX, if initialAiResponse is null but onRegenerateAnswer is available, call it.
        if (!initialAiResponse && typeof onRegenerateAnswer === 'function' && !initialIsLoading) {
            onRegenerateAnswer();
        } else {
             // If initialAiResponse is already there, useEffect handles showing it.
             // If it's currently loading by parent, useEffect handles it.
             // If no initial response and no way to get it, it will show empty state for answer.
            setCurrentResponse(initialAiResponse); // Explicitly set, useEffect will confirm
            setCurrentIsLoading(initialIsLoading);
            setCurrentError(initialError);
            setModalTitle("AI Assistant");
        }
    }, [currentIsLoading, initialAiResponse, onRegenerateAnswer, initialIsLoading]);


    useEffect(() => {
        // Reset WebView loader when new content is ready to be rendered
        if (visible && currentResponse && !currentIsLoading && !currentError) {
            setIsWebViewLoading(true);
        }
    }, [visible, currentResponse, currentIsLoading, currentError]);


    const handleCopyResponse = useCallback(async () => {
        setIsActionsMenuVisible(false);
        if (currentResponse) {
            try {
                await Clipboard.setStringAsync(currentResponse);
                Alert.alert("Copied!", "AI response copied to clipboard.");
            } catch (e) {
                Alert.alert("Error", "Could not copy response to clipboard.");
            }
        } else {
            Alert.alert("Nothing to Copy", "There is no AI response available to copy.");
        }
    }, [currentResponse]);

    const markdownHTML = useMemo(() => {
        if (currentResponse) {
            return generateHTML(currentResponse);
        }
        // Provide a placeholder based on the content type if no response
        const placeholderMsg = contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ?
            "<!-- Awaiting concept explanation -->" :
            "<!-- Awaiting answer -->";
        return generateHTML(placeholderMsg);
    }, [currentResponse, contentType]);

    const canCopy = !!currentResponse && !currentIsLoading && !currentError;
    // Enable regenerate if we have a way to fetch (either parent's func or internal) and questionItem exists
    const canRegenerate = (typeof onRegenerateAnswer === 'function' || !!questionItem) && !!questionItem;
    const canExplainConcepts = !!questionItem && !!subjectContext; // Need item and context

    const handleCloseModal = () => {
        onClose(); // Parent handles visibility. State reset is done in useEffect via `visible` prop.
    };
    
    const regenerateButtonText = () => {
        if (currentIsLoading) return "Generating...";
        if (!currentResponse && !currentError) return contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "Generate Explanation" : "Generate Answer";
        return contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "Regenerate Explanation" : "Regenerate Answer";
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleCloseModal}
        >
            <SafeAreaView style={styles.modalOverlay}>
                <View style={styles.modalView}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalTitleContainer}>
                            <Icon
                                iconSet="MaterialCommunityIcons"
                                name={contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "brain-outline" : "robot-happy-outline"}
                                size={22}
                                color={COLORS.primary || '#007AFF'}
                                style={styles.modalTitleIcon}
                            />
                            <Text style={styles.modalTitle} numberOfLines={1}>{modalTitle}</Text>
                        </View>
                        <View style={styles.headerRightActions}>
                            {(canCopy || canRegenerate || canExplainConcepts) && (
                                <View style={styles.moreOptionsContainer}>
                                    <TouchableOpacity
                                        onPress={() => setIsActionsMenuVisible(v => !v)}
                                        style={styles.headerIconButton}
                                        disabled={currentIsLoading} // Disable menu toggle while any AI is loading
                                    >
                                        <Icon iconSet="Ionicons" name="ellipsis-vertical" size={24} color={COLORS.textSecondary || '#8E8E93'} />
                                    </TouchableOpacity>
                                    {isActionsMenuVisible && (
                                        <View style={styles.moreOptionsMenu}>
                                            {canCopy && (
                                                <TouchableOpacity style={styles.menuItem} onPress={handleCopyResponse}>
                                                    <Icon name="copy-outline" iconSet="Ionicons" size={20} color={COLORS.text || '#000'} style={styles.menuItemIcon} />
                                                    <Text style={styles.menuItemText}>Copy Response</Text>
                                                </TouchableOpacity>
                                            )}
                                            
                                            {contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS && (
                                                <TouchableOpacity style={styles.menuItem} onPress={handleShowAnswer} disabled={currentIsLoading}>
                                                    <Icon name="chatbubble-ellipses-outline" iconSet="Ionicons" size={20} color={currentIsLoading ? (COLORS.disabled || '#CCC') : (COLORS.text || '#000')} style={styles.menuItemIcon} />
                                                    <Text style={[styles.menuItemText, currentIsLoading && { color: COLORS.disabled || '#CCC' }]}>Show Answer</Text>
                                                </TouchableOpacity>
                                            )}
                                            
                                            {contentType === REQUEST_TYPES.SOLVE_QUESTION && canExplainConcepts && (
                                                <TouchableOpacity style={styles.menuItem} onPress={handleExplainConcepts} disabled={currentIsLoading}>
                                                    <Icon name="bulb-outline" iconSet="Ionicons" size={20} color={currentIsLoading ? (COLORS.disabled || '#CCC') : (COLORS.text || '#000')} style={styles.menuItemIcon} />
                                                    <Text style={[styles.menuItemText, currentIsLoading && { color: COLORS.disabled || '#CCC' }]}>Explain Concepts</Text>
                                                </TouchableOpacity>
                                            )}

                                            {canRegenerate && (
                                                <TouchableOpacity style={styles.menuItem} onPress={handleRegenerateCurrentView} disabled={currentIsLoading}>
                                                    <Icon name="reload-circle-outline" iconSet="Ionicons" size={20} color={currentIsLoading ? (COLORS.disabled || '#CCC') : (COLORS.text || '#000')} style={styles.menuItemIcon} />
                                                    <Text style={[styles.menuItemText, currentIsLoading && { color: COLORS.disabled || '#CCC' }]}>
                                                        {regenerateButtonText()}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                </View>
                            )}
                            <TouchableOpacity onPress={handleCloseModal} style={[styles.headerIconButton, styles.modalCloseButton]}>
                                <Icon iconSet="Ionicons" name="close-circle" size={28} color={COLORS.textSecondary || '#8E8E93'} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView
                        style={styles.contentScrollView}
                        contentContainerStyle={styles.contentScrollContainer}
                        showsVerticalScrollIndicator={true}
                        keyboardShouldPersistTaps="handled"
                    >
                        {currentIsLoading && (
                            <View style={styles.stateInfoContainer}>
                                <ActivityIndicator size={Platform.OS === 'ios' ? "large" : 60} color={COLORS.primary || '#007AFF'} />
                                <Text style={styles.stateInfoText}>
                                    {contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "AI is preparing concept explanations..." : "AI is thinking, please wait..."}
                                </Text>
                            </View>
                        )}

                        {currentError && !currentIsLoading && (
                            <View style={[styles.stateInfoContainer, styles.errorStateContainer]}>
                                <Icon name="alert-circle-outline" iconSet="Ionicons" size={50} color={COLORS.error || '#D32F2F'} />
                                <Text style={[styles.stateInfoTitle, { color: COLORS.error || '#D32F2F' }]}>Oops! An Error Occurred</Text>
                                <Text style={styles.errorDetailText}>{currentError}</Text>
                                {canRegenerate && (
                                    <TouchableOpacity style={styles.errorRetryButton} onPress={handleRegenerateCurrentView} disabled={currentIsLoading}>
                                        <Icon name="refresh-outline" iconSet="Ionicons" size={20} color={COLORS.error || '#D32F2F'} style={styles.actionButtonIcon} />
                                        <Text style={styles.errorRetryButtonText}>
                                            {contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "Retry Explanation" : "Try Again"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {!currentIsLoading && !currentError && currentResponse && (
                            <View style={styles.aiResponseContainer}>
                                {isWebViewLoading && (
                                    <ActivityIndicator
                                        size="large"
                                        color={COLORS.primary || '#007AFF'}
                                        style={styles.webViewLoader}
                                    />
                                )}
                                <WebView
                                    originWhitelist={['*']}
                                    source={{ html: markdownHTML }}
                                    style={[styles.webView, { opacity: isWebViewLoading ? 0 : 1 }]}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    mixedContentMode="compatibility"
                                    setSupportMultipleWindows={false}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                    onLoadEnd={() => setIsWebViewLoading(false)}
                                    onError={({ nativeEvent }) => {
                                        console.error('Chat WebView error:', nativeEvent);
                                        setIsWebViewLoading(false);
                                        setCurrentError("Error displaying AI response. HTML content might be malformed. Try regenerating.");
                                    }}
                                />
                            </View>
                        )}
                        
                        {!currentIsLoading && !currentError && !currentResponse && (
                             <View style={styles.stateInfoContainer}>
                                <Icon
                                    name={contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "bulb-outline" : "chatbubbles-outline"}
                                    iconSet="Ionicons" size={48} color={COLORS.textDisabled || '#AEAEB2'} />
                                <Text style={styles.stateInfoText}>
                                    {contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "Concept explanations will appear here." : "AI response will appear here."}
                                </Text>
                                {canRegenerate && (
                                     <TouchableOpacity style={styles.generateButton} onPress={handleRegenerateCurrentView} disabled={currentIsLoading}>
                                        <Icon name="sparkles-outline" iconSet="Ionicons" size={20} color={COLORS.primary || '#007AFF'} style={styles.actionButtonIcon} />
                                        <Text style={styles.generateButtonText}>{regenerateButtonText()}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
                {isActionsMenuVisible && (
                    <Pressable
                        style={styles.fullScreenMenuBackdrop}
                        onPress={() => setIsActionsMenuVisible(false)}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
});

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'flex-end',
    },
    modalView: {
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: Platform.OS === 'ios' ? '93%' : '90%',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
        elevation: 35,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Platform.OS === 'ios' ? 12 : 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight || '#ECECEC',
        minHeight: 58,
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 8,
        flex: 1, 
    },
    modalTitleIcon: {
        // marginRight: 8, // Using gap instead
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text || '#1A1A1A',
        textAlign: 'left',
    },
    headerRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    headerIconButton: {
        padding: 8,
    },
    modalCloseButton: {
        // marginLeft: 4, // Adjust if needed
    },
    moreOptionsContainer: {
        position: 'relative',
        marginRight: Platform.OS === 'ios' ? 0 : -4,
    },
    moreOptionsMenu: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 40 : 44, 
        right: 8,
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderRadius: 10,
        paddingVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 200, 
        minWidth: 230, // Adjusted width
        borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
        borderColor: COLORS.borderUltraLight || '#F0F0F0',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13, 
        paddingHorizontal: 18,
    },
    menuItemIcon: {
        marginRight: 14,
    },
    menuItemText: {
        fontSize: 16, 
        color: COLORS.text || '#000000',
    },
    fullScreenMenuBackdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 100, 
    },
    contentScrollView: {
        flex: 1,
    },
    contentScrollContainer: {
        flexGrow: 1, 
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 30, 
    },
    stateInfoContainer: { 
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        minHeight: 200, 
    },
    stateInfoText: {
        marginTop: 18,
        fontSize: 16,
        color: COLORS.textSecondary || '#718096',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    stateInfoTitle: {
        fontSize: 19,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 10,
        textAlign: 'center',
    },
    errorStateContainer: { 
        backgroundColor:  COLORS.errorBackground || '#FFF0F0', // Provide fallback
        borderRadius: 12,
        paddingHorizontal: 15, 
        marginVertical: 10, 
    },
    errorDetailText: {
        fontSize: 15,
        color: COLORS.errorText || COLORS.textSecondary || '#502A2A', // Provide fallback
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 25,
    },
    errorRetryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        borderColor: COLORS.error || '#D32F2F',
        borderWidth: 1.5,
        backgroundColor: 'transparent',
    },
    errorRetryButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.error || '#D32F2F',
    },
    generateButton: { 
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        borderColor: COLORS.primary || '#007AFF',
        borderWidth: 1.5,
        backgroundColor: 'transparent',
        marginTop: 25,
    },
    generateButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary || '#007AFF',
    },
    aiResponseContainer: {
        flex: 1, 
        backgroundColor: COLORS.surface || "#FFF", 
        borderRadius: 10, 
        overflow: 'hidden', 
        minHeight: 250, 
        position: 'relative', 
    },
    webViewLoader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surface || 'rgba(255,255,255,0.8)', 
        zIndex: 1, 
    },
    webView: {
        flex: 1, 
        backgroundColor: 'transparent', 
    },
    actionButtonIcon: { 
        marginRight: 8,
    },
});

export default AIChatModal;