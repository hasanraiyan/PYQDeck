import React, { useMemo, useCallback, useState } from 'react';
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
} from 'react-native';
import MarkdownDisplay from 'react-native-markdown-display';
import { COLORS, UNCAT_CHAPTER_NAME } from '../constants';
import { getQuestionPlainText } from '../helpers/helpers';
import Icon from './Icon';
import CustomImageRenderer from './FullScreenImageModal';

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.text,
  },
  code_block: {
    backgroundColor: COLORS.disabledBackground,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginVertical: 5,
  },
  code_inline: {
    backgroundColor: COLORS.disabledBackground,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  bullet_list: {
    marginLeft: 10,
  },
  ordered_list: {
    marginLeft: 10,
  },
  heading1: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
    marginTop: 10,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
    marginTop: 8,
  },
  blockquote: {
    backgroundColor: '#f9f9f9',
    borderLeftColor: '#ccc',
    borderLeftWidth: 5,
    marginVertical: 5,
    padding: 10,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
});

const screenWidth = Dimensions.get('window').width;
const maxImageWidth = screenWidth - 2 * 15 - 20;



const QuestionItem = React.memo(
  ({ item, isCompleted, onToggleComplete, onCopy, onSearch, onAskAI }) => {
    const plainText = useMemo(
      () => getQuestionPlainText(item.text),
      [item.text]
    );

    const handleCopy = useCallback(() => onCopy(plainText), [onCopy, plainText]);
    const handleSearch = useCallback(() => onSearch(plainText), [onSearch, plainText]);
    const handleToggle = useCallback(
      () => onToggleComplete(item.questionId, !isCompleted),
      [onToggleComplete, item.questionId, isCompleted]
    );

    const handleAskAIInternal = useCallback(() => {
      onAskAI(item);
    }, [onAskAI, item]);

    return (
      <View style={styles.questionCard}>
        <View style={styles.metaRow}>
          <View style={styles.metaTagsContainer}>
            {item.year && (
              <View style={[styles.tag, styles.tagYear]}>
                <Text style={[styles.tagText, { color: COLORS.tagYearText }]}>
                  {item.year}
                </Text>
              </View>
            )}
            {item.qNumber && (
              <View style={[styles.tag, styles.tagQNum]}>
                <Text style={[styles.tagText, { color: COLORS.tagQNumText }]}>
                  {item.qNumber}
                </Text>
              </View>
            )}
            {item.marks != null && (
              <View style={[styles.tag, styles.tagMarks]}>
                <Text style={[styles.tagText, { color: COLORS.tagMarksText }]}>
                  {item.marks} Marks
                </Text>
              </View>
            )}
          </View>
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
            <Icon
              iconSet="Ionicons"
              name="layers-outline"
              size={16}
              color={COLORS.chapterIcon}
              style={styles.chapterIcon}
            />
            <Text style={styles.chapterText} numberOfLines={1}>
              {item.chapter}
            </Text>
          </View>
        ) : (
          <View style={styles.chapterRow}>
            <Icon
              iconSet="Ionicons"
              name="help-circle-outline"
              size={16}
              color={COLORS.textSecondary}
              style={styles.chapterIcon}
            />
            <Text style={[styles.chapterText, { fontStyle: 'italic' }]}>
              {UNCAT_CHAPTER_NAME}
            </Text>
          </View>
        )}

        <View style={styles.markdownContainer}>
         
          <MarkdownDisplay
            style={markdownStyles}
            renderers={{ image: CustomImageRenderer }}
          >
            {item.text}
          </MarkdownDisplay>

        </View>

        <View style={styles.actionsRow}>
          <View style={styles.actionsLeft}>
            <TouchableOpacity
              onPress={handleSearch}
              style={styles.iconButton}
              accessibilityLabel="Search question on Google"
            >
              <Icon
                iconSet="FontAwesome"
                name="google"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCopy}
              style={styles.iconButton}
              accessibilityLabel="Copy question text"
            >
              <Icon
                iconSet="Ionicons"
                name="copy-outline"
                size={22}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.askAiButton}
            onPress={handleAskAIInternal}
            activeOpacity={0.8}
            accessibilityLabel="Ask AI (e.g., ChatGPT)"
          >
            <Icon
              iconSet="MaterialCommunityIcons"
              name="robot-outline"
              size={16}
              color={COLORS.surface}
              style={styles.askAiButtonIcon}
            />
            <Text style={styles.askAiButtonText}>Ask AI</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  questionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 14,
    overflow: Platform.OS === 'ios' ? 'visible' : 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2.5,
    elevation: 3,
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
    marginRight: 10,
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
  markdownContainer: {
    paddingVertical: 15,
    paddingHorizontal: 15,
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
});

export default QuestionItem;
