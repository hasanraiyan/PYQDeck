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
    const [imageLoading, setImageLoading] = useState(false);
    // Parsing logic remains the same - memoized for performance
    const parsedContent = useMemo(() => {
        if (!question?.text) return [{ type: 'text', content: 'Question text missing.' }];
        const parts = [];
        let lastIndex = 0;
        let match;
        const sourceText = question.text;
        while ((match = CODE_BLOCK_REGEX.exec(sourceText)) !== null) {
            if (match.index > lastIndex) {
                const textPart = sourceText.substring(lastIndex, match.index).trim();
                const cleanedTextPart = textPart.replace(QUESTION_ID_REGEX, '');
                if (cleanedTextPart) parts.push({ type: 'text', content: cleanedTextPart });
            }
            // Default language to 'plaintext' if not specified
            const language = match[1] || 'plaintext';
            const codeContent = match[2].trim();
            if (codeContent) parts.push({ type: 'code', language: language.toLowerCase(), content: codeContent });
            lastIndex = CODE_BLOCK_REGEX.lastIndex;
        }
        if (lastIndex < sourceText.length) {
            const remainingText = sourceText.substring(lastIndex).trim();
            const cleanedRemainingText = remainingText.replace(QUESTION_ID_REGEX, '');
            if (cleanedRemainingText) parts.push({ type: 'text', content: cleanedRemainingText });
        }
        // Handle edge cases where text might only contain ID or be empty after cleaning
        if (parts.length === 0 && sourceText.match(QUESTION_ID_REGEX)) { /* Empty content expected */ }
        else if (parts.length === 0 && lastIndex === 0) {
            const cleanedFullText = sourceText.trim().replace(QUESTION_ID_REGEX, '');
            if (cleanedFullText) parts.push({ type: 'text', content: cleanedFullText });
        }
        if (parts.length === 0) {
            return [{ type: 'text', content: '[Question content appears empty or is only formatting]' }];
        }
        return parts;
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
        promptText += `:\n\n${question.text.replace(QUESTION_ID_REGEX, '').trim()}`; // Cleaned text

        // Create search query string with the formatted prompt
        const searchQuery = encodeURIComponent(promptText);

        // Open default browser with Google search query (more general than just ChatGPT)
        // Alternatively, use the ChatGPT link if preferred: `https://chatgpt.com/search?q=${searchQuery}`
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

            {/* Body Section (Text and Code) */}
            <View style={globalStyles.questionBody}>
                {parsedContent.map((part, index) => {
                    if (part.type === 'text') {
                        // Parse and render images within text
                        const imageMatches = Array.from(part.content.matchAll(IMAGE_REGEX));
                        if (imageMatches.length > 0) {
                            return (
                                <View key={`text-${index}`}>
                                    {part.content.split(IMAGE_REGEX).map((textSegment, i) => {
                                        if (i % 3 === 0) {
                                            return (
                                                <Text key={`text-segment-${i}`} style={globalStyles.text} selectable>
                                                    {textSegment}
                                                </Text>
                                            );
                                        } else if (i % 3 === 2) {                                            return (
                                                <View key={`image-container-${i}`} style={styles.imageContainer}>
                                                    <Image
                                                        key={`image-${i}`}
                                                        source={{ uri: imageMatches[Math.floor(i / 3)][2] }}
                                                        style={styles.questionImage}
                                                        resizeMode="contain"
                                                        onLoadStart={() => setImageLoading(true)}
                                                        onLoadEnd={() => setImageLoading(false)}
                                                    />
                                                    {imageLoading && (
                                                        <View style={styles.skeletonLoader}>
                                                            <ActivityIndicator size="small" color={Colors.textSecondary} />
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        }
                                        return null;
                                    })}
                                </View>
                            );
                        }
                        return (
                            <Text key={`text-${index}`} style={globalStyles.text} selectable>
                                {part.content}
                            </Text>
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
    imageContainer: {
        position: 'relative',
    },
    skeletonLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  

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
        // Add horizontal margin if needed, but padding is within globalStyles.codeBlockStyle
        // marginHorizontal: -5 // Example: slightly reduce horizontal padding effect
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