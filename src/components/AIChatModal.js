// src/components/AIChatModal.js
import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    // TouchableOpacity, // Not directly used, PressableScale might use it
    StyleSheet,
    // SafeAreaView, // Not directly used
    ScrollView,
    // ActivityIndicator, // Custom loaders used
    // Alert, // Not directly used
    // Pressable, // PressableScale used
    Animated,
    Dimensions,
    Easing,
    Platform, // Explicitly ensure Platform is imported
} from 'react-native';
import Icon from './Icon';
import { COLORS } from '../constants';
import { WebView } from 'react-native-webview';
// import * as Clipboard from 'expo-clipboard'; // Not used directly in this file
import generateHTML from '../helpers/generateHTML';
import { askAIWithContext, REQUEST_TYPES } from '../helpers/openaiHelper';
import GlobalLoadingIndicator from './GlobalLoadingIndicator';
import * as Haptics from 'expo-haptics';
import PressableScale from './PressableScale';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const DYNAMIC_LOADING_TEXTS = [
    "🧠 AI is analyzing your question...",
    "📚 Consulting knowledge base...",
    "✨ Crafting a response...",
    "💡 Formulating insights...",
    "⏳ Just a moment more...",
];

const LoadingDots = ({ color = COLORS.primary }) => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;
    const animationRef = useRef(null);

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
                    Animated.delay(600) // Pause at the bottom
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

    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const modalTranslateY = useRef(new Animated.Value(screenHeight)).current;
    const initialContentOpacity = useRef(new Animated.Value(0)).current;
    const initialContentTranslateY = useRef(new Animated.Value(30)).current;
    const subsequentActionsOpacity = useRef(new Animated.Value(0)).current;
    const progressBarAnim = useRef(new Animated.Value(0)).current;
    
    const progressBarAnimationRef = useRef(null);
    const subsequentActionsAnimationRef = useRef(null);
    const entranceAnimationRef = useRef(null);

    const isMountedRef = useRef(false);

    useEffect(() => {
        if (visible) {
            isMountedRef.current = true;
        }
        return () => {
            isMountedRef.current = false;
            // Stop any pending animations on unmount or when visibility changes leading to cleanup
            if (progressBarAnimationRef.current) progressBarAnimationRef.current.stop();
            if (entranceAnimationRef.current) entranceAnimationRef.current.stop();
            if (subsequentActionsAnimationRef.current) subsequentActionsAnimationRef.current.stop();
        };
    }, [visible]);


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
            progressBarAnim.setValue(0); // Ensure bar starts from 0
            progressBarAnimationRef.current = Animated.loop(
                Animated.timing(progressBarAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: false, // Width animation cannot use native driver
                })
            );
            progressBarAnimationRef.current.start();
        } else {
            if (progressBarAnimationRef.current) {
                progressBarAnimationRef.current.stop();
            }
            progressBarAnim.setValue(0); // Reset progress bar when not loading
        }
        return () => {
            if (progressBarAnimationRef.current) {
                progressBarAnimationRef.current.stop();
            }
        };
    }, [currentIsLoading, progressBarAnim]);

    useEffect(() => {
        if (visible) {
            // Reset states for re-opening
            setContentType(null);
            setAiTextResponse(null);
            setCurrentIsLoading(false);
            setCurrentError(null);
            setModalTitle("AI Assistant");
            setUserHasMadeChoice(false);
            setIsWebViewLoading(true);
            setDynamicLoadingText(DYNAMIC_LOADING_TEXTS[0]);

            // Reset animation values
            backdropOpacity.setValue(0);
            modalTranslateY.setValue(screenHeight);
            initialContentOpacity.setValue(0);
            initialContentTranslateY.setValue(30);
            subsequentActionsOpacity.setValue(0);

            if (entranceAnimationRef.current) {
                entranceAnimationRef.current.stop();
            }

            entranceAnimationRef.current = Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.spring(modalTranslateY, {
                    toValue: 0,
                    tension: 100, 
                    friction: 15,  
                    useNativeDriver: true,
                }),
            ]);
            
            entranceAnimationRef.current.start(({ finished }) => {
                if (finished && isMountedRef.current) {
                    Animated.parallel([
                        Animated.timing(initialContentOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                        Animated.spring(initialContentTranslateY, { toValue: 0, tension: 120, friction: 10, useNativeDriver: true }),
                    ]).start();
                }
            });
        }
        // Exit animation is handled by handleCloseModal
        return () => {
            if (entranceAnimationRef.current) entranceAnimationRef.current.stop();
        };
    }, [visible, backdropOpacity, modalTranslateY, initialContentOpacity, initialContentTranslateY, subsequentActionsOpacity, screenHeight]);


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
                (feedbackMsg) => {
                    if (isMountedRef.current) { // Guard console log
                        console.log("AI Info:", feedbackMsg);
                    }
                }
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
        if (contentType) {
            generateAndSetResponse(contentType);
        }
    }, [contentType, generateAndSetResponse]);

    useEffect(() => {
        if (isMountedRef.current && userHasMadeChoice && !currentIsLoading && aiTextResponse && !isWebViewLoading) {
            if (subsequentActionsAnimationRef.current) subsequentActionsAnimationRef.current.stop();
            subsequentActionsAnimationRef.current = Animated.spring(subsequentActionsOpacity, {
                toValue: 1,
                useNativeDriver: true,
                tension: 120,
                friction: 8,
            });
            subsequentActionsAnimationRef.current.start();
        } else if (!currentIsLoading && (!aiTextResponse || currentError)) { 
            // Hide actions if loading stopped and there's no response (e.g. error, or cleared response)
            if (subsequentActionsAnimationRef.current) subsequentActionsAnimationRef.current.stop();
            subsequentActionsOpacity.setValue(0);
        }
        return () => {
            if (subsequentActionsAnimationRef.current) subsequentActionsAnimationRef.current.stop();
        };
    }, [userHasMadeChoice, currentIsLoading, aiTextResponse, isWebViewLoading, currentError, subsequentActionsOpacity]);


    const markdownHTML = useMemo(() => generateHTML(aiTextResponse || "<!-- Awaiting AI Content -->"), [aiTextResponse]);
    const canRegenerate = userHasMadeChoice && !!contentType && !currentIsLoading;

    const handleCloseModal = useCallback(() => {
        if (!isMountedRef.current) return;

        isMountedRef.current = false; 
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

        // Stop all relevant animations
        if (entranceAnimationRef.current) entranceAnimationRef.current.stop();
        if (progressBarAnimationRef.current) progressBarAnimationRef.current.stop();
        if (subsequentActionsAnimationRef.current) subsequentActionsAnimationRef.current.stop();
        initialContentOpacity.stopAnimation(); // Stop initial content animations if they were somehow active
        initialContentTranslateY.stopAnimation();

        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 250,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(modalTranslateY, { 
                toValue: screenHeight,
                duration: 300, 
                easing: Easing.inOut(Easing.ease), 
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose(); 
        });
    }, [onClose, backdropOpacity, modalTranslateY, initialContentOpacity, initialContentTranslateY, screenHeight]);

    const renderInitialChoiceButtons = () => (
        <Animated.View style={[
            styles.initialActionsContainer,
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
                    <Icon name="arrow-forward" iconSet="Ionicons" size={16} color={COLORS.primary ? COLORS.primary + '80' : '#007AFF80'} />
                </PressableScale>
            </View>
        </Animated.View>
    );
    
    const renderPostChoiceContent = () => {
        if (currentIsLoading) {
            return (
                <Animated.View style={styles.stateInfoContainer}>
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
                <Animated.View style={[styles.stateInfoContainer, styles.errorStateContainer]}>
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
                            hapticType="medium">
                            <Icon name="refresh" iconSet="Ionicons" size={18} color={COLORS.error || '#D32F2F'} />
                            <Text style={styles.errorRetryButtonText}>{retryActionText}</Text>
                        </PressableScale>
                    )}
                </Animated.View>
            );
        }

        if (aiTextResponse && (contentType === REQUEST_TYPES.SOLVE_QUESTION || contentType === REQUEST_TYPES.EXPLAIN_CONCEPTS)) {
            return (
                <Animated.View style={styles.aiResponseContainer}>
                    {isWebViewLoading && (
                         <GlobalLoadingIndicator
                            visible={isWebViewLoading}
                            size="large"
                            text="Formatting response..."
                            style={styles.webViewLoaderContainer}
                            textStyle={styles.webViewLoaderText}
                        />
                    )}
                    <WebView
                        key={markdownHTML} 
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
                                triggerHaptic(Haptics.NotificationFeedbackType.Error); // Haptic on error
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
            <Animated.View style={styles.stateInfoContainer}>
                <Icon name="information-circle-outline" iconSet="Ionicons" size={48} color={COLORS.textDisabled || '#AEAEB2'} />
                <Text style={styles.stateInfoText}>Please select an action, or an issue occurred.</Text>
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
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={handleCloseModal}
        >
            <Animated.View style={[styles.modalOverlay, { opacity: backdropOpacity }]}>
                <Animated.View style={[styles.modalView, { transform: [{ translateY: modalTranslateY }] }]}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalTitleContainer}>
                            <View style={styles.titleIconContainer}>
                                <Icon
                                    iconSet={headerIconInfo.set}
                                    name={headerIconInfo.name}
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
                                hapticType="medium" scaleValue={0.9}>
                                <Icon iconSet="Ionicons" name="close-circle" size={28} color={COLORS.textSecondary || '#8E8E93'} />
                            </PressableScale>
                        </View>
                    </View>

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
        marginRight: 8, // Space before close button
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
        flexShrink: 1, // Allow title to shrink if too long
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
        paddingHorizontal: 12,
        paddingTop: 10, // Added small top padding for content separation
        paddingBottom: Platform.OS === 'ios' ? 24 : 32, // Consistent bottom padding
    },
    initialActionsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20, // Inner padding for content alignment
        // paddingBottom is handled by contentScrollContainer
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
        padding: 20, // Padding for the content within the state box
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
        marginTop: 20, // Space below dynamic text
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary || '#007AFF',
        borderRadius: 2,
    },
    stateInfoText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.textSecondary || '#718096',
        textAlign: 'center',
        paddingHorizontal: 10,
        lineHeight: 23,
    },
    errorStateContainer: { 
        backgroundColor: (COLORS.error || '#D32F2F') + '10', 
        borderRadius: 16,
        paddingVertical: 30, // More vertical padding for error
        width: '100%', // Error box takes full width of stateInfoContainer
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
        // marginTop and marginHorizontal handled by contentScrollContainer
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
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
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
        marginHorizontal: 4,
        maxWidth: Platform.OS === 'ios' ? 170 : 160, 
        gap: 6,
        minHeight: 40,
    },
    regenerateButtonSmall: {
        backgroundColor: (COLORS.primary || '#007AFF') + '10', 
        borderColor: (COLORS.primary || '#007AFF') + '30', 
        borderWidth: 1.2,
    },
    switchButtonSmall: {
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