import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, UNCAT_CHAPTER_NAME } from '../constants';
import { getQuestionPlainText } from '../helpers/helpers';
import { toggleBookmark, isQuestionBookmarked } from '../helpers/bookmarkHelpers';
import Icon from './Icon';
import { Share, Alert } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const maxImageWidth = screenWidth - 2 * 15 - 20;

const CustomImageView = ({ src, alt }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [imageHeight, setImageHeight] = useState(150);

  useEffect(() => {
    if (src && !hasError) {
      Image.getSize(src, (width, height) => {
        const aspectRatio = width / height;
        const calculatedHeight = maxImageWidth / aspectRatio;
        setImageHeight(Math.max(150, Math.min(calculatedHeight, 300)));
      }, (error) => {
        console.warn(`Failed to get image size: ${src}`, error);
      });
    }
  }, [src, hasError]);

  const handleImagePress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.imageContainer}>
      {isLoading && (
        <View style={[styles.loadingContainer, { height: imageHeight }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
      {hasError ? (
        <View style={[styles.errorContainer, { height: imageHeight }]}>
          <Icon
            iconSet="Ionicons"
            name="image-outline"
            size={40}
            color={COLORS.error}
          />
          <Text style={styles.errorText}>Failed to load image</Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleImagePress}
          activeOpacity={0.9}
          style={styles.imageTouchable}
        >
          <Image
            source={{ uri: src }}
            style={[styles.questionImage, { height: imageHeight, opacity: isLoading ? 0 : 1 }]}
            accessibilityLabel={alt || 'Question Image'}
            onLoadEnd={() => {
              setTimeout(() => setIsLoading(false), 100);
            }}
            onError={(error) => {
              console.warn(`Failed to load image: ${src}`, error.nativeEvent?.error);
              setHasError(true);
              setIsLoading(false);
            }}
          />
          {!isLoading && (
            <View style={styles.imageOverlay}>
              <Icon
                iconSet="Ionicons"
                name="expand-outline"
                size={20}
                color={COLORS.surface}
              />
            </View>
          )}
        </TouchableOpacity>
      )}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
              <Icon iconSet="Ionicons" name="close" size={24} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.modalImageContainer}
            onPress={handleCloseModal}
            activeOpacity={1}
          >
            <Image
              source={{ uri: src }}
              style={styles.fullScreenImage}
              resizeMode="contain"
              accessibilityLabel={alt || 'Full Screen Image'}
            />
          </TouchableOpacity>
          <View style={styles.modalFooter}>
            <Text style={styles.imageCaption} numberOfLines={2}>
              {alt || 'Image'}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const parseMarkdownContent = (text) => {
  if (!text) return [{ type: 'text', content: '' }];

  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = imageRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }

    parts.push({
      type: 'image',
      alt: match[1],
      src: match[2]
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }

  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content: text
    });
  }

  return parts;
}

