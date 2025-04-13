// src/styles/globalStyles.js
import { StyleSheet, Platform } from 'react-native';

// --- NEW LIGHT THEME COLORS ---
export const Colors = {
  // Core Theme
  background: '#F8F9FA', // Very Light Gray (Off-white)
  surface: '#FFFFFF',    // White (for cards, modals, headers)
  textPrimary: '#212529', // Near Black (for main text)
  textSecondary: '#6C757D',// Medium Gray (for subtitles, placeholders)
  accent: '#007BFF',      // Vibrant Blue (for interactive elements, highlights)
  accentSecondary: '#0056b3', // Darker Blue (for hover/pressed states or secondary accents)
  border: '#DEE2E6',      // Light Grey Border
  shadow: 'rgba(0, 0, 0, 0.1)', // Subtle black shadow
  transparent: 'transparent',

  // Component Backgrounds (can often use 'surface' or 'background')
  cardBackground: '#FFFFFF',
  listItemBg: '#FFFFFF',
  listItemHoverBg: '#F1F3F5', // Slightly darker for press feedback

  // Status/Special Colors
  success: '#28A745', // Green
  danger: '#DC3545', // Red
  warning: '#FFC107', // Yellow/Orange
  disabled: '#ADB5BD', // Lighter Gray for disabled state text/icons
  disabledBg: '#E9ECEF', // Light gray background for disabled elements

  // Completed state indicator (can be accent or success)
  completedIndicator: '#28A745', // Success green

  // Modal Specific (Already light-themed, adjusted for new palette)
  modalSurface: '#FFFFFF',
  modalBorder: '#E9ECEF', // Slightly lighter border inside modal
  modalTextPrimary: '#343A40', // Slightly darker primary text in modal
  modalTextSecondary: '#6C757D', // Keep medium gray
  modalPrimaryButton: '#007BFF', // Use main accent color
  modalPrimaryButtonText: '#FFFFFF',
  modalSecondaryButtonBorder: '#6C757D', // Use secondary text color for border
  modalSecondaryButtonText: '#6C757D', // Use secondary text color for text
  modalBackdrop: 'rgba(0, 0, 0, 0.4)', // Slightly lighter backdrop

  // Syntax Highlighting (Okaidia dark theme contrasts well)
  codeBlockBackground: '#F1F3F5', // Light grey background for code blocks
  codeBlockText: '#343A40', // Use dark text for code itself if not using highlighter theme colors
};

// --- UPDATED GLOBAL STYLES ---
export const globalStyles = StyleSheet.create({
  // Container uses the main background color
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Content padding for FlatLists etc.
  contentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
    // paddingTop needs to be set per screen to account for header height
  },
  // QuestionCard Styling
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  // Card with completed indicator (e.g., left border)
  cardCompleted: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.completedIndicator,
    paddingLeft: 11, // Adjust padding to account for border width
  },
  // Titles (Standard header is preferred, but keep for consistency if used elsewhere)
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 15,
    textAlign: 'center',
  },
  // Default Text Styles
  text: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 23,
  },
  textSecondary: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  // List Item Styling (Branch, Semester, Subject)
  listItem: {
    backgroundColor: Colors.listItemBg,
    paddingVertical: 16, // Slightly adjusted padding
    paddingHorizontal: 15,
    marginVertical: 6,
    marginHorizontal: 12, // Keep horizontal margin
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    // Subtle shadow for list items too
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  listItemText: {
    fontSize: 17,
    fontWeight: '500', // Medium weight for list items
    color: Colors.textPrimary,
    flexShrink: 1,
    marginRight: 10,
  },
  // Button Styling (Used in Modal)
  button: {
    backgroundColor: Colors.modalPrimaryButton,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: Colors.modalPrimaryButtonText,
    fontSize: 16,
    fontWeight: '500',
  },
  // Filter Modal Styling
  modalContent: {
    backgroundColor: Colors.modalSurface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    maxHeight: '80%',
    borderTopWidth: 1, // Add border for definition against backdrop
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border, // Use main border color
    shadowColor: '#000', // Keep stronger shadow for modal pop
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.modalBorder, // Use specific modal border color
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.modalTextPrimary,
  },
  // Tag Styling (QuestionCard) - Light background, accent text
  tag: {
    backgroundColor: Colors.accent + '1A', // Very transparent accent bg
    color: Colors.accent, // Accent color text
    paddingHorizontal: 10, // Adjusted padding
    paddingVertical: 5,
    borderRadius: 16, // More rounded
    fontSize: 11,
    fontWeight: '600',
    overflow: 'hidden',
    textAlign: 'center',
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.accent + '40', // Transparent accent border
  },
  // Filter Option Styling (Modal)
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  filterOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.modalTextPrimary, // Use modal text color
    flexShrink: 1,
  },
  // Question Card Specific Layouts
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  questionHeaderLeft: {
    flexShrink: 1,
    marginRight: 8,
  },
  questionHeaderRight: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center', // Align tags nicely if they wrap
    maxWidth: '75%', // Prevent tags from pushing year/qNumber too much
  },
  questionBody: {
    marginBottom: 12,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border, // Use main border color
  },
  questionFooterLeft: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1, // Allow tags to take available space
    marginRight: 10,
    alignItems: 'center', // Align tags nicely
  },
  completionContainer: {
    // Keep switch alignment, styling handled within component props
  },
  // Syntax Highlighting Styles
  codeBlockStyle: {
    borderRadius: 6,
    padding: 12,
    marginVertical: 10, // Keep vertical margin
    backgroundColor: Colors.codeBlockBackground, // Should be light (e.g., #F1F3F5 or #F8F9FA)
    borderWidth: 1,
    borderColor: Colors.border, // Use standard border color
    overflow: 'hidden', // Ensure rounded corners clip content
  },
  codeTextStyle: { // Base style for text *within* the code block
    fontSize: Platform.OS === 'ios' ? 13 : 12, // Font size
    lineHeight: 19, // Line height
    // --- REMOVE COLOR HERE --- Let the theme (prism) control the text color
    // color: Colors.codeBlockText, // REMOVE THIS or ensure it's a sensible default like textPrimary
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace', // Font family
  },
  // Activity Indicator / Empty List Styling
  activityIndicatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background, // Use main background color
    paddingBottom: 50, // Add some padding if header is present
  },
  emptyListContainer: {
    flexGrow: 1, // Take available space
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200, // Ensure it has some height
  },
  emptyListText: {
    textAlign: 'center',
    color: Colors.textSecondary, // Use themed secondary text
    fontSize: 16,
    marginTop: 15, // Space below icon
  }
});