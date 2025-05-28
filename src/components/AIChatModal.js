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
    Alert,
    Pressable,
    Animated,
    Dimensions,
    Easing,
} from 'react-native';
import Icon from './Icon';
import { COLORS } from '../constants';
import { WebView } from 'react-native-webview';
// import * as Clipboard from 'expo-clipboard'; // Not used directly in this file
import generateHTML from '../helpers/generateHTML';
import { askAIWithContext, REQUEST_TYPES } from '../helpers/openaiHelper';
import GlobalLoadingIndicator from './GlobalLoadingIndicator'; // Import the new component
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const IS_YOUTUBE_ENABLED = false; // Control YouTube feature

const DYNAMIC_LOADING_TEXTS = [
    "🧠 AI is analyzing your question...",
    "📚 Consulting knowledge base...",
    "✨ Crafting a response...",
    "💡 Formulating insights...",
    "⏳ Just a moment more...",
];

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
                activeOpacity={1}
                disabled={disabled}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
};

const LoadingDots = ({ color = COLORS.primary }) => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;
    const animationRef = useRef(null); // Ref to store the animation instance

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
                    Animated.delay(600)
                ])
            );

        animationRef.current = Animated.parallel([
            createAnimation(dot1, 0),
            createAnimation(dot2, 200),
            createAnimation(dot3, 400),
        ]);
        animationRef.current.start();

        return () => {
            if (animationRef.current) {
                animationRef.current.stop();
            }
        };
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
    const [aiTextResponse, setAiTextResponse] = useState(null);
    const [currentIsLoading, setCurrentIsLoading] = useState(false);
    const [currentError, setCurrentError] = useState(null);
    const [modalTitle, setModalTitle] = useState("AI Assistant");
    const [userHasMadeChoice, setUserHasMadeChoice] = useState(false);
    const [dynamicLoadingText, setDynamicLoadingText] = useState(DYNAMIC_LOADING_TEXTS[0]);
    const [isWebViewLoading, setIsWebViewLoading] = useState(true);

    const modalSlideAnim = useRef(new Animated.Value(screenHeight)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const initialContentOpacity = useRef(new Animated.Value(0)).current;
    const initialContentTranslateY = useRef(new Animated.Value(30)).current;
    const subsequentActionsOpacity = useRef(new Animated.Value(0)).current;
    const headerScale = useRef(new Animated.Value(0.9)).current;
    const contentScale = useRef(new Animated.Value(0.95)).current;
    const progressBarAnim = useRef(new Animated.Value(0)).current;
    
    const progressBarAnimationRef = useRef(null);
    const subsequentActionsAnimationRef = useRef(null);


    const isMountedRef = useRef(false); // Initially false, set to true when visible

    useEffect(() => {
        // This effect primarily handles setting up isMountedRef
        // and cleaning up when the component truly unmounts.
        if (visible) {
            isMountedRef.current = true;
        }
        return () => {
            isMountedRef.current = false;
            // Stop any pending animations on unmount
            if (progressBarAnimationRef.current) progressBarAnimationRef.current.stop();
            if (subsequentActionsAnimationRef.current) subsequentActionsAnimationRef.current.stop();
        };
    }, [visible]); // Re-evaluate if visible changes, crucial for re-mount if modal is re-shown


    useEffect(() => {
        let textInterval;
        if (currentIsLoading) {
            if (isMountedRef.current) setDynamicLoadingText(DYNAMIC_LOADING_TEXTS[0]);
            let currentIndex = 0;
            textInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % DYNAMIC_LOADING_TEXTS.length;
                if (isMountedRef.current) {
                    setDynamicLoadingText(DYNAMIC_LOADING_TEXTS[currentIndex]);
                }
            }, 2000);
        }
        return () => clearInterval(textInterval);
    }, [currentIsLoading]);

    useEffect(() => {
        if (currentIsLoading) {
            progressBarAnim.setValue(0);
            progressBarAnimationRef.current = Animated.loop(
                Animated.timing(progressBarAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: false,
                })
            );
            progressBarAnimationRef.current.start();
        } else {
            if (progressBarAnimationRef.current) {
                progressBarAnimationRef.current.stop();
            }
            progressBarAnim.setValue(0);
        }
        return () => {
            if (progressBarAnimationRef.current) {
                progressBarAnimationRef.current.stop();
            }
        };
    }, [currentIsLoading, progressBarAnim]);

    useEffect(() => {
        // This effect handles the modal's entrance and exit animations based on `visible`
        let entranceAnimParallel;
        let contentEntranceAnimParallel;

        if (visible) {
            isMountedRef.current = true; // Ensure it's true when modal is set to be visible

            // Reset states
            setContentType(null);
            setAiTextResponse(null);
            setCurrentIsLoading(false);
            setCurrentError(null);
            setModalTitle("AI Assistant");
            setUserHasMadeChoice(false);
            setIsWebViewLoading(true);
            setDynamicLoadingText(DYNAMIC_LOADING_TEXTS[0]);

            // Reset animation values
            modalSlideAnim.setValue(screenHeight);
            backdropOpacity.setValue(0);
            initialContentOpacity.setValue(0);
            initialContentTranslateY.setValue(30);
            subsequentActionsOpacity.setValue(0); // Reset this explicitly
            headerScale.setValue(0.9);
            contentScale.setValue(0.95);

            entranceAnimParallel = Animated.parallel([
                Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(modalSlideAnim, { toValue: 0, useNativeDriver: true, tension: 100, friction: 12 }),
            ]);
            
            entranceAnimParallel.start(() => {
                if (isMountedRef.current) {
                    contentEntranceAnimParallel = Animated.parallel([
                        Animated.spring(headerScale, { toValue: 1, useNativeDriver: true, tension: 150, friction: 10 }),
                        Animated.spring(contentScale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 10 }),
                        Animated.timing(initialContentOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                        Animated.spring(initialContentTranslateY, { toValue: 0, useNativeDriver: true, tension: 120, friction: 10 }),
                    ]);
                    contentEntranceAnimParallel.start();
                }
            });
        }
        // No 'else' block here for hiding, as `handleCloseModal` manages the exit animation.
        // `onRequestClose` or a direct parent prop change to `visible=false` should trigger `handleCloseModal` or similar logic.

        return () => {
            // Cleanup for animations if the component unmounts unexpectedly OR if visible changes
            if (entranceAnimParallel) entranceAnimParallel.stop();
            if (contentEntranceAnimParallel) contentEntranceAnimParallel.stop();
        };
    }, [visible]); // Re-run only when `visible` prop changes


    const triggerHaptic = (type = Haptics.ImpactFeedbackStyle.Light) => {
        Haptics.impactAsync(type);
    };

    const generateAndSetResponse = useCallback(async (requestedType) => {
        if (!isMountedRef.current) return; 

        if (!questionItem || !subjectContext) {
            setCurrentError("Missing question or subject context to ask AI.");
            setCurrentIsLoading(false);
            setUserHasMadeChoice(true);
            return;
        }
        if (currentIsLoading) return;

        setCurrentIsLoading(true);
        setCurrentError(null);
        setAiTextResponse(null);
        setContentType(requestedType);
        setUserHasMadeChoice(true);
        setIsWebViewLoading(true);
        if (subsequentActionsAnimationRef.current) subsequentActionsAnimationRef.current.stop();
        subsequentActionsOpacity.setValue(0);

        if (requestedType === REQUEST_TYPES.EXPLAIN_CONCEPTS) {
            setModalTitle("AI Explains Concepts");
        } else {
            setModalTitle("AI Solution");
        }
        
        try {
            const response = await askAIWithContext(
                requestedType,
                questionItem,
                subjectContext,
                (feedbackMsg) => console.log("AI Info:", feedbackMsg) // This feedback is just console log
            );

            if (!isMountedRef.current) return;

            if (requestedType === REQUEST_TYPES.SOLVE_QUESTION || requestedType === REQUEST_TYPES.EXPLAIN_CONCEPTS) {
                setAiTextResponse(response);
            }
            triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
            if (isMountedRef.current) {
                setCurrentError(e.message || `Failed to get AI response.`);
                triggerHaptic(Haptics.NotificationFeedbackType.Error);
            }
        } finally {
            if (isMountedRef.current) {
                setCurrentIsLoading(false);
            }
        }
    }, [questionItem, subjectContext, currentIsLoading, subsequentActionsOpacity, contentType]);

    const handleGenerateAnswer = useCallback(() => generateAndSetResponse(REQUEST_TYPES.SOLVE_QUESTION), [generateAndSetResponse]);
    const handleExplainConcepts = useCallback(() => generateAndSetResponse(REQUEST_TYPES.EXPLAIN_CONCEPTS), [generateAndSetResponse]);
    const handleRegenerateCurrentView = useCallback(() => {
        if (contentType) generateAndSetResponse(contentType);
    }, [contentType, generateAndSetResponse]);

    useEffect(() => {
        if (isMountedRef.current && !isWebViewLoading && !currentIsLoading && (aiTextResponse || youtubeSearchUrl) && userHasMadeChoice) {
            if (subsequentActionsAnimationRef.current) subsequentActionsAnimationRef.current.stop();
            subsequentActionsAnimationRef.current = Animated.spring(subsequentActionsOpacity, {
                toValue: 1,
                useNativeDriver: true,
                tension: 120,
                friction: 8,
            });
            subsequentActionsAnimationRef.current.start();
        } else {
             // Reset if conditions are not met or modal is closing.
             if (subsequentActionsAnimationRef.current) subsequentActionsAnimationRef.current.stop();
             subsequentActionsOpacity.setValue(0);
        }
        return () => {
            if (subsequentActionsAnimationRef.current) subsequentActionsAnimationRef.current.stop();
        };
    }, [isWebViewLoading, currentIsLoading, aiTextResponse, userHasMadeChoice, subsequentActionsOpacity]);

    const markdownHTML = useMemo(() => generateHTML(aiTextResponse || "<!-- Awaiting AI Content -->"), [aiTextResponse]);
    const canRegenerate = userHasMadeChoice && !!contentType && !currentIsLoading;

    const handleCloseModal = useCallback(() => {
        if (!isMountedRef.current) return; // Don't do anything if already unmounted / closing

        isMountedRef.current = false; // Signal that modal is now closing
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

        Animated.parallel([
            Animated.timing(backdropOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
            Animated.spring(modalSlideAnim, { toValue: screenHeight, useNativeDriver: true, tension: 100, friction: 10 }),
        ]).start(({ finished }) => {
            // `finished` will be true if the animation completed, false if interrupted (e.g., by unmount)
            // It's generally safe to call onClose here because the parent controls the actual unmount.
            // The key is that isMountedRef is already false, preventing internal state updates.
            onClose(); 
        });
    }, [onClose, backdropOpacity, modalSlideAnim]);


    const renderInitialChoiceButtons = () => (
        <Animated.View style={[
            styles.initialActionsContainer,
            {
                opacity: initialContentOpacity,
                transform: [{ translateY: initialContentTranslateY }, { scale: contentScale }]
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
                    disabled={currentIsLoading} hapticType="medium">
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
                    disabled={currentIsLoading} hapticType="medium">
                    <View style={[styles.buttonIconContainer, styles.conceptsIconContainer]}>
                        <Icon name="bulb" iconSet="Ionicons" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.buttonTextContainer}>
                        <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Explain Concepts</Text>
                        <Text style={[styles.actionButtonSubtext, { color: COLORS.textSecondary }]}>Learn the fundamentals</Text>
                    </View>
                    <Icon name="arrow-forward" iconSet="Ionicons" size={16} color={COLORS.primary + '80'} />
                </PressableScale>

                {IS_YOUTUBE_ENABLED && (
                    <PressableScale
                        style={[styles.actionButton, styles.exploreVideosButton, currentIsLoading && styles.buttonDisabled]}
                        onPress={() => generateAndSetResponse(REQUEST_TYPES.GET_VIDEO_SEARCH_TAGS)}
                        disabled={currentIsLoading} hapticType="medium">
                        <View style={[styles.buttonIconContainer, styles.videosIconContainer]}>
                            <Icon name="logo-youtube" iconSet="Ionicons" size={20} color={COLORS.error} />
                        </View>
                        <View style={styles.buttonTextContainer}>
                            <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Explore Videos</Text>
                            <Text style={[styles.actionButtonSubtext, { color: COLORS.textSecondary }]}>Find relevant tutorials</Text>
                        </View>
                        <Icon name="arrow-forward" iconSet="Ionicons" size={16} color={COLORS.error + '80'} />
                    </PressableScale>
                )}
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
            let retryActionText = "Retry";
            if (contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS) retryActionText = "Retry Explanation";
            else if (contentType === REQUEST_TYPES.SOLVE_QUESTION) retryActionText = "Retry Answer";

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
                            disabled={currentIsLoading} hapticType="medium">
                            <Icon name="refresh" iconSet="Ionicons" size={18} color={COLORS.error || '#D32F2F'} />
                            <Text style={styles.errorRetryButtonText}>{retryActionText}</Text>
                        </PressableScale>
                    )}
                </Animated.View>
            );
        }

        if (aiTextResponse && (contentType === REQUEST_TYPES.SOLVE_QUESTION || contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS)) {
            return (
                <Animated.View style={[styles.aiResponseContainer, { transform: [{ scale: contentScale }] }]}>
                    {isWebViewLoading && (
                         <GlobalLoadingIndicator
                            visible={isWebViewLoading}
                            size="large"
                            text="Formatting response..."
                            style={styles.webViewLoaderContainer} // Applies position: 'absolute' and background
                            textStyle={styles.webViewLoaderText} // Matches existing text style
                        />
                    )}
                    <WebView
                        key={markdownHTML} // Force re-render on HTML change
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
                            if(isMountedRef.current) setIsWebViewLoading(false); 
                            triggerHaptic(); 
                        }}
                        onError={({ nativeEvent }) => {
                            if(isMountedRef.current) {
                                console.error('Chat WebView error:', nativeEvent);
                                setIsWebViewLoading(false);
                                setCurrentError("Error displaying AI response. Content might be malformed. Try regenerating.");
                            }
                        }}
                    />
                    <Animated.View style={[styles.subsequentActionsContainer, { opacity: subsequentActionsOpacity }]}>
                        {canRegenerate && (
                            <PressableScale
                                style={[styles.actionButtonSmall, styles.regenerateButtonSmall, currentIsLoading && styles.buttonDisabled]}
                                onPress={handleRegenerateCurrentView}
                                disabled={currentIsLoading} hapticType="light">
                                <Icon name="refresh" iconSet="Ionicons" size={16} color={COLORS.primary} />
                                <Text style={[styles.actionButtonTextSmall, { color: COLORS.primary }]}>
                                    Regenerate
                                </Text>
                            </PressableScale>
                        )}
                        {contentType === REQUEST_TYPES.SOLVE_QUESTION && (
                            <PressableScale
                                style={[styles.actionButtonSmall, styles.switchButtonSmall, currentIsLoading && styles.buttonDisabled]}
                                onPress={handleExplainConcepts}
                                disabled={currentIsLoading} hapticType="light">
                                <Icon name="bulb-outline" iconSet="Ionicons" size={16} color={COLORS.textSecondary} />
                                <Text style={[styles.actionButtonTextSmall, { color: COLORS.textSecondary }]}>Concepts</Text>
                            </PressableScale>
                        )}
                        {contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS && (
                            <PressableScale
                                style={[styles.actionButtonSmall, styles.switchButtonSmall, currentIsLoading && styles.buttonDisabled]}
                                onPress={handleGenerateAnswer}
                                disabled={currentIsLoading} hapticType="light">
                                <Icon name="chatbubble-ellipses-outline" iconSet="Ionicons" size={16} color={COLORS.textSecondary} />
                                <Text style={[styles.actionButtonTextSmall, { color: COLORS.textSecondary }]}>Answer</Text>
                            </PressableScale>
                        )}
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
    
    const getHeaderIcon = () => {
        switch (contentType) {
            case REQUEST_TYPES.EXPLAIN_CONCEPTS: return { name: "brain", set: "MaterialCommunityIcons" };
            case REQUEST_TYPES.SOLVE_QUESTION: return { name: "robot-happy-outline", set: "MaterialCommunityIcons" };
            default: return { name: "sparkles", set: "Ionicons" };
        }
    };
    const headerIconInfo = getHeaderIcon();


    return (
        <Modal
            animationType="none" // All animations are custom
            transparent={true}
            visible={visible}
            onRequestClose={handleCloseModal}
        >
            <Animated.View style={[styles.modalOverlay, { opacity: backdropOpacity }]}>
                <Animated.View style={[styles.modalView, { transform: [{ translateY: modalSlideAnim }] }]}>
                    <Animated.View style={[styles.modalHeader, { transform: [{ scale: headerScale }] }]}>
                        <View style={styles.modalTitleContainer}>
                            <View style={styles.titleIconContainer}>
                                <Icon
                                    iconSet={headerIconInfo.set}
                                    name={headerIconInfo.name}
                                    size={24}
                                    color={
                                        (IS_YOUTUBE_ENABLED && contentType === REQUEST_TYPES.GET_VIDEO_SEARCH_TAGS) ? COLORS.error : (COLORS.primary || '#007AFF')
                                    }
                                />
                            </View>
                            <Text style={styles.modalTitle} numberOfLines={1}>{modalTitle}</Text>
                        </View>
                        <View style={styles.headerRightActions}>
                            <PressableScale
                                onPress={handleCloseModal}
                                style={styles.headerIconButton}
                                hapticType="medium" scaleValue={0.9}>
                                <Icon iconSet="Ionicons" name="close-circle" size={28} color={COLORS.textSecondary || '#8E8E93'} />
                            </PressableScale>
                        </View>
                    </Animated.View>

                    <ScrollView
                        style={styles.contentScrollView}
                        contentContainerStyle={styles.contentScrollContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        bounces={true}>
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
        backgroundColor: 'rgba(0,0,0,0.6)', 
        justifyContent: 'flex-end',
    },
    modalView: {
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderTopLeftRadius: 32, 
        borderTopRightRadius: 32,
        height: Platform.OS === 'ios' ? '95%' : '93%', 
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -12 }, 
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 50,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Platform.OS === 'ios' ? 18 : 20, 
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight || '#F0F0F0',
        minHeight: 70, 
        backgroundColor: COLORS.surface || '#FFFFFF', 
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, 
    },
    titleIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: (COLORS.primary || '#007AFF') + '10', 
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    modalTitle: {
        fontSize: 20, 
        fontWeight: '700', 
        color: COLORS.text || '#1A1A1A',
        letterSpacing: -0.3, 
    },
    headerRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIconButton: {
        padding: 8, 
        borderRadius: 20,
    },
    contentScrollView: {
        flex: 1,
    },
    contentScrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 12, // Adjusted as per previous fix
        // paddingTop: 4,        // Adjusted as per previous fix
        // paddingBottom: Platform.OS === 'ios' ? 24 : 32, // Adjusted as per previous fix
    },
    initialActionsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20, // This is for the initial screen, likely okay as is
        paddingBottom: 60, 
    },
    iconContainer: { 
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: (COLORS.primary || '#007AFF') + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    initialActionsTitle: {
        fontSize: 24, 
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
        marginBottom: 40, 
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    buttonsContainer: { 
        width: '100%',
        maxWidth: 380, 
        gap: 16, 
    },
    actionButton: { 
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20, 
        paddingHorizontal: 24,
        borderRadius: 16, 
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
        borderColor: (COLORS.primary || '#007AFF') + '20', 
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    exploreVideosButton: { 
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderWidth: 2,
        borderColor: (COLORS.error || '#D32F2F') + '20',
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
        backgroundColor: 'rgba(255,255,255,0.2)', 
        alignItems: 'center',
        justifyContent: 'center',
    },
    conceptsIconContainer: {
        backgroundColor: (COLORS.primary || '#007AFF') + '15', 
    },
    videosIconContainer: { 
        backgroundColor: (COLORS.error || '#D32F2F') + '15',
    },
    buttonTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    actionButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white', 
        marginBottom: 2,
    },
    actionButtonSubtext: {
        fontSize: 14,
        fontWeight: '400',
        color: 'rgba(255,255,255,0.8)', 
    },
    buttonDisabled: { 
        opacity: 0.6, 
    },
    stateInfoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 300, 
    },
    loadingContainer: { 
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
        width: '70%', 
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
    errorStateContainer: { 
        backgroundColor: (COLORS.error || '#D32F2F') + '10', 
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
    stateInfoTitle: { 
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
        borderRadius: 25, 
        borderColor: COLORS.error || '#D32F2F',
        borderWidth: 1.5,
        backgroundColor: 'transparent', 
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
        backgroundColor: COLORS.surfaceAlt2 || '#F9F9F9', 
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 300, 
        display: 'flex',
        flexDirection: 'column',
        // Ensure aiResponseContainer itself does not have excessive padding if it's meant to fill the space:
        // marginTop: 10, // Example: If some top margin is needed from the header
        // marginHorizontal: 0, // Removed previous horizontal padding if now handled by contentScrollContainer
    },
    webViewLoaderContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: (COLORS.surfaceAlt2 || '#F9F9F9') + 'E6', 
        zIndex: 10, 
    },
    webViewLoaderText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    webView: {
        flex: 1,
        backgroundColor: 'transparent', 
    },
    subsequentActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Distributes space between buttons
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12, // Reduced slightly to give buttons more room if needed
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight || '#ECECEC',
        backgroundColor: COLORS.surface || '#FFFFFF', 
    },
    actionButtonSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        flex: 1, 
        marginHorizontal: 4, // Slightly reduced margin
        maxWidth: Platform.OS === 'ios' ? 170 : 160, 
        gap: 6,
        minHeight: 40, // Ensures a minimum tap target height
    },
    regenerateButtonSmall: {
        backgroundColor: (COLORS.primary || '#007AFF') + '10', 
        borderColor: (COLORS.primary || '#007AFF') + '30', 
        borderWidth: 1.2,
    },
    switchButtonSmall: { // <<< UPDATED STYLE
        backgroundColor: 'transparent',
        borderColor: COLORS.textSecondary || '#6c757d',
        borderWidth: 1.2,
    },
    actionButtonTextSmall: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default AIChatModal;