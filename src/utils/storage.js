// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prefix for keys to avoid collisions with other AsyncStorage data
const COMPLETED_PREFIX = '@PYQDeck:completed_questions_';

/**
 * Loads the Set of completed question IDs for a given subject ID.
 * Returns an empty Set if no data is found or an error occurs.
 * @param {string} subjectId - The unique identifier for the subject.
 * @returns {Promise<Set<string>>} A promise resolving to a Set of completed question IDs.
 */
export const loadCompletedQuestions = async (subjectId) => {
  if (!subjectId) {
      console.warn('loadCompletedQuestions called with invalid subjectId.');
      return new Set(); // Return empty set for invalid input
  }
  try {
    const key = `${COMPLETED_PREFIX}${subjectId}`;
    const jsonValue = await AsyncStorage.getItem(key);
    // Parse only if jsonValue is a non-empty string
    if (jsonValue && typeof jsonValue === 'string') {
        const parsedArray = JSON.parse(jsonValue);
        // Ensure the parsed value is an array before creating a Set
        if (Array.isArray(parsedArray)) {
            return new Set(parsedArray);
        } else {
            console.warn(`Invalid data format found for key ${key}. Expected array.`);
            // Optionally clear the invalid data: await AsyncStorage.removeItem(key);
            return new Set();
        }
    }
    return new Set(); // Return empty set if no value found
  } catch (e) {
    console.error('Error loading completed questions from AsyncStorage:', e);
    return new Set(); // Return empty set on error
  }
};

/**
 * Saves the Set of completed question IDs for a given subject ID.
 * Converts the Set to an Array before storing as JSON.
 * @param {string} subjectId - The unique identifier for the subject.
 * @param {Set<string>} completedSet - The Set containing completed question IDs.
 * @returns {Promise<void>} A promise resolving when the save operation is complete.
 */
export const saveCompletedQuestions = async (subjectId, completedSet) => {
   if (!subjectId) {
       console.warn('saveCompletedQuestions called with invalid subjectId.');
       return; // Do nothing for invalid input
   }
   // Ensure completedSet is actually a Set
   if (!(completedSet instanceof Set)) {
      console.error('Invalid data type passed to saveCompletedQuestions. Expected a Set.');
      return;
   }
  try {
    const key = `${COMPLETED_PREFIX}${subjectId}`;
    // Convert Set to Array for JSON serialization
    const jsonValue = JSON.stringify(Array.from(completedSet));
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving completed questions to AsyncStorage:', e);
    // Consider re-throwing or handling the error based on application needs
  }
};

/**
 * Toggles the completion status for a specific question within a subject.
 * Loads the current set, modifies it, and saves it back.
 * Returns the updated Set for immediate UI feedback.
 * @param {string} subjectId - The unique identifier for the subject.
 * @param {string} questionId - The unique identifier for the question.
 * @returns {Promise<Set<string>>} A promise resolving to the *updated* Set of completed question IDs.
 */
export const toggleQuestionCompletion = async (subjectId, questionId) => {
   if (!subjectId || !questionId) {
       console.warn("toggleQuestionCompletion called with invalid subjectId or questionId.");
       // Return the current set without modification on bad input
       return await loadCompletedQuestions(subjectId);
   }
    let currentSet = new Set(); // Initialize empty set
    try {
        // Load the current set for the subject
        currentSet = await loadCompletedQuestions(subjectId);

        // Create a new Set for modification to avoid mutating the original during the process
        const updatedSet = new Set(currentSet);

        // Toggle the presence of the questionId
        if (updatedSet.has(questionId)) {
            updatedSet.delete(questionId);
        } else {
            updatedSet.add(questionId);
        }

        // Save the updated set back to storage
        await saveCompletedQuestions(subjectId, updatedSet);

        // Return the updated set so the UI can react immediately
        return updatedSet;

    } catch (e) {
         console.error('Error toggling question completion:', e);
         // On error during toggle/save, return the original set loaded at the beginning
         // This prevents the UI from staying in an inconsistent state if the save fails
         return currentSet;
    }
};

// --- Optional Utility Functions ---

/**
 * Clears all completion data for a specific subject.
 * @param {string} subjectId - The unique identifier for the subject.
 * @returns {Promise<void>}
 */
export const clearSubjectCompletion = async (subjectId) => {
    if (!subjectId) {
        console.warn('clearSubjectCompletion called with invalid subjectId.');
        return;
    }
    try {
        const key = `${COMPLETED_PREFIX}${subjectId}`;
        await AsyncStorage.removeItem(key);
    } catch (e) {
        console.error('Error clearing subject completion data:', e);
    }
};

/**
 * Clears ALL completion data stored by this app. Use with caution!
 * @returns {Promise<void>}
 */
export const clearAllCompletionData = async () => {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const completionKeys = allKeys.filter(key => key.startsWith(COMPLETED_PREFIX));
        if (completionKeys.length > 0) {
            await AsyncStorage.multiRemove(completionKeys);
            console.log('Cleared all PYQDeck completion data.');
        }
    } catch (e) {
        console.error('Error clearing all completion data:', e);
    }
};