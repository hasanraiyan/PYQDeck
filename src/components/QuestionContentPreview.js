import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from './Icon'; // Assuming Icon component path
import { COLORS as IMPORTED_COLORS } from '../constants'; // Assuming constants path
import GlobalLoadingIndicator from './GlobalLoadingIndicator'; // Import the new component

// Ensure COLORS is an object, even if the import fails or constants.js doesn't export it properly.
const COLORS = IMPORTED_COLORS || {};

const PREVIEW_WEBVIEW_MIN_HEIGHT = 60;
const PREVIEW_WEBVIEW_MAX_HEIGHT = 100;

const injectedJavaScript = `
  (function() {
    function sendHeight() {
      var height = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      );
      // Ensure a string is posted, even if height is somehow not a number (shouldn't happen with Math.max)
      window.ReactNativeWebView.postMessage(String(height || 0));
    }

    if (document.readyState === 'complete') {
      sendHeight();
    } else {
      window.addEventListener('load', sendHeight);
    }

    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, {
      attributes: true, childList: true, subtree: true, characterData: true
    });

    setTimeout(sendHeight, 300);
    setTimeout(sendHeight, 1000);
  })();
  true; // Required for Android
`;

const QuestionContentPreview = React.memo(({ htmlContent, onShouldOpenModal }) => {
  const [webViewHeight, setWebViewHeight] = useState(PREVIEW_WEBVIEW_MIN_HEIGHT);
  const [isContentTruncated, setIsContentTruncated] = useState(false);
  const [webViewLoadError, setWebViewLoadError] = useState(false);

  const handleWebViewMessage = useCallback((event) => {
    const rawHeight = event.nativeEvent.data;
    if (rawHeight === "ignore" || rawHeight === undefined || rawHeight === null) return;

    const calculatedHeight = parseInt(rawHeight, 10);

    if (!isNaN(calculatedHeight) && calculatedHeight >= 0) { // Allow 0 height for empty content
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
    console.warn('Preview WebView error:', nativeEvent.description || `Code: ${nativeEvent.code}`, nativeEvent.url);
    setWebViewLoadError(true);
    setWebViewHeight(PREVIEW_WEBVIEW_MIN_HEIGHT);
  }, []);

  const canExpand = isContentTruncated || webViewLoadError;

  const safeHtmlContent = htmlContent || ''; // Ensure htmlContent is a string

  const fullHtmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 15px;
            line-height: 1.5;
            color: ${COLORS.text || '#212121'}; /* More specific default */
            background-color: transparent;
            overflow-wrap: break-word;
            word-break: break-word; /* Ensure long words break */
          }
          * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          img, video, iframe { max-width: 100%; height: auto; display: block; }
          /* Prevent selection to make it feel more like a preview */
          /* You might want to remove this if copy-paste from preview is desired */
          /* body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; } */
        </style>
      </head>
      <body>
        ${safeHtmlContent}
      </body>
    </html>
  `;

  return (
    <TouchableOpacity
      onPress={canExpand ? onShouldOpenModal : undefined}
      activeOpacity={canExpand ? 0.7 : 1.0}
      disabled={!canExpand}
      style={styles.markdownTouchable}
    >
      <View style={styles.markdownCard}>
        <View style={[styles.contentWrapper, { height: webViewHeight }]}>
          {webViewLoadError ? (
            <View style={[styles.feedbackContainer, styles.errorContainer, { height: '100%' }]}>
              <Icon name="alert-circle-outline" iconSet="Ionicons" size={30} color={COLORS.error || '#FF3B30'} />
              <Text style={styles.feedbackText}>Failed to load preview</Text>
              {onShouldOpenModal && <Text style={styles.feedbackHint}>Tap to try in full view</Text>}
            </View>
          ) : (
            <WebView
              originWhitelist={['*']}
              source={{ html: fullHtmlContent }}
              style={[styles.webview, { height: webViewHeight }]}
              containerStyle={styles.webviewContainerStyle}
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
              renderLoading={() => (
                <GlobalLoadingIndicator
                  size="small"
                  text="Loading preview..."
                  style={[styles.feedbackContainer, styles.loadingContainer, { height: '100%' }]} // Apply to wrapper
                  textStyle={styles.feedbackText} // Apply specific text style
                />
              )}
              androidHardwareAccelerationDisabled={Platform.OS === 'android' && webViewLoadError}
              allowsInlineMediaPlayback={true}
              textZoom={80} // Prevent system font size affecting WebView content too much
              // onShouldStartLoadWithRequest={() => true} // Default, but can be useful for debugging
              // decelerationRate="normal" // Default
            />
          )}
        </View>

        {isContentTruncated && !webViewLoadError && (
          <View style={styles.expandIndicator}>
            <Text style={styles.expandIndicatorText}>Tap to see more</Text>
            <Icon name="chevron-down" iconSet="Ionicons" size={22} color={COLORS.primary || '#007AFF'} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  markdownTouchable: {
    marginVertical: 8,
  },
  markdownCard: {
    backgroundColor: COLORS.surface || '#FFFFFF',
    // borderRadius: 12,
    paddingHorizontal: 16,
    // shadowColor: COLORS.shadow || '#000000', // Added fallback for shadow color too
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  contentWrapper: {
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'transparent', // WebView has its own logic for body background
  },
  webviewContainerStyle: {
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  webview: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  feedbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  loadingContainer: {
    // backgroundColor transparent by default from parent
  },
  errorContainer: {
    backgroundColor: `${(COLORS.error || '#FF3B30')}1A`, // 10% opacity for error color
    borderRadius: 6,
  },
  feedbackText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textSecondary || '#8A8A8E',
    textAlign: 'center',
  },
  feedbackHint: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textTertiary || '#AEAEB2',
    textAlign: 'center',
  },
  expandIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${(COLORS.surface || '#FFFFFF')}E6`, // ~90% opacity

    paddingTop: 8,
    borderTopColor: COLORS.border || '#D1D1D6',
  },
  expandIndicatorText: {
    color: COLORS.primary || '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
});

export default QuestionContentPreview;