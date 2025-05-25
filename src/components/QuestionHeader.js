import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from './Icon'; // Assuming Icon component path
import { COLORS, UNCAT_CHAPTER_NAME } from '../constants'; // Assuming constants path

const QuestionHeader = React.memo(({
  item,
  isCompleted,
  bookmarked,
  onToggleComplete,
  onBookmark,
}) => {

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
    <View style={styles.headerContent}>
      <View style={styles.metaRow}>
        <View style={styles.metaTagsContainer}>
          {renderTags()}
        </View>
        <View style={styles.metaActions}>
          <TouchableOpacity onPress={onBookmark} style={styles.bookmarkButton} accessibilityLabel={bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}>
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
            onValueChange={onToggleComplete}
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
  );
});

const styles = StyleSheet.create({
  headerContent: {
    paddingHorizontal: 16,
    // paddingTop: 12, // Moved from QuestionItem container
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin:0,
    padding:0,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkButton: {
    padding: 6,
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
    paddingHorizontal: 16, // This padding makes it look like a full-width separator
    marginHorizontal: -16, // Counteract headerContent padding for full width effect
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
    flexShrink: 1,
  },
  uncategorizedChapterText: {
    fontStyle: 'italic',
    color: COLORS.textTertiary || '#C7C7CC',
  },
});

export default QuestionHeader;