import React, { useState, useRef, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    Share,
    Pressable,
    Platform,
    Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import Icon from './Icon'; // Assuming Icon.js is in the same directory
import { COLORS } from '../constants'; // Assuming constants.js is in ../constants

// A simple progress bar component
const ProgressBar = ({ progress }) => (
    <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
    </View>
);

const commonUserAgent = Platform.OS === 'android'
    ? 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36' // Common Android Chrome UA
    : 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'; // Common iOS Safari UA


const SearchWebViewModal = React.memo(({ visible, onClose, searchQuery }) => {
    const webViewRef = useRef(null);
    const initialSearchUrl = searchQuery // This defines the URL to load when the modal opens or searchQuery changes
        ? `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&aod=0`
        : '';

    const [currentUrl, setCurrentUrl] = useState(initialSearchUrl);
    const [pageTitle, setPageTitle] = useState('Google Search');
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);

    React.useEffect(() => {
        if (visible) {
            // When the modal becomes visible or the initial search URL changes, reset states
            setCurrentUrl(initialSearchUrl);
            setPageTitle(searchQuery ? `Search: ${searchQuery}` : 'Google Search');
            setCanGoBack(false);
            setCanGoForward(false);
            setLoadingProgress(0);
            setIsLoading(true); // Assume loading will start
            setIsMoreMenuVisible(false);

            // If initialSearchUrl is empty and webView is already loaded with something,
            // explicitly load about:blank or rely on conditional rendering to hide WebView.
            // The current conditional rendering handles this well by showing PlaceholderView.
        }
    }, [visible, initialSearchUrl, searchQuery]); // searchQuery added to correctly update title if it changes while visible

    const handleNavigationStateChange = useCallback(navState => {
        setCanGoBack(navState.canGoBack);
        setCanGoForward(navState.canGoForward);
        setCurrentUrl(navState.url);
        if (navState.title && !navState.title.startsWith('http') && navState.title.trim() !== "") {
            setPageTitle(navState.title);
        }
        setIsLoading(navState.loading);
        if (!navState.loading) {
            setLoadingProgress(0); // Reset progress when loading finishes
        }
    }, []);

    const handleLoadProgress = useCallback(event => {
        setLoadingProgress(event.nativeEvent.progress);
    }, []);

    const goBack = () => webViewRef.current?.goBack();
    const goForward = () => webViewRef.current?.goForward();
    const reload = () => {
        webViewRef.current?.reload();
        setIsMoreMenuVisible(false);
    };

    const openInBrowser = async () => {
        setIsMoreMenuVisible(false);
        if (!currentUrl) return;
        try {
            const supported = await Linking.canOpenURL(currentUrl);
            if (supported) {
                await Linking.openURL(currentUrl);
            } else {
                // Fallback to Expo WebBrowser if Linking doesn't support it (e.g. custom schemes not handled by default browser)
                // For standard http/https, Linking.openURL should usually work.
                await WebBrowser.openBrowserAsync(currentUrl);
            }
        } catch (error) {
            Alert.alert("Error", `Could not open this URL: ${currentUrl}`);
            console.error("Error opening in browser:", error);
        }
    };

    const shareUrl = async () => {
        setIsMoreMenuVisible(false);
        if (!currentUrl) return;
        try {
            await Share.share({
                message: Platform.OS === 'ios' ? undefined : `Check out this link: ${currentUrl}`, // Message for Android
                url: currentUrl, // URL for iOS and Android
                title: pageTitle, // Title for some share targets
            });
        } catch (error) {
            Alert.alert("Error", "Could not share the link.");
        }
    };

    const handleCloseModal = () => {
        setIsMoreMenuVisible(false);
        onClose();
    };

    const renderError = (errorDomain, errorCode, errorDesc) => (
        <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" iconSet="Ionicons" size={60} color={COLORS.error || '#D32F2F'} />
            <Text style={styles.errorTitle}>Oops! Something went wrong.</Text>
            <Text style={styles.errorText}>
                Could not load the page. This might be due to security policies (e.g., by Google), network issues, or an invalid address.
            </Text>
            <TouchableOpacity onPress={openInBrowser} style={[styles.errorActionButton, { marginBottom: 10 }]}>
                <Text style={styles.errorActionButtonText}>Open in External Browser</Text>
            </TouchableOpacity>
            <Text style={styles.errorDetails}>{`Error: ${errorDesc} (Code: ${errorCode}, Domain: ${errorDomain})`}</Text>
            <TouchableOpacity onPress={handleCloseModal} style={styles.errorCloseButton}>
                <Text style={styles.errorCloseButtonText}>Close Viewer</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={handleCloseModal}>
            <SafeAreaView style={styles.modalOverlay}>
                <View style={styles.modalView}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <View style={styles.headerNavControls}>
                            <TouchableOpacity onPress={goBack} disabled={!canGoBack} style={styles.navButton}>
                                <Icon iconSet="Ionicons" name="arrow-back" size={24} color={canGoBack ? (COLORS.primary || '#007AFF') : (COLORS.disabled || '#CCCCCC')} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={goForward} disabled={!canGoForward} style={styles.navButton}>
                                <Icon iconSet="Ionicons" name="arrow-forward" size={24} color={canGoForward ? (COLORS.primary || '#007AFF') : (COLORS.disabled || '#CCCCCC')} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalTitleContainer}>
                            {/* Optionally, show a loading indicator or keep title static while loading */}
                            <Text style={styles.modalTitle} numberOfLines={1} ellipsizeMode="tail">
                                {isLoading && currentUrl ? "Loading..." : (pageTitle || "Web Page")}
                            </Text>
                        </View>

                        <View style={styles.headerActionControls}>
                            <View style={styles.moreOptionsContainer}>
                                <TouchableOpacity onPress={() => setIsMoreMenuVisible(v => !v)} style={styles.modalActionButton}>
                                    <Icon iconSet="Ionicons" name="ellipsis-vertical" size={24} color={COLORS.primary || '#007AFF'} />
                                </TouchableOpacity>
                                {isMoreMenuVisible && (
                                    <View style={styles.moreOptionsMenu}>
                                        <TouchableOpacity style={styles.menuItem} onPress={reload}>
                                            <Icon name="refresh-outline" iconSet="Ionicons" size={20} color={COLORS.text || '#000'} style={styles.menuItemIcon} />
                                            <Text style={styles.menuItemText}>Reload Page</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.menuItem} onPress={shareUrl}>
                                            <Icon name="share-outline" iconSet="Ionicons" size={20} color={COLORS.text || '#000'} style={styles.menuItemIcon} />
                                            <Text style={styles.menuItemText}>Share URL</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.menuItem} onPress={openInBrowser}>
                                            <Icon name="open-outline" iconSet="Ionicons" size={20} color={COLORS.text || '#000'} style={styles.menuItemIcon} />
                                            <Text style={styles.menuItemText}>Open in Browser</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
                                <Icon iconSet="Ionicons" name="close" size={28} color={COLORS.textSecondary || '#8E8E93'} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.contentAreaContainer}>
                        {isLoading && loadingProgress > 0 && loadingProgress < 1 && <ProgressBar progress={loadingProgress} />}

                        {initialSearchUrl ? (
                            <WebView
                                ref={webViewRef}
                                originWhitelist={['https://*', 'http://*']}
                                source={{ uri: currentUrl }} // currentUrl is updated by useEffect and navigation
                                style={styles.modalWebView}
                                javaScriptEnabled
                                domStorageEnabled
                                userAgent={commonUserAgent} // Added User-Agent
                                startInLoadingState // This can be true, works well with onLoadProgress
                                setSupportMultipleWindows={false}
                                forceDarkOff
                                preferredColorScheme="light"
                                allowsInlineMediaPlayback={true} // iOS: Allow media to play inline
                                mediaPlaybackRequiresUserAction={false} // Allow autoplay for media if website initiates
                                onNavigationStateChange={handleNavigationStateChange}
                                onLoadProgress={handleLoadProgress}
                                renderError={renderError}
                                onError={({ nativeEvent }) => {
                                    console.error('WebView error:', nativeEvent);
                                    // renderError is usually preferred for displaying UI,
                                    // but onError can catch other types of errors.
                                }}
                                onHttpError={({ nativeEvent }) => {
                                    console.warn('WebView HTTP error:', nativeEvent);
                                    if ([400, 403, 401].includes(nativeEvent.statusCode) && nativeEvent.url && nativeEvent.url.includes('google.com')) {
                                        Alert.alert(
                                            'Access Issue with Google',
                                            'Google may be restricting access within the app. Would you like to try opening this page in your device browser?',
                                            [
                                                { text: 'Open in Browser', onPress: () => { openInBrowser(); handleCloseModal(); } },
                                                { text: 'Cancel', style: 'cancel', onPress: () => { /* Optionally close modal or let user stay on error page */ } },
                                            ],
                                            { cancelable: true }
                                        );
                                    }
                                    // You might want to show the renderError component for HTTP errors too
                                    // if the WebView doesn't do it automatically.
                                }}
                            />
                        ) : (
                            <View style={styles.placeholderView}>
                                <Icon iconSet="Ionicons" name="search-outline" size={48} color={COLORS.textDisabled || '#AEAEB2'} />
                                <Text style={styles.placeholderText}>
                                    No search query provided.
                                </Text>
                            </View>
                        )}

                        {isMoreMenuVisible && <Pressable style={styles.menuBackdrop} onPress={() => setIsMoreMenuVisible(false)} />}
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
});

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalView: {
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 0, // No horizontal padding for the main view to allow header/content full width
        paddingBottom: 0,    // No bottom padding for main view
        height: '85%',       // Or a different dynamic height
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 25,
        overflow: 'hidden', // Important for border radius on children like WebView
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 10, // Horizontal padding for header content
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight || '#E0E0E0',
        zIndex: 10, // Ensure header is above progress bar if progress bar was absolutely positioned
    },
    headerNavControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerActionControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navButton: {
        padding: 8,
    },
    modalTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6, // Changed from gop, 'gap' property
        marginHorizontal: 5, // Give some space so it doesn't touch nav/action controls
    },
    // modalTitleIcon: { // This style was defined but not used, can be removed or used
    //     marginRight: 6,
    // },
    modalTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.text || '#000000',
        textAlign: 'center',
    },
    modalActionButton: {
        padding: 8,
    },
    modalCloseButton: {
        padding: 8,
        marginLeft: 0, // Adjust as needed
    },
    moreOptionsContainer: {
        position: 'relative', // For absolute positioning of the menu
        marginRight: Platform.OS === 'ios' ? 0 : 4,
    },
    moreOptionsMenu: {
        position: 'absolute',
        top: '100%', // Position below the ellipsis icon
        right: 0,
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 8, // For Android shadow
        zIndex: 100,   // Above other content
        minWidth: 180,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    menuItemIcon: {
        marginRight: 12,
    },
    menuItemText: {
        fontSize: 15,
        color: COLORS.text || '#000000',
    },
    menuBackdrop: { // To close menu when tapping outside
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'transparent', // Or a semi-transparent color for visual cue
        zIndex: 50, // Below menu (100) but above WebView content
    },
    contentAreaContainer: {
        flex: 1,
        position: 'relative', // For menuBackdrop or other absolute elements inside
        // paddingBottom: Platform.OS === 'ios' ? 20 : 15, // If needed for safe area at bottom, but SafeAreaView handles top
    },
    progressBarContainer: {
        height: 3,
        backgroundColor: COLORS.borderLight || '#E0E0E0',
        // No absolute positioning needed if it's part of the flow, directly under header
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.primary || '#007AFF',
    },
    modalWebView: {
        flex: 1,
        width: '100%',
        backgroundColor: COLORS.surface || '#FFFFFF', // Match modal background
    },
    placeholderView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background || '#F2F2F7',
    },
    placeholderText: {
        marginTop: 15,
        fontSize: 16,
        color: COLORS.textSecondary || '#8E8E93',
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.surface || '#FFFFFF',
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text || '#000000',
        marginTop: 15,
        marginBottom: 10,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 15,
        color: COLORS.textSecondary || '#8E8E93',
        textAlign: 'center',
        marginBottom: 10,
    },
    errorDetails: {
        fontSize: 12,
        color: COLORS.textDisabled || '#AEAEB2',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    errorActionButton: {
        backgroundColor: COLORS.secondary || '#007AFF', // Or a different color for distinction
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginTop: 10,
    },
    errorActionButtonText: {
        color: COLORS.white || '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    errorCloseButton: { // Changed from primary to maybe a less prominent color or style
        backgroundColor: COLORS.grey3 || '#C7C7CC', // Example: a lighter grey
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginTop: 15,
    },
    errorCloseButtonText: {
        color: COLORS.text || '#000000', // Text color for the less prominent button
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SearchWebViewModal;