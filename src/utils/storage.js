// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPLETED_PREFIX = 'completed_questions_';

// Loads the Set of completed question IDs for a given subject
export const loadCompletedQuestions = async (subjectId) => {
  if (!subjectId) return new Set(); // Prevent errors if subjectId is missing
  try {
    const key = `${COMPLETED_PREFIX}${subjectId}`;
    const jsonValue = await AsyncStorage.getItem(key);
    // Parse only if jsonValue is not null/undefined
    return jsonValue ? new Set(JSON.parse(jsonValue)) : new Set();
  } catch (e) {
    console.error('Error loading completed questions from AsyncStorage:', e);
    return new Set(); // Return empty set on error
  }
};

// Saves the Set of completed question IDs for a given subject
export const saveCompletedQuestions = async (subjectId, completedSet) => {
   if (!subjectId) return; // Prevent errors if subjectId is missing
   if (!(completedSet instanceof Set)) { // Basic type check
      console.error('Invalid data type passed to saveCompletedQuestions. Expected Set.');
      return;
   }
  try {
    const key = `${COMPLETED_PREFIX}${subjectId}`;
    // Convert Set to Array for JSON storage
    const jsonValue = JSON.stringify(Array.from(completedSet));
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving completed questions to AsyncStorage:', e);
  }
};

// Toggles the completion status for a specific question in a subject
export const toggleQuestionCompletion = async (subjectId, questionId) => {
   if (!subjectId || !questionId) return await loadCompletedQuestions(subjectId); // Return current set on bad input
    try {
        // Load the current set
        const completedSet = await loadCompletedQuestions(subjectId);
        // Toggle the ID
        if (completedSet.has(questionId)) {
            completedSet.delete(questionId);
        } else {
            completedSet.add(questionId);
        }
        // Save the updated set
        await saveCompletedQuestions(subjectId, completedSet);
        // Return the updated set so the UI can react immediately
        return completedSet;
    } catch (e) {
         console.error('Error toggling question completion:', e);
         // On error, return the original set before the toggle attempt
         return await loadCompletedQuestions(subjectId);
    }
};