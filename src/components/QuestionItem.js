// src/components/QuestionItem.js
import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS, UNCAT_CHAPTER_NAME } from '../constants';
import { formatQuestionText, getQuestionPlainText } from '../helpers/helpers';
import Icon from './Icon'; // Import the generic Icon component

const QuestionItem = React.memo(
  ({ item, isCompleted, onToggleComplete, onCopy, onSearch, onAskAI }) => {
    // Memoize derived data for performance
    const formattedText = useMemo(
      () => formatQuestionText(item.text),
      [item.text]
    );
    const plainText = useMemo(
      () => getQuestionPlainText(item.text),
      [item.text]
    );

    // Memoize callbacks
    const handleCopy = useCallback(() => onCopy(plainText), [onCopy, plainText]);
    const handleSearch = useCallback(() => onSearch(plainText), [onSearch, plainText]);
    const handleAskAI = useCallback(() => onAskAI(plainText), [onAskAI, plainText]);
    const handleToggle = useCallback(
      () => onToggleComplete(item.questionId, !isCompleted),
      [onToggleComplete, item.questionId, isCompleted]
    );

    return (
      <View style={styles.questionCard}>
        {/* Meta Info: Tags and Completion Switch */}
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

        {/* Chapter Info */}
        {item.chapter && (
          <View style={styles.chapterRow}>
            <Icon
              iconSet="Ionicons"
              name="layers-outline"
              size={16}
              color={COLORS.chapterIcon}
              style={styles.chapterIcon}
            />
            <Text style={styles.chapterText} numberOfLines={2}>
              {item.chapter}
            </Text>
          </View>
        )}
        {!item.chapter && (
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

        {/* Question Text */}
        <Text style={styles.questionTextContent}>{formattedText}</Text>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <View style={styles.actionsLeft}>
            {/* Google Search */}
            <TouchableOpacity
              onPress={handleSearch}
              style={styles.iconButton}
              accessibilityLabel="Search question on Google">
              <Icon
                iconSet="FontAwesome"
                name="google"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            {/* Copy to Clipboard */}
            <TouchableOpacity
              onPress={handleCopy}
              style={styles.iconButton}
              accessibilityLabel="Copy question text">
              <Icon
                iconSet="Ionicons"
                name="copy-outline"
                size={22}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {/* Ask AI Button */}
          <TouchableOpacity
            style={styles.askAiButton}
            onPress={handleAskAI}
            activeOpacity={0.8}
            accessibilityLabel="Ask AI (e.g., ChatGPT)">
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
    paddingTop: 12,
    paddingBottom: 8,
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
    marginTop: 4,
    backgroundColor: '#fafafa',
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
  questionTextContent: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.text,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
    marginRight: 12,
  },
  askAiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 7,
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
  },
});

export default QuestionItem;