const generateHTML = (markdownContent) => {
  const escapedData = JSON.stringify(markdownContent)
    .replace(/</g, '\\u003c')
    .replace(/\//g, '\\/');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/13.0.1/markdown-it.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/markdown-it-texmath@1.0.0/texmath.min.js"></script>
  <style>
    body {
      padding: 0px;
      font-family: -apple-system, sans-serif;
      line-height: 1.4;
      font-size: 17px;
      line-height: 25px;
      color: ${COLORS.text};
      font-weight: 400;
    }
    pre {
      background-color: ${COLORS.disabledBackground};
      padding: 8px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: ${Platform.OS === 'ios' ? 'Menlo' : 'monospace'};
      background-color: ${COLORS.disabledBackground};
      border-radius: 8px;
      padding: 8px;
      font-size: 14px;
      color: ${COLORS.text};
    }
    code {
      background-color: ${COLORS.disabledBackground};
      padding-horizontal: 4px;
      padding-vertical: 1px;
      border-radius: 3px;
      font-family: ${Platform.OS === 'ios' ? 'Menlo' : 'monospace'};
      font-size: 14px;
      color: ${COLORS.text};
    }
    h1 {
      font-size: 22px;
      font-weight: bold;
      color: ${COLORS.primary};
      margin-bottom: 5px;
      margin-top: 10px;
    }
    h2 {
      font-size: 20px;
      font-weight: bold;
      color: ${COLORS.primary};
      margin-bottom: 5px;
      margin-top: 8px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    .katex { font-size: 1em !important; }
    .katex-display { margin: 1em 0; }
  </style>
</head>
<body>
  <div id="content"></div>

  <script>
    (function() {
      document.addEventListener('DOMContentLoaded', function() {
        const data = ${escapedData};

        const md = window.markdownit({
          html: true,
          linkify: true,
          typographer: true
        });

        const tm = window.texmath.use(window.katex, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\\(", right: "\\\)", display: false },
            { left: "\\\\[", right: "\\\\]", display: true }
          ]
        });

        md.use(tm);

        const contentDiv = document.getElementById('content');
        try {
          contentDiv.innerHTML = md.render(data);
        } catch (error) {
          contentDiv.innerHTML = '<p>Error rendering content</p>';
          console.error('Markdown rendering error:', error);
        }

        document.querySelectorAll('img').forEach(img => {
          img.onerror = () => {
            img.style.display = 'none';
          };
        });
      });
    })();
  </script>
</body>
</html>
  `;
};

const QuestionItem = React.memo(
  ({ item, isCompleted, onToggleComplete, onCopy, onSearch, onAskAI }) => {
    const plainText = useMemo(
      () => getQuestionPlainText(item.text),
      [item.text]
    );

    const [bookmarked, setBookmarked] = useState(false);
    useEffect(() => {
      let mounted = true;
      isQuestionBookmarked(item.questionId).then((res) => {
        if (mounted) setBookmarked(res);
      });
      return () => { mounted = false; };
    }, [item.questionId]);

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
        await Share.share({
          message: plainText,
        });
      } catch (e) {
        Alert.alert('Error', 'Could not share the question.');
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.metaRow}>
          <View style={styles.metaTagsContainer}>
            {item.year && (
              <View style={[styles.tag, styles.tagYear]}>
                <Text style={[styles.tagText, { color: COLORS.tagYearText }]}> {item.year} </Text>
              </View>
            )}
            {item.qNumber && (
              <View style={[styles.tag, styles.tagQNum]}>
                <Text style={[styles.tagText, { color: COLORS.tagQNumText }]}> {item.qNumber} </Text>
              </View>
            )}
            {item.marks != null && (
              <View style={[styles.tag, styles.tagMarks]}>
                <Text style={[styles.tagText, { color: COLORS.tagMarksText }]}> {item.marks} Marks </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkButton} accessibilityLabel={bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}>
            <Icon
              iconSet="Ionicons"
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={bookmarked ? COLORS.primary : COLORS.textSecondary}
            />
          </TouchableOpacity>
          <Switch
            trackColor={{
              false: COLORS.disabledBackground,
              true: COLORS.completed,
            }}
            thumbColor={
              isCompleted
                ? COLORS.completedThumb
                : Platform.OS === 'android'
                ? COLORS.surface
                : null
            }
            ios_backgroundColor={COLORS.disabledBackground}
            onValueChange={handleToggle}
            value={isCompleted}
            style={styles.completionSwitch}
          />
        </View>
        {item.chapter ? (
          <View style={styles.chapterRow}>
            <Icon iconSet="Ionicons" name="layers-outline" size={16} color={COLORS.chapterIcon} style={styles.chapterIcon} />
            <Text style={styles.chapterText} numberOfLines={1}> {item.chapter} </Text>
          </View>
        ) : (
          <View style={styles.chapterRow}>
            <Icon iconSet="Ionicons" name="help-circle-outline" size={16} color={COLORS.textSecondary} style={styles.chapterIcon} />
            <Text style={[styles.chapterText, { fontStyle: 'italic' }]}> {UNCAT_CHAPTER_NAME} </Text>
          </View>
        )}
        <View style={styles.markdownContainer}>
          <WebView
            originWhitelist={['*']}
            source={{ html: generateHTML(item.text) }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mixedContentMode="compatibility"
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
            }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
          />
        </View>
        <View style={styles.actionsRow}>
          <View style={styles.actionsLeft}>
            <TouchableOpacity
              onPress={handleSearch}
              style={styles.iconButton}
              accessibilityLabel="Search question on Google"
            >
              <Icon iconSet="FontAwesome" name="google" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCopy}
              style={styles.iconButton}
              accessibilityLabel="Copy question text"
            >
              <Icon iconSet="Ionicons" name="copy-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShareText}
              style={styles.iconButton}
              accessibilityLabel="Share question as text"
            >
              <Icon iconSet="Ionicons" name="share-social-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.askAiButton}
            onPress={handleAskAIInternal}
            activeOpacity={0.8}
            accessibilityLabel="Ask AI (e.g., ChatGPT)"
          >
            <Icon iconSet="MaterialCommunityIcons" name="robot-outline" size={16} color={COLORS.surface} style={styles.askAiButtonIcon} />
            <Text style={styles.askAiButtonText}>Ask AI</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: COLORS.surface,
  },
  imageTouchable: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  questionImage: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: COLORS.disabledBackground,
    marginBottom: 0,
  },
  imageOverlay: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: COLORS.primary + 'cc',
    borderRadius: 16,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.disabledBackground,
    borderRadius: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '22',
    borderRadius: 14,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    alignItems: 'flex-end',
    padding: 16,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageContainer: {
    width: '90%',
    height: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    marginBottom: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: COLORS.disabledBackground,
  },
  modalFooter: {
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  imageCaption: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2,
  },
  markdownContainer: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 15,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  metaTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flexShrink: 1,
    margin: 10,
  },
  tag: {
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
    overflow: 'hidden',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 0.5,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagYear: {
    backgroundColor: COLORS.tagYearBg,
    borderColor: COLORS.tagYearText,
  },
  tagQNum: {
    backgroundColor: COLORS.tagQNumBg,
    borderColor: COLORS.tagQNumText,
  },
  tagMarks: {
    backgroundColor: COLORS.tagMarksBg,
    borderColor: COLORS.tagMarksText,
  },
  completionSwitch: {
    transform: Platform.OS === 'ios' ? [{ scaleX: 0.8 }, { scaleY: 0.8 }] : [],
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    borderBottomColor: COLORS.border,
  },
  chapterIcon: {
    marginRight: 8,
  },
  chapterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
    marginLeft: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  askAiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  askAiButtonIcon: {
    marginRight: 6,
  },
  askAiButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  bookmarkButton: {
    marginHorizontal: 8,
    padding: 2,
  },
  webview: {
    flex: 1,
    minHeight: 100,
    width: '100%',
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const MemoizedQuestionItem = React.memo(QuestionItem);
export default MemoizedQuestionItem;