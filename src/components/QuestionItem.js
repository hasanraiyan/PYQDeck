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
} from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, UNCAT_CHAPTER_NAME } from '../constants';
import { getQuestionPlainText } from '../helpers/helpers';
import { toggleBookmark, isQuestionBookmarked } from '../helpers/bookmarkHelpers';
import Icon from './Icon';
import { Share, Alert } from 'react-native';
import generateHTML from '../helpers/generateHTML';

const PREVIEW_WEBVIEW_MIN_HEIGHT = 80;
const PREVIEW_WEBVIEW_MAX_HEIGHT = 200;

const QuestionItem = ({ item, isCompleted, onToggleComplete, onCopy, onSearch, onAskAI }) => {
    const plainText = useMemo(
      () => getQuestionPlainText(item.text),
      [item.text]
    );

    const htmlContent = useMemo(() => {
      const bodyStyles = `body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: ${COLORS.text || '#333'}; background-color: ${COLORS.surface || '#fff'}; } img { max-width: 100%; height: auto; border-radius: 6px; }`;
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
        setTimeout(sendHeight, 500);
      })();
      true;
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
      console.error('WebView error:', nativeEvent);
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
    const handleSearch = useCallback(() => onSearch(plainText), [onSearch, plainText]);
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

    // ----- FIX FOR TEXT STRING WARNING: Programmatically build tags -----
    const renderTags = () => {
        const tags = [];
        if (item.year) {
            tags.push(
                <View key="year-tag" style={[styles.tag, styles.tagYear]}>
                    <Text style={[styles.tagText, { color: COLORS.tagYearText || COLORS.primary }]}> {item.year} </Text>
                </View>
            );
        }
        if (item.qNumber) {
            tags.push(
                <View key="qNumber-tag" style={[styles.tag, styles.tagQNum]}>
                    <Text style={[styles.tagText, { color: COLORS.tagQNumText || COLORS.accent }]}> {item.qNumber} </Text>
                </View>
            );
        }
        if (item.marks != null) {
            tags.push(
                <View key="marks-tag" style={[styles.tag, styles.tagMarks]}>
                    <Text style={[styles.tagText, { color: COLORS.tagMarksText || COLORS.secondary }]}> {item.marks} Marks </Text>
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
                {/* Render the programmatically built tags */}
                {renderTags()}
            </View>
            <View style={styles.metaActions}>
                <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkButton} accessibilityLabel={bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}>
                    <Icon
                    iconSet="Ionicons"
                    name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={24} 
                    color={bookmarked ? COLORS.primary : COLORS.textSecondary}
                    />
                </TouchableOpacity>
                <Switch
                    trackColor={{ false: COLORS.disabledBackground, true: COLORS.completed || COLORS.primaryLight }}
                    thumbColor={isCompleted ? (COLORS.completedThumb || COLORS.primary) : (Platform.OS === 'android' ? COLORS.surface : COLORS.disabledBackground)}
                    ios_backgroundColor={COLORS.disabledBackground}
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
                        color={item.chapter ? (COLORS.chapterIcon || COLORS.textSecondary) : COLORS.textTertiary} 
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
                <View style={[styles.webViewFeedbackContainer, styles.webViewErrorContainer]}>
                    <Icon name="alert-circle-outline" iconSet="Ionicons" size={30} color={COLORS.error} />
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
                    startInLoadingState={true}
                    containerStyle={styles.webViewContentContainer}
                    renderLoading={() => (
                    <View style={[styles.webViewFeedbackContainer, styles.webViewLoadingContainer, { height: webViewHeight }]}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.webViewFeedbackText}>Loading content...</Text>
                    </View>
                    )}
                />
            )}
            {isContentTruncated && !webViewLoadError && (
                <View style={styles.expandIndicator}>
                    <Text style={styles.expandIndicatorText}>Tap to see more</Text>
                    <Icon name="chevron-down" iconSet="Ionicons" size={20} color={COLORS.primary} />
                </View>
            )}
            </View>
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          <View style={styles.actionsLeft}>
            <TouchableOpacity onPress={handleSearch} style={styles.iconButton} accessibilityLabel="Search question">
              <Icon iconSet="FontAwesome" name="google" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCopy} style={styles.iconButton} accessibilityLabel="Copy question text">
              <Icon iconSet="Ionicons" name="copy-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShareText} style={styles.iconButton} accessibilityLabel="Share question">
              <Icon iconSet="Ionicons" name="share-social-outline" size={22} color={COLORS.textSecondary} />
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
                        <Icon iconSet="Ionicons" name="close" size={28} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>
                <WebView
                    originWhitelist={['*']}
                    source={{ html: htmlContent }}
                    style={styles.modalWebView}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    mixedContentMode="compatibility"
                    startInLoadingState={true}
                    renderLoading={() => (
                    <View style={styles.modalLoadingView}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
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
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: COLORS.shadow || '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerContent: {
    paddingHorizontal: 8,
    paddingTop: 0,
    paddingBottom: 0,
  },
  metaRow: {
    padding:4,
    paddingBottom: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
  },
  metaTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center', 
    flex: 1, 
    marginRight: 8, 
  },
  tag: {
    borderRadius: 16, 
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6, // This will space out the tags correctly when rendered from an array
    marginBottom: 6, 
    borderWidth: 1,
    backgroundColor: COLORS.background, 
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagYear: { borderColor: COLORS.tagYearText || COLORS.primary, backgroundColor: (COLORS.tagYearBg || COLORS.primary) + '1A' },
  tagQNum: { borderColor: COLORS.tagQNumText || COLORS.accent, backgroundColor: (COLORS.tagQNumBg || COLORS.accent) + '1A' },
  tagMarks: { borderColor: COLORS.tagMarksText || COLORS.secondary, backgroundColor: (COLORS.tagMarksBg || COLORS.secondary) + '1A' },
  
  metaActions: {
    flexDirection: 'row',
    justifyContent:'center',
    alignItems: 'center', 
  },
  bookmarkButton: {
    padding: 6,
  },
  completionSwitch: {
    transform: Platform.OS === 'ios' ? [{ scaleX: 0.85 }, { scaleY: 0.85 }] : [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    marginLeft: 8, 
  },

  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLightest || '#f0f0f0',
  },
  chapterIcon: {
    marginRight: 8,
  },
  chapterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
  },
  uncategorizedChapterText: {
    fontStyle: 'italic',
    color: COLORS.textTertiary,
  },

  markdownTouchable: {},
  markdownContainer: { 
    paddingHorizontal: 16,
    paddingBottom: 8, 
    backgroundColor: COLORS.surface, 
  },
  webViewContentContainer: {
    backgroundColor: COLORS.surface, 
    borderRadius: 6, 
    overflow: 'hidden', 
  },
  webview: {
    width: '100%',
    backgroundColor: 'transparent', 
  },
  webViewFeedbackContainer: {
    height: PREVIEW_WEBVIEW_MIN_HEIGHT, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
  },
  webViewLoadingContainer: {
    backgroundColor: 'transparent',
  },
  webViewErrorContainer: {
    backgroundColor: (COLORS.errorBackground || COLORS.error) + '1A',
  },
  webViewFeedbackText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  webViewErrorHint: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  expandIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    position: 'absolute', 
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `${COLORS.surface}E6`, 
    paddingBottom: 10, 
  },
  expandIndicatorText: {
    color: COLORS.primary,
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
    borderTopColor: COLORS.borderLightest || '#f0f0f0',
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
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20, 
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    gap: 6,
    elevation: 4,
  },
  askAiButtonIcon: {
    margin: 6,

  },
  askAiButtonText: {
    color: COLORS.white || '#FFFFFF', 
    fontSize: 13,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    maxHeight: '90%',
    minHeight: '50%',
    shadowColor: '#000',
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
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalWebView: {
    flex: 1,
    padding: 20,
    width: '100%',
    backgroundColor: COLORS.surface,
  },
  modalLoadingView: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface + 'CC',
  },
});

export default React.memo(QuestionItem);