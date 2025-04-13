// FILE: src/components/QuestionCard.js
import React, { useMemo, useState, useEffect, useCallback } from 'react'; // Added useCallback
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Linking,
  Image,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as Animatable from 'react-native-animatable';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

// --- Theme Colors (unchanged) ---
const ThemeColors = {
  primary: '#3A6EA5',
  primaryLight: '#3A6EA520',
  secondary: '#6E3A9E',
  secondaryLight: '#6E3A9E20',
  accent: '#DE8C3C',
  accentLight: '#DE8C3C20',
  success: '#52AA5E',
  successLight: '#52AA5E20',
  text: '#2D3748',
  lightText: '#6B7280',
  border: '#E2E8F0',
  cardBg: '#FFFFFF',
  bodyBg: '#F7FAFC',
  codeHeaderBg: '#2D3748',
  codeHeaderFg: '#CBD5E0',
};

// --- Regex patterns (unchanged) ---
const CODE_BLOCK_REGEX = /```(\w+)?\s*\n([\s\S]*?)\n?```/g;
const QUESTION_ID_REGEX = /^(Q\d+[a-z]?\s*:)\s*/i;
const IMAGE_REGEX = /!\[([^\]]*)\]\(([^\)]+)\)/g; // Basic regex, assumes URLs don't contain ')'

// --- Configurable Threshold (unchanged) ---
const SHORT_CONTENT_THRESHOLD = 150;

