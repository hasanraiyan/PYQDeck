// App.js
// Final Version v4.2 - Fixed Text Rendering Issues (Title Truncation)

// ** DISCLAIMER: **
// Putting all components, screens, navigation, styles, and utilities in a single file
// is generally NOT recommended for maintainability in larger React Native projects.
// This is done here specifically based on the user request.
// Consider splitting into separate files/folders (components/, screens/, navigation/, hooks/, utils/)
// for better organization in real-world applications.

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Linking,
  Switch,
  ScrollView,
  TextInput,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as LinkingExpo from 'expo-linking';
// Ensure all necessary icon sets are imported
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
  AntDesign,
} from '@expo/vector-icons';

// --- DATA ---
// ========================================================================
// == CRITICAL: REPLACE THE CONTENT OF THIS beuData OBJECT WITH YOUR FULL DATASET ==
// == Make sure 'icon', 'chapter', and 'year' fields are present and accurate. ==
// ========================================================================
const beuData = {
  branches: [
    {
      id: 'it',
      name: 'Information Technology',
      icon: { set: 'Ionicons', name: 'laptop-outline' },
      semesters: [
        {
          id: 'it_sem3',
          number: 3,
          subjects: [
            {
              id: 'it301',
              name: 'Object-Oriented Programming Using C++',
              code: 'IT301',
              questions: [
                {
                  questionId: 'it301_2019_1a',
                  year: 2019,
                  qNumber: 'Q1a',
                  chapter: 'Module 3: Classes and Data Abstraction',
                  text: 'Which feature allows open recursion among the following?\n\n*   (i) Use of `this` pointer\n*   (ii) Use of pointers\n*   (iii) Use of pass by value\n*   (iv) Use of parameterized constructor',
                  type: 'MCQ',
                  marks: 2,
                },
                {
                  questionId: 'it301_2019_1b',
                  year: 2019,
                  qNumber: 'Q1b',
                  chapter: 'Module 4: Overloading, Templates and Inheritance',
                  text: 'If same message is passed to objects of several different classes and all of those can respond in a different way, what is this feature called?\n\n*   (i) Inheritance\n*   (ii) Overloading\n*   (iii) Polymorphism\n*   (iv) Overriding',
                  type: 'MCQ',
                  marks: 2,
                },
                {
                  questionId: 'it301_2021_3a',
                  year: 2021,
                  qNumber: 'Q3a',
                  chapter: 'Module 1: Introduction to C++ and OOP',
                  text: 'Explain the difference between procedural programming and object-oriented programming.',
                  type: 'Explanation',
                  marks: 7,
                },
                {
                  questionId: 'it301_2021_misc',
                  year: 2021,
                  qNumber: 'Misc1',
                  chapter: null,
                  text: 'What is the purpose of the `main` function in C++?',
                  type: 'Explanation',
                  marks: 5,
                },
                {
                  questionId: 'it301_2019_2a',
                  year: 2019,
                  qNumber: 'Q2a',
                  chapter: 'Module 1: Introduction to C++ and OOP',
                  text: 'What is Object-oriented Programming (OOP)? Write the basic concepts of OOP (e.g., Encapsulation, Abstraction, Inheritance, Polymorphism).',
                  type: 'Explanation',
                  marks: 7,
                },
                {
                  questionId: 'it301_2019_2b',
                  year: 2019,
                  qNumber: 'Q2b',
                  chapter: 'Module 3: Classes and Data Abstraction',
                  text: 'What do you mean by class and object? Give a simple example.',
                  type: 'Explanation with Example',
                  marks: 7,
                },
                {
                  questionId: 'it301_2019_9a',
                  year: 2019,
                  qNumber: 'Q9a',
                  chapter: 'Module 4: Overloading, Templates and Inheritance',
                  text: 'With the help of an example program, differentiate between Function Overloading and Function Overriding.',
                  type: 'Differentiate with Example',
                  marks: 7,
                },
              ],
            },
            {
              id: 'it302',
              name: 'Data Structures & Algorithms',
              code: 'IT302',
              questions: [
                {
                  questionId: 'it302_2021_1a',
                  year: 2021,
                  qNumber: 'Q1a',
                  chapter: 'Module 1: Analysis of Algorithms',
                  text: 'What is the time complexity (Big-O notation) of Linear Search in the worst case?\n\n* (i) O(1)\n* (ii) O(log n)\n* (iii) O(n)\n* (iv) O(n^2)',
                  type: 'MCQ',
                  marks: 2,
                },
                {
                  questionId: 'it302_2022_6a',
                  year: 2022,
                  qNumber: 'Q6a',
                  chapter: 'Module 4: Trees',
                  text: 'Define a Binary Search Tree (BST). Construct a BST for the following sequence of numbers: `50, 30, 70, 20, 40, 60, 80`.',
                  type: 'Definition & Problem',
                  marks: 7,
                },
                {
                  questionId: 'it302_2022_7a',
                  year: 2022,
                  qNumber: 'Q7a',
                  chapter: 'Module 5: Graphs',
                  text: 'Explain Depth First Search (DFS) algorithm with an example.',
                  type: 'Explanation with Example',
                  marks: 7,
                },
              ],
            },
          ],
        },
        {
          id: 'it_sem4',
          number: 4,
          subjects: [
            {
              id: 'it401',
              name: 'Web Technologies',
              code: 'IT401',
              questions: [],
            },
            {
              id: 'it402',
              name: 'Database Management Systems',
              code: 'IT402',
              questions: [
                {
                  questionId: 'it402_2023_1a',
                  year: 2023,
                  qNumber: 'Q1a',
                  chapter: 'Module 1: Introduction',
                  text: 'What is a DBMS?',
                  type: 'Definition',
                  marks: 2,
                },
              ],
            },
          ],
        },
      ],
    },
    // Add other branches here following the same structure...
  ],
};
// --- END DATA ---

