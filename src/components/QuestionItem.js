import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Alert, Share } from 'react-native';
import { COLORS } from '../constants'; // Ensure these are correctly defined
import { getQuestionPlainText } from '../helpers/helpers'; // Ensure this helper exists
import { toggleBookmark, isQuestionBookmarked } from '../helpers/bookmarkHelpers'; // Ensure these helpers exist
import generateHTML from '../helpers/generateHTML'; // Ensure this helper exists

// Import sub-components
import QuestionHeader from './QuestionHeader';
import QuestionContentPreview from './QuestionContentPreview';
import QuestionActionsBar from './QuestionActionsBar';
import ContentDisplayModal from './ContentDisplayModal';
import SearchWebViewModal from './SearchWebViewModal';

const QuestionItem = ({ item, isCompleted, onToggleComplete, onCopy, onSearch, onAskAI }) => {
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

  const [bookmarked, setBookmarked] = useState(false);
  useEffect(() => {
    let mounted = true;
    isQuestionBookmarked(item.questionId).then((res) => {
      if (mounted) setBookmarked(res);
    });
    return () => { mounted = false; };
  }, [item.questionId]);

  const [isContentModalVisible, setIsContentModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');

  const openContentModal = useCallback(() => {
    setIsContentModalVisible(true);
  }, []);

  const closeContentModal = useCallback(() => {
    setIsContentModalVisible(false);
  }, []);

  const handleBookmark = useCallback(async () => {
    const newState = await toggleBookmark(item.questionId);
    setBookmarked(newState);
  }, [item.questionId]);

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
        bookmarked={bookmarked}
        onToggleComplete={handleToggleCompletion}
        onBookmark={handleBookmark}
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