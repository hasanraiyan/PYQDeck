// src/utils/helpers.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as LinkingExpo from 'expo-linking';
import { ASYNC_STORAGE_PREFIX, UNCAT_CHAPTER_NAME } from '../constants';
import beuData from '../data/beuData'; // Import the raw data

// Finds data for branch, semester, or subject based on provided path IDs
export const findData = (path) => {
  const { branchId, semId, subjectId } = path;
  try {
    const branch = beuData.branches.find((b) => b.id === branchId);
    if (!branch) return { error: 'Branch not found' };

    if (!semId) return { branch }; // Return just branch data if no semester ID
    const semester = branch.semesters?.find((s) => s.id === semId);
    if (!semester) return { error: 'Semester not found' };

    if (!subjectId) return { branch, semester }; // Return branch and semester if no subject ID
    const subject = semester.subjects?.find((sub) => sub.id === subjectId);
    if (!subject) return { error: 'Subject not found' };

    // Ensure 'questions' is always an array, even if missing/null in data source
    const questions =
      subject.questions && Array.isArray(subject.questions)
        ? [...subject.questions]
        : [];
    // Return a shallow copy of the subject with the guaranteed questions array
    return {
      branch,
      semester,
      subject: { ...subject, questions },
      questions,
    };
  } catch (e) {
    console.error('Error in findData:', e);
    return { error: 'An error occurred while retrieving data.' };
  }
};

// Basic formatting for question text (handles lists, code blocks placeholder)
export const formatQuestionText = (text) => {
  if (!text) return '';
  let formatted = text.replace(/```[\s\S]*?```/g, '\n[Code Block]\n'); // Replace code blocks with placeholder
  formatted = formatted.replace(/^\s*[\*\-]\s+/gm, '\u2022 '); // Convert markdown lists to bullets
  return formatted.trim();
};

// Extracts plain text from question (removes code blocks, lists, tags) for search/copy
export const getQuestionPlainText = (text) => {
  if (!text) return '';
  // Remove code blocks
  let plainText = text.replace(
    /```(cpp|c|java|javascript|html|css|python)?\n([\s\S]*?)\n```/g,
    '\n'
  );
  // Remove list markers
  plainText = plainText.replace(/^\s*[\*\-]\s+/gm, '');
  // Remove potential HTML tags
  plainText = plainText.replace(/<[^>]*>/g, ' ');
  // Normalize whitespace
  plainText = plainText.replace(/\s+/g, ' ').trim();
  return plainText;
};

// Check if a question is marked completed in AsyncStorage
export const isQuestionCompleted = async (questionId) => {
  try {
    const value = await AsyncStorage.getItem(
      ASYNC_STORAGE_PREFIX + questionId
    );
    return value === 'true';
  } catch (e) {
    console.error('Error reading completion status:', e);
    return false; // Default to false on error
  }
};

// Save question completion status to AsyncStorage
export const setQuestionCompleted = async (questionId, isCompleted) => {
  try {
    await AsyncStorage.setItem(
      ASYNC_STORAGE_PREFIX + questionId,
      isCompleted ? 'true' : 'false'
    );
  } catch (e) {
    console.error('Error saving completion status:', e);
  }
};

// Load completion statuses for multiple question IDs efficiently
export const loadCompletionStatuses = async (questionIds) => {
  if (!Array.isArray(questionIds)) {
    console.error(
      'loadCompletionStatuses expected an array, received:',
      typeof questionIds
    );
    return {};
  }
  const keys = questionIds.map((id) => ASYNC_STORAGE_PREFIX + id);
  const statuses = {};
  if (keys.length === 0) return statuses; // Nothing to load

  try {
    const storedValues = await AsyncStorage.multiGet(keys); // Returns [[key1, val1], [key2, val2], ...]
    storedValues.forEach(([key, value]) => {
      if (key) {
        // Ensure key is valid
        const questionId = key.replace(ASYNC_STORAGE_PREFIX, '');
        statuses[questionId] = value === 'true';
      }
    });
  } catch (e) {
    console.error('Error loading bulk completion statuses:', e);
  }
  return statuses;
};

// Copy text to clipboard and show feedback
export const copyToClipboard = async (text, showFeedback = () => {}) => {
  try {
    await Clipboard.setStringAsync(text || ''); // Handle null/undefined text
    showFeedback('Question text copied!');
  } catch (e) {
    console.error('Clipboard copy error:', e);
    showFeedback('Failed to copy text!');
  }
};

// Open a URL in the default browser/app
export const openLink = async (url, showFeedback = () => {}) => {
  try {
    const supported = await LinkingExpo.canOpenURL(url);
    if (supported) {
      await LinkingExpo.openURL(url);
    } else {
      console.warn(`Cannot open URL: ${url}`);
      showFeedback('Cannot open URL');
    }
  } catch (e) {
    console.error('Error opening link:', e);
    showFeedback('Could not open link');
  }
};

// Search a query on Google
export const searchGoogle = (query, showFeedback) => {
  const url = `https://google.com/search?q=${encodeURIComponent(
    query || ''
  )}`;
  openLink(url, showFeedback); // Use the local openLink function
};

// Open AI search (using ChatGPT search URL as an example)
export const askAI = (query, showFeedback) => {
  const url = `https://chatgpt.com/search?q=${encodeURIComponent(
    query || ''
  )}`;
  openLink(url, showFeedback); // Use the local openLink function
};

// Debounce function calls (e.g., for search input)
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Extract unique years from a list of questions, sorted descending
export const getUniqueYears = (questions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return [];
  }
  const years = new Set();
  questions.forEach((q) => {
    // Ensure year exists and is numeric
    if (q.year != null && !isNaN(Number(q.year))) {
      years.add(Number(q.year));
    }
  });
  // Convert Set to array and sort descending
  return Array.from(years).sort((a, b) => b - a);
};

// Extract unique chapter names, sorted (Module N first, then alpha), Uncategorized last
export const getUniqueChapters = (questions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return [];
  }
  const chapters = new Set();
  let hasUncategorized = false;
  questions.forEach((q) => {
    // Check if chapter is a non-empty string
    if (q.chapter && typeof q.chapter === 'string' && q.chapter.trim()) {
      chapters.add(q.chapter.trim());
    } else {
      hasUncategorized = true; // Found at least one question without a valid chapter
    }
  });

  // Sort chapters: Module numbers first, then alphabetically
  const sortedChapters = Array.from(chapters).sort((a, b) => {
    const matchA = a.match(/^Module\s+(\d+)/i); // Case-insensitive match for "Module N"
    const matchB = b.match(/^Module\s+(\d+)/i);
    if (matchA && matchB) {
      // Both are modules, sort by number
      return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
    } else if (matchA) {
      return -1; // Module A comes before non-module B
    } else if (matchB) {
      return 1; // Non-module A comes after module B
    } else {
      // Neither is a module, sort alphabetically
      return a.localeCompare(b);
    }
  });

  // Add the specific "Uncategorized" name at the end if needed
  if (hasUncategorized) {
    sortedChapters.push(UNCAT_CHAPTER_NAME);
  }

  return sortedChapters;
};