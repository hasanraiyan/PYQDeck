import React, { useState, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator, // Still used for the placeholder if we had one, but not for webview loading
  Platform,
  Alert,
  Share,
  Pressable,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import Icon from './Icon';
import { COLORS } from '../constants';

// A simple progress bar component
const ProgressBar = ({ progress }) => (
  <View style={styles.progressBarContainer}>
    <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
  </View>
);

const SearchWebViewModal = React.memo(({
  visible,
  onClose,
  searchQuery,
}) => {
  const webViewRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [pageTitle, setPageTitle] = useState('Google Search');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Still true to show initial progress bar / "Loading..." title
  const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);

  const initialSearchUrl = searchQuery
    ? `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&aod=0`
    : '';

  React.useEffect(() => {
    if (visible) {
      setCurrentUrl(initialSearchUrl);
      setPageTitle(searchQuery ? `Search: ${searchQuery}` : 'Google Search');
      setCanGoBack(false);
      setCanGoForward(false);
      setLoadingProgress(0);
      setIsLoading(true); // Reset loading state for new search or visibility
      setIsMoreMenuVisible(false);
    }
  }, [visible, searchQuery, initialSearchUrl]);

  const handleNavigationStateChange = useCallback((navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
    if (navState.title && !navState.title.startsWith('http')) {
      setPageTitle(navState.title);
    }
    setIsLoading(navState.loading); // This will be true while loading, false when done
    if (!navState.loading) {
      setLoadingProgress(0); // Reset progress when loading finishes
    }
  }, []);

  const handleLoadProgress = useCallback((event) => {
    setLoadingProgress(event.nativeEvent.progress);
  }, []);

  const goBack = () => webViewRef.current?.goBack();
  const goForward = () => webViewRef.current?.goForward();
  const reload = () => {
    webViewRef.current?.reload();
    setIsMoreMenuVisible(false);
  }

  const openInBrowser = async () => {
    setIsMoreMenuVisible(false);
    if (currentUrl) {
      try {
        await WebBrowser.openBrowserAsync(currentUrl);
      } catch (error) {
        Alert.alert("Error", `Could not open this URL: ${currentUrl}`);
        console.error("Error opening in browser:", error);
      }
    }
  };

  const shareUrl = async () => {
    setIsMoreMenuVisible(false);
    if (currentUrl) {
      try {
        await Share.share({
          message: `Check out this link: ${currentUrl}`,
          url: currentUrl,
          title: pageTitle,
        });
      } catch (error) {
        Alert.alert("Error", "Could not share the link.");
      }
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
        Could not load the page. This might be due to Google's security policies, network issues, or an invalid address.
      </Text>
      <TouchableOpacity
        onPress={() => {
          openInBrowser();
        }}
        style={[styles.errorActionButton, {marginBottom: 10}]}
      >
         <Text style={styles.errorActionButtonText}>Open in Browser</Text>
      </TouchableOpacity>
      <Text style={styles.errorDetails}>{`Error: ${errorDesc} (${errorCode})`}</Text>
      <TouchableOpacity onPress={handleCloseModal} style={styles.errorCloseButton}>
        <Text style={styles.errorCloseButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );

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
            <View style={styles.headerNavControls}>
              <TouchableOpacity onPress={goBack} disabled={!canGoBack} style={styles.navButton}>
                <Icon iconSet="Ionicons" name="arrow-back" size={24} color={canGoBack ? (COLORS.primary || '#007AFF') : (COLORS.disabled || '#CCCCCC')} />
              </TouchableOpacity>
              <TouchableOpacity onPress={goForward} disabled={!canGoForward} style={styles.navButton}>
                <Icon iconSet="Ionicons" name="arrow-forward" size={24} color={canGoForward ? (COLORS.primary || '#007AFF') : (COLORS.disabled || '#CCCCCC')} />
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={reload} style={styles.navButton}>
                <Icon iconSet="Ionicons" name="refresh" size={24} color={COLORS.primary || '#007AFF'} />
              </TouchableOpacity> */}
            </View>

            <View style={styles.modalTitleContainer}>
              <Icon iconSet="FontAwesome" name="globe" size={16} color={COLORS.textSecondary || '#8E8E93'} style={styles.modalTitleIcon} />
              <Text style={styles.modalTitle} numberOfLines={1} ellipsizeMode="tail">
                {isLoading && loadingProgress < 1 ? '' : pageTitle}
              </Text>
            </View>

            <View style={styles.headerActionControls}>
              <View style={styles.moreOptionsContainer}>
                <TouchableOpacity onPress={() => setIsMoreMenuVisible(prev => !prev)} style={styles.modalActionButton}>
                  <Icon iconSet="Ionicons" name="ellipsis-vertical" size={24} color={COLORS.primary || '#007AFF'} />
                </TouchableOpacity>
                {isMoreMenuVisible && (
                  <View style={styles.moreOptionsMenu}>
                    <TouchableOpacity style={styles.menuItem} onPress={shareUrl}>
                      <Icon name="share-outline" iconSet="Ionicons" size={20} color={COLORS.text || '#000000'} style={styles.menuItemIcon} />
                      <Text style={styles.menuItemText}>Share URL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={openInBrowser}>
                      <Icon name="open-outline" iconSet="Ionicons" size={20} color={COLORS.text || '#000000'} style={styles.menuItemIcon} />
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

          <View style={styles.contentAreaContainer}>
            {/* Progress Bar - shown when isLoading is true AND there's progress > 0 and < 1 */}
            {isLoading && loadingProgress > 0 && loadingProgress < 1 && <ProgressBar progress={loadingProgress} />}

            {initialSearchUrl ? (
              <WebView
                ref={webViewRef}
                originWhitelist={['https://*', 'http://*']}
                source={{ uri: initialSearchUrl }}
                style={styles.modalWebView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true} // WebView will show its own loading state (e.g., spinner or blank)
                // renderLoading prop REMOVED
                setSupportMultipleWindows={false}
                forceDarkOff={true}
                preferredColorScheme="light"
                onNavigationStateChange={handleNavigationStateChange}
                onLoadProgress={handleLoadProgress}
                renderError={renderError}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error('Search WebView error:', nativeEvent);
                }}
                onHttpError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('Search WebView HTTP error:', nativeEvent.statusCode, nativeEvent.url);
                  if (nativeEvent.statusCode === 403 || nativeEvent.statusCode === 400) {
                    Alert.alert(
                      "Access Issue",
                      "Google may be restricting access from within the app for this search or page. Try opening in your browser.",
                      [
                        { text: "Open in Browser", onPress: () => { openInBrowser(); handleCloseModal(); }},
                        { text: "Cancel", onPress: handleCloseModal, style: "cancel" }
                      ]
                    );
                  }
                }}
              />
            ) : (
              <View style={styles.placeholderView}>
                <Icon iconSet="Ionicons" name="search-outline" size={48} color={COLORS.textDisabled || '#AEAEB2'} />
                <Text style={styles.placeholderText}>
                  {searchQuery === null || searchQuery === undefined ? "No search query provided." : "Enter a search query to begin."}
                </Text>
              </View>
            )}

            {isMoreMenuVisible && (
              <Pressable
                onPress={() => setIsMoreMenuVisible(false)}
                style={styles.menuBackdrop}
              />
            )}
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
    paddingHorizontal: 0,
    paddingBottom: 0,
    height: '70%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 25,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight || '#E0E0E0',
    zIndex: 10,
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
    gop:6,
    marginHorizontal: 5,
  },
  modalTitleIcon: {
    marginRight: 6,
  },
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
    marginLeft: 0,
  },
  moreOptionsContainer: {
    position: 'relative',
    marginRight: Platform.OS === 'ios' ? 0 : 4,
  },
  moreOptionsMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: COLORS.surface || '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 100,
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
  menuBackdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 50,
  },
  contentAreaContainer: {
    flex: 1,
    position: 'relative',
    paddingBottom: Platform.OS === 'ios' ? 20 : 15,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: COLORS.borderLight || '#E0E0E0',
    // No absolute positioning needed if it's part of the flow
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary || '#007AFF',
  },
  modalWebView: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.surface || '#FFFFFF', // Match modal background to avoid flash
  },
  // modalLoadingViewAbsolute and loadingText styles REMOVED
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
  },
  errorActionButton: {
    backgroundColor: COLORS.secondary || '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
  },
  errorActionButtonText: {
    color: COLORS.white || '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorCloseButton: {
    backgroundColor: COLORS.primary || '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
  },
  errorCloseButtonText: {
    color: COLORS.white || '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchWebViewModal;