// FILE: src/styles/globalStyles.js
import { StyleSheet, Platform } from 'react-native';

// --- LIGHT THEME COLORS ---
// Provides a clean, modern, and accessible light theme.
export const Colors = {
  // Core Palette
  background: '#F8F9FA', // Very Light Gray (Off-white) - Main screen background
  surface: '#FFFFFF',    // White - Card, Header, Modal backgrounds
  textPrimary: '#212529', // Near Black - Main text, Titles
  textSecondary: '#6C757D',// Medium Gray - Subtitles, descriptions, placeholders, icons
  accent: '#007BFF',      // Vibrant Blue - Interactive elements, icons, highlights
  accentSecondary: '#0056b3', // Darker Blue - Pressed states, secondary accents (not heavily used)
  border: '#DEE2E6',      // Light Gray - Borders for cards, list items, dividers
  shadow: 'rgba(0, 0, 0, 0.1)', // Subtle black shadow for depth

  // Status & Feedback Colors
  success: '#28A745', // Green - Completed state, success messages
  danger: '#DC3545', // Red - Errors, warnings (alternative)
  warning: '#FFC107', // Yellow/Orange - Warnings, attention items
  disabled: '#ADB5BD', // Lighter Gray - Disabled text/icons
  disabledBg: '#E9ECEF', // Very Light Gray - Disabled input backgrounds, switch track

  // Component-Specific Variations (Derived or Explicit)
  cardBackground: '#FFFFFF',      // Card bg uses surface white directly
  listItemBg: '#FFFFFF',         // List item bg uses surface white directly
  // listItemHoverBg: '#F1F3F5',      // Potential hover/press background (use activeOpacity instead for simplicity)
  completedIndicator: '#28A745', // Use success green for completed border
  modalSurface: '#FFFFFF',       // Modal background uses surface color directly
  modalBorder: '#E9ECEF',           // Slightly lighter border inside modal
  modalTextPrimary: '#343A40',      // Slightly darker text in modals for emphasis
  modalTextSecondary: '#6C757D', // Consistent secondary text in modals
  modalBackdrop: 'rgba(0, 0, 0, 0.45)', // Semi-transparent black backdrop for modals
  codeBlockBackground: '#F1F3F5',    // Distinct light grey background for code blocks
  // Code text color is determined by the syntax highlighter theme (e.g., prism)

  transparent: 'transparent', // Utility color
};

