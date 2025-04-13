// FILE: src/components/QuestionCard.js
import React, { useMemo, useState } from 'react';
import { View, Text, Switch, StyleSheet, Platform, TouchableOpacity, Linking, Image, ActivityIndicator } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Light theme suitable for our background
import * as Animatable from 'react-native-animatable';
import { FontAwesome5 } from '@expo/vector-icons';

import { globalStyles, Colors } from '../styles/globalStyles'; // Use updated styles/colors

// Regex remains the same
const CODE_BLOCK_REGEX = /```(\w+)?\s*\n([\s\S]*?)\n?```/g;
const QUESTION_ID_REGEX = /^(Q\d+[a-z]?\s*:)\s*/i;
const IMAGE_REGEX = /!\[([^\]]*)\]\(([^\)]+)\)/g;

const QuestionCard = React.memo(({ question, isCompleted, onToggleCompletion }) => {
    // State for loading indicators (currently global for all images in card)
    const [imageLoadingStates, setImageLoadingStates] = useState({});
    // State to track sizes of potentially expandable images { uri: { height: number } | null }
    const [imageSizes, setImageSizes] = useState({});
    // State to track which image URI is currently expanded (used for potential animation triggers if needed, though not strictly necessary for basic resize)
    // const [expandedImage, setExpandedImage] = useState(null); // Keep this if advanced animations are added later

    // Handle image resize on press
    const handleImageResize = (uri) => {
        const isCurrentlyExpanded = !!imageSizes[uri]; // Check if there's a size object for this URI
        setImageSizes(prev => ({
            ...prev,
            [uri]: isCurrentlyExpanded ? null : { height: 400 } // Toggle between null (default) and expanded size
        }));
        // setExpandedImage(isCurrentlyExpanded ? null : uri); // Update if using expandedImage for animations
    };

    // Image loading state handlers (per image URI)
    const handleImageLoadStart = (uri) => {
        setImageLoadingStates(prev => ({ ...prev, [uri]: true }));
    };
    const handleImageLoadEnd = (uri) => {
        setImageLoadingStates(prev => ({ ...prev, [uri]: false }));
    };


    // Parsing logic - memoized for performance
    const parsedContent = useMemo(() => {
        if (!question?.text) return [{ type: 'text', content: 'Question text missing.' }];
        const parts = [];
        let lastIndex = 0;
        let match;
        const sourceText = question.text;

        // First, extract code blocks
        while ((match = CODE_BLOCK_REGEX.exec(sourceText)) !== null) {
            if (match.index > lastIndex) {
                const textPart = sourceText.substring(lastIndex, match.index).trim();
                // Don't clean question ID here yet, handle it globally later if needed
                if (textPart) parts.push({ type: 'text', content: textPart });
            }
            // Default language to 'plaintext' if not specified
            const language = match[1] || 'plaintext';
            const codeContent = match[2].trim();
            if (codeContent) parts.push({ type: 'code', language: language.toLowerCase(), content: codeContent });
            lastIndex = CODE_BLOCK_REGEX.lastIndex;
        }

        // Handle remaining text after the last code block (or the whole text if no code blocks)
        if (lastIndex < sourceText.length) {
            const remainingText = sourceText.substring(lastIndex).trim();
            if (remainingText) parts.push({ type: 'text', content: remainingText });
        }

        // Clean Question ID from the *first* text part only, if present
        if (parts.length > 0 && parts[0].type === 'text') {
             parts[0].content = parts[0].content.replace(QUESTION_ID_REGEX, '').trim();
             // If cleaning results in an empty first part, remove it unless it's the *only* part
             if (!parts[0].content && parts.length > 1) {
                 parts.shift();
             }
        }

        // Handle edge cases where text might only contain ID or be empty after cleaning
        if (parts.length === 0 && sourceText.match(QUESTION_ID_REGEX)) {
            // Intentionally left empty if only ID was present
        } else if (parts.length === 0 && lastIndex === 0) {
            // If no code blocks and no ID was matched/cleaned, push the original text
            const cleanedFullText = sourceText.trim().replace(QUESTION_ID_REGEX, ''); // Clean potential ID just in case
             if (cleanedFullText) {
                parts.push({ type: 'text', content: cleanedFullText });
            }
        }

        // Final fallback if everything else resulted in empty content
        if (parts.length === 0) {
            return [{ type: 'text', content: '[Question content appears empty or is only formatting]' }];
        }

        // Now, process text parts further to extract images
        const finalParts = [];
        parts.forEach(part => {
            if (part.type === 'text') {
                let textLastIndex = 0;
                let imageMatch;
                while ((imageMatch = IMAGE_REGEX.exec(part.content)) !== null) {
                    // Push preceding text if any
                    if (imageMatch.index > textLastIndex) {
                        finalParts.push({ type: 'text', content: part.content.substring(textLastIndex, imageMatch.index) });
                    }
                    // Push image part
                    finalParts.push({ type: 'image', alt: imageMatch[1], uri: imageMatch[2] });
                    textLastIndex = IMAGE_REGEX.lastIndex;
                }
                // Push remaining text after last image (or whole text if no images)
                if (textLastIndex < part.content.length) {
                    finalParts.push({ type: 'text', content: part.content.substring(textLastIndex) });
                }
            } else {
                // Keep code parts as they are
                finalParts.push(part);
            }
        });


        return finalParts.filter(p => p.content || p.uri); // Filter out potentially empty parts

    }, [question?.text]);

    // Toggle handler remains the same
    const handleToggle = () => {
         if (question?.questionId) {
            onToggleCompletion(question.questionId);
         } else {
             console.warn("Attempted to toggle completion for question without ID:", question);
         }
    };

    // Handle "Ask AI" button press
    const handleAskAI = () => {
        // Format question data as a natural language prompt
        let promptText = `Help me understand or solve this question`;
        if (question.type) promptText += ` (Type: ${question.type})`;
        if (question.chapter) promptText += ` about "${question.chapter.replace(/^Module\s*\d+:\s*/i, '').trim()}"`;
        if (question.year) promptText += ` from the ${question.year} exam`;
        if (question.marks) promptText += ` worth ${question.marks} marks`;
        promptText += `:\n\n${question.text.replace(QUESTION_ID_REGEX, '').trim()}`; // Use cleaned text

        // Create search query string with the formatted prompt
        const searchQuery = encodeURIComponent(promptText);

        // Open default browser with ChatGPT search query
        const url = `https://chatgpt.com/search?q=${searchQuery}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.warn("Cannot open URL: " + url);
                // Optionally show an alert to the user
            }
        }).catch(err => console.error('An error occurred attempting to open URL', err));
    };

    // Render null check
    if (!question || !question.questionId) {
        console.warn("Rendering null for invalid question object:", question);
        return null;
    }

    // Clean chapter name for display in tag
    const displayChapter = (question.chapter || '').replace(/^Module\s*\d+:\s*/i, '').trim();

    return (
        <Animatable.View
            animation="fadeIn"
            duration={300}
            useNativeDriver // Use native driver for opacity animation
            style={[
                globalStyles.card, // Use the improved card style from globalStyles
                isCompleted ? globalStyles.cardCompleted : {} // Apply completed style if needed
            ]}
        >
             {/* Header Section */}
             <View style={globalStyles.questionHeader}>
                 <View style={globalStyles.questionHeaderLeft}>
                    {/* Year and Question Number */}
                    <Text style={[globalStyles.textSecondary, styles.metaText]}>
                        {question.year || 'N/A'} - {question.qNumber || '?'}
                    </Text>
                 </View>
                 <View style={globalStyles.questionHeaderRight}>
                    {/* Chapter Tag (Cleaned) */}
                    {displayChapter && (
                         <Text style={[globalStyles.tag, styles.chapterTag]} numberOfLines={2}>
                            {displayChapter}
                         </Text>
                    )}
                 </View>
            </View>

            {/* Body Section (Text, Code, and Images) */}
            <View style={globalStyles.questionBody}>
                {parsedContent.map((part, index) => {
                    if (part.type === 'text') {
                        return (
                            <Text key={`text-${index}`} style={globalStyles.text} selectable>
                                {part.content}
                            </Text>
                        );
                    } else if (part.type === 'image') {
                        const uri = part.uri;
                        const isLoading = imageLoadingStates[uri];
                        const currentSizeStyle = imageSizes[uri]; // Will be { height: 400 } or null/undefined
                        return (
                             <View key={`image-container-${index}`} style={styles.imageOuterContainer}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => handleImageResize(uri)}
                                    style={styles.imageTouchable} // Ensure touchable takes up space
                                >
                                    <Image
                                        source={{ uri: uri }}
                                        style={[
                                            styles.questionImage, // Base style (includes default height)
                                            currentSizeStyle,    // Override height if expanded
                                            isLoading ? styles.imageLoading : {} // Optionally dim while loading
                                        ]}
                                        resizeMode="contain"
                                        onLoadStart={() => handleImageLoadStart(uri)}
                                        onLoadEnd={() => handleImageLoadEnd(uri)}
                                        // Consider adding onError handler
                                        onError={(e) => {
                                            console.warn(`Failed to load image: ${uri}`, e.nativeEvent.error);
                                            handleImageLoadEnd(uri); // Ensure loading state is cleared on error
                                        }}
                                    />
                                    {isLoading && (
                                        <View style={styles.skeletonLoader}>
                                            <ActivityIndicator size="small" color={Colors.textSecondary} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                             </View>
                        );
                    } else if (part.type === 'code') {
                        return (
                            // Use a View container for potential margin/padding adjustments if needed
                            <View key={`code-${index}`} style={styles.codeOuterContainer}>
                                <SyntaxHighlighter
                                    language={part.language || 'plaintext'} // Ensure language is passed
                                    style={prism} // Use the imported light theme style
                                    customStyle={globalStyles.codeBlockStyle} // Use global style for background, padding, border
                                    codeTagProps={{ style: globalStyles.codeTextStyle }} // Base font settings from global
                                    highlighter={"prism"} // Use prism highlighter
                                    PreTag={View} // Use View for the outer container
                                    CodeTag={Text} // Use Text for code lines
                                    // Consider adding line numbers if useful, but keep it clean for now
                                    // showLineNumbers={true}
                                    // lineNumberStyle={{ color: Colors.textSecondary }}
                                    wrapLines={true} // Ensure long lines wrap
                                >
                                    {part.content}
                                </SyntaxHighlighter>
                            </View>
                        );
                    }
                    return null;
                })}
            </View>

            {/* Footer Section (Tags, Ask AI Button, and Switch) */}
            {/* FIX: Moved footer content INSIDE this View */}
            <View style={globalStyles.questionFooter}>

                {/* Left side: Type and Marks tags */}
                <View style={globalStyles.questionFooterLeft}>
                   {question.type && typeof question.type === 'string' && (
                        <Text style={[globalStyles.tag, styles.footerTag]}>
                           {question.type}
                        </Text>
                   )}
                   {(question.marks !== null && question.marks !== undefined && question.marks !== '') && (
                        <Text style={[globalStyles.tag, styles.footerTag]}>
                            {question.marks} Marks
                        </Text>
                   )}
                </View>

                {/* Right side: Ask AI button and Completion Switch */}
                <View style={globalStyles.questionFooterRight}>
                    {/* Ask AI Button */}
                    {/* FIX: Removed redundant Animatable.View wrappers */}
                    <TouchableOpacity
                        style={styles.askAiButton}
                        onPress={handleAskAI}
                        activeOpacity={0.7}
                    >
                        <FontAwesome5 name="robot" size={14} color={Colors.accent} />
                        <Text style={styles.askAiButtonText}>Ask AI</Text>
                    </TouchableOpacity>

                    {/* Completion Switch */}
                    <View style={globalStyles.completionContainer}>
                       <Switch
                         trackColor={{ false: Colors.disabledBg, true: Colors.success + 'B3' }} // Use success color with transparency
                         thumbColor={isCompleted ? Colors.success : Colors.surface}
                         ios_backgroundColor={Colors.disabledBg} // Background for iOS when off
                         onValueChange={handleToggle}
                         value={isCompleted}
                         disabled={!question?.questionId} // Disable if no ID
                         style={styles.switchStyle} // Apply scaling transform
                        />
                     </View>
                </View>
            </View>
        </Animatable.View>
    );
});

// Local styles specific to QuestionCard, enhancing or overriding global ones
const styles = StyleSheet.create({
    metaText: { // Style for Year - Q#, making it slightly smaller,
        fontSize: 13,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    chapterTag: { // Specific style for chapter tag if needed (e.g., different color/bg)
        backgroundColor: Colors.accent + '10', // Even lighter background
        borderColor: Colors.accent + '20',
        color: Colors.accent, // Keep accent color
        maxWidth: '100%', // Ensure it can take full width if needed on right side
        textAlign: 'right', // Align text right if it wraps within the tag container
    },
    codeOuterContainer: {
        marginVertical: 8, // Keep vertical margin around code blocks
    },
    imageOuterContainer: {
        marginVertical: 8, // Add vertical margin around images like code blocks
        position: 'relative', // Needed for absolute positioning of loader
        alignSelf: 'center', // Center image block horizontally
        width: '100%', // Take full width for contain/resize logic
        minHeight: 50, // Ensure container has some height even before image loads
    },
    imageTouchable: {
       width: '100%', // Ensure touchable fills the container
       // The height will be determined by the Image inside
    },
    questionImage: {
        width: '100%', // Image takes full width of its container
        height: 200, // Default height
        borderRadius: 8,
        backgroundColor: Colors.surface, // Background visible before load or if transparent PNG
    },
    imageLoading: {
       opacity: 0.5, // Dim image while loading indicator is visible
    },
    skeletonLoader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.surface + '80', // Semi-transparent overlay
        borderRadius: 8, // Match image border radius
    },
    footerTag: { // Style for Type/Marks tags in footer
         backgroundColor: Colors.textSecondary + '15', // Lighter secondary background
         color: Colors.textSecondary,
         borderColor: Colors.textSecondary + '30',
         fontSize: 11, // Slightly smaller font for footer tags
         paddingVertical: 4, // Adjust padding
         paddingHorizontal: 9,
         marginRight: 6, // Space between tags
         marginBottom: 4, // Space if tags wrap
    },
    askAiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.accent + '1A', // Consistent light accent background
        paddingVertical: 6,
        paddingHorizontal: 12, // Slightly more horizontal padding
        borderRadius: 18, // More rounded corners
        borderWidth: 1,
        borderColor: Colors.accent + '30', // Subtle border
        marginRight: 10, // Space between button and switch
    },
    askAiButtonText: {
        color: Colors.accent,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6, // Space between icon and text
    },
    switchStyle: {
         // Keep scaling for a smaller switch appearance
         transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }]
    }
});

export default QuestionCard;