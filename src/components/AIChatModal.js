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
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';
import generateHTML from '../helpers/generateHTML';
import { askAIWithContext, REQUEST_TYPES } from '../helpers/openaiHelper';

const AIChatModal = React.memo(({
    visible,
    onClose,
    questionItem,
    subjectContext,
    // REMOVE: initialAiResponse, initialIsLoading, initialError, onRegenerateAnswer
    // These will now be managed internally after user action.
}) => {
    const [contentType, setContentType] = useState(null); // null | SOLVE_QUESTION | EXPLAIN_CONCEPTS
    const [currentResponse, setCurrentResponse] = useState(null);
    const [currentIsLoading, setCurrentIsLoading] = useState(false);
    const [currentError, setCurrentError] = useState(null);
    const [modalTitle, setModalTitle] = useState("AI Assistant");
    const [userHasMadeChoice, setUserHasMadeChoice] = useState(false); // NEW: Tracks if user clicked a primary action

    const [isActionsMenuVisible, setIsActionsMenuVisible] = useState(false); // Will be simplified
    const [isWebViewLoading, setIsWebViewLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            // Reset to initial state when modal becomes visible
            // but preserve questionItem and subjectContext as they are props.
            setContentType(null);
            setCurrentResponse(null);
            setCurrentIsLoading(false);
            setCurrentError(null);
            setModalTitle("AI Assistant");
            setUserHasMadeChoice(false); // Reset choice flag
            setIsWebViewLoading(true); // Reset WebView loader
            setIsActionsMenuVisible(false);
        }
    }, [visible]); // Only depends on `visible` to reset

    const generateAndSetResponse = useCallback(async (requestedType) => {
        if (!questionItem || !subjectContext) {
            setCurrentError("Missing question or subject context to ask AI.");
            setCurrentIsLoading(false);
            setUserHasMadeChoice(true); // Still mark as choice made to show error state
            return;
        }
        if (currentIsLoading) return;

        setIsActionsMenuVisible(false);
        setCurrentIsLoading(true);
        setCurrentError(null);
        setCurrentResponse(null);
        setContentType(requestedType); // Set content type based on user's choice
        setModalTitle(requestedType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "AI Explains Concepts" : "AI Solution");
        setUserHasMadeChoice(true); // User has now made a choice
        setIsWebViewLoading(true);

        try {
            const response = await askAIWithContext(
                requestedType,
                questionItem,
                subjectContext,
                (feedbackMsg) => console.log("AI Info:", feedbackMsg)
            );
            setCurrentResponse(response);
        } catch (e) {
            setCurrentError(e.message || `Failed to get AI response for ${requestedType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? 'concepts' : 'answer'}.`);
            setCurrentResponse(null);
        } finally {
            setCurrentIsLoading(false);
        }
    }, [questionItem, subjectContext, currentIsLoading]);

    const handleGenerateAnswer = useCallback(() => {
        generateAndSetResponse(REQUEST_TYPES.SOLVE_QUESTION);
    }, [generateAndSetResponse]);

    const handleExplainConcepts = useCallback(() => {
        generateAndSetResponse(REQUEST_TYPES.EXPLAIN_CONCEPTS);
    }, [generateAndSetResponse]);

    const handleRegenerateCurrentView = useCallback(() => {
        if (contentType) { // Only if a content type was previously chosen
            generateAndSetResponse(contentType);
        }
    }, [contentType, generateAndSetResponse]);

    useEffect(() => {
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
        return generateHTML("<!-- Awaiting AI Content -->");
    }, [currentResponse]);

    const canCopy = !!currentResponse && !currentIsLoading && !currentError;
    const canRegenerate = userHasMadeChoice && !!contentType && !currentIsLoading;

    const handleCloseModal = () => {
        onClose();
    };

    const renderInitialChoiceButtons = () => (
        <View style={styles.initialActionsContainer}>
            <Text style={styles.initialActionsTitle}>How can AI assist you with this question?</Text>
            <TouchableOpacity style={[styles.actionButton, styles.generateAnswerButton]} onPress={handleGenerateAnswer} disabled={currentIsLoading}>
                <Icon name="chatbubble-ellipses-outline" iconSet="Ionicons" size={22} color={COLORS.white} style={styles.actionButtonIcon} />
                <Text style={styles.actionButtonText}>Generate Answer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.explainConceptsButton]} onPress={handleExplainConcepts} disabled={currentIsLoading}>
                <Icon name="bulb-outline" iconSet="Ionicons" size={22} color={COLORS.primary} style={styles.actionButtonIconAlt} />
                <Text style={styles.actionButtonTextAlt}>Explain Concepts</Text>
            </TouchableOpacity>
        </View>
    );

    const renderPostChoiceContent = () => {
        if (currentIsLoading) {
            return (
                <View style={styles.stateInfoContainer}>
                    <ActivityIndicator size={Platform.OS === 'ios' ? "large" : 60} color={COLORS.primary || '#007AFF'} />
                    <Text style={styles.stateInfoText}>
                        {contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "AI is preparing concept explanations..." : "AI is generating the answer..."}
                    </Text>
                </View>
            );
        }

        if (currentError) {
            return (
                <View style={[styles.stateInfoContainer, styles.errorStateContainer]}>
                    <Icon name="alert-circle-outline" iconSet="Ionicons" size={50} color={COLORS.error || '#D32F2F'} />
                    <Text style={[styles.stateInfoTitle, { color: COLORS.error || '#D32F2F' }]}>Oops! An Error Occurred</Text>
                    <Text style={styles.errorDetailText}>{currentError}</Text>
                    {canRegenerate && (
                        <TouchableOpacity style={styles.errorRetryButton} onPress={handleRegenerateCurrentView}>
                            <Icon name="refresh-outline" iconSet="Ionicons" size={20} color={COLORS.error || '#D32F2F'} style={styles.actionButtonIcon} />
                            <Text style={styles.errorRetryButtonText}>
                                {contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "Retry Explanation" : "Retry Answer"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        if (currentResponse) {
            return (
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
                    {/* Subsequent action buttons can go here, e.g., under the WebView */}
                    {canRegenerate && (
                         <View style={styles.subsequentActionsContainer}>
                            <TouchableOpacity style={[styles.actionButtonSmall, styles.regenerateButtonSmall]} onPress={handleRegenerateCurrentView}>
                                <Icon name="reload-circle-outline" iconSet="Ionicons" size={18} color={COLORS.primary} style={styles.actionButtonIconAlt} />
                                <Text style={styles.actionButtonTextSmallAlt}>
                                    {contentType === REQUEST_TYPES.SOLVE_QUESTION ? "Regenerate Answer" : "Regenerate Concepts"}
                                </Text>
                            </TouchableOpacity>
                             {contentType === REQUEST_TYPES.SOLVE_QUESTION && (
                                <TouchableOpacity style={[styles.actionButtonSmall, styles.explainConceptsButtonSmall]} onPress={handleExplainConcepts}>
                                    <Icon name="bulb-outline" iconSet="Ionicons" size={18} color={COLORS.textSecondary} style={styles.actionButtonIconAlt} />
                                    <Text style={styles.actionButtonTextSmallAlt}>Explain Concepts</Text>
                                </TouchableOpacity>
                             )}
                             {contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS && (
                                <TouchableOpacity style={[styles.actionButtonSmall, styles.showAnswerButtonSmall]} onPress={handleGenerateAnswer}>
                                     <Icon name="chatbubble-ellipses-outline" iconSet="Ionicons" size={18} color={COLORS.textSecondary} style={styles.actionButtonIconAlt} />
                                     <Text style={styles.actionButtonTextSmallAlt}>Show Answer</Text>
                                 </TouchableOpacity>
                             )}
                         </View>
                    )}
                </View>
            );
        }
        // Fallback, though should be covered by initial choice or error/loading
        return <View style={styles.stateInfoContainer}><Text style={styles.stateInfoText}>Select an action.</Text></View>;
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
                                name={
                                    contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "brain-outline"
                                    : contentType === REQUEST_TYPES.SOLVE_QUESTION ? "robot-happy-outline"
                                    : "help-circle-outline" // Default icon before choice
                                }
                                size={22}
                                color={COLORS.primary || '#007AFF'}
                                style={styles.modalTitleIcon}
                            />
                            <Text style={styles.modalTitle} numberOfLines={1}>{modalTitle}</Text>
                        </View>
                        <View style={styles.headerRightActions}>
                            {canCopy && ( // Only show copy if there's content
                                <TouchableOpacity
                                    onPress={() => setIsActionsMenuVisible(v => !v)}
                                    style={styles.headerIconButton}
                                >
                                    <Icon iconSet="Ionicons" name="ellipsis-vertical" size={24} color={COLORS.textSecondary || '#8E8E93'} />
                                </TouchableOpacity>
                            )}
                             {isActionsMenuVisible && canCopy && (
                                <View style={styles.moreOptionsMenu}>
                                    <TouchableOpacity style={styles.menuItem} onPress={handleCopyResponse}>
                                        <Icon name="copy-outline" iconSet="Ionicons" size={20} color={COLORS.text || '#000'} style={styles.menuItemIcon} />
                                        <Text style={styles.menuItemText}>Copy Response</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            <TouchableOpacity onPress={handleCloseModal} style={[styles.headerIconButton, styles.modalCloseButton, !canCopy && {marginLeft: 'auto'}]}>
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
                        {!userHasMadeChoice ? renderInitialChoiceButtons() : renderPostChoiceContent()}
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
    modalTitleIcon: {},
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
        // marginLeft auto is applied if no other buttons
    },
    moreOptionsContainer: { // This container is not strictly needed if only one button
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
        minWidth: 200, // Adjusted
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
    // NEW Styles for initial action buttons
    initialActionsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    initialActionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textSecondary || '#4A5568',
        textAlign: 'center',
        marginBottom: 30,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 25,
        width: '90%',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    generateAnswerButton: {
        backgroundColor: COLORS.primary || '#007AFF',
    },
    explainConceptsButton: {
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderWidth: 1.5,
        borderColor: COLORS.primary || '#007AFF',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white || '#FFFFFF',
    },
    actionButtonTextAlt: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary || '#007AFF',
    },
    actionButtonIcon: {
        marginRight: 10,
    },
    actionButtonIconAlt: { // For buttons with text color matching icon
         marginRight: 10,
        //  color: COLORS.primary || '#007AFF', // Color is set on Icon directly
    },
    // END NEW Styles for initial action buttons
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
        backgroundColor:  COLORS.errorBackground || '#FFF0F0',
        borderRadius: 12,
        padding: 20, // Added more padding around error
        marginVertical: 10,
    },
    errorDetailText: {
        fontSize: 15,
        color: COLORS.errorText || COLORS.textSecondary || '#502A2A',
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
    aiResponseContainer: {
        flex: 1,
        backgroundColor: COLORS.surface || "#FFF",
        borderRadius: 10,
        overflow: 'hidden',
        minHeight: 250,
        position: 'relative',
        display: 'flex', // Use flex for column layout
        flexDirection: 'column', // Stack WebView and subsequent actions
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
        flex: 1, // WebView takes available space
        backgroundColor: 'transparent',
    },
    // NEW Styles for subsequent action buttons
    subsequentActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Or 'flex-end' or 'center'
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight || '#ECECEC',
        backgroundColor: COLORS.surfaceAlt || '#F8F8F8', // Slight contrast
    },
    actionButtonSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    regenerateButtonSmall: {
        borderColor: COLORS.primary || '#007AFF',
    },
    explainConceptsButtonSmall: {
        borderColor: COLORS.textSecondary || '#8E8E93',
    },
    showAnswerButtonSmall: {
        borderColor: COLORS.textSecondary || '#8E8E93',
    },
    actionButtonTextSmallAlt: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.primary, // Default for regenerate
    },
    // Note: For explain/show answer buttons with secondary color, icon color is set on icon directly,
    // and text color can be specific like:
    // explainConceptsButtonSmall > Text: { color: COLORS.textSecondary }
});

export default AIChatModal;