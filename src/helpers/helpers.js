
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as LinkingExpo from 'expo-linking';
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


            return journeyData;
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


export const formatQuestionText = (text) => {
    if (!text) return '';
    let formatted = text.replace(/```[\s\S]*?```/g, '\n[Code Block]\n');
    formatted = formatted.replace(/^\s*[\*\-]\s+/gm, '\u2022 ');
    return formatted.trim();
};


export const getQuestionPlainText = (text) => {
    if (!text) return '';

    let plainText = text.replace(
        /```(cpp|c|java|javascript|html|css|python)?\n([\s\S]*?)\n```/g,
        '\n'
    );

    plainText = plainText.replace(/^\s*[\*\-]\s+/gm, '');

    plainText = plainText.replace(/<[^>]*>/g, ' ');

    plainText = plainText.replace(/\s+/g, ' ').trim();
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
    const keys = questionIds.map((id) => ASYNC_STORAGE_PREFIX + id);
    const statuses = {};
    if (keys.length === 0) return statuses;

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



export const copyToClipboard = async (text, showFeedback = () => { }) => {
    try {
        await Clipboard.setStringAsync(text || '');
        showFeedback('Question text copied!');
    } catch (e) {
        console.error('Clipboard copy error:', e);
        showFeedback('Failed to copy text!');
    }
};


export const openLink = async (url, showFeedback = () => { }) => {
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


    const url = `https://chatgpt.com/search?q=${encodeURIComponent(
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