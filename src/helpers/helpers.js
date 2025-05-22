import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as LinkingExpo from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { ASYNC_STORAGE_PREFIX, UNCAT_CHAPTER_NAME } from '../constants';
import beuData from '../data/beuData';

const LAST_JOURNEY_KEY = 'pyqdeck_lastJourney_v1';

export const saveLastJourney = async (journeyData) => {
    try {
        if (
            !journeyData ||
            !journeyData.branchId ||
            !journeyData.semId ||
            !journeyData.subjectId
        ) {
            console.warn('Attempted to save invalid journey data:', journeyData);
            return;
        }
        const jsonValue = JSON.stringify(journeyData);
        await AsyncStorage.setItem(LAST_JOURNEY_KEY, jsonValue);
    } catch (e) {
        console.error('Error saving last journey:', e);
    }
};

export const loadLastJourney = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(LAST_JOURNEY_KEY);
        if (jsonValue != null) {
            const journeyData = JSON.parse(jsonValue);
            if (journeyData.branchId && journeyData.semId && journeyData.subjectId) {
                return journeyData;
            } else {
                console.warn('Loaded journey data is invalid:', journeyData);
                await AsyncStorage.removeItem(LAST_JOURNEY_KEY); 
                return null;
            }
        }
        return null;
    } catch (e) {
        console.error('Error loading last journey:', e);
        return null;
    }
};

