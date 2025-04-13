// src/components/QuestionCard.js
import React, { useMemo } from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
// Try using the ESM path for styles
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Use 'esm'
import * as Animatable from 'react-native-animatable';

import { globalStyles, Colors } from '../styles/globalStyles';

// Improved regex to handle optional language and trim whitespace
const CODE_BLOCK_REGEX = /```(\w+)?\s*\n([\s\S]*?)\n?```/g;

const QuestionCard = React.memo(({ question, isCompleted, onToggleCompletion }) => {

    const parsedContent = useMemo(() => {
        if (!question?.text) return [{ type: 'text', content: 'Question text missing.' }]; // Handle missing text

        const parts = [];
        let lastIndex = 0;
        let match;
        const sourceText = question.text; // Work with a copy

        while ((match = CODE_BLOCK_REGEX.exec(sourceText)) !== null) {
            // Text before code block
            if (match.index > lastIndex) {
                const textPart = sourceText.substring(lastIndex, match.index).trim();
                 // Remove leading Q number identifier if present in text part
                 const cleanedTextPart = textPart.replace(/^(Q\d+[a-z]?\s*:)\s*/i, '');
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
            lastIndex = CODE_BLOCK_REGEX.lastIndex; // Use regex lastIndex
        }

        // Remaining text after last code block
        if (lastIndex < sourceText.length) {
             const remainingText = sourceText.substring(lastIndex).trim();
             const cleanedRemainingText = remainingText.replace(/^(Q\d+[a-z]?\s*:)\s*/i, '');
            if (cleanedRemainingText) { // Only push if there's actual text content
                parts.push({ type: 'text', content: cleanedRemainingText });
            }
        }

        // Handle cases where the entire input was just the question identifier
        if (parts.length === 0 && sourceText.match(/^(Q\d+[a-z]?\s*:)\s*$/i)) {
             // Optionally show placeholder or nothing
        }
         // Handle cases where there were no code blocks at all
        else if (parts.length === 0 && lastIndex === 0) {
             const cleanedFullText = sourceText.trim().replace(/^(Q\d+[a-z]?\s*:)\s*/i, '');
             if (cleanedFullText) {
                 parts.push({ type: 'text', content: cleanedFullText });
             }
        }

        return parts;
    }, [question?.text]); // Depend only on question text

    const handleToggle = () => {
         // Ensure questionId exists before calling toggle
         if (question?.questionId) {
            onToggleCompletion(question.questionId);
         } else {
             console.warn("Attempted to toggle completion for question without ID:", question);
         }
    };

    return (
        <Animatable.View 
            animation="fadeIn" 
            duration={500}
            useNativeDriver
            style={[globalStyles.card, isCompleted ? { backgroundColor: Colors.completedBg } : {}, 
                   { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }]}
        >
             <View style={globalStyles.questionHeader}>
                 {/* Left side: Year and Q-Number */}
                 <View style={globalStyles.questionHeaderLeft}>
                    <Text style={globalStyles.textSecondary}>
                        {question?.year || 'N/A'} - {question?.qNumber || '?'}
                    </Text>
                 </View>
                 {/* Right side: Chapter Tag(s) */}
                 <View style={globalStyles.questionHeaderRight}>
                    {question?.chapter && typeof question.chapter === 'string' && (
                         <Text style={globalStyles.tag} numberOfLines={2}> {/* Allow wrap slightly */}
                            {question.chapter.replace(/^Module\s*\d+:\s*/i, '')}
                         </Text>
                    )}
                 </View>
            </View>

            <View style={globalStyles.questionBody}>
                {parsedContent.length === 0 ? (
                     <Text style={[globalStyles.text, {fontStyle: 'italic', color: Colors.textSecondary}]}>
                         [Question content not available or formatting issue]
                     </Text>
                ) : (
                    parsedContent.map((part, index) => {
                        if (part.type === 'text') {
                            return <Text key={`text-${index}`} style={globalStyles.text} selectable>{part.content}</Text>; // Make text selectable
                        } else if (part.type === 'code') {
                            return (
                                <SyntaxHighlighter
                                    key={`code-${index}`}
                                    language={part.language || 'cpp'}
                                    style={okaidia}
                                    customStyle={globalStyles.codeBlockStyle || {}}
                                    codeTagProps={{ style: globalStyles.codeTextStyle || {} }}
                                    highlighter="prism"
                                    PreTag={({ children }) => <View>{children}</View>}
                                    CodeTag={({ children }) => <Text>{children}</Text>}
                                    showLineNumbers={false}
                                    wrapLines={true}
                                    lineProps={{style: {}}}
                                >
                                    {part.content}
                                </SyntaxHighlighter>
                            );
                        }
                        return null;
                    })
                )}
            </View>

            <View style={globalStyles.questionFooter}>
                {/* Footer Left: Type/Marks Tags */}
                <View style={globalStyles.questionFooterLeft}>
                   {question?.type && typeof question.type === 'string' && (
                        <Text style={globalStyles.tag}>Type: {question.type}</Text>
                   )}
                   {(question?.marks !== null && question?.marks !== undefined && question.marks !== '') && (
                        <Text style={globalStyles.tag}>Marks: {question.marks}</Text>
                   )}
                </View>

                 {/* Footer Right: Completion Toggle */}
                 <View style={globalStyles.completionContainer}>
                   <Switch
                     trackColor={{ false: Colors.disabled, true: Colors.success + 'aa' }} // Add some opacity
                     thumbColor={isCompleted ? Colors.success : Colors.surface}
                     ios_backgroundColor={Colors.disabled}
                     onValueChange={handleToggle}
                     value={isCompleted}
                     disabled={!question?.questionId} // Disable if no ID
                     style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                    />
                 </View>
            </View>
        </Animatable.View>
    );
});


export default QuestionCard;
