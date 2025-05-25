import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Alert,
  Share,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, UNCAT_CHAPTER_NAME } from '../constants'; // Ensure these are correctly defined in your project
import { getQuestionPlainText } from '../helpers/helpers'; // Ensure this helper exists
import { toggleBookmark, isQuestionBookmarked } from '../helpers/bookmarkHelpers'; // Ensure these helpers exist
import Icon from './Icon'; // Ensure this custom Icon component exists and works
import generateHTML from '../helpers/generateHTML'; // Ensure this helper exists

const PREVIEW_WEBVIEW_MIN_HEIGHT = 80;
const PREVIEW_WEBVIEW_MAX_HEIGHT = 150;

const QuestionItem = ({ item, isCompleted, onToggleComplete, onCopy, onSearch, onAskAI }) => {
    const plainText = useMemo(
      () => getQuestionPlainText(item.text),
      [item.text]
    );

    const htmlContent = useMemo(() => {
      // Basic default colors if COLORS are not fully defined
      const textColor = COLORS.text || '#333333';
      const surfaceColor = COLORS.surface || '#FFFFFF';
      const bodyStyles = `body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: ${textColor}; background-color: ${surfaceColor}; } img { max-width: 100%; height: auto; border-radius: 6px; }`;
      return generateHTML(item.text, `<style>${bodyStyles}</style>`);
    }, [item.text]);

    const [bookmarked, setBookmarked] = useState(false);
    useEffect(() => {
      let mounted = true;
      isQuestionBookmarked(item.questionId).then((res) => {
        if (mounted) setBookmarked(res);
      });
      return () => { mounted = false; };
    }, [item.questionId]);

    const [webViewHeight, setWebViewHeight] = useState(PREVIEW_WEBVIEW_MIN_HEIGHT);
    const [isContentTruncated, setIsContentTruncated] = useState(false);
    const [isWebViewModalVisible, setIsWebViewModalVisible] = useState(false);
    const [webViewLoadError, setWebViewLoadError] = useState(false);

    // State for Search Modal
    const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
    const [currentSearchQuery, setCurrentSearchQuery] = useState('');

    const injectedJavaScript = `
      (function() {
        function sendHeight() {
          var height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight);
          window.ReactNativeWebView.postMessage(String(height));
        }
        if (document.readyState === 'complete') {
          sendHeight();
        } else {
          window.addEventListener('load', sendHeight);
        }
        // Additional triggers for height adjustment
        const observer = new MutationObserver(sendHeight);
        observer.observe(document.body, { attributes: true, childList: true, subtree: true });
        setTimeout(sendHeight, 500); // Fallback
        setTimeout(sendHeight, 1500); // Another fallback for slower content
      })();
      true; // note: this is required, or you'll sometimes get silent failures
    `;

    const handleWebViewMessage = useCallback((event) => {
      const rawHeight = event.nativeEvent.data;
      const calculatedHeight = parseInt(rawHeight, 10);

      if (!isNaN(calculatedHeight) && calculatedHeight > 10) {
        if (calculatedHeight > PREVIEW_WEBVIEW_MAX_HEIGHT) {
          setWebViewHeight(PREVIEW_WEBVIEW_MAX_HEIGHT);
          setIsContentTruncated(true);
        } else {
          setWebViewHeight(Math.max(calculatedHeight, PREVIEW_WEBVIEW_MIN_HEIGHT));
          setIsContentTruncated(false);
        }
      } else {
         setWebViewHeight(PREVIEW_WEBVIEW_MIN_HEIGHT);
      }
      setWebViewLoadError(false);
    }, []);
    
    const handleWebViewError = useCallback((syntheticEvent) => {
      const { nativeEvent } = syntheticEvent;
      console.error('Preview WebView error:', nativeEvent);
      setWebViewLoadError(true);
      setWebViewHeight(PREVIEW_WEBVIEW_MIN_HEIGHT); 
    }, []);


    const openWebViewModal = useCallback(() => {
      if (isContentTruncated || webViewHeight >= PREVIEW_WEBVIEW_MAX_HEIGHT || webViewLoadError) {
         setIsWebViewModalVisible(true);
      }
    }, [isContentTruncated, webViewHeight, webViewLoadError]);

    const closeWebViewModal = useCallback(() => {
      setIsWebViewModalVisible(false);
    }, []);

    const handleBookmark = useCallback(async () => {
      const newState = await toggleBookmark(item.questionId);
      setBookmarked(newState);
    }, [item.questionId]);

    const handleCopy = useCallback(() => onCopy(plainText), [onCopy, plainText]);
    
    const openSearchModal = useCallback((query) => {
        setCurrentSearchQuery(query);
        setIsSearchModalVisible(true);
    }, []);

    const closeSearchModal = useCallback(() => {
        setIsSearchModalVisible(false);
        setCurrentSearchQuery(''); 
    }, []);

    const handleSearch = useCallback(() => {
      // If you still need to notify the parent component, uncomment the line below
      // if (onSearch) onSearch(plainText);
      openSearchModal(plainText);
    }, [plainText, openSearchModal]); 

    const handleToggle = useCallback(
      () => onToggleComplete(item.questionId, !isCompleted),
      [onToggleComplete, item.questionId, isCompleted]
    );

    const handleAskAIInternal = useCallback(() => {
      onAskAI(item);
    }, [onAskAI, item]);

    const handleShareText = async () => {
      try {
        await Share.share({ message: plainText });
      } catch (e) {
        Alert.alert('Error', 'Could not share the question.');
      }
    };

    const renderTags = () => {
        const tags = [];
        if (item.year) {
            tags.push(
                <View key="year-tag" style={[styles.tag, styles.tagYear]}>
                    <Text style={[styles.tagText, { color: COLORS.tagYearText || COLORS.primary || '#007AFF' }]}> {item.year} </Text>
                </View>
            );
        }
        if (item.qNumber) {
            tags.push(
                <View key="qNumber-tag" style={[styles.tag, styles.tagQNum]}>
                    <Text style={[styles.tagText, { color: COLORS.tagQNumText || COLORS.accent || '#FF9500' }]}> {item.qNumber} </Text>
                </View>
            );
        }
        if (item.marks != null) {
            tags.push(
                <View key="marks-tag" style={[styles.tag, styles.tagMarks]}>
                    <Text style={[styles.tagText, { color: COLORS.tagMarksText || COLORS.secondary || '#34C759' }]}> {item.marks} Marks </Text>
                </View>
            );
        }
        return tags;
    };

    return (
      <View style={styles.container}>
        <View style={styles.headerContent}>
            <View style={styles.metaRow}>
            <View style={styles.metaTagsContainer}>
                {renderTags()}
            </View>
            <View style={styles.metaActions}>
                <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkButton} accessibilityLabel={bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}>
                    <Icon
                    iconSet="Ionicons"
                    name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={24} 
                    color={bookmarked ? (COLORS.primary || '#007AFF') : (COLORS.textSecondary || '#8E8E93')}
                    />
                </TouchableOpacity>
                <Switch
                    trackColor={{ false: COLORS.disabledBackground || '#E5E5EA', true: COLORS.completed || (COLORS.primaryLight || '#7ABFFF') }}
                    thumbColor={isCompleted ? (COLORS.completedThumb || COLORS.primary || '#007AFF') : (Platform.OS === 'android' ? (COLORS.surface || '#FFFFFF') : (COLORS.disabledBackground || '#E5E5EA'))}
                    ios_backgroundColor={COLORS.disabledBackground || '#E5E5EA'}
                    onValueChange={handleToggle}
                    value={isCompleted}
                    style={styles.completionSwitch}
                />
            </View>
            </View>

            {(item.chapter || UNCAT_CHAPTER_NAME) && (
                <View style={styles.chapterRow}>
                    <Icon 
                        iconSet="Ionicons" 
                        name={item.chapter ? "layers-outline" : "help-circle-outline"} 
                        size={16} 
                        color={item.chapter ? (COLORS.chapterIcon || COLORS.textSecondary || '#8E8E93') : (COLORS.textTertiary || '#C7C7CC')} 
                        style={styles.chapterIcon} 
                    />
                    <Text style={[styles.chapterText, !item.chapter && styles.uncategorizedChapterText]} numberOfLines={1}>
                    {item.chapter || UNCAT_CHAPTER_NAME}
                    </Text>
                </View>
            )}
        </View>


        <TouchableOpacity
            onPress={openWebViewModal}
            activeOpacity={(isContentTruncated || webViewHeight >= PREVIEW_WEBVIEW_MAX_HEIGHT || webViewLoadError) ? 0.7 : 1.0}
            disabled={!(isContentTruncated || webViewHeight >= PREVIEW_WEBVIEW_MAX_HEIGHT || webViewLoadError)}
            style={styles.markdownTouchable}
        >
            <View style={[styles.markdownContainer, {minHeight: webViewHeight}]}>
            {webViewLoadError ? (
                <View style={[styles.webViewFeedbackContainer, styles.webViewErrorContainer, {height: webViewHeight}]}>
                    <Icon name="alert-circle-outline" iconSet="Ionicons" size={30} color={COLORS.error || '#FF3B30'} />
                    <Text style={styles.webViewFeedbackText}>Failed to load content</Text>
                    <Text style={styles.webViewErrorHint}>Tap to retry or view raw</Text>
                </View>
            ) : (
                <WebView
                    originWhitelist={['*']}
                    source={{ html: htmlContent }}
                    style={[styles.webview, { height: webViewHeight }]}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    mixedContentMode="compatibility"
                    onMessage={handleWebViewMessage}
                    injectedJavaScript={injectedJavaScript}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    onError={handleWebViewError}
                    onHttpError={handleWebViewError} // Good to catch HTTP errors too
                    startInLoadingState={true}
                    containerStyle={styles.webViewContentContainer}
                    renderLoading={() => (
                    <View style={[styles.webViewFeedbackContainer, styles.webViewLoadingContainer, { height: webViewHeight }]}>
                        <ActivityIndicator size="small" color={COLORS.primary || '#007AFF'} />
                        <Text style={styles.webViewFeedbackText}>Loading content...</Text>
                    </View>
                    )}
                />
            )}
            {isContentTruncated && !webViewLoadError && (
                <View style={styles.expandIndicator}>
                    <Text style={styles.expandIndicatorText}>Tap to see more</Text>
                    <Icon name="chevron-down" iconSet="Ionicons" size={20} color={COLORS.primary || '#007AFF'} />
                </View>
            )}
            </View>
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          <View style={styles.actionsLeft}>
            <TouchableOpacity onPress={handleSearch} style={styles.iconButton} accessibilityLabel="Search question on Google">
              <Icon iconSet="FontAwesome" name="google" size={20} color={COLORS.textSecondary || '#8E8E93'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCopy} style={styles.iconButton} accessibilityLabel="Copy question text">
              <Icon iconSet="Ionicons" name="copy-outline" size={22} color={COLORS.textSecondary || '#8E8E93'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShareText} style={styles.iconButton} accessibilityLabel="Share question">
              <Icon iconSet="Ionicons" name="share-social-outline" size={22} color={COLORS.textSecondary || '#8E8E93'} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.askAiButton} onPress={handleAskAIInternal} activeOpacity={0.8}>
            <Icon 
                iconSet="MaterialCommunityIcons" 
                name="robot-happy-outline" 
                size={18} 
                color={COLORS.white || '#FFFFFF'}
                style={styles.askAiButtonIcon} 
            />
            <Text style={styles.askAiButtonText}>Ask AI</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for Full Question Content */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isWebViewModalVisible}
          onRequestClose={closeWebViewModal}
        >
          <SafeAreaView style={styles.modalOverlay}>
            <View style={styles.modalView}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Question Content</Text>
                    <TouchableOpacity onPress={closeWebViewModal} style={styles.modalCloseButton}>
                        <Icon iconSet="Ionicons" name="close" size={28} color={COLORS.textSecondary || '#8E8E93'} />
                    </TouchableOpacity>
                </View>
                <WebView
                    originWhitelist={['*']}
                    source={{ html: htmlContent }}
                    style={{margin: 10}} // Add some padding
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    mixedContentMode="compatibility"
                    startInLoadingState={true}
                    renderLoading={() => (
                    <View style={styles.modalLoadingView}>
                        <ActivityIndicator size="large" color={COLORS.primary || '#007AFF'} />
                    </View>
                    )}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.error('Modal WebView error:', nativeEvent);
                        Alert.alert("Error", "Could not load content fully.");
                        closeWebViewModal();
                    }}
                />
            </View>
          </SafeAreaView>
        </Modal>

        {/* Modal for Google Search */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isSearchModalVisible}
          onRequestClose={closeSearchModal}
        >
          <SafeAreaView style={styles.modalOverlay}>
            <View style={styles.modalView}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Google Search</Text>
                    <TouchableOpacity onPress={closeSearchModal} style={styles.modalCloseButton}>
                        <Icon iconSet="Ionicons" name="close" size={28} color={COLORS.textSecondary || '#8E8E93'} />
                    </TouchableOpacity>
                </View>
                {currentSearchQuery ? (
                    <WebView
                        originWhitelist={['https://*', 'http://*']} 
                        source={{ uri: `https://www.google.com/search?q=${encodeURIComponent(currentSearchQuery)}` }}
                        style={[styles.modalWebView, { padding: 0 }]} // No padding for external site
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        setSupportMultipleWindows={false} 
                        renderLoading={() => (
                            <View style={styles.modalLoadingView}>
                                <ActivityIndicator size="large" color={COLORS.primary || '#007AFF'} />
                            </View>
                        )}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.error('Search WebView error:', nativeEvent);
                            Alert.alert(
                                "Search Error", 
                                "Could not load Google search results in the app. This might be due to Google's security policies. You can try searching in your browser.",
                                [{ text: "OK", onPress: closeSearchModal }]
                            );
                        }}
                        onHttpError={(syntheticEvent) => { 
                            const { nativeEvent } = syntheticEvent;
                            console.warn('Search WebView HTTP error:', nativeEvent.statusCode, nativeEvent.url);
                            // You might want to show a less severe error or just log it
                            if (nativeEvent.statusCode === 403 || nativeEvent.statusCode === 400) { // Example status codes
                                // Alert.alert("Notice", "Google may be restricting access from within apps for some searches.");
                            }
                        }}
                    />
                ) : (
                    <View style={[styles.modalLoadingView, { justifyContent: 'center'}]}> 
                        <Text style={{color: COLORS.textSecondary || '#8E8E93'}}>Preparing search...</Text>
                    </View>
                )}
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface || '#FFFFFF',
    borderRadius: 16,
    marginVertical: 8,
    // marginHorizontal: Platform.OS === 'ios' ? 16 : 12, // Standardized horizontal margin
    shadowColor: COLORS.shadow || '#000000',
    shadowOffset: { width: 0, height: 2 }, // Subtle shadow
    shadowOpacity: 0.08, // More subtle
    shadowRadius: 6,   // Softer
    elevation: 3,      // Android shadow
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
  },
  metaTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center', 
    flex: 1, 
  },
  tag: {
    borderRadius: 16, 
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6, 
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagYear: { 
    borderColor: COLORS.tagYearText || COLORS.primary || '#007AFF', 
    backgroundColor: (COLORS.tagYearBg || (COLORS.primary || '#007AFF') + '1A') 
  },
  tagQNum: { 
    borderColor: COLORS.tagQNumText || COLORS.accent || '#FF9500', 
    backgroundColor: (COLORS.tagQNumBg || (COLORS.accent || '#FF9500') + '1A') 
  },
  tagMarks: { 
    borderColor: COLORS.tagMarksText || COLORS.secondary || '#34C759', 
    backgroundColor: (COLORS.tagMarksBg || (COLORS.secondary || '#34C759') + '1A') 
  },
  metaActions: {
    flexDirection: 'row',
    justifyContent:'center',
    alignItems: 'center', 
  },
  bookmarkButton: {
    padding: 6, // Increased touch target
  },
  completionSwitch: {
    transform: Platform.OS === 'ios' ? [{ scaleX: 0.85 }, { scaleY: 0.85 }] : [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    marginLeft: Platform.OS === 'ios' ? 4 : 0,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
    paddingHorizontal: 16,
    marginHorizontal: -16, // To make border full width if headerContent has padding
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLightest || '#F0F0F0',
  },
  chapterIcon: {
    marginRight: 8,
  },
  chapterText: {
    fontSize: 13,
    color: COLORS.textSecondary || '#8E8E93',
    fontWeight: '500',
    flexShrink: 1, // Important for long chapter names
  },
  uncategorizedChapterText: {
    fontStyle: 'italic',
    color: COLORS.textTertiary || '#C7C7CC',
  },
  markdownTouchable: {
    
  },
  markdownContainer: { 
    paddingHorizontal: 16,
    paddingBottom: 8, 
  },
  webViewContentContainer: {
    backgroundColor: COLORS.surface || '#FFFFFF', 
    borderRadius: 6, 
    overflow: 'hidden', 
  },
  webview: {
    width: '100%',
    backgroundColor: 'transparent', 
  },
  webViewFeedbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
  },
  webViewLoadingContainer: {
    backgroundColor: 'transparent',
  },
  webViewErrorContainer: {
    backgroundColor: (COLORS.errorBackground || (COLORS.error || '#FF3B30') + '1A'),
  },
  webViewFeedbackText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textSecondary || '#8E8E93',
    textAlign: 'center',
  },
  webViewErrorHint: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textTertiary || '#C7C7CC',
    textAlign: 'center',
  },
  expandIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', 
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `${COLORS.surface || '#FFFFFF'}E6`, 
    paddingBottom: 10, 
    paddingTop: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  expandIndicatorText: {
    color: COLORS.primary || '#007AFF',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12, 
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLightest || '#F0F0F0',
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 10, 
    marginRight: 4, 
  },
  askAiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary || '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20, 
    shadowColor: COLORS.primary || '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    gap: 4,
    shadowRadius: 4,
    elevation: 4,
  },
  askAiButtonIcon: {
    marginRight: 6, // For gap
  },
  askAiButtonText: {
    color: COLORS.white || '#FFFFFF', 
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'flex-end', 
  },
  modalView: {
    backgroundColor: COLORS.surface || '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 0, 
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, 
    maxHeight: '95%', // Increased max height
    minHeight: '60%', // Increased min height
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 20, 
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20, 
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight || '#E0E0E0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text || '#000000',
  },
  modalCloseButton: {
    padding: 8, 
  },
  modalWebView: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.surface || '#FFFFFF',
  },
  modalLoadingView: {
    position: 'absolute', 
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: (COLORS.surface || '#FFFFFF') + 'CC', 
  },
});

export default React.memo(QuestionItem);