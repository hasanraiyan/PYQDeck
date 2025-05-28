// src/constants/index.js
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const appVersion = Constants.expoConfig.version;

export const ASYNC_STORAGE_PREFIX = 'beuApp_vNative_completed_';
export const UNCAT_CHAPTER_NAME = 'Uncategorized'; // Consistent name for questions without a chapter

export const COLORS = {
  primary: '#4338ca', // Indigo 700
  primaryLight: '#6366f1', // Indigo 500
  secondary: '#10b981', // Emerald 500
  background: '#f4f5f7', // Cool Gray 100 / Tailwind bg-gray-100
  surface: '#ffffff', // White
  surfaceAlt: '#E9ECEF', // A light gray, good for secondary buttons or subtle backgrounds
  surfaceAlt2: '#F9F9F9', // An even lighter off-white, good for response areas (ADDED)
  text: '#1f2937', // Cool Gray 800
  textSecondary: '#6b7280', // Cool Gray 500
  border: '#e5e7eb', // Cool Gray 200
  borderLight: '#F0F0F0', // Lighter border, good for subtle separators
  borderLightest: '#F5F5F5', // Even lighter
  disabled: '#9ca3af', // Cool Gray 400
  disabledBackground: '#f3f4f6', // Cool Gray 200 / Tailwind bg-gray-200
  error: '#ef4444', // Red 500
  completed: '#4ade80', // Green 400 (brighter green for track)
  completedThumb: '#22c55e', // Green 600 (darker green for thumb)
  tagYearBg: '#e0f2fe', // Sky 100
  tagYearText: '#0ea5e9', // Sky 500
  tagQNumBg: '#f3e8ff', // Purple 100
  tagQNumText: '#a855f7', // Purple 500
  tagMarksBg: '#fffbeb', // Amber 50
  tagMarksText: '#b45309', // Amber 700
  chapterIcon: '#8b5cf6', // Violet 500 (Used for chapter selection icon)
  branchIconColorDefault: '#f97316', // Orange 500
  semesterIconColor: '#3b82f6', // Blue 500
  subjectIconColor: '#8b5cf6', // Violet 500 (Used for subject list icon)
  progressBarBackground: '#e5e7eb', // Cool Gray 200
  surfaceOverlay: 'rgba(255, 255, 255, 0.75)', // For main loader
  surfaceOverlayWebView: 'rgba(249, 249, 249, 0.85)', // For WebView loader, matching surfaceAlt2
  yearIconColor: '#f59e0b', // Amber 500 (Used for year selection icon)
  white: '#FFFFFF', // Explicit white
  shadow: '#000000', // For shadow color
};

export const DEFAULT_BRANCH_ICON = { set: 'Ionicons', name: 'school-outline' };
export const SEARCH_DEBOUNCE_DELAY = 300; // Milliseconds to wait after typing before searching

// Export Platform for potential use elsewhere if needed, or keep it directly used
export { Platform };