// --- CONSTANTS ---
const ASYNC_STORAGE_PREFIX = 'beuApp_vNative_completed_';
const UNCAT_CHAPTER_NAME = 'Uncategorized'; // Consistent name for questions without a chapter
const COLORS = {
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
const DEFAULT_BRANCH_ICON = { set: 'Ionicons', name: 'school-outline' };
const SEARCH_DEBOUNCE_DELAY = 300; // Milliseconds to wait after typing before searching

// --- UTILITIES ---
const Utils = {
  // Finds data for branch, semester, or subject based on provided path IDs
  findData: (path) => {
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
      console.error('Error in Utils.findData:', e);
      return { error: 'An error occurred while retrieving data.' };
    }
  },

  // Basic formatting for question text (handles lists, code blocks placeholder)
  formatQuestionText: (text) => {
    if (!text) return '';
    let formatted = text.replace(/```[\s\S]*?```/g, '\n[Code Block]\n'); // Replace code blocks with placeholder
    formatted = formatted.replace(/^\s*[\*\-]\s+/gm, '\u2022 '); // Convert markdown lists to bullets
    return formatted.trim();
  },

  // Extracts plain text from question (removes code blocks, lists, tags) for search/copy
  getQuestionPlainText: (text) => {
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
  },

  // Check if a question is marked completed in AsyncStorage
  isQuestionCompleted: async (questionId) => {
    try {
      const value = await AsyncStorage.getItem(
        ASYNC_STORAGE_PREFIX + questionId
      );
      return value === 'true';
    } catch (e) {
      console.error('Error reading completion status:', e);
      return false; // Default to false on error
    }
  },

  // Save question completion status to AsyncStorage
  setQuestionCompleted: async (questionId, isCompleted) => {
    try {
      await AsyncStorage.setItem(
        ASYNC_STORAGE_PREFIX + questionId,
        isCompleted ? 'true' : 'false'
      );
    } catch (e) {
      console.error('Error saving completion status:', e);
    }
  },

  // Load completion statuses for multiple question IDs efficiently
  loadCompletionStatuses: async (questionIds) => {
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
  },

  // Copy text to clipboard and show feedback
  copyToClipboard: async (text, showFeedback = () => {}) => {
    try {
      await Clipboard.setStringAsync(text || ''); // Handle null/undefined text
      showFeedback('Question text copied!');
    } catch (e) {
      console.error('Clipboard copy error:', e);
      showFeedback('Failed to copy text!');
    }
  },

  // Open a URL in the default browser/app
  openLink: async (url, showFeedback = () => {}) => {
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
  },

  // Search a query on Google
  searchGoogle: (query, showFeedback) => {
    const url = `https://google.com/search?q=${encodeURIComponent(
      query || ''
    )}`;
    Utils.openLink(url, showFeedback);
  },

  // Open AI search (using ChatGPT search URL as an example)
  askAI: (query, showFeedback) => {
    const url = `https://chatgpt.com/search?q=${encodeURIComponent(
      query || ''
    )}`;
    Utils.openLink(url, showFeedback);
  },

  // Debounce function calls (e.g., for search input)
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Extract unique years from a list of questions, sorted descending
  getUniqueYears: (questions) => {
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
  },

  // Extract unique chapter names, sorted (Module N first, then alpha), Uncategorized last
  getUniqueChapters: (questions) => {
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
  },
};

// --- Reusable UI Components ---

