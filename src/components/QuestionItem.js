import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Alert, Share } from 'react-native';
import { COLORS } from '../constants'; // Ensure these are correctly defined
import { getQuestionPlainText } from '../helpers/helpers'; // Ensure this helper exists
import generateHTML from '../helpers/generateHTML'; // Ensure this helper exists

// Import sub-components
import QuestionHeader from './QuestionHeader';
import QuestionContentPreview from './QuestionContentPreview';
import QuestionActionsBar from './QuestionActionsBar';
import ContentDisplayModal from './ContentDisplayModal';
import SearchWebViewModal from './SearchWebViewModal';
// Removed: import { toggleBookmark, isQuestionBookmarked } from '../helpers/bookmarkHelpers';

const QuestionItem = ({
  item,
  isCompleted,
  onToggleComplete,
  onCopy,
  // onSearch, // Already commented out as handled by SearchWebViewModal inside QuestionItem
  onAskAI,
  isBookmarked,      // New prop
  onToggleBookmark,  // New prop
}) => {
  const plainText = useMemo(
    () => getQuestionPlainText(item.text),
    [item.text]
  );

  const htmlContent = useMemo(() => {
    const textColor = COLORS.text || '#333333';
    const surfaceColor = COLORS.surface || '#FFFFFF';
    const bodyStyles = `body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: ${textColor}; background-color: ${surfaceColor}; } img { max-width: 100%; height: auto; border-radius: 6px; }`;
    return generateHTML(item.text, `<style>${bodyStyles}</style>`);
  }, [item.text]);

  // Local 'bookmarked' state and useEffect have been removed.
  // 'isBookmarked' prop is now used directly.
  // 'onToggleBookmark' prop is now used for handling bookmark toggles.
  
  const [isContentModalVisible, setIsContentModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');

  const openContentModal = useCallback(() => {
    setIsContentModalVisible(true);
  }, []);

  const closeContentModal = useCallback(() => {
    setIsContentModalVisible(false);
  }, []);

  // The 'handleBookmark' useCallback that called local toggleBookmark is removed.
  // The 'onBookmark' prop passed to QuestionHeader will now use 'onToggleBookmark(item.questionId)'.

  const handleToggleCompletion = useCallback(
    () => onToggleComplete(item.questionId, !isCompleted),
    [onToggleComplete, item.questionId, isCompleted]
  );

  const handleCopyText = useCallback(() => onCopy(plainText), [onCopy, plainText]);

  const openSearchModal = useCallback((query) => {
    setCurrentSearchQuery(query);
    setIsSearchModalVisible(true);
  }, []);

  const closeSearchModal = useCallback(() => {
    setIsSearchModalVisible(false);
    setCurrentSearchQuery('');
  }, []);

  const handleSearchAction = useCallback(() => {
    // The onSearch prop might be for a different kind of search (e.g., within app data)
    // If it's specifically for Google search, this component now handles it directly.
    // if (onSearch) onSearch(plainText); 
    openSearchModal(plainText);
  }, [plainText, openSearchModal]);

  const handleAskAIAction = useCallback(() => {
    onAskAI(item);
  }, [onAskAI, item]);

  const handleShareTextAction = async () => {
    try {
      await Share.share({ message: plainText });
    } catch (e) {
      Alert.alert('Error', 'Could not share the question.');
    }
  };

  return (
    <View style={styles.container}>
      <QuestionHeader
        item={item}
        isCompleted={isCompleted}
        bookmarked={isBookmarked} // Use the isBookmarked prop
        onToggleComplete={handleToggleCompletion}
        onBookmark={() => onToggleBookmark(item.questionId)} // Call the passed-in handler
      />

      <QuestionContentPreview
        htmlContent={htmlContent}
        onShouldOpenModal={openContentModal}
      />

      <QuestionActionsBar
        onSearch={handleSearchAction}
        onCopy={handleCopyText}
        onShare={handleShareTextAction}
        onAskAI={handleAskAIAction}
      />

      <ContentDisplayModal
        visible={isContentModalVisible}
        onClose={closeContentModal}
        htmlContent={htmlContent}
        title="Question Content"
        titleIconName="document-text-outline"
        titleIconSet="Ionicons"
      />

      <SearchWebViewModal
        visible={isSearchModalVisible}
        onClose={closeSearchModal}
        searchQuery={currentSearchQuery}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface || '#FFFFFF',
    borderRadius: 16,
    marginVertical: 8,
    // marginHorizontal will be applied by the parent list
    shadowColor: COLORS.shadow || '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    paddingTop: 12, // Added padding top to the main container
  },
  // Styles specific to QuestionItem layout or that don't fit sub-components can remain.
  // Most styles have been moved to their respective components.
});

export default React.memo(QuestionItem);