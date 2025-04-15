import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKED_QUESTIONS_KEY = 'pyqdeck_bookmarked_questions_v1';

export const getBookmarkedQuestions = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(BOOKMARKED_QUESTIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error loading bookmarks:', e);
    return [];
  }
};

export const isQuestionBookmarked = async (questionId) => {
  const bookmarks = await getBookmarkedQuestions();
  return bookmarks.includes(questionId);
};

export const addBookmark = async (questionId) => {
  try {
    const bookmarks = await getBookmarkedQuestions();
    if (!bookmarks.includes(questionId)) {
      bookmarks.push(questionId);
      await AsyncStorage.setItem(BOOKMARKED_QUESTIONS_KEY, JSON.stringify(bookmarks));
    }
  } catch (e) {
    console.error('Error adding bookmark:', e);
  }
};

export const removeBookmark = async (questionId) => {
  try {
    let bookmarks = await getBookmarkedQuestions();
    bookmarks = bookmarks.filter(id => id !== questionId);
    await AsyncStorage.setItem(BOOKMARKED_QUESTIONS_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Error removing bookmark:', e);
  }
};

export const toggleBookmark = async (questionId) => {
  const isBookmarked = await isQuestionBookmarked(questionId);
  if (isBookmarked) {
    await removeBookmark(questionId);
  } else {
    await addBookmark(questionId);
  }
  return !isBookmarked;
};
