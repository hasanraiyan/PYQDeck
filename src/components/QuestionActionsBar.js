import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon'; // Assuming Icon component path
import { COLORS } from '../constants'; // Assuming constants path

const QuestionActionsBar = React.memo(({
  onSearch,
  onCopy,
  onShare,
  onAskAI,
}) => {
  return (
    <View style={styles.actionsRow}>
      <View style={styles.actionsLeft}>
        <TouchableOpacity onPress={onSearch} style={styles.iconButton} accessibilityLabel="Search question on Google">
          <Icon iconSet="FontAwesome" name="google" size={20} color={COLORS.textSecondary || '#8E8E93'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onCopy} style={styles.iconButton} accessibilityLabel="Copy question text">
          <Icon iconSet="Ionicons" name="copy-outline" size={22} color={COLORS.textSecondary || '#8E8E93'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onShare} style={styles.iconButton} accessibilityLabel="Share question">
          <Icon iconSet="Ionicons" name="share-social-outline" size={22} color={COLORS.textSecondary || '#8E8E93'} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.askAiButton} onPress={onAskAI} activeOpacity={0.8}>
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
  );
});

const styles = StyleSheet.create({
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
    // marginRight: 6, // Replaced by gap
  },
  askAiButtonText: {
    color: COLORS.white || '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default QuestionActionsBar;