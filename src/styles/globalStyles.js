// src/styles/globalStyles.js
import { StyleSheet, Platform } from 'react-native';

// --- NEW THEMED COLORS ---
export const Colors = {
  // Core Theme
  gradientStart: '#1e3a8a', // Deep Blue
  gradientEnd: '#5b21b6',   // Purple
  textPrimary: '#f8fafc',   // Very Light Gray/Almost White (for main text)
  textSecondary: '#cbd5e1', // Lighter Gray (for subtitles, placeholders)
  textDark: '#1e293b',      // Dark Slate (for light backgrounds like modal)
  accent: '#f59e0b',       // Amber/Gold (for icons, highlights)
  accentSecondary: '#fbbf24', // Amber 400
  border: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white border
  transparent: 'transparent',

  // Component Backgrounds
  cardBackground: 'rgba(255, 255, 255, 0.08)', // Main card bg (e.g., QuestionCard)
  listItemBg: 'rgba(255, 255, 255, 0.1)', // List item bg
  listItemHoverBg: 'rgba(255, 255, 255, 0.15)', // Slight change on press

  // Status/Special Colors
  success: '#10b981',       // Emerald-500 (Keep for switch, maybe adjust shade)
  danger: '#ef4444',        // Red-500
  disabled: '#94a3b8',      // Slate-400 (Adjusted for theme contrast)
  completedBg: 'rgba(16, 185, 129, 0.1)', // Transparent success green

  // Modal Specific (Light Theme Contrast)
  modalSurface: '#ffffff',
  modalBorder: '#e2e8f0',   // slate-200
  modalTextPrimary: '#1e293b', // slate-800
  modalTextSecondary: '#64748b', // slate-500
  modalPrimaryButton: '#4f46e5', // Keep original primary for modal actions
  modalSecondaryButtonBorder: '#6366f1',
  modalSecondaryButtonText: '#6366f1',

  // Syntax Highlighting (Okaidia is dark, should be fine)
};

// --- UPDATED GLOBAL STYLES ---
export const globalStyles = StyleSheet.create({
  // Container now transparent to let gradient/navigator background through
  container: {
    flex: 1,
    backgroundColor: Colors.transparent, // Let navigator handle background
  },
  // Content padding for FlatLists etc. - often applied within FlatList's contentContainerStyle
  contentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
    // paddingTop needs to be set per screen to account for transparent header
  },
  // QuestionCard Styling
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  // Titles (May not be used much with header titles)
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
    paddingVertical: 18,
    paddingHorizontal: 15,
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemText: {
      fontSize: 17,
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
  },
  buttonText: {
    color: '#ffffff', // White text on primary button
    fontSize: 16,
    fontWeight: '500',
  },
  // Filter Modal Styling (Uses Modal Specific Colors)
  modalContent: {
    backgroundColor: Colors.modalSurface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Adjust for safe area if needed
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
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
      fontSize: 18,
      fontWeight: '600',
      color: Colors.modalTextPrimary,
  },
   // Tag Styling (QuestionCard)
   tag: {
      backgroundColor: Colors.accent + '30', // Amber accent with opacity
      color: Colors.accentSecondary, // Slightly brighter amber text
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 14,
      fontSize: 11,
      fontWeight: '600',
      overflow: 'hidden',
      textAlign: 'center',
      marginRight: 6,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: Colors.accent + '50',
  },
  // Filter Option Styling (Modal)
  filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12, // Slightly more padding
  },
   filterOptionText: {
      marginLeft: 12,
      fontSize: 16,
      color: Colors.modalTextPrimary,
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
        maxWidth: '75%',
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
        borderTopColor: Colors.border,
    },
     questionFooterLeft: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
        marginRight: 10,
    },
     completionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // Syntax Highlighting Styles (Base)
    codeBlockStyle: {
        borderRadius: 6,
        padding: 12,
        marginVertical: 10,
        backgroundColor: 'rgba(0,0,0,0.3)', // Darker overlay for code
        fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
    },
    codeTextStyle: {
        fontSize: Platform.OS === 'ios' ? 13 : 12, // Slightly smaller on Android maybe
        lineHeight: 19,
        color: '#f8f8f2', // Light text color typical for Okaidia
    },
    // Activity Indicator / Empty List Styling
    activityIndicatorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.transparent, // Important for gradient
      paddingTop: 80, // Offset for header
    },
    emptyListContainer: {
       flex: 1, // Allow it to take space if needed
       justifyContent: 'center',
       alignItems: 'center',
       padding: 40,
       paddingTop: 60, // Extra top padding if list is empty
    },
     emptyListText: {
       textAlign: 'center',
       color: Colors.textSecondary, // Use themed secondary text
       fontSize: 16,
       marginTop: 10, // Space below icon
    }
});