// --- GLOBAL STYLESHEET ---
// Defines reusable styles applied across the application for consistency.
export const globalStyles = StyleSheet.create({
  // --- Containers & Layout ---
  container: { // Base container for screens
    flex: 1,
    backgroundColor: Colors.background, // Use the main background color
  },
  
  // --- Custom Header Styles ---
  header: {
    backgroundColor: Colors.surface,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    maxWidth: '70%',
  },
  headerBackButton: {
    padding: 8,
    marginRight: 10,
  },
  listContentContainer: { // Padding for FlatList content
    paddingHorizontal: 10, // Slightly reduced horizontal padding for lists
    paddingBottom: 10, // Ample space at the bottom
    paddingLeft:10,
    paddingRight:10,
    // paddingTop should be added per-screen to account for header
  },
  activityIndicatorContainer: { // Centered loading indicator
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingBottom: 50, // Offset if header is typically present
  },
  emptyListContainer: { // Centered message/icon for empty lists
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: 250, // Ensure it takes up noticeable space
    backgroundColor: Colors.background, // Match screen background
  },

  // --- Text Styles ---
  text: { // Base text style
    fontSize: 16, // Standard readable size
    color: Colors.textPrimary,
    lineHeight: 24, // Appropriate line spacing
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // Standard fonts
  },
  textSecondary: { // Subdued text style
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  listItemText: { // Text within list items
    fontSize: 16,
    fontWeight: '500', // Medium weight for clarity
    color: Colors.textPrimary,
    flexShrink: 1, // Allow text to shrink if needed
    marginRight: 8, // Space before chevron
  },
  listItemSubtitle: { // Smaller text below listItemText
      fontSize: 13,
      color: Colors.textSecondary,
      marginTop: 2, // Space below main text
  },
  emptyListText: { // Text shown in empty states
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 15, // Space below icon
    lineHeight: 22,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  listItemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
    backgroundColor: Colors.disabledBg,
  },

  // --- Icons ---
   emptyListIcon: { // Style for icons in empty states
       marginBottom: 15,
   },

  // --- List Items (Branches, Semesters, Subjects, etc.) ---
  listItem: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginVertical: 4,
    marginHorizontal: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // --- Cards (QuestionCard) ---
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 0,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    transform: [{ scale: 1 }],
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
  },
  cardInner: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border + '20',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 16,
  },
  cardCompleted: {
    borderLeftWidth: 6,
    borderLeftColor: Colors.success,
    shadowColor: Colors.success,
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },

  // --- Question Card Specific Layouts ---
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Pushes year/q# left, chapter tag right
    alignItems: 'flex-start', // Align items at the top
    marginBottom: 12, // Space below header
  },
  questionHeaderLeft: {
    flexShrink: 1, // Allow left side to shrink if needed
    marginRight: 8, // Space between left and right sides
  },
  questionHeaderRight: {
    // Aligns chapter tag to the right, allows wrapping if needed
    alignItems: 'flex-end', // Align tag to the bottom if it wraps (though unlikely for short tags)
    maxWidth: '65%', // Limit width to prevent overlap with very long chapter names
  },
  questionBody: {
    marginBottom: 15, // Space between main content and footer
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Pushes tags left, actions right
    alignItems: 'center', // Vertically center items in footer
    marginTop: 12, // Space above footer
    paddingTop: 12, // Space above content within footer
    borderTopWidth: 1, // Divider line
    borderTopColor: Colors.border, // Use standard border color
  },
  questionFooterLeft: { // Container for Type/Marks tags
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow tags to wrap
    flex: 1, // Allow it to take available space (pushes right side)
    marginRight: 10, // Space between tags and actions
    alignItems: 'center', // Align items vertically if they wrap
  },
   questionFooterRight: { // Container for Ask AI / Switch
      flexDirection: 'row',
      alignItems: 'center',
   },
  completionContainer: {
    // No specific styles needed, switch is styled directly via props/local style
  },

  // --- Tags (Used in QuestionCard) ---
  tag: {
    backgroundColor: Colors.accent + '1A', // Very transparent accent bg
    color: Colors.accent, // Accent color text
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16, // Pill shape
    fontSize: 12, // Smaller font size for tags
    fontWeight: '600', // Bold text
    overflow: 'hidden', // Ensure background respects border radius
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.accent + '30', // Subtle accent border
    // Add margin as needed where the tag is used (e.g., marginRight, marginBottom)
  },

  // --- Code Blocks (Syntax Highlighting) ---
  codeBlockStyle: { // Style applied via `customStyle` prop of SyntaxHighlighter
    borderRadius: 6,
    padding: 12,
    backgroundColor: Colors.codeBlockBackground, // Specific background
    borderWidth: 1,
    borderColor: Colors.border, // Standard border
    // Margin is applied by the container View in QuestionCard (styles.codeOuterContainer)
  },
  codeTextStyle: { // Base text style for code, applied via `codeTagProps`
    // Use a monospace font
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
    fontSize: Platform.OS === 'ios' ? 14 : 13, // Slightly smaller code font
    lineHeight: 20, // Adjust line height for readability
    // Color is determined by the syntax highlighter's theme (prism)
  },

  // --- Buttons (Example, if needed outside modals) ---
  button: {
    backgroundColor: Colors.accent, // Use accent color for primary actions
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
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
    color: Colors.surface, // White text on accent background
    fontSize: 16,
    fontWeight: '600',
  },

  // --- Modal Styles (If a modal component were added back) ---
  /*
  modalBackdrop: {
      flex: 1,
      backgroundColor: Colors.modalBackdrop,
      justifyContent: 'flex-end', // Position modal at the bottom
  },
  modalContent: {
    backgroundColor: Colors.modalSurface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 35 : 25, // Account for safe area / home indicator
    maxHeight: '85%', // Limit modal height
    shadowColor: '#000',
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
    borderBottomColor: Colors.modalBorder,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.modalTextPrimary,
  },
  modalCloseButton: {
      padding: 5, // Make touch target larger
  },
  modalSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.modalTextSecondary,
      marginBottom: 10,
      marginTop: 15,
  },
  modalOptionContainer: {
      maxHeight: 200, // Limit height of scrollable options
  },
  modalFilterOption: { // Style for filter options (checkbox/radio)
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalFilterOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.modalTextPrimary,
    flexShrink: 1,
  },
  modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around', // Or 'flex-end'
      marginTop: 25,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: Colors.modalBorder,
  },
  modalPrimaryButton: { // Inherits from button, potentially overrides
      backgroundColor: Colors.accent,
  },
  modalSecondaryButton: { // Style for secondary/clear button
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.modalTextSecondary,
  },
  modalSecondaryButtonText: {
       color: Colors.modalTextSecondary,
       fontSize: 16,
       fontWeight: '500',
  },
  */
});