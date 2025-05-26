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
    Animated,
    Dimensions,
    Easing,
} from 'react-native';
import Icon from './Icon';
import { COLORS } from '../constants';
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';
import generateHTML from '../helpers/generateHTML';
import { askAIWithContext, REQUEST_TYPES } from '../helpers/openaiHelper';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');



const DYNAMIC_LOADING_TEXTS = [
    "🧠 AI is analyzing your question...",
    "📚 Consulting knowledge base...",
    "✨ Crafting a response...",
    "💡 Formulating insights...",
    "⏳ Just a moment more...",
];

// Enhanced PressableScale with better animations and haptic feedback
const PressableScale = ({ onPress, style, children, disabled, hapticType = 'light', scaleValue = 0.96 }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const animateIn = () => {
        if (disabled) return;
        Haptics.impactAsync(
            hapticType === 'medium' ? Haptics.ImpactFeedbackStyle.Medium :
                hapticType === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy :
                    Haptics.ImpactFeedbackStyle.Light
        );
        Animated.parallel([
            Animated.spring(scale, {
                toValue: scaleValue,
                useNativeDriver: true,
                tension: 300,
                friction: 10,
            }),
            Animated.timing(opacity, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();
    };

    const animateOut = () => {
        if (disabled) return;
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 300,
                friction: 8,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            })
        ]).start();
    };

    return (
        <Animated.View style={[{ transform: [{ scale }], opacity }, disabled && { opacity: 0.5 }]}>
            <TouchableOpacity
                onPressIn={animateIn}
                onPressOut={animateOut}
                onPress={onPress}
                style={style}
                activeOpacity={1} // Active opacity is handled by Animated.View
                disabled={disabled}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
};

