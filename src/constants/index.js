// src/constants/index.js
import { Platform } from 'react-native';

export const ASYNC_STORAGE_PREFIX = 'beuApp_vNative_completed_';
export const UNCAT_CHAPTER_NAME = 'Uncategorized'; // Consistent name for questions without a chapter

export const COLORS = {
  primary: '#4338ca',
  primaryLight: '#6366f1',
  secondary: '#10b981',
  background: '#f4f5f7',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  disabled: '#9ca3af',
  disabledBackground: '#f3f4f6',
  error: '#ef4444',
  completed: '#4ade80',
  completedThumb: '#22c55e',
  tagYearBg: '#e0f2fe',
  tagYearText: '#0ea5e9',
  tagQNumBg: '#f3e8ff',
  tagQNumText: '#a855f7',
  tagMarksBg: '#fffbeb',
  tagMarksText: '#b45309',
  chapterIcon: '#8b5cf6', // Used for chapter selection icon
  branchIconColorDefault: '#f97316',
  semesterIconColor: '#3b82f6',
  subjectIconColor: '#8b5cf6', // Used for subject list icon
  progressBarBackground: '#e5e7eb',
  yearIconColor: '#f59e0b', // Used for year selection icon
};

export const DEFAULT_BRANCH_ICON = { set: 'Ionicons', name: 'school-outline' };
export const SEARCH_DEBOUNCE_DELAY = 300; // Milliseconds to wait after typing before searching

// Export Platform for potential use elsewhere if needed, or keep it directly used
export { Platform };