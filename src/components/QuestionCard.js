// src/components/QuestionCard.js
import React, { useMemo } from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
// --- CHANGE HERE: Import a light theme like 'prism' ---
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Or try vs, ghcolors, etc.
import * as Animatable from 'react-native-animatable';

import { globalStyles, Colors } from '../styles/globalStyles'; // Use updated styles/colors

// Regex remains the same
const CODE_BLOCK_REGEX = /```(\w+)?\s*\n([\s\S]*?)\n?```/g;
const QUESTION_ID_REGEX = /^(Q\d+[a-z]?\s*:)\s*/i;

const QuestionCard = React.memo(({ question, isCompleted, onToggleCompletion }) => {

    // Parsing logic remains the same
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
            const language = match[1] || 'cpp';
            const codeContent = match[2].trim();
            if (codeContent) parts.push({ type: 'code', language: language, content: codeContent });
            lastIndex = CODE_BLOCK_REGEX.lastIndex;
        }
        if (lastIndex < sourceText.length) {
            const remainingText = sourceText.substring(lastIndex).trim();
            const cleanedRemainingText = remainingText.replace(QUESTION_ID_REGEX, '');
            if (cleanedRemainingText) parts.push({ type: 'text', content: cleanedRemainingText });
        }
        if (parts.length === 0 && sourceText.match(QUESTION_ID_REGEX)) { /* No content */ }
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

    // Render null check
    if (!question || !question.questionId) {
        console.warn("Rendering null for invalid question object:", question);
        return null;
    }

    return (
        <Animatable.View
            animation="fadeIn"
            duration={300}
            useNativeDriver
            style={[
                globalStyles.card,
                isCompleted ? globalStyles.cardCompleted : {}
            ]}
        >
             {/* Header Section */}
             <View style={globalStyles.questionHeader}>
                 <View style={globalStyles.questionHeaderLeft}>
                    <Text style={[globalStyles.textSecondary, { fontSize: 13, fontWeight: '500' }]}>
                        {question.year || 'N/A'} - {question.qNumber || '?'}
                    </Text>
                 </View>
                 <View style={globalStyles.questionHeaderRight}>
                    {question.chapter && typeof question.chapter === 'string' && (
                         <Text style={globalStyles.tag} numberOfLines={1}>
                            {question.chapter.replace(/^Module\s*\d+:\s*/i, '').trim()}
                         </Text>
                    )}
                 </View>
            </View>

            {/* Body Section (Text and Code) */}
            <View style={globalStyles.questionBody}>
                {parsedContent.map((part, index) => {
                    if (part.type === 'text') {
                        return <Text key={`text-${index}`} style={globalStyles.text} selectable>{part.content}</Text>;
                    } else if (part.type === 'code') {
                        return (
                            <View key={`code-${index}`} style={styles.codeContainer}>
                                <SyntaxHighlighter
                                    language={part.language || 'cpp'}
                                    // --- CHANGE HERE: Use the imported light theme ---
                                    style={prism}
                                    customStyle={globalStyles.codeBlockStyle} // Background, padding, border
                                    codeTagProps={{ style: globalStyles.codeTextStyle }} // Base font settings
                                    highlighter="prism"
                                    PreTag={View}
                                    CodeTag={Text}
                                    showLineNumbers={false}
                                    wrapLines={true}
                                >
                                    {part.content}
                                </SyntaxHighlighter>
                            </View>
                        );
                    }
                    return null;
                })}
            </View>

            {/* Footer Section (Tags and Switch) */}
            <View style={globalStyles.questionFooter}>
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
                 <View style={globalStyles.completionContainer}>
                   <Switch
                     trackColor={{ false: Colors.disabledBg, true: Colors.success + 'B3' }}
                     thumbColor={isCompleted ? Colors.success : Colors.surface}
                     ios_backgroundColor={Colors.disabledBg}
                     onValueChange={handleToggle}
                     value={isCompleted}
                     disabled={!question?.questionId}
                     style={styles.switchStyle}
                    />
                 </View>
            </View>
        </Animatable.View>
    );
});

// Local styles specific to QuestionCard (remain the same)
const styles = StyleSheet.create({
    codeContainer: {
        marginVertical: 8,
    },
    footerTag: {
         backgroundColor: Colors.textSecondary + '1A',
         color: Colors.textSecondary,
         borderColor: Colors.textSecondary + '30',
         fontSize: 10,
         paddingVertical: 3,
         paddingHorizontal: 8,
    },
    switchStyle: {
         transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }]
    }
});

export default QuestionCard;