// Animated loading dots component
const LoadingDots = ({ color = COLORS.primary }) => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createAnimation = (dot, delay) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 600,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.delay(600) // Wait for other dots cycle
                ])
            );

        const animations = [
            createAnimation(dot1, 0),
            createAnimation(dot2, 200),
            createAnimation(dot3, 400),
        ];

        Animated.parallel(animations).start();
    }, [dot1, dot2, dot3]);

    return (
        <View style={styles.loadingDotsContainer}>
            {[dot1, dot2, dot3].map((dot, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.loadingDot,
                        { backgroundColor: color },
                        {
                            transform: [{
                                translateY: dot.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -8],
                                })
                            }]
                        }
                    ]}
                />
            ))}
        </View>
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
    const [isActionsMenuVisible, setIsActionsMenuVisible] = useState(false); // Can be removed if not used
    const [isWebViewLoading, setIsWebViewLoading] = useState(true);

    // Enhanced animation values
    const modalSlideAnim = useRef(new Animated.Value(screenHeight)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const initialContentOpacity = useRef(new Animated.Value(0)).current;
    const initialContentTranslateY = useRef(new Animated.Value(30)).current;
    const subsequentActionsOpacity = useRef(new Animated.Value(0)).current;
    const headerScale = useRef(new Animated.Value(0.9)).current;
    const contentScale = useRef(new Animated.Value(0.95)).current;
    const progressBarAnim = useRef(new Animated.Value(0)).current;


    // Dynamic loading text rotation
    useEffect(() => {
        let textInterval;
        if (currentIsLoading) {
            setDynamicLoadingText(DYNAMIC_LOADING_TEXTS[0]);
            let currentIndex = 0;
            textInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % DYNAMIC_LOADING_TEXTS.length;
                setDynamicLoadingText(DYNAMIC_LOADING_TEXTS[currentIndex]);
            }, 2000);
        }
        return () => clearInterval(textInterval);
    }, [currentIsLoading]);

    // Loading progress bar animation
    useEffect(() => {
        if (currentIsLoading) {
            progressBarAnim.setValue(0);
            Animated.loop(
                Animated.timing(progressBarAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: false, // width animations are not supported by native driver
                })
            ).start();
        } else {
            progressBarAnim.stopAnimation(); // Stop the animation when not loading
            progressBarAnim.setValue(0); // Reset its value
        }
    }, [currentIsLoading, progressBarAnim]);


    // Enhanced modal animations
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

            // Reset animation values
            modalSlideAnim.setValue(screenHeight);
            backdropOpacity.setValue(0);
            initialContentOpacity.setValue(0);
            initialContentTranslateY.setValue(30);
            subsequentActionsOpacity.setValue(0);
            headerScale.setValue(0.9);
            contentScale.setValue(0.95);

            // Animate modal entrance
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(modalSlideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 12, // Adjusted friction for smoother spring
                }),
            ]).start(() => {
                // After modal appears, animate content
                Animated.parallel([
                    Animated.spring(headerScale, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 150,
                        friction: 10,
                    }),
                    Animated.spring(contentScale, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 120,
                        friction: 10,
                    }),
                    Animated.parallel([
                        Animated.timing(initialContentOpacity, {
                            toValue: 1,
                            duration: 400,
                            easing: Easing.out(Easing.cubic),
                            useNativeDriver: true,
                        }),
                        Animated.spring(initialContentTranslateY, {
                            toValue: 0,
                            useNativeDriver: true,
                            tension: 120,
                            friction: 10,
                        }),
                    ]),
                ]).start();
            });
        }
    }, [visible]);

    const triggerHaptic = (type = Haptics.ImpactFeedbackStyle.Light) => {
        Haptics.impactAsync(type);
    };

    const generateAndSetResponse = useCallback(async (requestedType) => {
        if (!questionItem || !subjectContext) {
            setCurrentError("Missing question or subject context to ask AI.");
            setCurrentIsLoading(false);
            setUserHasMadeChoice(true);
            return;
        }
        if (currentIsLoading) return;

        setIsActionsMenuVisible(false);
        setCurrentIsLoading(true);
        setCurrentError(null);
        setCurrentResponse(null);
        setContentType(requestedType);
        setModalTitle(requestedType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "AI Explains Concepts" : "AI Solution");
        setUserHasMadeChoice(true);
        setIsWebViewLoading(true);
        subsequentActionsOpacity.setValue(0);

        try {
            const response = await askAIWithContext(
                requestedType,
                questionItem,
                subjectContext,
                (feedbackMsg) => console.log("AI Info:", feedbackMsg)
            );
            setCurrentResponse(response);
            triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
            setCurrentError(e.message || `Failed to get AI response.`);
            setCurrentResponse(null);
            triggerHaptic(Haptics.NotificationFeedbackType.Error);
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

    // Animate subsequent actions when ready
    useEffect(() => {
        if (!isWebViewLoading && !currentIsLoading && currentResponse && userHasMadeChoice) {
            Animated.spring(subsequentActionsOpacity, {
                toValue: 1,
                useNativeDriver: true,
                tension: 120,
                friction: 8,
            }).start();
        }
    }, [isWebViewLoading, currentIsLoading, currentResponse, userHasMadeChoice, subsequentActionsOpacity]);

    // const handleCopyResponse = useCallback(async () => {
    //     setIsActionsMenuVisible(false);
    //     if (currentResponse) {
    //         try {
    //             await Clipboard.setStringAsync(currentResponse);
    //             triggerHaptic(Haptics.NotificationFeedbackType.Success);
    //             Alert.alert("✅ Copied!", "AI response copied to clipboard.");
    //         } catch (e) {
    //             triggerHaptic(Haptics.NotificationFeedbackType.Error);
    //             Alert.alert("❌ Error", "Could not copy response to clipboard.");
    //         }
    //     } else {
    //         Alert.alert("Nothing to Copy", "There is no AI response available to copy.");
    //     }
    // }, [currentResponse]);

    const markdownHTML = useMemo(() => {
        if (currentResponse) {
            return generateHTML(currentResponse);
        }
        return generateHTML("<!-- Awaiting AI Content -->");
    }, [currentResponse]);

    // const canCopy = !!currentResponse && !currentIsLoading && !currentError;
    const canRegenerate = userHasMadeChoice && !!contentType && !currentIsLoading;

    const handleCloseModal = () => {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

        // Animate modal exit
        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.spring(modalSlideAnim, {
                toValue: screenHeight,
                useNativeDriver: true,
                tension: 100,
                friction: 10, // Adjusted for smoother exit
            }),
        ]).start(() => {
            onClose();
        });
    };

    const renderInitialChoiceButtons = () => (
        <Animated.View style={[
            styles.initialActionsContainer,
            {
                opacity: initialContentOpacity,
                transform: [
                    { translateY: initialContentTranslateY },
                    { scale: contentScale }
                ]
            }
        ]}>
            <View style={styles.iconContainer}>
                <Icon name="sparkles" iconSet="Ionicons" size={48} color={COLORS.primary || '#007AFF'} />
            </View>
            <Text style={styles.initialActionsTitle}>How can AI assist you today?</Text>
            <Text style={styles.initialActionsSubtitle}>Choose an option to get started with your AI-powered learning experience</Text>

            <View style={styles.buttonsContainer}>
                <PressableScale
                    style={[styles.actionButton, styles.generateAnswerButton, currentIsLoading && styles.buttonDisabled]}
                    onPress={handleGenerateAnswer}
                    disabled={currentIsLoading}
                    hapticType="medium"
                >
                    <View style={styles.buttonIconContainer}>
                        <Icon name="chatbubble-ellipses" iconSet="Ionicons" size={20} color="white" />
                    </View>
                    <View style={styles.buttonTextContainer}>
                        <Text style={styles.actionButtonText}>Generate Answer</Text>
                        <Text style={styles.actionButtonSubtext}>Get a complete solution</Text>
                    </View>
                    <Icon name="arrow-forward" iconSet="Ionicons" size={16} color="rgba(255,255,255,0.8)" />
                </PressableScale>

                <PressableScale
                    style={[styles.actionButton, styles.explainConceptsButton, currentIsLoading && styles.buttonDisabled]}
                    onPress={handleExplainConcepts}
                    disabled={currentIsLoading}
                    hapticType="medium"
                >
                    <View style={[styles.buttonIconContainer, styles.conceptsIconContainer]}>
                        <Icon name="bulb" iconSet="Ionicons" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.buttonTextContainer}>
                        <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Explain Concepts</Text>
                        <Text style={[styles.actionButtonSubtext, { color: COLORS.textSecondary }]}>Learn the fundamentals</Text>
                    </View>
                    <Icon name="arrow-forward" iconSet="Ionicons" size={16} color={COLORS.primary + '80'} />
                </PressableScale>
            </View>
        </Animated.View>
    );

    const renderPostChoiceContent = () => {
        if (currentIsLoading) {
            return (
                <Animated.View style={[styles.stateInfoContainer, { transform: [{ scale: contentScale }] }]}>
                    <View style={styles.loadingContainer}>
                        <LoadingDots color={COLORS.primary} />
                        <Text style={styles.stateInfoText}>{dynamicLoadingText}</Text>
                        <View style={styles.progressBar}>
                            <Animated.View style={[
                                styles.progressBarFill,
                                {
                                    width: progressBarAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%']
                                    })
                                }
                            ]} />
                        </View>
                    </View>
                </Animated.View>
            );
        }

        if (currentError) {
            return (
                <Animated.View style={[styles.stateInfoContainer, styles.errorStateContainer, { transform: [{ scale: contentScale }] }]}>
                    <View style={styles.errorIconContainer}>
                        <Icon name="alert-circle" iconSet="Ionicons" size={44} color={COLORS.error || '#D32F2F'} />
                    </View>
                    <Text style={[styles.stateInfoTitle, { color: COLORS.error || '#D32F2F' }]}>Oops! Something went wrong</Text>
                    <Text style={styles.errorDetailText}>{currentError}</Text>
                    {canRegenerate && (
                        <PressableScale
                            style={styles.errorRetryButton}
                            onPress={handleRegenerateCurrentView}
                            disabled={currentIsLoading}
                            hapticType="medium"
                        >
                            <Icon name="refresh" iconSet="Ionicons" size={18} color={COLORS.error || '#D32F2F'} />
                            <Text style={styles.errorRetryButtonText}>
                                {contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "Retry Explanation" : "Retry Answer"}
                            </Text>
                        </PressableScale>
                    )}
                </Animated.View>
            );
        }

        if (currentResponse) {
            return (
                <Animated.View style={[styles.aiResponseContainer, { transform: [{ scale: contentScale }] }]}>
                    {isWebViewLoading && (
                        <View style={styles.webViewLoaderContainer}>
                            <ActivityIndicator size="large" color={COLORS.primary || '#007AFF'} />
                            <Text style={styles.webViewLoaderText}>Formatting response...</Text>
                        </View>
                    )}
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: markdownHTML }}
                        style={[styles.webView, { opacity: isWebViewLoading ? 0.3 : 1 }]}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        mixedContentMode="compatibility"
                        setSupportMultipleWindows={false}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        onLoadEnd={() => {
                            setIsWebViewLoading(false);
                            triggerHaptic();
                        }}
                        onError={({ nativeEvent }) => {
                            console.error('Chat WebView error:', nativeEvent);
                            setIsWebViewLoading(false);
                            setCurrentError("Error displaying AI response. Content might be malformed. Try regenerating.");
                        }}
                    />
                    <Animated.View style={[styles.subsequentActionsContainer, { opacity: subsequentActionsOpacity }]}>
                        {canRegenerate && (
                            <PressableScale
                                style={[styles.actionButtonSmall, styles.regenerateButtonSmall, currentIsLoading && styles.buttonDisabled]}
                                onPress={handleRegenerateCurrentView}
                                disabled={currentIsLoading}
                                hapticType="light"
                            >
                                <Icon name="refresh" iconSet="Ionicons" size={16} color={COLORS.primary} />
                                <Text style={[styles.actionButtonTextSmall, { color: COLORS.primary }]}>
                                    {contentType === REQUEST_TYPES.SOLVE_QUESTION ? "Regenerate" : "Regen. Concepts"}
                                </Text>
                            </PressableScale>
                        )}
                        {contentType === REQUEST_TYPES.SOLVE_QUESTION && (
                            <PressableScale
                                style={[styles.actionButtonSmall, styles.switchButtonSmall, currentIsLoading && styles.buttonDisabled]}
                                onPress={handleExplainConcepts}
                                disabled={currentIsLoading}
                                hapticType="light"
                            >
                                <Icon name="bulb-outline" iconSet="Ionicons" size={16} color={COLORS.textSecondary} />
                                <Text style={[styles.actionButtonTextSmall, { color: COLORS.textSecondary }]}>Concepts</Text>
                            </PressableScale>
                        )}
                        {contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS && (
                            <PressableScale
                                style={[styles.actionButtonSmall, styles.switchButtonSmall, currentIsLoading && styles.buttonDisabled]}
                                onPress={handleGenerateAnswer}
                                disabled={currentIsLoading}
                                hapticType="light"
                            >
                                <Icon name="chatbubble-ellipses-outline" iconSet="Ionicons" size={16} color={COLORS.textSecondary} />
                                <Text style={[styles.actionButtonTextSmall, { color: COLORS.textSecondary }]}>Answer</Text>
                            </PressableScale>
                        )}
                        {/* {canCopy && (
                            <PressableScale
                                style={[styles.actionButtonSmall, styles.copyButtonSmall]}
                                onPress={handleCopyResponse}
                                hapticType="light"
                            >
                                <Icon name="copy-outline" iconSet="Ionicons" size={16} color={COLORS.textSecondary} />
                                <Text style={[styles.actionButtonTextSmall, {color: COLORS.textSecondary}]}>Copy</Text>
                            </PressableScale>
                        )} */}
                    </Animated.View>
                </Animated.View>
            );
        }

        return (
            <Animated.View style={[styles.stateInfoContainer, { transform: [{ scale: contentScale }] }]}>
                <Icon name="information-circle-outline" iconSet="Ionicons" size={48} color={COLORS.textDisabled || '#AEAEB2'} />
                <Text style={styles.stateInfoText}>Please select an action to proceed.</Text>
            </Animated.View>
        );
    };

    return (
        <Modal
            animationType="none" // Handled by Animated views
            transparent={true}
            visible={visible}
            onRequestClose={handleCloseModal}
        >
            <Animated.View style={[styles.modalOverlay, { opacity: backdropOpacity }]}>
                <Animated.View style={[
                    styles.modalView,
                    {
                        transform: [{ translateY: modalSlideAnim }]
                    }
                ]}>
                    <Animated.View style={[styles.modalHeader, { transform: [{ scale: headerScale }] }]}>
                        <View style={styles.modalTitleContainer}>
                            <View style={styles.titleIconContainer}>
                                <Icon
                                    iconSet={
                                        contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "MaterialCommunityIcons"
                                            : contentType === REQUEST_TYPES.SOLVE_QUESTION ? "MaterialCommunityIcons"
                                                : "Ionicons"
                                    }
                                    name={
                                        contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS ? "brain"
                                            : contentType === REQUEST_TYPES.SOLVE_QUESTION ? "robot-happy-outline"
                                                : "sparkles"
                                    }
                                    size={24}
                                    color={COLORS.primary || '#007AFF'}
                                />

                            </View>
                            <Text style={styles.modalTitle} numberOfLines={1}>{modalTitle}</Text>
                        </View>
                        <View style={styles.headerRightActions}>
                            <PressableScale
                                onPress={handleCloseModal}
                                style={styles.headerIconButton}
                                hapticType="medium"
                                scaleValue={0.9}
                            >
                                <Icon iconSet="Ionicons" name="close-circle" size={28} color={COLORS.textSecondary || '#8E8E93'} />
                            </PressableScale>
                        </View>
                    </Animated.View>

                    <ScrollView
                        style={styles.contentScrollView}
                        contentContainerStyle={styles.contentScrollContainer}
                        showsVerticalScrollIndicator={false} // Can be true if preferred
                        keyboardShouldPersistTaps="handled"
                        bounces={true} // For iOS-like bounce
                    >
                        {!userHasMadeChoice ? renderInitialChoiceButtons() : renderPostChoiceContent()}
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
});

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', // Slightly darker for better contrast
        justifyContent: 'flex-end',
    },
    modalView: {
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderTopLeftRadius: 32, // More pronounced modern radius
        borderTopRightRadius: 32,
        height: Platform.OS === 'ios' ? '95%' : '93%', // Taller modal
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -12 }, // Stronger shadow for depth
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 50,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Platform.OS === 'ios' ? 18 : 20, // Increased padding
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight || '#F0F0F0',
        minHeight: 70, // Ensure enough space for larger title/icons
        backgroundColor: COLORS.surface || '#FFFFFF', // Ensure header bg
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Allow title to take available space
    },
    titleIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: (COLORS.primary || '#007AFF') + '10', // Light primary bg for icon
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    modalTitle: {
        fontSize: 20, // Slightly larger
        fontWeight: '700', // Bolder title
        color: COLORS.text || '#1A1A1A',
        letterSpacing: -0.3, // iOS-like letter spacing
    },
    headerRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIconButton: {
        padding: 8, // Good touch area
        borderRadius: 20,
    },
    contentScrollView: {
        flex: 1,
    },
    contentScrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 32, // More top padding for content
        paddingBottom: 40, // Ample bottom padding
    },
    initialActionsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 60, // Push buttons up a bit from the bottom edge
    },
    iconContainer: { // For the large "sparkles" icon
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: (COLORS.primary || '#007AFF') + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    initialActionsTitle: {
        fontSize: 24, // Larger, more prominent title
        fontWeight: '700',
        color: COLORS.text || '#1A1A1A',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    initialActionsSubtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: COLORS.textSecondary || '#666666',
        textAlign: 'center',
        marginBottom: 40, // More space before buttons
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    buttonsContainer: { // Container for the two main action buttons
        width: '100%',
        maxWidth: 380, // Max width for larger screens
        gap: 16, // Spacing between buttons
    },
    actionButton: { // Common style for initial large buttons
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20, // Generous padding
        paddingHorizontal: 24,
        borderRadius: 16, // Modern rounded corners
        width: '100%',
    },
    generateAnswerButton: {
        backgroundColor: COLORS.primary || '#007AFF',
        shadowColor: COLORS.primary || '#007AFF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    explainConceptsButton: {
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderWidth: 2,
        borderColor: (COLORS.primary || '#007AFF') + '20', // Light border for subtle definition
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    buttonIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)', // For primary button
        alignItems: 'center',
        justifyContent: 'center',
    },
    conceptsIconContainer: {
        backgroundColor: (COLORS.primary || '#007AFF') + '15', // For secondary button
    },
    buttonTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    actionButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white', // Default for primary button
        marginBottom: 2,
    },
    actionButtonSubtext: {
        fontSize: 14,
        fontWeight: '400',
        color: 'rgba(255,255,255,0.8)', // Default for primary button
    },
    buttonDisabled: { // Common style for disabled buttons
        opacity: 0.6, // Overridden by PressableScale's disabled style
    },
    stateInfoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 300, // Ensure it takes up some space
    },
    loadingContainer: { // Specific container for loading elements
        alignItems: 'center',
        width: '100%',
    },
    loadingDotsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    loadingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    progressBar: {
        height: 4,
        width: '70%', // Or a fixed width like 150
        backgroundColor: COLORS.borderLight || '#E0E0E0',
        borderRadius: 2,
        marginTop: 15,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary || '#007AFF',
        borderRadius: 2,
    },
    stateInfoText: {
        marginTop: 20,
        fontSize: 16,
        color: COLORS.textSecondary || '#718096',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 23,
    },
    errorStateContainer: { // For error specific styling within stateInfoContainer
        backgroundColor: (COLORS.error || '#D32F2F') + '10', // Light error bg
        borderRadius: 16,
        paddingVertical: 30,
    },
    errorIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: (COLORS.error || '#D32F2F') + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    stateInfoTitle: { // Used for error title
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    errorDetailText: {
        fontSize: 15,
        color: COLORS.textSecondary || '#4A5568',
        textAlign: 'center',
        marginBottom: 25,
        paddingHorizontal: 10,
        lineHeight: 21,
    },
    errorRetryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25, // Pill shape
        borderColor: COLORS.error || '#D32F2F',
        borderWidth: 1.5,
        backgroundColor: 'transparent', // Or very light error color
        marginTop: 15,
        gap: 8,
    },
    errorRetryButtonText: {
        color: COLORS.error || '#D32F2F',
        fontSize: 15,
        fontWeight: '600',
    },
    aiResponseContainer: {
        flex: 1,
        backgroundColor: COLORS.surfaceAlt2 || '#F9F9F9', // Light grey for response area
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 300, // Ensure it takes visible space
        display: 'flex',
        flexDirection: 'column',
    },
    webViewLoaderContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: (COLORS.surfaceAlt2 || '#F9F9F9') + 'E6', // Semi-transparent overlay
        zIndex: 10, // Above WebView
    },
    webViewLoaderText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    webView: {
        flex: 1,
        backgroundColor: 'transparent', // WebView itself is transparent
    },
    subsequentActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight || '#ECECEC',
        backgroundColor: COLORS.surface || '#FFFFFF', // Match modal main bg
    },
    actionButtonSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        flex: 1, // Allow flex grow/shrink for responsiveness
        marginHorizontal: 5,
        maxWidth: Platform.OS === 'ios' ? 170 : 160, // Max width for small buttons
        gap: 6,
    },
    regenerateButtonSmall: {
        backgroundColor: (COLORS.primary || '#007AFF') + '10', // Light primary bg
        borderColor: (COLORS.primary || '#007AFF') + '30', // Softer border
        borderWidth: 1.2,
    },
    switchButtonSmall: {
        backgroundColor: COLORS.surfaceAlt || '#E9ECEF', // Light grey
        borderColor: COLORS.border || '#D1D1D6',
        borderWidth: 1.2,
    },
    // copyButtonSmall: { // Added style for copy button
    //     backgroundColor: COLORS.surfaceAlt || '#E9ECEF',
    //     borderColor: COLORS.border || '#D1D1D6',
    //     borderWidth: 1.2,
    // },
    actionButtonTextSmall: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default AIChatModal;