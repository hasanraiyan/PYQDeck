import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from './Icon'; // Assuming Icon component path
import { COLORS } from '../constants'; // Assuming constants path

const PREVIEW_WEBVIEW_MIN_HEIGHT = 80;
const PREVIEW_WEBVIEW_MAX_HEIGHT = 150;

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
    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    setTimeout(sendHeight, 500);
    setTimeout(sendHeight, 1500);
  })();
  true; // Required
`;

const QuestionContentPreview = React.memo(({ htmlContent, onShouldOpenModal }) => {
  const [webViewHeight, setWebViewHeight] = useState(PREVIEW_WEBVIEW_MIN_HEIGHT);
  const [isContentTruncated, setIsContentTruncated] = useState(false);
  const [webViewLoadError, setWebViewLoadError] = useState(false);

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

  const canExpand = isContentTruncated || webViewHeight >= PREVIEW_WEBVIEW_MAX_HEIGHT || webViewLoadError;

  return (
    <TouchableOpacity
      onPress={canExpand ? onShouldOpenModal : undefined}
      activeOpacity={canExpand ? 0.7 : 1.0}
      disabled={!canExpand}
      style={styles.markdownTouchable}
    >
      <View style={[styles.markdownContainer, { minHeight: webViewHeight }]}>
        {webViewLoadError ? (
          <View style={[styles.webViewFeedbackContainer, styles.webViewErrorContainer, { height: webViewHeight }]}>
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
            onHttpError={handleWebViewError}
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
  );
});

const styles = StyleSheet.create({
  markdownTouchable: {
    // Styles for the touchable area if needed
  },
  markdownContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    // paddingTop: 8, // Added from original QuestionItem
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
});

export default QuestionContentPreview;