// --- Enable LayoutAnimation on Android (unchanged) ---
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const QuestionCard = React.memo(({ question, isCompleted, onToggleCompletion }) => {
    // imageErrorStates can be used to show a specific error icon if needed
    const [imageLoadingStates, setImageLoadingStates] = useState({});
    const [imageErrorStates, setImageErrorStates] = useState({}); // Track load errors per image
    const [imageSizes, setImageSizes] = useState({});
    const [copiedCodeIndices, setCopiedCodeIndices] = useState({});
    const [isQuestionCopied, setIsQuestionCopied] = useState(false);

    // --- Parsing logic (unchanged, assumes valid input) ---
    const parsedContent = useMemo(() => {
        // ... (parsing logic remains the same as provided) ...
        if (!question?.text) return [{ type: 'text', content: 'Question text missing.' }];
        const parts = [];
        let lastIndex = 0;
        let match;
        const sourceText = question.text;

        CODE_BLOCK_REGEX.lastIndex = 0;
        while ((match = CODE_BLOCK_REGEX.exec(sourceText)) !== null) {
            if (match.index > lastIndex) {
                const textPart = sourceText.substring(lastIndex, match.index).trim();
                if (textPart) parts.push({ type: 'text', content: textPart });
            }
            const language = match[1] || 'plaintext';
            const codeContent = match[2].trim();
            if (codeContent) parts.push({ type: 'code', language: language.toLowerCase(), content: codeContent });
            lastIndex = CODE_BLOCK_REGEX.lastIndex;
        }

        if (lastIndex < sourceText.length) {
            const remainingText = sourceText.substring(lastIndex).trim();
            if (remainingText) parts.push({ type: 'text', content: remainingText });
        }

        if (parts.length > 0 && parts[0].type === 'text') {
             parts[0].content = parts[0].content.replace(QUESTION_ID_REGEX, '').trim();
             if (!parts[0].content && parts.length > 1) {
                 parts.shift();
             } else if (!parts[0].content && parts.length === 1) {
                parts.length = 0;
             }
        }

        if (parts.length === 0 && sourceText.match(QUESTION_ID_REGEX)) {
             // Intentionally left empty if only ID was present
        } else if (parts.length === 0 && lastIndex === 0 && sourceText.trim()) {
             // Handle case where the entire text might just be the question without code blocks
            const cleanedFullText = sourceText.trim().replace(QUESTION_ID_REGEX, '');
             if (cleanedFullText) {
                parts.push({ type: 'text', content: cleanedFullText });
            }
        }

        if (parts.length === 0) {
            return [{ type: 'text', content: '[Question content appears empty or is only formatting]' }];
        }

        const finalParts = [];
        parts.forEach(part => {
            if (part.type === 'text') {
                let textLastIndex = 0;
                let imageMatch;
                IMAGE_REGEX.lastIndex = 0; // Reset regex index for each text part
                while ((imageMatch = IMAGE_REGEX.exec(part.content)) !== null) {
                    if (imageMatch.index > textLastIndex) {
                        finalParts.push({ type: 'text', content: part.content.substring(textLastIndex, imageMatch.index).trim() });
                    }
                    // Ensure URI is captured correctly (group 2)
                    const imageUri = imageMatch[2];
                    const imageAlt = imageMatch[1] || '';
                    if (imageUri) { // Only add if URI exists
                       finalParts.push({ type: 'image', alt: imageAlt, uri: imageUri });
                    } else {
                       console.warn("Image regex matched but failed to capture URI in text:", part.content);
                    }
                    textLastIndex = IMAGE_REGEX.lastIndex;
                }
                if (textLastIndex < part.content.length) {
                    const remainingText = part.content.substring(textLastIndex).trim();
                    if(remainingText) { // Only add if remaining text is not empty
                        finalParts.push({ type: 'text', content: remainingText });
                    }
                }
            } else {
                finalParts.push(part); // Push code blocks directly
            }
        });

        // Final filter to remove empty text parts that might result from trimming
        return finalParts.filter(p => (p.type === 'text' && p.content) || p.type === 'image' || p.type === 'code');
    }, [question?.text]);

    // --- isContentShortAndSimple logic (unchanged) ---
    const { isContentShortAndSimple } = useMemo(() => {
        let totalTextLength = 0;
        let hasNonTextElements = false;
        parsedContent.forEach(part => {
            if (part.type === 'text') {
                totalTextLength += part.content?.length || 0;
            } else if (part.type === 'image' || part.type === 'code') {
                hasNonTextElements = true;
            }
        });
        // Always expand if short and simple, otherwise start collapsed
        const shouldAlwaysExpand = totalTextLength <= SHORT_CONTENT_THRESHOLD && !hasNonTextElements;
        return { isContentShortAndSimple: shouldAlwaysExpand };
    }, [parsedContent]);

    const [isExpanded, setIsExpanded] = useState(isContentShortAndSimple);

    // Update isExpanded if the content definition changes (e.g., question prop updates)
    useEffect(() => {
        setIsExpanded(isContentShortAndSimple);
    }, [isContentShortAndSimple]);

    // --- Handlers ---
    const handleImageResize = useCallback((uri) => { // Wrap in useCallback
        if (!uri) return;
        const isCurrentlyExpanded = !!imageSizes[uri];
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setImageSizes(prev => ({
            ...prev,
            [uri]: isCurrentlyExpanded ? null : { height: 400 } // Toggle between default (null) and expanded
        }));
    }, [imageSizes]); // Dependency on imageSizes state

    const handleImageLoadStart = useCallback((uri) => { // Wrap in useCallback
        if (!uri) return;
        setImageLoadingStates(prev => ({ ...prev, [uri]: true }));
        setImageErrorStates(prev => ({ ...prev, [uri]: false })); // Reset error state on new load attempt
    }, []); // No dependencies needed

    const handleImageLoadEnd = useCallback((uri) => { // Wrap in useCallback
        // This is called on both success and error, ensures loading indicator stops
        if (!uri) return;
        setImageLoadingStates(prev => ({ ...prev, [uri]: false }));
    }, []); // No dependencies needed

    const handleImageError = useCallback((uri, error) => { // Wrap in useCallback
        if (!uri) return;
        console.warn(`[QuestionCard] Failed to load image: ${uri}`, error);
        // Set loading to false (redundant with onLoadEnd but safe)
        setImageLoadingStates(prev => ({ ...prev, [uri]: false }));
        // Set error state to true
        setImageErrorStates(prev => ({ ...prev, [uri]: true }));
        // Optionally: Alert the user, though console warning is often sufficient for images
        // Alert.alert("Image Error", `Could not load an image: ${uri}`);
    }, []); // No dependencies needed

    const toggleExpansion = useCallback(() => { // Wrap in useCallback
        if (isContentShortAndSimple) return;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(prev => !prev);
    }, [isContentShortAndSimple]); // Dependency

    const handleToggle = useCallback(() => { // Wrap in useCallback
         if (question?.questionId) {
            onToggleCompletion(question.questionId);
         } else {
             console.warn("[QuestionCard] Attempted to toggle completion for question without ID:", question);
         }
    }, [question?.questionId, onToggleCompletion]); // Dependencies

    const handleAskAI = useCallback(() => { // Wrap in useCallback
        let promptText = `Help me understand or solve this question`;
        if (question?.type) promptText += ` (Type: ${question.type})`;
        if (question?.chapter) promptText += ` about "${question.chapter.replace(/^Module\s*\d+:\s*/i, '').trim()}"`;
        if (question?.year) promptText += ` from the ${question.year} exam`;
        if (question?.marks) promptText += ` worth ${question.marks} marks`;
        const questionBody = question?.text?.replace(QUESTION_ID_REGEX, '').trim() || "[Question text missing]";
        promptText += `:\n\n${questionBody}`;

        const searchQuery = encodeURIComponent(promptText);
        // Using chatgpt.com search - ensure this is the intended behavior
        const url = `https://chatgpt.com/search?q=${searchQuery}`;

        Linking.openURL(url).catch(err => {
             console.error('[QuestionCard] An error occurred attempting to open URL:', url, err);
             Alert.alert("Error", "Could not open the AI chat link. Ensure you have a browser or the necessary app installed.");
        });
    }, [question]); // Dependency on question object

    const handleCopyCode = useCallback(async (codeContent, index) => { // Wrap in useCallback
        if (!codeContent) return;
        try {
            await Clipboard.setStringAsync(codeContent);
            setCopiedCodeIndices(prev => ({ ...prev, [index]: true }));
            const timer = setTimeout(() => {
                setCopiedCodeIndices(prev => ({ ...prev, [index]: false }));
            }, 1500);
            // Optional: Clear timer if component unmounts? Not strictly necessary here.
        } catch (e) {
             console.error("[QuestionCard] Failed to copy code block:", e);
             Alert.alert("Error", "Could not copy code.");
        }
    }, []); // No dependencies needed

    const handleGoogleSearch = useCallback(() => { // Wrap in useCallback
        if (!question?.text) {
            Alert.alert("Error", "No question text available to search.");
            return;
        }
        const searchText = question.text.replace(QUESTION_ID_REGEX, '').trim();
        if (!searchText) {
             Alert.alert("Error", "Question text is empty, nothing to search.");
             return;
        }
        const searchQuery = encodeURIComponent(searchText);
        const url = `https://www.google.com/search?q=${searchQuery}`;

        Linking.openURL(url).catch(err => {
            console.error('[QuestionCard] Failed to open Google search URL:', url, err);
            Alert.alert("Error", "Could not open the browser for searching.");
        });
    }, [question?.text]); // Dependency

    const handleCopyQuestionText = useCallback(async () => { // Wrap in useCallback
        if (!question?.text) {
            Alert.alert("Error", "No question text available to copy.");
            return;
        }
        const textToCopy = question.text.replace(QUESTION_ID_REGEX, '').trim();
        if (!textToCopy) {
            Alert.alert("Error", "Question text is empty, nothing to copy.");
            return;
        }
        try {
            await Clipboard.setStringAsync(textToCopy);
            setIsQuestionCopied(true);
            const timer = setTimeout(() => {
                setIsQuestionCopied(false);
            }, 1500);
             // Optional: Clear timer if component unmounts? Not strictly necessary here.
        } catch (error) {
            console.error("[QuestionCard] Failed to copy question text:", error);
            Alert.alert("Error", "Could not copy text to clipboard.");
        }
    }, [question?.text]); // Dependency

    // --- Render Logic ---

    // Add a more explicit check at the top
    if (!question || !question.questionId) {
        console.warn("[QuestionCard] Rendering null due to invalid/missing question prop or questionId:", question);
        return null; // Return null if essential data is missing
    }

    const displayChapter = (question.chapter || '').replace(/^Module\s*\d+:\s*/i, '').trim();
    const showFullContent = isContentShortAndSimple || isExpanded;

    return (
        <Animatable.View
            animation="fadeIn"
            duration={300}
            useNativeDriver={Platform.OS !== 'web'} // Generally safe, check specific Animatable features if issues arise
            style={[
                styles.card,
                isCompleted ? styles.cardCompleted : {}
            ]}
        >
            {/* Card Content Area */}
            <View style={styles.container}>
                {/* Header Section (unchanged) */}
                <View style={styles.questionHeader}>
                    {/* ... header content ... */}
                     <View style={styles.questionHeaderLeft}>
                        {question.year && (
                            <View style={[styles.badge, styles.examBadge]}>
                                <Text style={[styles.badgeText, styles.examText]}>{question.year}</Text>
                            </View>
                        )}
                        {question.qNumber && (
                            <View style={[styles.badge, styles.questionNumberBadge]}>
                                <Text style={[styles.badgeText, styles.questionNumberText]}>Q{question.qNumber}</Text>
                            </View>
                        )}
                        {(question.marks !== null && question.marks !== undefined) && (
                            <View style={[styles.badge, styles.marksBadge]}>
                                <Text style={[styles.badgeText, styles.marksText]}>{question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.questionHeaderRight}>
                        <Switch
                            trackColor={{ false: ThemeColors.border, true: ThemeColors.successLight }}
                            thumbColor={isCompleted ? ThemeColors.success : '#f4f3f4'}
                            ios_backgroundColor={ThemeColors.border}
                            onValueChange={handleToggle}
                            value={isCompleted}
                            style={styles.switchStyle}
                        />
                    </View>
                </View>

                {/* Chapter Tag (unchanged) */}
                {displayChapter ? (
                    <View style={styles.chapterContainer}>
                       {/* ... chapter content ... */}
                       <FontAwesome5 name="book-open" size={12} color={ThemeColors.secondary} style={styles.chapterIcon} />
                        <Text style={styles.chapterTag} numberOfLines={1} ellipsizeMode="tail">
                            {displayChapter}
                        </Text>
                    </View>
                ) : null}

                {/* Question Body Area - Touchable wraps the whole body */}
                <TouchableOpacity
                    activeOpacity={isContentShortAndSimple ? 1 : 0.7}
                    onPress={toggleExpansion}
                    disabled={isContentShortAndSimple}
                    accessibilityLabel={isExpanded ? "Collapse question content" : "Expand question content"} // Accessibility enhancement
                >
                    <View style={styles.questionBody}>
                        {/* Preview Text */}
                        {!isContentShortAndSimple && !isExpanded && parsedContent.length > 0 && (
                            <Text style={styles.previewText} numberOfLines={2} ellipsizeMode="tail">
                                {/* Find first text part for preview */}
                                {parsedContent.find(part => part.type === 'text')?.content || parsedContent[0]?.alt || 'Expand to see content'}
                            </Text>
                        )}

                        {/* Full Content */}
                        {showFullContent && (
                            <View>
                                {parsedContent.map((part, index) => {
                                    switch (part.type) {
                                        case 'text':
                                            // Ensure content exists before rendering
                                            return part.content ? (
                                                <Text key={`text-${index}`} style={styles.text} selectable>
                                                    {part.content}
                                                </Text>
                                            ) : null;
                                        case 'image':
                                            const uri = part.uri;
                                            // CRITICAL: Add a check for a valid URI string
                                            if (!uri || typeof uri !== 'string') {
                                                console.warn(`[QuestionCard] Invalid or missing URI for image part at index ${index}:`, part);
                                                return ( // Render placeholder for invalid URI
                                                    <View key={`image-error-${index}`} style={styles.imageErrorPlaceholder}>
                                                         <FontAwesome5 name="exclamation-triangle" size={24} color={ThemeColors.lightText} />
                                                        <Text style={styles.imageErrorText}>Invalid Image Source</Text>
                                                    </View>
                                                );
                                            }
                                            const isLoading = imageLoadingStates[uri];
                                            const hasError = imageErrorStates[uri];
                                            const currentSizeStyle = imageSizes[uri];
                                            const isExpandedImage = !!currentSizeStyle;
                                            const imageAltText = part.alt || `Image ${index + 1}`; // Fallback alt text

                                            return (
                                                <View key={`image-container-${index}`} style={styles.imageOuterContainer}>
                                                    {/* Show skeleton OR error placeholder */}
                                                    {isLoading && !hasError && (
                                                        <Animatable.View
                                                            style={styles.skeletonLoader}
                                                            animation="pulse"
                                                            easing="ease-out"
                                                            iterationCount="infinite"
                                                        >
                                                            <ActivityIndicator size="small" color={ThemeColors.primary} />
                                                        </Animatable.View>
                                                    )}
                                                    {hasError && !isLoading && ( // Show error icon if loading finished with error
                                                        <View style={styles.imageErrorPlaceholder}>
                                                            <FontAwesome5 name="image-slash" size={24} color={ThemeColors.lightText} />
                                                            <Text style={styles.imageErrorText}>Failed to load</Text>
                                                        </View>
                                                    )}
                                                    {/* Actual Image (conditionally rendered if no error) */}
                                                    {/* Make touchable only active if no error and not loading */}
                                                    <TouchableOpacity
                                                        activeOpacity={0.8}
                                                        onPress={() => handleImageResize(uri)}
                                                        style={styles.imageTouchable}
                                                        accessibilityLabel={hasError ? `Error loading ${imageAltText}` : (isExpandedImage ? `Compress ${imageAltText}` : `Expand ${imageAltText}`)}
                                                        disabled={isLoading || hasError} // Disable touch if loading or error
                                                    >
                                                        {/* Render image only if no error occurred */}
                                                        {!hasError && (
                                                            <Image
                                                                source={{ uri: uri }}
                                                                style={[
                                                                    styles.questionImage,
                                                                    currentSizeStyle, // Apply dynamic size if set
                                                                    // Hide image visually while loading ONLY if no error
                                                                    isLoading ? styles.imageLoadingInvisible : {},
                                                                ]}
                                                                resizeMode="contain"
                                                                onLoadStart={() => handleImageLoadStart(uri)}
                                                                // onLoad is fine but onLoadEnd covers both success/error for state clearing
                                                                onLoadEnd={() => handleImageLoadEnd(uri)}
                                                                onError={(e) => handleImageError(uri, e.nativeEvent.error)}
                                                                accessible={true} // Mark as accessible
                                                                accessibilityLabel={imageAltText} // Use alt text
                                                            />
                                                        )}
                                                        {/* Resize Indicator (only show if loaded successfully and not loading) */}
                                                        {!isLoading && !hasError && (
                                                            <View style={styles.imageResizeIndicator}>
                                                                <FontAwesome5
                                                                    name={isExpandedImage ? "compress-alt" : "expand-alt"}
                                                                    size={14}
                                                                    color="#fff"
                                                                />
                                                            </View>
                                                        )}
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        case 'code':
                                             // Ensure content exists before rendering
                                             if (!part.content) return null;
                                            const isCodeCopied = copiedCodeIndices[index];
                                            return (
                                                <View key={`code-${index}`} style={styles.codeOuterContainer}>
                                                     {/* ... code header and syntax highlighter ... */}
                                                    <View style={styles.codeHeader}>
                                                        <Text style={styles.codeLanguage}>
                                                            {part.language || 'code'}
                                                        </Text>
                                                        <TouchableOpacity
                                                            onPress={() => handleCopyCode(part.content, index)}
                                                            style={styles.copyButton}
                                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                            disabled={isCodeCopied}
                                                            accessibilityLabel={isCodeCopied ? "Code copied" : "Copy code block"}
                                                        >
                                                            <FontAwesome5
                                                                name={isCodeCopied ? "check-circle" : "copy"}
                                                                size={16}
                                                                color={isCodeCopied ? ThemeColors.success : ThemeColors.codeHeaderFg}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <SyntaxHighlighter
                                                        language={part.language || 'plaintext'}
                                                        style={atomDark}
                                                        customStyle={styles.codeBlockStyle}
                                                        highlighter={"prism"}
                                                        PreTag={View} // Use View for PreTag
                                                        CodeTag={Text} // Use Text for CodeTag
                                                        selectable={true}
                                                    >
                                                        {part.content}
                                                    </SyntaxHighlighter>
                                                </View>
                                            );
                                        default:
                                            console.warn(`[QuestionCard] Unknown parsed content type: ${part.type}`);
                                            return null;
                                    }
                                })}
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Footer with Action Buttons (unchanged structure) */}
                <View style={styles.questionFooter}>
                   {/* ... footer buttons ... */}
                    <TouchableOpacity
                        onPress={handleGoogleSearch}
                        style={styles.footerButton}
                        accessibilityLabel="Search this question on Google"
                      >
                        <FontAwesome5
                          name="google"
                          size={16}
                          color={ThemeColors.accent}
                        />
                      </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        activeOpacity={0.7}
                        onPress={handleCopyQuestionText}
                        disabled={isQuestionCopied}
                        accessibilityLabel={isQuestionCopied ? "Question copied" : "Copy full question text"}
                    >
                        <FontAwesome5
                            name={isQuestionCopied ? "check-circle" : "copy"}
                            size={16}
                            color={isQuestionCopied ? ThemeColors.success : ThemeColors.lightText}
                        />
                    </TouchableOpacity>

                    <View style={styles.footerSpacer} />

                    <TouchableOpacity
                        style={styles.askAiButton}
                        onPress={handleAskAI}
                        activeOpacity={0.8}
                        accessibilityLabel="Ask AI assistant about this question"
                    >
                        <FontAwesome5 name="robot" size={15} color="#FFFFFF" />
                        <Text style={styles.askAiButtonText}>Ask AI</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animatable.View>
    );
});

// --- Styles (Added styles for image error state) ---
const styles = StyleSheet.create({
    // ...(Existing styles remain the same)...
    card: {
        backgroundColor: ThemeColors.cardBg,
        borderRadius: 12,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        overflow: 'hidden', // Keep hidden
        borderWidth: 1,
        borderColor: ThemeColors.border,
    },
    cardCompleted: {
         borderLeftWidth: 4, // Slightly thicker maybe
         borderLeftColor: ThemeColors.success,
         // Optionally add a subtle background tint
         // backgroundColor: `${ThemeColors.success}10`, // Very light green tint
    },
    container: {
        flexDirection: 'column',
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: ThemeColors.border,
    },
    questionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8, 
        flexShrink: 1, 
        marginRight: 8, 
    },
    questionHeaderRight: {
        // Alignment handled by parent flex
    },
    badge: {
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    badgeText: {
        fontWeight: '600', // Bolder text
        fontSize: 11,
        letterSpacing: 0.5, // Added letter spacing
    },
    examBadge: { backgroundColor: ThemeColors.primaryLight },
    questionNumberBadge: { backgroundColor: ThemeColors.secondaryLight },
    marksBadge: { backgroundColor: ThemeColors.accentLight },
    examText: { color: ThemeColors.primary },
    questionNumberText: { color: ThemeColors.secondary },
    marksText: { color: ThemeColors.accent },
    chapterContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: ThemeColors.border,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDFEFE', // Slightly different background for chapter
    },
    chapterIcon: { marginRight: 8 },
    chapterTag: {
        color: ThemeColors.secondary,
        fontWeight: '500',
        fontSize: 13,
        flex: 1, // Take remaining space
    },
    questionBody: {
        paddingHorizontal: 16,
        paddingBottom: 16, // Keep bottom padding
        // Removed background color here, let card be bg, or use bodyBg if desired contrast
        // backgroundColor: ThemeColors.bodyBg,
    },
    previewText: {
        paddingTop: 16, // Space from top/chapter
        color: ThemeColors.lightText,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 0, // No bottom margin needed when previewing
    },
    text: {
        paddingTop: 16, // Consistent top padding for first text element
        color: ThemeColors.text,
        fontSize: 15.5, // Slightly larger
        lineHeight: 24,
        marginBottom: 12, // Space between paragraphs/elements
    },
    imageOuterContainer: {
        marginTop: 16,
        marginBottom: 12,
        alignSelf: 'flex-start', // Keep for contain/alignment
        maxWidth: '100%',
        minHeight: 80, // Increased min height for error/loading state
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: ThemeColors.border,
        position: 'relative',
        backgroundColor: '#F0F0F0', // Background shown briefly or during error
    },
    imageTouchable: {
        // Container for image and resize indicator
    },
    questionImage: {
        width: '100%', // Fill container width
        height: 200,   // Default height (overridden by state)
        // borderRadius removed, rely on container's overflow: hidden
    },
    imageLoadingInvisible: {
        opacity: 0, // Keep image hidden during load if skeleton is shown
    },
    imageResizeIndicator: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1, // Above image
    },
    skeletonLoader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(210, 210, 210, 0.8)',
        zIndex: 2, // On top
    },
    imageErrorPlaceholder: { // Style for displaying error
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F0F0', // Use the light grey background
        zIndex: 1, // Above potential invisible image, below skeleton if both active
        padding: 10,
    },
    imageErrorText: {
        marginTop: 8,
        fontSize: 12,
        color: ThemeColors.lightText,
        textAlign: 'center',
    },
    codeOuterContainer: {
        marginTop: 16,
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#4A5568', // Keep distinct border for code
    },
    codeHeader: {
        backgroundColor: ThemeColors.codeHeaderBg,
        paddingVertical: 6,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    codeLanguage: {
        color: ThemeColors.codeHeaderFg,
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'lowercase',
        marginRight: 8,
    },
    copyButton: {
        padding: 4, // Small padding around icon
    },
    codeBlockStyle: {
        borderRadius: 0, // No border radius inside container
        padding: 16,
        margin: 0, // No margin inside container
        fontSize: 14,
        lineHeight: 20, // Added line height for readability
    },
    questionFooter: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: ThemeColors.border,
        backgroundColor: ThemeColors.cardBg, // Match card background
    },
    footerButton: {
        padding: 10, // Hit area
        marginRight: 4, // Spacing
    },
    actionButton: { // Style specifically for Copy button
        padding: 10,
        marginRight: 4,
    },
    footerSpacer: {
        flex: 1, // Pushes Ask AI button to the right
    },
    askAiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ThemeColors.primary,
        paddingVertical: 9,
        paddingHorizontal: 18,
        borderRadius: 20, // Fully rounded ends
        shadowColor: ThemeColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    askAiButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 8,
    },
    switchStyle: {
        transform: Platform.OS === 'ios' ? [{ scaleX: 0.8 }, { scaleY: 0.8 }] : [],
    }
});

export default QuestionCard;