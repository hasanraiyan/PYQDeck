// src/components/AIChatModal.js
import React, { useMemo, useCallback, useState, useEffect } from 'react'; // Added useEffect
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
import { getQuestionPlainText } from '../helpers/helpers';
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';
import generateHTML from '../helpers/generateHTML';

const AIChatModal = React.memo(({
    visible,
    onClose,
    questionItem,
    aiResponse,
    isLoading, // Overall loading state for AI response generation
    error,
    onRegenerate,
}) => {
    const [isActionsMenuVisible, setIsActionsMenuVisible] = useState(false);
    const [isWebViewLoading, setIsWebViewLoading] = useState(true); // For WebView's own loading state

    const questionPlainText = useMemo(() => {
        if (questionItem && questionItem.text) {
            return getQuestionPlainText(questionItem.text);
        }
        return "No question context available.";
    }, [questionItem]);

    // Reset WebView loading state when AI response changes or modal becomes visible with a response
    useEffect(() => {
        if (visible && aiResponse && !isLoading && !error) {
            setIsWebViewLoading(true);
        }
    }, [visible, aiResponse, isLoading, error]);

    const handleCopyResponse = useCallback(async () => {
        if (aiResponse) {
            try {
                await Clipboard.setStringAsync(aiResponse);
                Alert.alert("Copied!", "AI response copied to clipboard.");
            } catch (e) {
                console.error("Failed to copy to clipboard", e);
                Alert.alert("Error", "Could not copy response to clipboard.");
            }
        }
        setIsActionsMenuVisible(false);
    }, [aiResponse]);

    const handleRegenerate = useCallback(() => {
        if (onRegenerate) {
            onRegenerate();
        }
        setIsActionsMenuVisible(false);
    }, [onRegenerate]);

    const markdownHTML = useMemo(() => {
        if (aiResponse) {
            return generateHTML(aiResponse);
        }
        return generateHTML("<!-- No content -->"); // Empty valid HTML
    }, [aiResponse]);


    const canCopy = !!aiResponse && !isLoading && !error;
    const canRegenerate = !!onRegenerate && !isLoading; // Can regenerate even if there was an error or no response yet

    const handleCloseModal = () => {
        setIsActionsMenuVisible(false);
        onClose();
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
                                name="robot-happy-outline"
                                size={22}
                                color={COLORS.primary || '#007AFF'}
                                style={styles.modalTitleIcon}
                            />
                            <Text style={styles.modalTitle} numberOfLines={1}>AI Assistant</Text>
                        </View>
                        <View style={styles.headerRightActions}>
                            {(canCopy || (onRegenerate && !isLoading)) && ( // Show ellipsis if actions are possible
                                <View style={styles.moreOptionsContainer}>
                                    <TouchableOpacity
                                        onPress={() => setIsActionsMenuVisible(v => !v)}
                                        style={styles.headerIconButton}
                                        disabled={isLoading && !onRegenerate} // Disable if loading and no regenerate possible
                                    >
                                        <Icon
                                            iconSet="Ionicons"
                                            name="ellipsis-vertical"
                                            size={24}
                                            color={(isLoading && !onRegenerate) ? (COLORS.disabled || '#CCCCCC') : (COLORS.text || '#000000')}
                                        />
                                    </TouchableOpacity>
                                    {isActionsMenuVisible && (
                                        <View style={styles.moreOptionsMenu}>
                                            {canCopy && (
                                                <TouchableOpacity style={styles.menuItem} onPress={handleCopyResponse}>
                                                    <Icon name="copy-outline" iconSet="Ionicons" size={20} color={COLORS.text || '#000'} style={styles.menuItemIcon} />
                                                    <Text style={styles.menuItemText}>Copy Response</Text>
                                                </TouchableOpacity>
                                            )}
                                            {onRegenerate && (
                                                <TouchableOpacity
                                                    style={styles.menuItem}
                                                    onPress={handleRegenerate}
                                                    disabled={isLoading}
                                                >
                                                    <Icon name="reload-circle-outline" iconSet="Ionicons" size={20} color={isLoading ? (COLORS.disabled || '#CCCCCC') : (COLORS.text || '#000')} style={styles.menuItemIcon} />
                                                    <Text style={[styles.menuItemText, isLoading && { color: COLORS.disabled || '#CCCCCC' }]}>
                                                        {aiResponse || error ? 'Regenerate' : 'Generate'}
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
                        showsVerticalScrollIndicator={true} // Show scrollbar if content overflows
                        keyboardShouldPersistTaps="handled" // Good for webview interactions
                    >
                        {questionItem && (
                            <View style={styles.questionContextContainer}>
                                <Text style={styles.questionContextTitle}>Your Question:</Text>
                                <Text style={styles.questionContextText} numberOfLines={5} ellipsizeMode="tail">
                                    {questionPlainText}
                                </Text>
                            </View>
                        )}

                        {isLoading && (
                            <View style={styles.stateInfoContainer}>
                                <ActivityIndicator size={Platform.OS === 'ios' ? "large" : 60} color={COLORS.primary || '#007AFF'} />
                                <Text style={styles.stateInfoText}>AI is thinking, please wait...</Text>
                            </View>
                        )}

                        {error && !isLoading && (
                            <View style={[styles.stateInfoContainer, styles.errorStateContainer]}>
                                <Icon name="alert-circle-outline" iconSet="Ionicons" size={50} color={COLORS.error || '#D32F2F'} />
                                <Text style={[styles.stateInfoTitle, { color: COLORS.error || '#D32F2F' }]}>Oops! An Error Occurred</Text>
                                <Text style={styles.errorDetailText}>{error}</Text>
                                {onRegenerate && (
                                    <TouchableOpacity style={styles.errorRetryButton} onPress={handleRegenerate}>
                                        <Icon name="refresh-outline" iconSet="Ionicons" size={20} color={COLORS.error || '#D32F2F'} style={styles.actionButtonIcon} />
                                        <Text style={styles.errorRetryButtonText}>Try Again</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {!isLoading && !error && aiResponse && (
                            <View style={styles.aiResponseContainer}>
                                {isWebViewLoading && ( // Show activity indicator while WebView content itself is loading
                                    <ActivityIndicator
                                        size="large"
                                        color={COLORS.primary || '#007AFF'}
                                        style={styles.webViewLoader}
                                    />
                                )}
                                <WebView
                                    originWhitelist={['*']}
                                    source={{ html: markdownHTML }}
                                    style={[styles.webView, { opacity: isWebViewLoading ? 0 : 1 }]} // Hide WebView while its content loads
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    mixedContentMode="compatibility"
                                    setSupportMultipleWindows={false}
                                    showsVerticalScrollIndicator={false} // HTML body will handle scroll
                                    showsHorizontalScrollIndicator={false}
                                    onLoadEnd={() => setIsWebViewLoading(false)} // WebView content finished loading
                                    onError={({ nativeEvent }) => {
                                        console.error('Chat WebView error:', nativeEvent);
                                        setIsWebViewLoading(false); // Ensure loader hides on error too
                                        Alert.alert("Display Error", "Could not render AI response format correctly.");
                                    }}
                                    // renderLoading is for the initial load of the WebView component itself,
                                    // not necessarily its HTML content. We use a custom loader.
                                />
                            </View>
                        )}
                        {!isLoading && !error && !aiResponse && (
                             <View style={styles.stateInfoContainer}>
                                <Icon name="chatbubbles-outline" iconSet="Ionicons" size={48} color={COLORS.textDisabled || '#AEAEB2'} />
                                <Text style={styles.stateInfoText}>AI response will appear here.</Text>
                                {onRegenerate && ( // Offer to generate if possible
                                     <TouchableOpacity style={styles.generateButton} onPress={handleRegenerate}>
                                        <Icon name="sparkles-outline" iconSet="Ionicons" size={20} color={COLORS.primary || '#007AFF'} style={styles.actionButtonIcon} />
                                        <Text style={styles.generateButtonText}>Generate Response</Text>
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
        backgroundColor: 'rgba(0,0,0,0.65)', // Slightly darker overlay
        justifyContent: 'flex-end',
    },
    modalView: {
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: Platform.OS === 'ios' ? '93%' : '90%', // Adjusted height
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
        justifyContent: 'space-between', // Changed from flex-start to space-between
        paddingVertical: Platform.OS === 'ios' ? 12 : 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight || '#ECECEC',
        minHeight: 58,
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start', // Changed from center to flex-start
        gap: 8,
        flex: 1, // Added to allow title to take remaining space
    },
    modalTitleIcon: {
        // No specific style needed if using gap
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text || '#1A1A1A',
        textAlign: 'left', // Changed from center to left
    },
    headerRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        // Removed fixed width to allow natural sizing
    },
    headerIconButton: {
        padding: 8,
    },
    modalCloseButton: {
        // marginLeft: 4, // If more options icon is present
    },
    moreOptionsContainer: {
        position: 'relative',
        marginRight: Platform.OS === 'ios' ? 0 : -4, // Fine-tune spacing
    },
    moreOptionsMenu: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 40 : 44, // Adjust based on header height
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
        minWidth: 210, // Increased width
        borderWidth: Platform.OS === 'ios' ? 0.5 : 0, // Subtle border for iOS
        borderColor: COLORS.borderUltraLight || '#F0F0F0',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13, // Increased padding
        paddingHorizontal: 18,
    },
    menuItemIcon: {
        marginRight: 14,
    },
    menuItemText: {
        fontSize: 16, // Slightly larger
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
        flexGrow: 1, // Allows content to expand to fill ScrollView viewport if short
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 30, // Ensure space at the bottom
    },
    questionContextContainer: {
        padding: 16,
        backgroundColor: COLORS.surfaceAlt || '#F7F9FC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight || '#E8ECF0',
        marginBottom: 20, // Increased margin
    },
    questionContextTitle: {
        fontSize: 14.5,
        fontWeight: '600',
        color: COLORS.textSecondary || '#4A5568',
        marginBottom: 8,
    },
    questionContextText: {
        fontSize: 15,
        color: COLORS.text || '#2D3748',
        lineHeight: 22,
    },
    stateInfoContainer: { // Common container for loading, error, empty states
        flex: 1, // Allow this to take up space if it's the only thing
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        minHeight: 200, // Ensure it has some minimum height
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
    errorStateContainer: { // Specific styling for error block
        backgroundColor:  COLORS.errorBackground || '#FFF0F0',
        borderRadius: 12,
        paddingHorizontal: 15, // Inner padding
        marginVertical: 10, // If it's not taking flex:1
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
    generateButton: { // For the empty state "Generate Response"
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
        flex: 1, // Key for making this container take available vertical space
        backgroundColor: COLORS.surface || "#FFF", // Match WebView background for seamless look
        borderRadius: 10, // Rounded corners for the content area
        overflow: 'hidden', // Important for border radius on WebView
        minHeight: 250, // Ensure a decent minimum height for the response area
        position: 'relative', // For positioning the WebView loader
    },
    webViewLoader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)', // Semi-transparent overlay
        zIndex: 1, // Above WebView while loading
    },
    webView: {
        flex: 1, // WebView fills its parent (aiResponseContainer)
        backgroundColor: 'transparent', // Let parent container handle background
    },
    actionButtonIcon: { // Used by errorRetryButton and generateButton
        marginRight: 8,
    },
});

export default AIChatModal;