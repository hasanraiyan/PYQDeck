// src/styles/globalStyles.js
import { StyleSheet, Platform } from 'react-native';

export const Colors = {
  primary: '#4f46e5', // indigo-600
  secondary: '#6366f1', // indigo-500
  background: '#f1f5f9', // slate-100
  surface: '#ffffff',
  text: '#1e293b', // slate-800
  textSecondary: '#64748b', // slate-500
  textLight: '#ffffff',
  accent: '#f59e0b', // amber-500
  border: '#e2e8f0', // slate-200
  success: '#10b981', // emerald-500
  danger: '#ef4444', // red-500
  disabled: '#94a3b8', // slate-400
  completedBg: '#f0fdf4', // green-50 for completed cards
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30, // Add padding at the bottom for FlatList
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // for Android
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  subtitle: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors.text,
      marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  textSecondary: {
      fontSize: 14,
      color: Colors.textSecondary,
  },
  listItem: {
    backgroundColor: Colors.surface,
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemText: {
      fontSize: 17,
      color: Colors.text,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '500',
  },
   modalContainer: { // Not used directly, used by modal component
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: { // Used inside FilterModal
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Padding for bottom safe area
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  modalHeader: { // Used inside FilterModal
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 15,
  },
  modalTitle: { // Used inside FilterModal
      fontSize: 18,
      fontWeight: '600',
      color: Colors.text,
  },
   tag: { // Used inside QuestionCard
      backgroundColor: Colors.secondary + '30', // indigo-500 with opacity
      color: Colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      fontSize: 11,
      fontWeight: '500',
      overflow: 'hidden',
      textAlign: 'center',
      marginRight: 5,
      marginBottom: 5,
  },
  filterOption: { // Used inside FilterModal's Checkbox
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
  },
   filterOptionText: { // Used inside FilterModal's Checkbox
      marginLeft: 10,
      fontSize: 16,
      color: Colors.text,
      flexShrink: 1, // Allow text to wrap if needed
   },
    questionHeader: { // Used inside QuestionCard
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Align tags top
        marginBottom: 8,
    },
    questionHeaderLeft: { // Added for Q-Number side
        flexShrink: 1,
        marginRight: 8,
    },
    questionHeaderRight: { // Added for tags side
        flexDirection: 'row', // Arrange tags horizontally first
        flexWrap: 'wrap', // Allow tags to wrap
        justifyContent: 'flex-end', // Align tags to the right
        maxWidth: '70%', // Limit width of tags area
    },
    questionBody: { // Used inside QuestionCard
      marginBottom: 10,
    },
     questionFooter: { // Used inside QuestionCard
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
     questionFooterLeft: { // Added container for Type/Marks tags
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1, // Take available space
        marginRight: 10,
    },
     completionContainer: { // Used inside QuestionCard
        flexDirection: 'row',
        alignItems: 'center',
    },
    completionText: { // Not currently used, but available
        marginLeft: 5,
        fontSize: 14,
        color: Colors.textSecondary,
        fontStyle: 'italic'
    },
    // Styles specific to SyntaxHighlighter (example, adjust as needed)
    codeBlockStyle: {
        borderRadius: 5,
        padding: 10,
        marginVertical: 8,
        fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace', // Common monospace fonts
    },
    codeTextStyle: {
        fontSize: 13,
        lineHeight: 18,
    },
    activityIndicatorContainer: { // For Loading states
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.background, // Match background
    },
    emptyListContainer: { // For FlatList empty states
       marginTop: 50,
       alignItems: 'center',
       paddingHorizontal: 20
    },
     emptyListText: { // For FlatList empty states
       textAlign: 'center',
       color: Colors.textSecondary
    }
});