export const findData = (path) => {
    const { branchId, semId, subjectId } = path;
    try {
        const branch = beuData.branches.find((b) => b.id === branchId);
        if (!branch) return { error: 'Branch not found' };

        if (!semId) return { branch }; 
        const semester = branch.semesters?.find((s) => s.id === semId);
        if (!semester) return { error: 'Semester not found' };

        if (!subjectId) return { branch, semester }; 
        const subject = semester.subjects?.find((sub) => sub.id === subjectId);
        if (!subject) return { error: 'Subject not found' };

        const questions =
            subject.questions && Array.isArray(subject.questions)
                ? [...subject.questions] 
                : [];

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

export const getQuestionPlainText = (text) => {
    if (!text) return '';

    let plainText = text;

    plainText = plainText.replace(/```[\s\S]*?```/g, '\n[Code Snippet]\n'); 
    plainText = plainText.replace(/^( {4,}|\t+).*/gm, '\n[Code Snippet]\n'); 

    plainText = plainText.replace(/`([^`]+)`/g, '$1');

    plainText = plainText.replace(/!\[.*?\]\(.*?\)/g, '[Image]');

    plainText = plainText.replace(/\[(.*?)\]\(.*?\)/g, '$1');

    plainText = plainText.replace(/<[^>]*>/g, ' ');

    plainText = plainText.replace(/^#+\s+/gm, '');

    plainText = plainText.replace(/^>\s+/gm, '');

    plainText = plainText.replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, '');

    plainText = plainText.replace(/^\s*[\*\-\+]\s+/gm, ''); 
    plainText = plainText.replace(/^\s*[0-9]+\.\s+/gm, ''); 

    plainText = plainText.replace(/([*_~]){1,3}(.*?)\1{1,3}/g, '$2');

    plainText = plainText.replace(/\s+/g, ' ').trim();

    plainText = plainText.replace(/(\s|^)\[Code Snippet\](\s|$)/g, ' ').trim();
    plainText = plainText.replace(/(\s|^)\[Image\](\s|$)/g, ' ').trim();

    return plainText;
};

export const isQuestionCompleted = async (questionId) => {
    try {
        const value = await AsyncStorage.getItem(
            ASYNC_STORAGE_PREFIX + questionId
        );
        return value === 'true';
    } catch (e) {
        console.error('Error reading completion status:', e);
        return false; 
    }
};

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

export const loadCompletionStatuses = async (questionIds) => {
    if (!Array.isArray(questionIds)) {
        console.error(
            'loadCompletionStatuses expected an array, received:',
            typeof questionIds
        );
        return {};
    }
    if (questionIds.length === 0) return {}; 

    const keys = questionIds.map((id) => ASYNC_STORAGE_PREFIX + id);
    const statuses = {};

    try {
        const storedValues = await AsyncStorage.multiGet(keys);
        storedValues.forEach(([key, value]) => {
            if (key) {
                const questionId = key.replace(ASYNC_STORAGE_PREFIX, '');
                statuses[questionId] = value === 'true'; 
            }
        });
    } catch (e) {
        console.error('Error loading bulk completion statuses:', e);
    }
    return statuses;
};

export const copyToClipboard = async (text, showFeedback = () => {}) => {
    try {
        await Clipboard.setStringAsync(text || ''); 
        showFeedback('Question text copied!');
    } catch (e) {
        console.error('Clipboard copy error:', e);
        showFeedback('Failed to copy text!');
    }
};

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

export const searchGoogle = (query, showFeedback) => {
    const url = `https://google.com/search?q=${encodeURIComponent(
        query || '' 
    )}`;
    openLink(url, showFeedback);
};

export const askAI = (query, showFeedback) => {
    const url = `https://chatgpt.com?q=${encodeURIComponent(
        query || '' 
    )}`;
    openLink(url, showFeedback);
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const context = this; 
        const later = () => {
            timeout = null;
            func.apply(context, args); 
        };
        clearTimeout(timeout); 
        timeout = setTimeout(later, wait); 
    };
};

export const getUniqueYears = (questions) => {
    if (!Array.isArray(questions) || questions.length === 0) {
        return [];
    }
    const years = new Set();
    questions.forEach((q) => {
        if (q.year != null && !isNaN(Number(q.year))) {
            years.add(Number(q.year));
        }
    });
    return Array.from(years).sort((a, b) => b - a);
};

export const getUniqueChapters = (questions) => {
    if (!Array.isArray(questions) || questions.length === 0) {
        return [];
    }
    const chapters = new Set();
    let hasUncategorized = false;
    questions.forEach((q) => {
        if (q.chapter && typeof q.chapter === 'string' && q.chapter.trim()) {
            chapters.add(q.chapter.trim());
        } else {
            hasUncategorized = true; 
        }
    });

    const sortedChapters = Array.from(chapters).sort((a, b) => {
        const matchA = a.match(/^Module\s+(\d+)/i);
        const matchB = b.match(/^Module\s+(\d+)/i);
        if (matchA && matchB) {
            return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
        } else if (matchA) {
            return -1; 
        } else if (matchB) {
            return 1; 
        } else {
            return a.localeCompare(b);
        }
    });

    if (hasUncategorized) {
        sortedChapters.push(UNCAT_CHAPTER_NAME);
    }

    return sortedChapters;
};

// --- Streak & Daily Progress Helpers ---
const STREAK_KEY = 'pyqdeck_streak';
const STREAK_DATE_KEY = 'pyqdeck_streak_last_date';
const STREAK_TODAY_COUNT_KEY = 'pyqdeck_streak_today_count';
const STREAK_BEST_KEY = 'pyqdeck_streak_best';

// Call this when a question is marked completed
export const updateDailyStreak = async () => {
    try {
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
        const lastDate = await AsyncStorage.getItem(STREAK_DATE_KEY);
        let streak = parseInt(await AsyncStorage.getItem(STREAK_KEY), 10) || 0;
        let bestStreak = parseInt(await AsyncStorage.getItem(STREAK_BEST_KEY), 10) || 0;
        let todayCount = parseInt(await AsyncStorage.getItem(STREAK_TODAY_COUNT_KEY), 10) || 0;

        if (lastDate === todayStr) {
            todayCount += 1;
        } else {
            // Check if yesterday was the last active day
            if (lastDate) {
                const last = new Date(lastDate);
                const diff = (today - last) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    streak += 1;
                } else {
                    streak = 1;
                }
            } else {
                streak = 1;
            }
            todayCount = 1;
        }
        if (streak > bestStreak) bestStreak = streak;
        await AsyncStorage.setItem(STREAK_DATE_KEY, todayStr);
        await AsyncStorage.setItem(STREAK_KEY, streak.toString());
        await AsyncStorage.setItem(STREAK_TODAY_COUNT_KEY, todayCount.toString());
        await AsyncStorage.setItem(STREAK_BEST_KEY, bestStreak.toString());
        return { streak, todayCount, bestStreak };
    } catch (e) {
        console.error('Error updating streak:', e);
        return null;
    }
};

export const getStreakInfo = async () => {
    try {
        const streak = parseInt(await AsyncStorage.getItem(STREAK_KEY), 10) || 0;
        const todayCount = parseInt(await AsyncStorage.getItem(STREAK_TODAY_COUNT_KEY), 10) || 0;
        const bestStreak = parseInt(await AsyncStorage.getItem(STREAK_BEST_KEY), 10) || 0;
        const lastDate = await AsyncStorage.getItem(STREAK_DATE_KEY);
        return { streak, todayCount, bestStreak, lastDate };
    } catch (e) {
        return { streak: 0, todayCount: 0, bestStreak: 0, lastDate: null };
    }
};

// Optionally, call this on app launch to auto-reset streak if user missed a day
export const checkAndResetStreak = async () => {
    try {
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const lastDate = await AsyncStorage.getItem(STREAK_DATE_KEY);
        if (lastDate && lastDate !== todayStr) {
            const last = new Date(lastDate);
            const diff = (today - last) / (1000 * 60 * 60 * 24);
            if (diff > 1) {
                await AsyncStorage.setItem(STREAK_KEY, '0');
                await AsyncStorage.setItem(STREAK_TODAY_COUNT_KEY, '0');
            } else if (diff === 1) {
                await AsyncStorage.setItem(STREAK_TODAY_COUNT_KEY, '0');
            }
        }
    } catch (e) {
        console.error('Error checking/resetting streak:', e);
    }
};

// --- PYQ Secure Store Utilities ---
export const getPYQKey = (branchId, semId) => `PYQs_${branchId}_${semId}`;

// --- Chunked SecureStore Helpers ---
const CHUNK_SIZE = 2000;
const getChunkKey = (branchId, semId, index) => `PYQs_${branchId}_${semId}_part${index}`;

export const saveSemesterPYQsToSecureStore = async (branchId, semId, data) => {
    try {
        const json = JSON.stringify(data);
        const numChunks = Math.ceil(json.length / CHUNK_SIZE);
        // Remove old chunks first
        for (let i = 0; i < 10; i++) {
            await SecureStore.deleteItemAsync(getChunkKey(branchId, semId, i));
        }
        // Store new chunks
        for (let i = 0; i < numChunks; i++) {
            const chunk = json.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            await SecureStore.setItemAsync(getChunkKey(branchId, semId, i), chunk);
        }
        // Store chunk count
        await SecureStore.setItemAsync(getPYQKey(branchId, semId), numChunks.toString());
        return true;
    } catch (e) {
        console.error('Error saving PYQs to Secure Store (chunked):', e);
        return false;
    }
};

export const getSemesterPYQsFromSecureStore = async (branchId, semId) => {
    try {
        const countStr = await SecureStore.getItemAsync(getPYQKey(branchId, semId));
        const numChunks = parseInt(countStr, 10);
        if (!numChunks || isNaN(numChunks) || numChunks < 1) return null;
        let json = '';
        for (let i = 0; i < numChunks; i++) {
            const chunk = await SecureStore.getItemAsync(getChunkKey(branchId, semId, i));
            if (chunk === null) return null;
            json += chunk;
        }
        return JSON.parse(json);
    } catch (e) {
        console.error('Error loading PYQs from Secure Store (chunked):', e);
        return null;
    }
};

export const isSemesterPYQDownloaded = async (branchId, semId) => {
    try {
        const countStr = await SecureStore.getItemAsync(getPYQKey(branchId, semId));
        const numChunks = parseInt(countStr, 10);
        if (!numChunks || isNaN(numChunks) || numChunks < 1) return false;
        // Optionally, check existence of first chunk
        const firstChunk = await SecureStore.getItemAsync(getChunkKey(branchId, semId, 0));
        return !!firstChunk;
    } catch (e) {
        return false;
    }
};
