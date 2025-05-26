// src/components/AIChatModal.js
import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
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
    Animated, // Using Animated for simpler animations first
} from 'react-native';
import Icon from './Icon';
import { COLORS } from '../constants';
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';
import generateHTML from '../helpers/generateHTML';
import { askAIWithContext, REQUEST_TYPES } from '../helpers/openaiHelper';
import * as Haptics from 'expo-haptics'; // Import Haptics

const DYNAMIC_LOADING_TEXTS = [
    "AI is analyzing your question...",
    "Consulting knowledge base...",
    "Crafting a response...",
    "Formulating insights...",
    "Just a moment more...",
];

// Simple PressableScale component for button feedback
const PressableScale = ({ onPress, style, children, disabled }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        if (disabled) return;
        Animated.spring(scaleValue, {
            toValue: 0.97,
            useNativeDriver: true,
            bounciness: 10,
        }).start();
    };

    const onPressOut = () => {
        if (disabled) return;
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={onPress}
                style={style}
                activeOpacity={0.8} // Adjust activeOpacity
                disabled={disabled}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
};


const AIChatModal = React.memo(({
    visible,
    onClose,
    questionItem,
    subjectContext,
}) => {
    const [contentType, setContentType] = useState(null);
    const [currentResponse, setCurrentResponse] = useState(null);
    const [currentIsLoading, setCurrentIsLoading] = useState(false);
    const [currentError, setCurrentError] = useState(null);
    const [modalTitle, setModalTitle] = useState("AI Assistant");
    const [userHasMadeChoice, setUserHasMadeChoice] = useState(false);
    const [dynamicLoadingText, setDynamicLoadingText] = useState(DYNAMIC_LOADING_TEXTS[0]);

    const [isActionsMenuVisible, setIsActionsMenuVisible] = useState(false);
    const [isWebViewLoading, setIsWebViewLoading] = useState(true);

    // Animation values
    const initialContentOpacity = useRef(new Animated.Value(0)).current;
    const initialContentTranslateY = useRef(new Animated.Value(20)).current;
    const subsequentActionsOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let textInterval;
        if (currentIsLoading) {
            setDynamicLoadingText(DYNAMIC_LOADING_TEXTS[0]); // Reset to first
            let currentIndex = 0;
            textInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % DYNAMIC_LOADING_TEXTS.length;
                setDynamicLoadingText(DYNAMIC_LOADING_TEXTS[currentIndex]);
            }, 2500); // Change text every 2.5 seconds
        }
        return () => clearInterval(textInterval);
    }, [currentIsLoading]);

    useEffect(() => {
        if (visible) {
            // Reset states
            setContentType(null);
            setCurrentResponse(null);
            setCurrentIsLoading(false);
            setCurrentError(null);
            setModalTitle("AI Assistant");
            setUserHasMadeChoice(false);
            setIsWebViewLoading(true);
            setIsActionsMenuVisible(false);
            setDynamicLoadingText(DYNAMIC_LOADING_TEXTS[0]);

            // Reset and start entry animation for initial choices
            initialContentOpacity.setValue(0);
            initialContentTranslateY.setValue(20);
            Animated.parallel([
                Animated.timing(initialContentOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(initialContentTranslateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
            subsequentActionsOpacity.setValue(0); // Reset subsequent actions
        }
    }, [visible, initialContentOpacity, initialContentTranslateY, subsequentActionsOpacity]);

    const triggerHaptic = (type = Haptics.ImpactFeedbackStyle.Light) => {
        Haptics.impactAsync(type);
    };

    const generateAndSetResponse = useCallback(async (requestedType) => {
        if (!questionItem || !subjectContext) {
            // ... (error handling)
            setCurrentError("Missing question or subject context to ask AI.");
            setCurrentIsLoading(false);
            setUserHasMadeChoice(true);
            return;
        }
        if (currentIsLoading) return;
        triggerHaptic(); // Haptic on action start

        setIsActionsMenuVisible(false);
        setCurrentIsLoading(true);
        setCurrentError(null);
        setCurrentResponse(null); // Clear previous response
        setContentType(requestedType);
        setModalTitle(requestedType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "AI Explains Concepts" : "AI Solution");
        setUserHasMadeChoice(true);
        setIsWebViewLoading(true); // For the WebView content itself
        subsequentActionsOpacity.setValue(0); // Hide subsequent actions during new load

        try {
            const response = await askAIWithContext(
                requestedType,
                questionItem,
                subjectContext,
                (feedbackMsg) => console.log("AI Info:", feedbackMsg)
            );
            setCurrentResponse(response);
        } catch (e) {
            setCurrentError(e.message || `Failed to get AI response.`);
            setCurrentResponse(null);
        } finally {
            setCurrentIsLoading(false);
        }
    }, [questionItem, subjectContext, currentIsLoading, subsequentActionsOpacity]);

    const handleGenerateAnswer = useCallback(() => {
        generateAndSetResponse(REQUEST_TYPES.SOLVE_QUESTION);
    }, [generateAndSetResponse]);

    const handleExplainConcepts = useCallback(() => {
        generateAndSetResponse(REQUEST_TYPES.EXPLAIN_CONCEPTS);
    }, [generateAndSetResponse]);

    const handleRegenerateCurrentView = useCallback(() => {
        if (contentType) {
            generateAndSetResponse(contentType);
        }
    }, [contentType, generateAndSetResponse]);

    useEffect(() => {
        // Animate in subsequent actions when WebView is loaded and not loading AI
        if (!isWebViewLoading && !currentIsLoading && currentResponse && userHasMadeChoice) {
            Animated.timing(subsequentActionsOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isWebViewLoading, currentIsLoading, currentResponse, userHasMadeChoice, subsequentActionsOpacity]);


    const handleCopyResponse = useCallback(async () => {
        triggerHaptic();
        // ... (rest of copy logic)
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
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        onClose();
    };

    const renderInitialChoiceButtons = () => (
        <Animated.View style={[
            styles.initialActionsContainer,
            { opacity: initialContentOpacity, transform: [{ translateY: initialContentTranslateY }] }
        ]}>
            <Icon name="help-circle-outline" iconSet="Ionicons" size={60} color={COLORS.textDisabled || '#AEAEB2'} style={{marginBottom: 15}} />
            <Text style={styles.initialActionsTitle}>How can AI assist you?</Text>
            <PressableScale
                style={[styles.actionButton, styles.generateAnswerButton, currentIsLoading && styles.buttonDisabled, {gap: "5"}]}
                onPress={handleGenerateAnswer}
                disabled={currentIsLoading}
            >
                <Icon name="chatbubble-ellipses-outline" iconSet="Ionicons" size={22} color="white" style={styles.actionButtonIcon} />
                <Text style={styles.actionButtonText}>Generate Answer</Text>
            </PressableScale>
            <PressableScale
                style={[styles.actionButton, styles.explainConceptsButton, currentIsLoading && styles.buttonDisabled, {gap:'5'}]}
                onPress={handleExplainConcepts}
                disabled={currentIsLoading}
            >
                <Icon name="bulb-outline" iconSet="Ionicons" size={22} color={COLORS.primary} style={styles.actionButtonIcon} />
                <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Explain Concepts</Text>
            </PressableScale>
        </Animated.View>
    );

    const renderPostChoiceContent = () => {
        if (currentIsLoading) {
            return (
                <View style={styles.stateInfoContainer}>
                    <ActivityIndicator size={Platform.OS === 'ios' ? "large" : 60} color={COLORS.primary || '#007AFF'} />
                    <Text style={styles.stateInfoText}>{dynamicLoadingText}</Text>
                </View>
            );
        }

        if (currentError) {
            return (
                // ... (error rendering, unchanged for now but can be animated too)
                <View style={[styles.stateInfoContainer, styles.errorStateContainer]}>
                    <Icon name="alert-circle-outline" iconSet="Ionicons" size={50} color={COLORS.error || '#D32F2F'} />
                    <Text style={[styles.stateInfoTitle, { color: COLORS.error || '#D32F2F' }]}>Oops! An Error Occurred</Text>
                    <Text style={styles.errorDetailText}>{currentError}</Text>
                    {canRegenerate && (
                        <PressableScale style={styles.errorRetryButton} onPress={handleRegenerateCurrentView} disabled={currentIsLoading}>
                            <Icon name="refresh-outline" iconSet="Ionicons" size={20} color={COLORS.error || '#D32F2F'} style={styles.actionButtonIcon} />
                            <Text style={styles.errorRetryButtonText}>
                                {contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "Retry Explanation" : "Retry Answer"}
                            </Text>
                        </PressableScale>
                    )}
                </View>
            );
        }

        if (currentResponse) {
            return (
                <View style={styles.aiResponseContainer}>
                    {isWebViewLoading && (
                        <View style={styles.webViewLoaderContainer}>
                             <ActivityIndicator size="large" color={COLORS.primary || '#007AFF'} />
                            <Text style={styles.webViewLoaderText}>Loading formatted response...</Text>
                        </View>
                    )}
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: markdownHTML }}
                        style={[styles.webView, { opacity: isWebViewLoading ? 0.3 : 1 }]} // Keep slightly visible while loading
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        mixedContentMode="compatibility"
                        setSupportMultipleWindows={false}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        onLoadEnd={() => {setIsWebViewLoading(false); triggerHaptic();}}
                        onError={({ nativeEvent }) => {
                            /* ... error handling ... */
                            console.error('Chat WebView error:', nativeEvent);
                            setIsWebViewLoading(false);
                            setCurrentError("Error displaying AI response. Content might be malformed. Try regenerating.");
                        }}
                    />
                    <Animated.View style={[styles.subsequentActionsContainer, { opacity: subsequentActionsOpacity }]}>
                        {canRegenerate && ( // Ensure canRegenerate is true
                            <PressableScale
                                style={[styles.actionButtonSmall, styles.regenerateButtonSmall, currentIsLoading && styles.buttonDisabled]}
                                onPress={handleRegenerateCurrentView}
                                disabled={currentIsLoading}
                            >
                                <Icon name="reload-circle-outline" iconSet="Ionicons" size={18} color={COLORS.primary} style={styles.actionButtonIconSmall} />
                                <Text style={[styles.actionButtonTextSmall, {color: COLORS.primary}]}>
                                    {contentType === REQUEST_TYPES.SOLVE_QUESTION ? "Regenerate" : "Regen. Concepts"}
                                </Text>
                            </PressableScale>
                        )}
                         {contentType === REQUEST_TYPES.SOLVE_QUESTION && (
                            <PressableScale
                                style={[styles.actionButtonSmall, styles.switchButtonSmall, currentIsLoading && styles.buttonDisabled]}
                                onPress={handleExplainConcepts}
                                disabled={currentIsLoading}
                            >
                                <Icon name="bulb-outline" iconSet="Ionicons" size={18} color={COLORS.textSecondary} style={styles.actionButtonIconSmall} />
                                <Text style={[styles.actionButtonTextSmall, {color: COLORS.textSecondary}]}>Concepts</Text>
                            </PressableScale>
                         )}
                         {contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS && (
                            <PressableScale
                                style={[styles.actionButtonSmall, styles.switchButtonSmall, currentIsLoading && styles.buttonDisabled]}
                                onPress={handleGenerateAnswer}
                                disabled={currentIsLoading}
                            >
                                 <Icon name="chatbubble-ellipses-outline" iconSet="Ionicons" size={18} color={COLORS.textSecondary} style={styles.actionButtonIconSmall} />
                                 <Text style={[styles.actionButtonTextSmall, {color: COLORS.textSecondary}]}>Answer</Text>
                             </PressableScale>
                         )}
                    </Animated.View>
                </View>
            );
        }
        return (
            <View style={styles.stateInfoContainer}>
                <Icon name="information-circle-outline" iconSet="Ionicons" size={48} color={COLORS.textDisabled || '#AEAEB2'} />
                <Text style={styles.stateInfoText}>Please select an action to proceed.</Text>
            </View>
        );
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
                        {/* ... Header content ... */}
                        <View style={styles.modalTitleContainer}>
                            <Icon
                                iconSet="MaterialCommunityIcons"
                                name={
                                    contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "brain"
                                    : contentType === REQUEST_TYPES.SOLVE_QUESTION ? "robot-happy-outline"
                                    : "help-circle-outline"
                                }
                                size={22}
                                color={COLORS.primary || '#007AFF'}
                                style={styles.modalTitleIcon}
                            />
                            <Text style={styles.modalTitle} numberOfLines={1}>{modalTitle}</Text>
                        </View>
                        <View style={styles.headerRightActions}>
                            
                            <PressableScale onPress={handleCloseModal} style={[styles.headerIconButton, styles.modalCloseButton, !canCopy && { marginLeft: 'auto' }]}>
                                <Icon iconSet="Ionicons" name="close-circle" size={28} color={COLORS.textSecondary || '#8E8E93'} />
                            </PressableScale>
                        </View>
                    </View>

                    <ScrollView
                        style={styles.contentScrollView}
                        contentContainerStyle={styles.contentScrollContainer}
                        showsVerticalScrollIndicator={true}
                        keyboardShouldPersistTaps="handled" // Important for pressable items in scrollview
                    >
                        {!userHasMadeChoice ? renderInitialChoiceButtons() : renderPostChoiceContent()}
                    </ScrollView>
                </View>
                {isActionsMenuVisible && (
                    <Pressable
                        style={styles.fullScreenMenuBackdrop}
                        onPress={() => {setIsActionsMenuVisible(false); triggerHaptic();}} // Close menu on backdrop press
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
});

const styles = StyleSheet.create({
    // ... (previous styles)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)', // Slightly darker overlay
        justifyContent: 'flex-end',
    },
    modalView: {
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderTopLeftRadius: 28, // More pronounced radius
        borderTopRightRadius: 28,
        height: Platform.OS === 'ios' ? '94%' : '92%', // Slightly taller
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -8 }, // Stronger shadow
        shadowOpacity: 0.25,
        shadowRadius: 18,
        elevation: 40,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Platform.OS === 'ios' ? 14 : 16, // More padding
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight || '#ECECEC',
        minHeight: 60,
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    modalTitle: {
        fontSize: 19, // Slightly larger
        fontWeight: '600',
        color: COLORS.text || '#1A1A1A',
    },
    headerRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIconButton: {
        padding: 10, // Larger touch area
        borderRadius: 20, // Make it circular if desired
    },
    moreOptionsMenu: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 48 : 52,
        right: 10,
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 12,
        zIndex: 200,
        minWidth: 190,
        borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
        borderColor: COLORS.borderUltraLight || '#F0F0F0',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 18,
    },
    menuItemIcon: {
        marginRight: 14,
    },
    menuItemText: {
        fontSize: 16,
        color: COLORS.text || '#000000',
    },
    contentScrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20, // More horizontal padding
        paddingTop: 28,
        paddingBottom: 35,
    },
    initialActionsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    initialActionsTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: COLORS.textSecondary || '#4A5568',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 25,
    },
    actionButton: { // Common style for initial buttons
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16, // Good height
        paddingHorizontal: 24,
        borderRadius: 14, // Modern radius
        width: '100%',
        maxWidth: 340,
        marginBottom: 20, // More space between buttons
        // shadow properties defined per button type for color matching
    },
    generateAnswerButton: {
        backgroundColor: COLORS.primary || '#007AFF',
        shadowColor: COLORS.primary || '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
    },
    explainConceptsButton: {
        backgroundColor: COLORS.surfaceAlt || '#E9ECEF',
        // For bordered style:
        // backgroundColor: COLORS.white,
        // borderWidth: 1.5,
        // borderColor: COLORS.primary,
        shadowColor: '#000000', // Neutral shadow for lighter button
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white'
    },
    actionButtonIcon: {
        marginRight: 12,
    },
    buttonDisabled: { // Style for disabled buttons
        opacity: 0.6,
    },
    stateInfoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 250,
    },
    stateInfoText: {
        marginTop: 20,
        fontSize: 16,
        color: COLORS.textSecondary || '#718096',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 23,
    },
    // ... (errorStateContainer, errorDetailText, errorRetryButton mostly same, can also use PressableScale)
    errorRetryButton: { // Ensure it's pressable scale compatible
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 25,
        borderColor: COLORS.error || '#D32F2F',
        borderWidth: 1.5,
        backgroundColor: 'transparent',
        marginTop: 15,
    },
    aiResponseContainer: {
        flex: 1,
        backgroundColor: COLORS.surface || "#FFF",
        borderRadius: 12, // Consistent radius
        overflow: 'hidden',
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
    },
    webViewLoaderContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)', // More opaque
        zIndex: 1,
    },
    webViewLoaderText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    webView: {
        flex: 1,
        backgroundColor: 'transparent',
        // Opacity transition handled by Animated.View if we wrap it, or directly on style
    },
    subsequentActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Good for 2-3 buttons
        alignItems: 'center',
        paddingVertical: 14, // More padding
        paddingHorizontal: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight || '#ECECEC',
        backgroundColor: COLORS.surfaceAlt2 || '#F9F9F9',
    },
    actionButtonSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 9,
        paddingHorizontal: 10, // Adjusted for potentially shorter text
        borderRadius: 10,
        flex: 1, // Allow flex grow/shrink
        marginHorizontal: 6,
        maxWidth: Platform.OS === 'ios' ? 170 : 160, // Max width adjustment
    },
    regenerateButtonSmall: {
         backgroundColor: 'transparent',
         borderColor: COLORS.primaryLight || '#AED6F1',
         borderWidth: 1.2, // Slightly thinner border
    },
    switchButtonSmall: {
        backgroundColor: 'transparent',
        borderColor: COLORS.border || '#D1D1D6',
        borderWidth: 1.2,
    },
    actionButtonTextSmall: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center', // Center text if it wraps
    },
    actionButtonIconSmall: {
        marginRight: 8,
    },
});

export default AIChatModal;