// Loading State Indicator
const LoadingIndicator = () => (
  <View style={styles.centerContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Error State Message
const ErrorMessage = ({ message }) => (
  <View style={styles.centerContainer}>
    <Ionicons name="alert-circle-outline" size={40} color={COLORS.error} />
    <Text style={styles.errorText}>{message || 'An error occurred.'}</Text>
  </View>
);

// Empty State Message
const EmptyState = ({ message }) => (
  <View style={styles.centerContainer}>
    <Ionicons name="file-tray-outline" size={40} color={COLORS.textSecondary} />
    <Text style={styles.emptyText}>{message || 'No items found.'}</Text>
  </View>
);

// Generic Icon Component supporting multiple libraries
const Icon = ({ iconSet = 'Ionicons', name, size, color }) => {
  switch (iconSet) {
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={name} size={size} color={color} />;
    case 'FontAwesome':
      return <FontAwesome name={name} size={size} color={color} />;
    case 'AntDesign':
      return <AntDesign name={name} size={size} color={color} />;
    case 'Ionicons': // Default case
    default:
      return <Ionicons name={name} size={size} color={color} />;
  }
};

// Reusable Card Component for list items (Branches, Semesters, Subjects, Years, Chapters)
const ListItemCard = React.memo(
  ({
    title,
    subtitle,
    onPress,
    disabled = false,
    hasData = true,
    iconName,
    iconSet,
    iconColor = COLORS.textSecondary,
    progress, // Optional progress percentage (0-100) for subjects
  }) => {
    const isItemDisabled = disabled || !hasData;
    const showProgress = progress != null && progress >= 0 && hasData;

    return (
      <TouchableOpacity
        style={[
          styles.card, // Uses shadow/elevation now
          isItemDisabled ? styles.cardDisabled : {},
          showProgress ? styles.cardWithProgress : {}, // Add padding if progress bar visible
        ]}
        onPress={onPress}
        disabled={isItemDisabled}
        activeOpacity={0.65} // Visual feedback on press
      >
        {/* Top Row: Icon, Title/Subtitle, Chevron */}
        <View style={styles.cardTopRow}>
          {/* Icon Area */}
          {iconName && (
            // Icon container no longer needs a right border
            <View
              style={[
                styles.cardIconContainer,
                isItemDisabled ? styles.cardIconContainerDisabled : {},
              ]}>
              <Icon
                iconSet={iconSet}
                name={iconName}
                size={20}
                color={isItemDisabled ? COLORS.disabled : iconColor}
              />
            </View>
          )}
          {/* Content Area */}
          <View style={styles.cardContent}>
            {/* CORRECTION 1: Always allow up to 2 lines for title */}
            <Text
              style={[
                styles.cardTitle,
                isItemDisabled ? styles.cardTextDisabled : {},
              ]}
              numberOfLines={2}>
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.cardSubtitle,
                  isItemDisabled ? styles.cardTextDisabled : {},
                ]}
                numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          {/* Chevron or No Data Indicator */}
          {!isItemDisabled && (
            <View style={styles.cardChevronContainer}>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color={COLORS.textSecondary}
              />
            </View>
          )}
          {isItemDisabled &&
            !hasData && ( // Show 'No Data' only if disabled *because* of no data
              <View style={styles.cardChevronContainer}>
                <Text style={styles.noDataText}>No Data</Text>
              </View>
            )}
        </View>

        {/* Progress Bar (Optional, shown below content) */}
        {showProgress && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarIndicator,
                { width: `${Math.max(0, Math.min(100, progress))}%` },
              ]}
            />
            <Text style={styles.progressText}>{`${Math.round(
              progress
            )}% Done`}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

// --- SCREENS ---

// Screen to display list of Branches
const BranchListScreen = ({ navigation }) => {
  const branches = useMemo(() => beuData.branches || [], []);

  const handlePressBranch = useCallback(
    (branchId) => {
      navigation.navigate('Semesters', { branchId });
    },
    [navigation]
  );

  const renderBranchItem = useCallback(
    ({ item }) => {
      // Check if branch has any data (semesters -> subjects -> questions)
      const hasData =
        item.semesters?.some((sem) =>
          sem.subjects?.some((sub) => sub.questions?.length > 0)
        ) ?? false;
      const branchIcon = item.icon || DEFAULT_BRANCH_ICON;
      return (
        <ListItemCard
          title={item.name}
          onPress={() => handlePressBranch(item.id)}
          hasData={hasData}
          disabled={!hasData}
          iconName={branchIcon.name}
          iconSet={branchIcon.set}
          iconColor={COLORS.branchIconColorDefault}
        />
      );
    },
    [handlePressBranch]
  );

  if (!branches.length) {
    return <EmptyState message="No branches available in the data." />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={branches}
        renderItem={renderBranchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        initialNumToRender={10} // Optimization
        maxToRenderPerBatch={15} // Optimization
        windowSize={21} // Optimization
      />
    </SafeAreaView>
  );
};

// Screen to display list of Semesters for a selected Branch
const SemesterListScreen = ({ route, navigation }) => {
  const { branchId } = route.params;
  const { branch: branchData, error: dataError } = useMemo(
    () => Utils.findData({ branchId }),
    [branchId]
  );
  const [error, setError] = useState(dataError);

  useEffect(() => {
    if (branchData) {
      navigation.setOptions({ title: `${branchData.name || 'Semesters'}` });
      setError(null);
    } else if (dataError) {
      setError(dataError);
    } else if (!branchData && !dataError) {
      // Handle case where data might be missing unexpectedly
      setError('Branch data could not be loaded.');
    }
  }, [branchData, dataError, navigation]);

  const handlePressSemester = useCallback(
    (semId) => {
      navigation.navigate('Subjects', { branchId, semId });
    },
    [navigation, branchId]
  );

  const renderSemesterItem = useCallback(
    ({ item }) => {
      // Check if semester has any data (subjects -> questions)
      const hasData =
        item.subjects?.some((sub) => sub.questions?.length > 0) ?? false;
      return (
        <ListItemCard
          title={`Semester ${item.number}`}
          onPress={() => handlePressSemester(item.id)}
          hasData={hasData}
          disabled={!hasData}
          iconName="calendar-clear-outline"
          iconSet="Ionicons"
          iconColor={COLORS.semesterIconColor}
        />
      );
    },
    [handlePressSemester]
  );

  if (error) return <ErrorMessage message={error} />;
  if (!branchData && !error) return <LoadingIndicator />; // Show loading if data not yet available and no error
  if (!branchData?.semesters || branchData.semesters.length === 0) {
    return <EmptyState message="No semesters found for this branch." />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={branchData.semesters}
        renderItem={renderSemesterItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
};

// Screen to display list of Subjects for a selected Semester (with Progress Bar)
const SubjectListScreen = ({ route, navigation }) => {
  const { branchId, semId } = route.params;
  const { semester: semesterData, error: dataError } = useMemo(
    () => Utils.findData({ branchId, semId }),
    [branchId, semId]
  );
  const [error, setError] = useState(dataError);
  const [completionStatuses, setCompletionStatuses] = useState({});
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true); // Track status loading separately

  // Set navigation title
  useEffect(() => {
    if (semesterData) {
      navigation.setOptions({
        title: `Sem ${semesterData.number || '?'} Subjects`,
      });
      setError(null);
    } else if (dataError) {
      setError(dataError);
    } else if (!semesterData && !dataError) {
      setError('Semester data could not be loaded.');
    }
  }, [semesterData, dataError, navigation]);

  // Load completion statuses for all questions in this semester's subjects
  useEffect(() => {
    let isMounted = true;
    if (semesterData?.subjects && semesterData.subjects.length > 0) {
      setIsLoadingStatuses(true);
      // Flatten all question IDs from all subjects
      const allQuestionIds = semesterData.subjects.flatMap(
        (sub) => sub.questions?.map((q) => q.questionId) ?? []
      );

      if (allQuestionIds.length > 0) {
        Utils.loadCompletionStatuses(allQuestionIds)
          .then((statuses) => {
            if (isMounted) {
              setCompletionStatuses(statuses);
              setIsLoadingStatuses(false);
            }
          })
          .catch((err) => {
            console.error('Error loading subject completion statuses:', err);
            if (isMounted) setIsLoadingStatuses(false);
          });
      } else {
        // No questions in any subject
        if (isMounted) {
          setCompletionStatuses({});
          setIsLoadingStatuses(false);
        }
      }
    } else {
      // No subjects or semester data not loaded yet
      if (isMounted) {
        setCompletionStatuses({});
        setIsLoadingStatuses(false);
      }
    }
    return () => {
      isMounted = false;
    }; // Cleanup on unmount
  }, [semesterData]); // Rerun when semester data changes

  // Navigate to Organization Selection for the chosen subject
  const handlePressSubject = useCallback(
    (subjectId) => {
      navigation.navigate('OrganizationSelection', {
        branchId,
        semId,
        subjectId,
      });
    },
    [navigation, branchId, semId]
  );

  // Render individual subject item
  const renderSubjectItem = useCallback(
    ({ item }) => {
      const questions = item.questions || [];
      const totalQuestions = questions.length;
      const hasData = totalQuestions > 0;
      let progress = 0;

      // Calculate progress only if data exists and statuses are loaded
      if (hasData && !isLoadingStatuses) {
        const completedCount = questions.filter(
          (q) => completionStatuses[q.questionId]
        ).length;
        progress =
          totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;
      }

      return (
        <ListItemCard
          title={item.name}
          subtitle={item.code || ''}
          onPress={() => handlePressSubject(item.id)}
          hasData={hasData}
          disabled={!hasData}
          iconName="book-outline"
          iconSet="Ionicons"
          iconColor={COLORS.subjectIconColor}
          progress={hasData ? progress : null} // Pass progress only if subject has questions
        />
      );
    },
    [handlePressSubject, completionStatuses, isLoadingStatuses]
  ); // Dependencies

  if (error) return <ErrorMessage message={error} />;
  // Show loading if either semester data or completion statuses are loading
  if ((!semesterData && !error) || isLoadingStatuses)
    return <LoadingIndicator />;
  if (!semesterData?.subjects || semesterData.subjects.length === 0) {
    return <EmptyState message="No subjects found for this semester." />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={semesterData.subjects}
        renderItem={renderSubjectItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        extraData={completionStatuses} // Important: Trigger re-render when statuses change
      />
    </SafeAreaView>
  );
};

// Screen to choose how to view questions (All, By Chapter, By Year)
const OrganizationSelectionScreen = ({ route, navigation }) => {
  const { branchId, semId, subjectId } = route.params;
  const {
    subject: subjectData,
    questions,
    error: dataError,
  } = useMemo(
    () => Utils.findData({ branchId, semId, subjectId }),
    [branchId, semId, subjectId]
  );
  const [error, setError] = useState(dataError);

  // Set navigation title
  useEffect(() => {
    if (subjectData) {
      navigation.setOptions({
        title: subjectData.name || 'Organize Questions',
      });
      setError(null);
    } else if (dataError) {
      setError(dataError);
    } else if (!subjectData && !dataError) {
      setError('Subject data could not be loaded.');
    }
  }, [subjectData, dataError, navigation]);

  // Navigation callbacks for each option
  const navigateToQuestionsAll = useCallback(() => {
    navigation.navigate('Questions', {
      branchId,
      semId,
      subjectId,
      organizationMode: 'all',
    });
  }, [navigation, branchId, semId, subjectId]);

  const navigateToChapterSelection = useCallback(() => {
    navigation.navigate('ChapterSelection', { branchId, semId, subjectId });
  }, [navigation, branchId, semId, subjectId]);

  const navigateToYearSelection = useCallback(() => {
    navigation.navigate('YearSelection', { branchId, semId, subjectId });
  }, [navigation, branchId, semId, subjectId]);

  if (error) return <ErrorMessage message={error} />;
  if (!subjectData && !error) return <LoadingIndicator />;

  // Determine if data exists for enabling options
  const hasQuestions = Array.isArray(questions) && questions.length > 0;
  const uniqueYears = hasQuestions ? Utils.getUniqueYears(questions) : [];
  const uniqueChapters = hasQuestions ? Utils.getUniqueChapters(questions) : [];
  const canViewByYear = hasQuestions && uniqueYears.length > 0;
  const canViewByChapter = hasQuestions && uniqueChapters.length > 0;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.listContentContainer}>
        {/* Option 1: View All */}
        <ListItemCard
          title="View All (Default Sort)"
          subtitle="See all questions, newest first"
          onPress={navigateToQuestionsAll}
          iconName="list-outline"
          iconSet="Ionicons"
          iconColor={COLORS.primaryLight}
          hasData={hasQuestions}
          disabled={!hasQuestions}
        />
        {/* Option 2: View By Chapter */}
        <ListItemCard
          title="View By Chapter"
          subtitle="Select a chapter to view its questions"
          onPress={navigateToChapterSelection}
          iconName="folder-open-outline"
          iconSet="Ionicons"
          iconColor={COLORS.secondary}
          hasData={canViewByChapter} // Enable only if chapters exist
          disabled={!canViewByChapter}
        />
        {/* Option 3: View By Year */}
        <ListItemCard
          title="View By Year"
          subtitle="Filter questions by specific year"
          onPress={navigateToYearSelection}
          iconName="calendar-number-outline"
          iconSet="Ionicons"
          iconColor={COLORS.yearIconColor}
          hasData={canViewByYear} // Enable only if years exist
          disabled={!canViewByYear}
        />
        {/* Message if no questions at all */}
        {!hasQuestions && (
          <EmptyState message="No questions available for this subject yet." />
        )}
      </View>
    </SafeAreaView>
  );
};

// Screen to select a specific Year
const YearSelectionScreen = ({ route, navigation }) => {
  const { branchId, semId, subjectId } = route.params;
  const {
    subject: subjectData,
    questions,
    error: dataError,
  } = useMemo(
    () => Utils.findData({ branchId, semId, subjectId }),
    [branchId, semId, subjectId]
  );
  const [error, setError] = useState(dataError);

  // Set navigation title
  useEffect(() => {
    if (subjectData) {
      navigation.setOptions({
        title: `Select Year - ${subjectData.code || ''}`,
      });
      setError(null);
    } else if (dataError) {
      setError(dataError);
    } else if (!subjectData && !dataError) {
      setError('Subject data could not be loaded.');
    }
  }, [subjectData, dataError, navigation]);

  // Get list of unique years available for this subject
  const availableYears = useMemo(
    () => Utils.getUniqueYears(questions),
    [questions]
  );

  // Navigate to Questions screen filtered by the selected year
  const handlePressYear = useCallback(
    (year) => {
      navigation.navigate('Questions', {
        branchId,
        semId,
        subjectId,
        organizationMode: 'year', // Specify mode
        selectedYear: year, // Pass selected year
      });
    },
    [navigation, branchId, semId, subjectId]
  );

  // Render item for the year list
  const renderYearItem = useCallback(
    ({ item: year }) => (
      <ListItemCard
        title={`${year}`} // Display the year
        onPress={() => handlePressYear(year)}
        iconName="calendar-outline"
        iconSet="Ionicons"
        iconColor={COLORS.yearIconColor}
        hasData={true} // Each year is a valid selection
      />
    ),
    [handlePressYear]
  );

  if (error) return <ErrorMessage message={error} />;
  if (!subjectData && !error) return <LoadingIndicator />;
  if (availableYears.length === 0) {
    return (
      <EmptyState message="No questions with assigned years found for this subject." />
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={availableYears}
        renderItem={renderYearItem}
        keyExtractor={(item) => item.toString()} // Year number is a unique key
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
};

// Screen to select a specific Chapter
const ChapterSelectionScreen = ({ route, navigation }) => {
  const { branchId, semId, subjectId } = route.params;
  const {
    subject: subjectData,
    questions,
    error: dataError,
  } = useMemo(
    () => Utils.findData({ branchId, semId, subjectId }),
    [branchId, semId, subjectId]
  );
  const [error, setError] = useState(dataError);

  // Set navigation title
  useEffect(() => {
    if (subjectData) {
      navigation.setOptions({
        title: `Select Chapter - ${subjectData.code || ''}`,
      });
      setError(null);
    } else if (dataError) {
      setError(dataError);
    } else if (!subjectData && !dataError) {
      setError('Subject data could not be loaded.');
    }
  }, [subjectData, dataError, navigation]);

  // Get list of unique chapters available for this subject
  const availableChapters = useMemo(
    () => Utils.getUniqueChapters(questions),
    [questions]
  );

  // Navigate to Questions screen filtered by the selected chapter
  const handlePressChapter = useCallback(
    (chapterName) => {
      navigation.navigate('Questions', {
        branchId,
        semId,
        subjectId,
        organizationMode: 'chapter', // Specify mode
        selectedChapter: chapterName, // Pass selected chapter name
      });
    },
    [navigation, branchId, semId, subjectId]
  );

  // Render item for the chapter list
  const renderChapterItem = useCallback(
    ({ item: chapter }) => (
      <ListItemCard
        title={chapter} // Display chapter name
        onPress={() => handlePressChapter(chapter)}
        iconName="layers-outline" // Icon for chapters/modules
        iconSet="Ionicons"
        iconColor={COLORS.chapterIcon}
        hasData={true} // Each chapter is a valid selection
      />
    ),
    [handlePressChapter]
  );

  if (error) return <ErrorMessage message={error} />;
  if (!subjectData && !error) return <LoadingIndicator />;
  if (availableChapters.length === 0) {
    return (
      <EmptyState message="No questions with assigned chapters found for this subject." />
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={availableChapters}
        renderItem={renderChapterItem}
        keyExtractor={(item) => item} // Chapter name is the unique key
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
};

// Component to display a single Question Card
const QuestionItem = React.memo(
  ({ item, isCompleted, onToggleComplete, onCopy, onSearch, onAskAI }) => {
    // Memoize derived data for performance
    const formattedText = useMemo(
      () => Utils.formatQuestionText(item.text),
      [item.text]
    );
    const plainText = useMemo(
      () => Utils.getQuestionPlainText(item.text),
      [item.text]
    );

    // Memoize callbacks
    const handleCopy = useCallback(
      () => onCopy(plainText),
      [onCopy, plainText]
    );
    const handleSearch = useCallback(
      () => onSearch(plainText),
      [onSearch, plainText]
    );
    const handleAskAI = useCallback(
      () => onAskAI(plainText),
      [onAskAI, plainText]
    );
    const handleToggle = useCallback(
      () => onToggleComplete(item.questionId, !isCompleted),
      [onToggleComplete, item.questionId, isCompleted]
    );

    return (
      <View style={styles.questionCard}>
        {' '}
        {/* Uses shadow/elevation now */}
        {/* Meta Info: Tags and Completion Switch */}
        <View style={styles.metaRow}>
          <View style={styles.metaTagsContainer}>
            {item.year && (
              <View style={[styles.tag, styles.tagYear]}>
                <Text style={[styles.tagText, { color: COLORS.tagYearText }]}>
                  {item.year}
                </Text>
              </View>
            )}
            {item.qNumber && (
              <View style={[styles.tag, styles.tagQNum]}>
                <Text style={[styles.tagText, { color: COLORS.tagQNumText }]}>
                  {item.qNumber}
                </Text>
              </View>
            )}
            {item.marks != null && (
              <View style={[styles.tag, styles.tagMarks]}>
                <Text style={[styles.tagText, { color: COLORS.tagMarksText }]}>
                  {item.marks} Marks
                </Text>
              </View>
            )}
          </View>
          <Switch
            trackColor={{
              false: COLORS.disabledBackground,
              true: COLORS.completed,
            }}
            thumbColor={
              isCompleted
                ? COLORS.completedThumb
                : Platform.OS === 'android'
                ? COLORS.surface
                : null
            }
            ios_backgroundColor={COLORS.disabledBackground}
            onValueChange={handleToggle}
            value={isCompleted}
            style={styles.completionSwitch}
          />
        </View>
        {/* Chapter Info (Simplified - no borders, relies on background/padding) */}
        {item.chapter && (
          <View style={styles.chapterRow}>
            <Icon
              iconSet="Ionicons"
              name="layers-outline"
              size={16}
              color={COLORS.chapterIcon}
              style={styles.chapterIcon}
            />
            <Text style={styles.chapterText} numberOfLines={2}>
              {item.chapter /* Display original chapter name */}
            </Text>
          </View>
        )}
        {/* Show 'Uncategorized' if chapter is missing/null */}
        {!item.chapter && (
          <View style={styles.chapterRow}>
            <Icon
              iconSet="Ionicons"
              name="help-circle-outline"
              size={16}
              color={COLORS.textSecondary}
              style={styles.chapterIcon}
            />
            <Text style={[styles.chapterText, { fontStyle: 'italic' }]}>
              {UNCAT_CHAPTER_NAME}
            </Text>
          </View>
        )}
        {/* Question Text */}
        <Text style={styles.questionTextContent}>{formattedText}</Text>
        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <View style={styles.actionsLeft}>
            {/* Google Search */}
            <TouchableOpacity
              onPress={handleSearch}
              style={styles.iconButton}
              accessibilityLabel="Search question on Google">
              <Icon
                iconSet="FontAwesome"
                name="google"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            {/* Copy to Clipboard */}
            <TouchableOpacity
              onPress={handleCopy}
              style={styles.iconButton}
              accessibilityLabel="Copy question text">
              <Icon
                iconSet="Ionicons"
                name="copy-outline"
                size={22}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {/* Ask AI Button */}
          <TouchableOpacity
            style={styles.askAiButton}
            onPress={handleAskAI}
            activeOpacity={0.8}
            accessibilityLabel="Ask AI (e.g., ChatGPT)">
            <Icon
              iconSet="MaterialCommunityIcons"
              name="robot-outline"
              size={16}
              color={COLORS.surface}
              style={styles.askAiButtonIcon}
            />
            <Text style={styles.askAiButtonText}>Ask AI</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

// Screen to display the list of Questions based on selected Organization Mode
const QuestionListScreen = ({ route, navigation }) => {
  const {
    branchId,
    semId,
    subjectId,
    organizationMode = 'all', // 'all', 'year', 'chapter'
    selectedYear, // Provided if organizationMode === 'year'
    selectedChapter, // Provided if organizationMode === 'chapter'
  } = route.params;

  // State variables
  const [subjectData, setSubjectData] = useState(null);
  const [questions, setQuestions] = useState([]); // Holds ALL questions for the subject initially
  const [completionStatus, setCompletionStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'year_asc', 'year_desc' (only used in 'all' mode)
  const [filterCompleted, setFilterCompleted] = useState('all'); // 'all', 'completed', 'incomplete'
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const feedbackTimerRef = useRef(null); // Ref for feedback toast timeout

  // Debounce search input
  const debouncedSearchHandler = useCallback(
    Utils.debounce((query) => {
      setDebouncedSearchQuery(query);
    }, SEARCH_DEBOUNCE_DELAY),
    [] // Debouncer function is created once
  );
  useEffect(() => {
    debouncedSearchHandler(searchQuery);
  }, [searchQuery, debouncedSearchHandler]);

  // Effect to load subject data and initial completion statuses
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setCompletionStatus({});
    setQuestions([]);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);

    // Fetch subject details and its questions
    const {
      subject,
      questions: fetchedQuestions,
      error: dataError,
    } = Utils.findData({ branchId, semId, subjectId });

    if (dataError) {
      if (isMounted) {
        setError(dataError);
        setSubjectData(null);
        setLoading(false);
      }
    } else if (subject) {
      if (isMounted) {
        setSubjectData(subject);
        const validQuestions = Array.isArray(fetchedQuestions)
          ? fetchedQuestions
          : [];
        setQuestions(validQuestions); // Store all questions

        // Set screen title dynamically based on mode
        let screenTitle = subject.name || 'Questions';
        if (organizationMode === 'year' && selectedYear != null) {
          screenTitle = `${subject.name} (${selectedYear})`;
        } else if (organizationMode === 'chapter' && selectedChapter) {
          const chapterDisplay =
            selectedChapter === UNCAT_CHAPTER_NAME
              ? 'Uncategorized'
              : selectedChapter;
          // CORRECTION 2: Remove manual truncation, let navigation handle it
          screenTitle = `${subject.code || subject.name} (${chapterDisplay})`;
        }
        navigation.setOptions({ title: screenTitle });

        // Load completion statuses if questions exist
        if (validQuestions.length > 0) {
          const questionIds = validQuestions.map((q) => q.questionId);
          Utils.loadCompletionStatuses(questionIds)
            .then((statuses) => {
              if (isMounted) {
                setCompletionStatus(statuses);
                setLoading(false);
              }
            })
            .catch((err) => {
              console.error('Error loading completion statuses:', err);
              if (isMounted) {
                setError('Failed to load completion status.');
                setLoading(false);
              }
            });
        } else {
          if (isMounted) setLoading(false); // No questions, loading finished
        }
      }
    } else {
      // Should not happen if findData is correct, but handle defensively
      if (isMounted) {
        setError('Could not load subject details.');
        setLoading(false);
      }
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [
    branchId,
    semId,
    subjectId,
    navigation,
    organizationMode,
    selectedYear,
    selectedChapter,
  ]); // Re-run if parameters change

  // --- Callback Functions ---
  const displayFeedback = useCallback((message) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedbackMessage(message);
    setShowFeedback(true);
    feedbackTimerRef.current = setTimeout(() => {
      setShowFeedback(false);
      setFeedbackMessage('');
      feedbackTimerRef.current = null;
    }, 1500);
  }, []);

  const handleToggleComplete = useCallback((questionId, newStatus) => {
    setCompletionStatus((prev) => ({ ...prev, [questionId]: newStatus }));
    Utils.setQuestionCompleted(questionId, newStatus); // Persist
  }, []); // Doesn't need external dependencies

  const handleCopy = useCallback(
    (text) => {
      Utils.copyToClipboard(text, displayFeedback);
    },
    [displayFeedback]
  );
  const handleSearch = useCallback(
    (text) => {
      Utils.searchGoogle(text, displayFeedback);
    },
    [displayFeedback]
  );
  const handleAskAI = useCallback(
    (text) => {
      Utils.askAI(text, displayFeedback);
    },
    [displayFeedback]
  );

  // --- Data Processing (Filtering & Sorting) ---
  const processedQuestions = useMemo(() => {
    if (!Array.isArray(questions)) return []; // Safety check

    let filtered = [...questions]; // Start with all questions fetched for the subject

    // 1. Initial Filter based on Organization Mode (Year or Chapter)
    if (organizationMode === 'year' && selectedYear != null) {
      filtered = filtered.filter((q) => q.year === selectedYear);
    } else if (organizationMode === 'chapter' && selectedChapter) {
      if (selectedChapter === UNCAT_CHAPTER_NAME) {
        // Match questions with null, undefined, or empty string chapter
        filtered = filtered.filter(
          (q) =>
            !q.chapter || typeof q.chapter !== 'string' || !q.chapter.trim()
        );
      } else {
        // Match exact chapter name
        filtered = filtered.filter((q) => q.chapter === selectedChapter);
      }
    }
    // No initial filter needed for 'all' mode

    // 2. Filter by Search Query (on the already mode-filtered list)
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((q) => {
        const plainText = Utils.getQuestionPlainText(q.text).toLowerCase();
        const chapterText = (q.chapter || '').toLowerCase();
        const yearText = (q.year || '').toString();
        const qNumText = (q.qNumber || '').toLowerCase();
        // Search includes question text, chapter, year, and question number
        return (
          plainText.includes(query) ||
          chapterText.includes(query) ||
          yearText.includes(query) ||
          qNumText.includes(query)
        );
      });
    }

    // 3. Filter by Completion Status (on the searched list)
    if (filterCompleted !== 'all') {
      const requiredStatus = filterCompleted === 'completed';
      filtered = filtered.filter(
        (q) => !!completionStatus[q.questionId] === requiredStatus
      );
    }

    // 4. Sort the final filtered list
    if (organizationMode === 'all') {
      // Apply year-based sorting only in 'all' mode
      switch (sortBy) {
        case 'year_asc':
          filtered.sort((a, b) => (a.year || 0) - (b.year || 0));
          break;
        case 'year_desc':
          filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
          break;
        case 'default':
        default:
          filtered.sort((a, b) => {
            const yearDiff = (b.year || 0) - (a.year || 0); // Default: Newest year first
            if (yearDiff !== 0) return yearDiff;
            // Then sort by Question Number (handles Q1a, Q10b, etc.)
            return (a.qNumber || '').localeCompare(b.qNumber || '', undefined, {
              numeric: true,
              sensitivity: 'base',
            });
          });
          break;
      }
    } else {
      // For 'chapter' or 'year' mode, default sort is by Question Number
      filtered.sort((a, b) =>
        (a.qNumber || '').localeCompare(b.qNumber || '', undefined, {
          numeric: true,
          sensitivity: 'base',
        })
      );
    }

    return filtered;
  }, [
    questions, // Base data
    completionStatus, // For filtering
    sortBy, // For sorting ('all' mode)
    filterCompleted, // For filtering
    debouncedSearchQuery, // For searching
    organizationMode, // Determines initial filter and sorting logic
    selectedYear, // Parameter for 'year' mode
    selectedChapter, // Parameter for 'chapter' mode
  ]);

  // --- Render Functions ---
  // Renders a single QuestionItem card
  const renderQuestionItem = useCallback(
    ({ item }) => (
      <QuestionItem
        item={item}
        isCompleted={!!completionStatus[item.questionId]}
        onToggleComplete={handleToggleComplete}
        onCopy={handleCopy}
        onSearch={handleSearch}
        onAskAI={handleAskAI}
      />
    ),
    [
      completionStatus,
      handleToggleComplete,
      handleCopy,
      handleSearch,
      handleAskAI,
    ]
  ); // Dependencies for the item renderer

  // --- Loading / Error / Empty State Handling ---
  if (error) return <ErrorMessage message={error} />;
  if (loading || !subjectData) return <LoadingIndicator />; // Show loading until subject data is confirmed

  const noQuestionsInitiallyForSubject = questions.length === 0;
  // Check if the list is empty *after* all filters have been applied
  const noResultsAfterFilter =
    !noQuestionsInitiallyForSubject && processedQuestions.length === 0;

  // Determine the appropriate empty state message
  let listEmptyMessage = 'No questions available for this subject.'; // Default
  if (noResultsAfterFilter) {
    // If filters/search resulted in empty list
    if (organizationMode === 'year') {
      listEmptyMessage = `No questions match your filters for ${selectedYear}.`;
    } else if (organizationMode === 'chapter') {
      listEmptyMessage = `No questions match your filters for this chapter.`;
    } else {
      listEmptyMessage = 'No questions match search/filter criteria.';
    }
  } else if (
    organizationMode === 'year' &&
    !noQuestionsInitiallyForSubject &&
    processedQuestions.length === 0
  ) {
    // Specific message if the selected year itself had no questions
    listEmptyMessage = `No questions found for year ${selectedYear}.`;
  } else if (
    organizationMode === 'chapter' &&
    !noQuestionsInitiallyForSubject &&
    processedQuestions.length === 0
  ) {
    // Specific message if the selected chapter itself had no questions
    listEmptyMessage = `No questions found for chapter "${selectedChapter}".`;
  }

  // --- Component Return JSX ---
  return (
    <SafeAreaView style={styles.screen}>
      {/* Feedback Toast Notification */}
      {showFeedback && (
        <View style={styles.feedbackToast} pointerEvents="none">
          <Text style={styles.feedbackText}>{feedbackMessage}</Text>
        </View>
      )}

      {/* Search and Filter Controls Area */}
      <View style={styles.controlsContainer}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={COLORS.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search in ${
              organizationMode === 'year'
                ? selectedYear
                : organizationMode === 'chapter'
                ? 'chapter'
                : subjectData?.code || 'questions'
            }...`}
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing" // iOS clear button
            returnKeyType="search"
          />
        </View>

        {/* Filter/Sort Controls ScrollView (only show if there are questions) */}
        {!noQuestionsInitiallyForSubject && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.controlsScroll}>
            {/* Sort Options (Only visible in 'all' mode) */}
            {organizationMode === 'all' && (
              <>
                <Text style={styles.controlLabel}>Sort:</Text>
                <TouchableOpacity
                  onPress={() => setSortBy('default')}
                  style={[
                    styles.controlButton,
                    sortBy === 'default' && styles.controlButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.controlButtonText,
                      sortBy === 'default' && styles.controlButtonTextActive,
                    ]}>
                    Default
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortBy('year_desc')}
                  style={[
                    styles.controlButton,
                    sortBy === 'year_desc' && styles.controlButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.controlButtonText,
                      sortBy === 'year_desc' && styles.controlButtonTextActive,
                    ]}>
                    Newest
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortBy('year_asc')}
                  style={[
                    styles.controlButton,
                    sortBy === 'year_asc' && styles.controlButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.controlButtonText,
                      sortBy === 'year_asc' && styles.controlButtonTextActive,
                    ]}>
                    Oldest
                  </Text>
                </TouchableOpacity>
                <View style={styles.controlSeparator} />
              </>
            )}

            {/* Filter Options (Always visible if questions exist) */}
            <Text style={styles.controlLabel}>Filter:</Text>
            <TouchableOpacity
              onPress={() => setFilterCompleted('all')}
              style={[
                styles.controlButton,
                filterCompleted === 'all' && styles.controlButtonActive,
              ]}>
              <Text
                style={[
                  styles.controlButtonText,
                  filterCompleted === 'all' && styles.controlButtonTextActive,
                ]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilterCompleted('completed')}
              style={[
                styles.controlButton,
                filterCompleted === 'completed' && styles.controlButtonActive,
              ]}>
              <Text
                style={[
                  styles.controlButtonText,
                  filterCompleted === 'completed' &&
                    styles.controlButtonTextActive,
                ]}>
                Done
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilterCompleted('incomplete')}
              style={[
                styles.controlButton,
                filterCompleted === 'incomplete' && styles.controlButtonActive,
              ]}>
              <Text
                style={[
                  styles.controlButtonText,
                  filterCompleted === 'incomplete' &&
                    styles.controlButtonTextActive,
                ]}>
                Not Done
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* Main Question List */}
      <FlatList
        data={processedQuestions} // Use the filtered and sorted list
        renderItem={renderQuestionItem} // Use the memoized item renderer
        keyExtractor={(item) => item.questionId} // Unique key for each question
        contentContainerStyle={styles.listContentContainer} // Padding for the list
        ListEmptyComponent={<EmptyState message={listEmptyMessage} />} // Show empty state message
        // Performance Optimizations
        initialNumToRender={7}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews={Platform.OS === 'android'} // Can improve Android performance
        getItemLayout={null} // Set only if item heights are fixed and known
      />
    </SafeAreaView>
  );
};

// --- NAVIGATION SETUP ---
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Branches"
        screenOptions={{
          // Consistent header style across platforms
          headerStyle: {
            backgroundColor: COLORS.surface,
            ...(Platform.OS === 'android' && { elevation: 2 }), // Add elevation for Android shadow
          },
          headerTintColor: COLORS.text, // Color for back button and title
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
          headerBackTitleVisible: false, // Hide text next to back button on iOS
          headerShadowVisible: Platform.OS === 'ios', // Use default iOS shadow below header
        }}>
        {/* Define all screens in the navigation stack */}
        <Stack.Screen
          name="Branches"
          component={BranchListScreen}
          options={{ title: 'Select Branch' }}
        />
        <Stack.Screen
          name="Semesters"
          component={SemesterListScreen}
          // Title is set dynamically within the component based on Branch name
        />
        <Stack.Screen
          name="Subjects"
          component={SubjectListScreen}
          // Title is set dynamically within the component based on Semester number
        />
        <Stack.Screen
          name="OrganizationSelection"
          component={OrganizationSelectionScreen}
          // Title is set dynamically within the component based on Subject name
        />
        <Stack.Screen
          name="YearSelection"
          component={YearSelectionScreen}
          options={{ title: 'Select Year' }} // Static title, could be dynamic too
        />
        <Stack.Screen
          name="ChapterSelection"
          component={ChapterSelectionScreen}
          options={{ title: 'Select Chapter' }} // Static title, could be dynamic too
        />
        <Stack.Screen
          name="Questions"
          component={QuestionListScreen}
          // Title is set dynamically within the component based on Mode/Subject/Year/Chapter
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- STYLES ---
// Includes UI Improvements from v4.1
const styles = StyleSheet.create({
  // Core Layout & Screens
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    // Used for Loading, Error, Empty states
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  listContentContainer: {
    // Padding for FlatLists
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30, // Extra padding at bottom for gestures/home bar
    paddingHorizontal: 12,
  },

  // Status Messages Text
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // ListItemCard Styles - UI Improvement: Using shadow/elevation
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    marginBottom: 12, // Slightly increased spacing
    // borderWidth: 1, // Removed border
    // borderColor: COLORS.border, // Removed border
    overflow: Platform.OS === 'ios' ? 'visible' : 'hidden', // iOS needs visible for shadow
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2.0,
    // Android Elevation
    elevation: 2,
  },
  cardWithProgress: {
    // Extra padding when progress bar is visible
    paddingBottom: 5,
  },
  cardTopRow: {
    // Container for icon, content, chevron
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDisabled: {
    backgroundColor: COLORS.disabledBackground,
    // borderColor: COLORS.border, // Removed border
    opacity: 0.7,
    elevation: 0, // Remove shadow/elevation when disabled
    shadowOpacity: 0,
  },
  cardIconContainer: {
    // UI Improvement: Removed right border
    padding: 14,
    // borderRightWidth: 1, // Removed border
    // borderRightColor: COLORS.border, // Removed border
    alignItems: 'center',
    justifyContent: 'center',
    width: 55, // Consistent width for icon area
  },
  cardIconContainerDisabled: {
    // borderRightColor: COLORS.disabled, // Not needed anymore
  },
  cardContent: {
    // Text area
    flex: 1, // Take up remaining space
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardTitle: {
    // UI Improvement: Slightly larger font size
    fontSize: 16, // Was 15
    fontWeight: '600', // Medium weight
    color: COLORS.text,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cardTextDisabled: {
    // Text color when card is disabled
    color: COLORS.disabled,
  },
  cardChevronContainer: {
    // Holds the '>' icon or 'No Data' text
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    // Specific style for 'No Data' indicator
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.disabled,
    fontWeight: '500',
  },

  // Subject Progress Bar Styles (within ListItemCard)
  progressBarContainer: {
    height: 8, // Bar height
    backgroundColor: COLORS.progressBarBackground, // Background color of the track
    marginHorizontal: 16, // Align with card content padding
    marginTop: 8, // Space between text and progress bar
    marginBottom: 5, // Space below progress bar
    borderRadius: 4,
    overflow: 'hidden', // Clip the indicator fill
    flexDirection: 'row', // Needed for bg/indicator.
    alignItems: 'center',
  },
  progressBarIndicator: {
    // The filled part of the bar
    height: '100%',
    backgroundColor: COLORS.secondary, // Progress color
    borderRadius: 4,
  },
  progressText: {
    // Text overlay on the progress bar
    position: 'absolute', // Position over the bar background/indicator
    left: 6,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.surface, // White text for contrast
    // Add subtle shadow for readability
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  // Question Card Styles - UI Improvement: Using shadow/elevation
  questionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 14, // Slightly increased spacing
    // borderWidth: 1, // Removed border
    // borderColor: COLORS.border, // Removed border
    overflow: Platform.OS === 'ios' ? 'visible' : 'hidden', // iOS needs visible for shadow
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2.5,
    // Android Elevation
    elevation: 3,
  },
  metaRow: {
    // Top row with tags and switch
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 15,
  },
  metaTagsContainer: {
    // Holds the Year, QNum, Marks tags
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow tags to wrap to next line
    alignItems: 'center',
    flexShrink: 1, // Allow shrinking to make space for the switch
    marginRight: 10, // Space before the switch
  },
  tag: {
    // Base style for all tags
    borderRadius: 12, // Pill shape
    marginRight: 6,
    marginBottom: 4, // Space between wrapped tags
    overflow: 'hidden',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 0.5, // Subtle border for definition
  },
  tagText: {
    // Base text style within tags
    fontSize: 11,
    fontWeight: '600',
  },
  // Specific background/border colors for tags (text color applied inline in QuestionItem)
  tagYear: {
    backgroundColor: COLORS.tagYearBg,
    borderColor: COLORS.tagYearText,
  },
  tagQNum: {
    backgroundColor: COLORS.tagQNumBg,
    borderColor: COLORS.tagQNumText,
  },
  tagMarks: {
    backgroundColor: COLORS.tagMarksBg,
    borderColor: COLORS.tagMarksText,
  },
  completionSwitch: {
    // Style for the completion toggle
    transform: Platform.OS === 'ios' ? [{ scaleX: 0.8 }, { scaleY: 0.8 }] : [], // Make iOS switch slightly smaller
  },
  chapterRow: {
    // UI Improvement: Removed borders, using background and padding
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8, // Adjusted padding
    // borderBottomWidth: StyleSheet.hairlineWidth, // Removed border
    // borderBottomColor: COLORS.border, // Removed border
    // borderTopWidth: StyleSheet.hairlineWidth, // Removed border
    // borderTopColor: COLORS.border, // Removed border
    marginTop: 4, // Space after tags row
    backgroundColor: '#fafafa', // Slightly different background for separation
  },
  chapterIcon: {
    // Icon next to chapter name
    marginRight: 8,
  },
  chapterText: {
    // Chapter name text
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flexShrink: 1, // Allow text to shrink if long
  },
  questionTextContent: {
    // Main question text area
    paddingVertical: 15,
    paddingHorizontal: 15,
    fontSize: 15,
    lineHeight: 23, // Improve readability
    color: COLORS.text,
  },
  actionsRow: {
    // Bottom row with action buttons
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderTopWidth: StyleSheet.hairlineWidth, // Keep top border for separation
    borderTopColor: COLORS.border,
  },
  actionsLeft: {
    // Container for left-aligned icons (Search, Copy)
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    // UI Improvement: Increased tap area
    padding: 8, // Was 6
    marginRight: 12, // Space between icons
  },
  askAiButton: {
    // Style for the "Ask AI" button
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 15, // Rounded corners
    // Add subtle shadow/elevation for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  askAiButtonIcon: {
    // Icon inside Ask AI button
    marginRight: 6,
  },
  askAiButtonText: {
    // Text inside Ask AI button
    color: COLORS.surface, // White text
    fontSize: 13,
    fontWeight: '600',
  },

  // Controls Container (Search, Filter, Sort) Styles
  controlsContainer: {
    // Area holding search and filter/sort controls
    paddingBottom: 8,
    backgroundColor: COLORS.surface, // White background
    borderBottomWidth: 1, // Line separating controls from list
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    // Wrapper for search input and icon
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background, // Slightly different background for input field
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    // Magnifying glass icon
    marginRight: 8,
  },
  searchInput: {
    // Text input field style
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8, // Platform-specific padding
    fontSize: 15,
    color: COLORS.text,
  },
  controlsScroll: {
    // Horizontal scroll view for filter/sort buttons
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  controlLabel: {
    // Label text (e.g., "Sort:", "Filter:")
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: 8,
    marginLeft: 4,
  },
  controlButton: {
    // UI Improvement: Style for individual filter/sort buttons
    paddingVertical: 5,
    paddingHorizontal: 12, // Slightly more horizontal padding
    borderRadius: 15, // Softer rounding
    borderWidth: 1,
    borderColor: COLORS.border, // Subtle border for definition
    marginRight: 8,
    backgroundColor: COLORS.background, // Subtle inactive background
  },
  controlButtonActive: {
    // Style for the *selected* filter/sort button
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight, // Match border to background
  },
  controlButtonText: {
    // Text inside filter/sort buttons
    fontSize: 12,
    color: COLORS.textSecondary, // Good contrast on inactive background
    fontWeight: '500',
  },
  controlButtonTextActive: {
    // Text style for the *selected* button
    color: COLORS.surface,
    fontWeight: '600',
  },
  controlSeparator: {
    // Vertical line dividing Sort and Filter groups
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
    marginHorizontal: 6,
  },

  // Feedback Toast Style (popup message)
  feedbackToast: {
    position: 'absolute', // Overlay on top of the screen content
    bottom: Platform.OS === 'ios' ? 40 : 20, // Position near bottom
    left: 20,
    right: 20,
    backgroundColor: 'rgba(40, 40, 40, 0.9)', // Dark semi-transparent background
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25, // Rounded pill shape
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000, // Ensure it's above other elements
    // Add platform shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6, // Android shadow
  },
  feedbackText: {
    // Text inside the toast
    color: COLORS.surface, // White text
    fontSize: 14,
    textAlign: 'center',
  },
});
