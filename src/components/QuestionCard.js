// src/components/QuestionCard.js
import React, { useMemo } from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as Animatable from 'react-native-animatable';

import { globalStyles, Colors } from '../styles/globalStyles'; // Use updated styles/colors

// Regex to find code blocks, handling optional language identifier
const CODE_BLOCK_REGEX = /```(\w+)?\s*\n([\s\S]*?)\n?```/g;

// Regex to find and remove leading question identifiers like "Q1a:", "Q5:", etc.
const QUESTION_ID_REGEX = /^(Q\d+[a-z]?\s*:)\s*/i;

const QuestionCard = React.memo(({ question, isCompleted, onToggleCompletion }) => {

    const parsedContent = useMemo(() => {
        if (!question?.text) return [{ type: 'text', content: 'Question text missing.' }];

        const parts = [];
        let lastIndex = 0;
        let match;
        const sourceText = question.text; // Work with a copy

        while ((match = CODE_BLOCK_REGEX.exec(sourceText)) !== null) {
            // Text before code block
            if (match.index > lastIndex) {
                const textPart = sourceText.substring(lastIndex, match.index).trim();
                // Remove leading Q number identifier if present
                const cleanedTextPart = textPart.replace(QUESTION_ID_REGEX, '');
                if (cleanedTextPart) { // Only push if there's actual text content
                    parts.push({ type: 'text', content: cleanedTextPart });
                }
            }
            // Code block
            const language = match[1] || 'cpp'; // Default language if not specified
            const codeContent = match[2].trim();
            if (codeContent) { // Only push if there's code
                parts.push({ type: 'code', language: language, content: codeContent });
            }
            lastIndex = CODE_BLOCK_REGEX.lastIndex;
        }

        // Remaining text after last code block
        if (lastIndex < sourceText.length) {
            const remainingText = sourceText.substring(lastIndex).trim();
             const cleanedRemainingText = remainingText.replace(QUESTION_ID_REGEX, '');
            if (cleanedRemainingText) {
                parts.push({ type: 'text', content: cleanedRemainingText });
            }
        }

        // Handle cases where the entire input was just the question identifier (show nothing)
        if (parts.length === 0 && sourceText.match(QUESTION_ID_REGEX)) {
            // Explicitly return empty or a placeholder if desired
             // return [{ type: 'text', content: '[Empty Question Body]' }];
        }
        // Handle cases where there were no code blocks at all
        else if (parts.length === 0 && lastIndex === 0) {
             const cleanedFullText = sourceText.trim().replace(QUESTION_ID_REGEX, '');
             if (cleanedFullText) {
                 parts.push({ type: 'text', content: cleanedFullText });
             }
        }

         // If after all processing, parts is still empty, show a placeholder
         if (parts.length === 0) {
            return [{ type: 'text', content: '[Question content appears empty or is only formatting]' }];
         }

        return parts;
    }, [question?.text]); // Depend only on question text

    const handleToggle = () => {
         if (question?.questionId) {
            onToggleCompletion(question.questionId);
         } else {
             console.warn("Attempted to toggle completion for question without ID:", question);
         }
    };

    // Render null if the question object itself is somehow invalid (optional safety)
    if (!question) {
        return null;
    }

    return (
        <Animatable.View
            animation="fadeIn"
            duration={500}
            useNativeDriver // Recommended for performance
            // Use globalStyles.card, check completed status for different bg
            style={[globalStyles.card, isCompleted ? { backgroundColor: Colors.completedBg } : {}]}
        >
             <View style={globalStyles.questionHeader}>
                 <View style={globalStyles.questionHeaderLeft}>
                    <Text style={[globalStyles.textSecondary, { fontSize: 13 }]}>
                        {question?.year || 'N/A'} - {question?.qNumber || '?'}
                    </Text>
                 </View>
                 <View style={globalStyles.questionHeaderRight}>
                    {question?.chapter && typeof question.chapter === 'string' && (
                         <Text style={globalStyles.tag} numberOfLines={2}>
                            {question.chapter.replace(/^Module\s*\d+:\s*/i, '')}
                         </Text>
                    )}
                 </View>
            </View>

            <View style={globalStyles.questionBody}>
                {parsedContent.map((part, index) => {
                    if (part.type === 'text') {
                        return <Text key={`text-${index}`} style={globalStyles.text} selectable>{part.content}</Text>;
                    } else if (part.type === 'code') {
                        return (
                            <View key={`code-${index}`} style={{ marginVertical: 5 }}>
                                <SyntaxHighlighter
                                    language={part.language || 'cpp'}
                                    style={okaidia} // Keep okaidia dark theme
                                    customStyle={globalStyles.codeBlockStyle}
                                    codeTagProps={{ style: globalStyles.codeTextStyle }}
                                    highlighter="prism"
                                    PreTag={View} // Use View directly
                                    CodeTag={Text} // Use Text directly
                                    // Hiding line numbers for cleaner look on mobile
                                    showLineNumbers={false}
                                    // Ensure lines wrap
                                    wrapLines={true}
                                    // lineProps={{style: { flexWrap: 'wrap' }}} // Might be needed for aggressive wrapping
                                >
                                    {part.content}
                                </SyntaxHighlighter>
                            </View>
                        );
                    }
                    return null;
                })}
            </View>

            <View style={globalStyles.questionFooter}>
                <View style={globalStyles.questionFooterLeft}>
                   {question?.type && typeof question.type === 'string' && (
                        <Text style={[globalStyles.tag, { backgroundColor: Colors.accent + '20', color: Colors.accent, borderColor: Colors.accent + '40' }]}>
                            Type: {question.type}
                        </Text>
                   )}
                   {(question?.marks !== null && question?.marks !== undefined && question.marks !== '') && (
                        <Text style={[globalStyles.tag, { backgroundColor: Colors.accent + '20', color: Colors.accent, borderColor: Colors.accent + '40' }]}>
                            Marks: {question.marks}
                        </Text>
                   )}
                </View>

                 <View style={globalStyles.completionContainer}>
                   <Switch
                     trackColor={{ false: Colors.disabled + '80', true: Colors.success + 'aa' }}
                     thumbColor={isCompleted ? Colors.success : Colors.textSecondary} // Use lighter thumb for off state
                     ios_backgroundColor={Colors.disabled + '80'}
                     onValueChange={handleToggle}
                     value={isCompleted}
                     disabled={!question?.questionId}
                     style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }} // Slightly smaller switch
                    />
                 </View>
            </View>
        </Animatable.View>
    );
});

export default QuestionCard;