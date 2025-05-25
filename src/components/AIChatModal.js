// src/components/AIChatModal.js
import React, { useMemo, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Platform,
    Alert, // For copy feedback
} from 'react-native';
import Icon from './Icon';
import { COLORS } from '../constants';
import { getQuestionPlainText } from '../helpers/helpers';
import MarkdownDisplay from 'react-native-markdown-display';
import * as Clipboard from 'expo-clipboard'; // Using expo-clipboard

const AIChatModal = React.memo(({
    visible,
    onClose,
    questionItem,
    aiResponse,
    isLoading,
    error,
    onRegenerate,
}) => {
    const questionPlainText = useMemo(() => {
        if (questionItem && questionItem.text) {
            return getQuestionPlainText(questionItem.text);
        }
        return "No question context available.";
    }, [questionItem]);

    const handleCopyResponse = useCallback(async () => { // Made async for expo-clipboard
        if (aiResponse) {
            try {
                await Clipboard.setStringAsync(aiResponse);
                Alert.alert("Copied!", "AI response copied to clipboard.");
            } catch (e) {
                console.error("Failed to copy to clipboard", e);
                Alert.alert("Error", "Could not copy response to clipboard.");
            }
        }
    }, [aiResponse]);

    const markdownStyles = useMemo(() => ({
        // General Body & Text
        body: { color: COLORS.text || '#2c3e50', fontSize: 15.5, lineHeight: 25 },
        paragraph: { marginVertical: 8, color: COLORS.text || '#2c3e50', fontSize: 15.5, lineHeight: 25 },
        text: { color: COLORS.text || '#2c3e50' },
        strong: { fontWeight: Platform.OS === 'ios' ? '600' : 'bold' },
        em: { fontStyle: 'italic' },
        
        // Headings
        heading1: { color: COLORS.primary || '#007AFF', marginTop: 18, marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1.5, borderColor: COLORS.border || '#E0E0E0', fontSize: 22, fontWeight: '600' },
        heading2: { color: COLORS.primaryDark || COLORS.primary || '#0056b3', marginTop: 16, marginBottom: 8, fontSize: 20, fontWeight: '600' },
        heading3: { color: COLORS.text || '#2c3e50', marginTop: 14, marginBottom: 6, fontSize: 18, fontWeight: '600' },
        heading4: { color: COLORS.textSecondary || '#34495e', marginTop: 12, marginBottom: 4, fontSize: 16, fontWeight: 'bold' },

        // Links
        link: { color: COLORS.accent || COLORS.primary || '#007AFF', textDecorationLine: 'underline' },
        
        // Images (Note: MarkdownDisplay handles image rendering if URLs are valid)
        image: { maxWidth: '100%', alignSelf: 'center', marginVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.borderLight || '#EAEAEA', resizeMode: 'contain' },
        
        // Code Blocks
        code_block: {
            backgroundColor: COLORS.codeBackground || COLORS.background || '#f4f4f8',
            padding: 12,
            borderRadius: 6,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            fontSize: 13.5,
            marginVertical: 8,
            borderWidth: 1,
            borderColor: COLORS.border || '#E0E0E0',
            color: COLORS.codeText || COLORS.textSecondary || '#333'
        },
        fence: { // Alias for code_block
            backgroundColor: COLORS.codeBackground || COLORS.background || '#f4f4f8',
            padding: 12,
            borderRadius: 6,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            fontSize: 13.5,
            marginVertical: 8,
            borderWidth: 1,
            borderColor: COLORS.border || '#E0E0E0',
            color: COLORS.codeText || COLORS.textSecondary || '#333'
        },
        
        // Tables
        table: { borderWidth: 1, borderColor: COLORS.border || '#D0D0D0', borderRadius: 6, marginVertical: 10, overflow: 'hidden' },
        th: { backgroundColor: COLORS.surfaceAlt || COLORS.background || '#f0f2f5', padding: 10, fontWeight: 'bold', borderBottomWidth: 1, borderColor: COLORS.border || '#D0D0D0', color: COLORS.text || '#2c3e50'},
        td: { padding: 10, borderBottomWidth: 1, borderColor: COLORS.borderLight || '#EAEAEA', color: COLORS.text || '#2c3e50' },
        tr: { borderBottomWidth: 0 },
        
        // Lists
        bullet_list: { marginLeft: 5, marginVertical: 8 },
        ordered_list: { marginLeft: 5, marginVertical: 8 },
        list_item: { 
            marginVertical: 5, 
            flexDirection: 'row', 
            alignItems: 'flex-start',
            lineHeight: 24, 
        },
        bullet_list_icon: {
            marginRight: 10,
            fontSize: Platform.OS === 'ios' ? 8 : 10, 
            color: COLORS.textSecondary || '#555',
            lineHeight: 24, 
            marginTop: Platform.OS === 'ios' ? 7 : 6, 
        },
        ordered_list_icon: {
            marginRight: 10,
            fontSize: 15,
            color: COLORS.textSecondary || '#555',
            lineHeight: 24, 
            minWidth: 20, 
        },
        // Blockquotes
        blockquote: {
            backgroundColor: COLORS.surfaceAlt || '#f9f9f9',
            paddingHorizontal: 15,
            paddingVertical: 10,
            marginVertical: 10,
            borderLeftColor: COLORS.primary || '#007AFF',
            borderLeftWidth: 4,
            borderRadius: 4,
        }

    }), [COLORS]);


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalOverlay}>
                <View style={styles.modalView}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalTitleContainer}>
                            <Icon
                                iconSet="MaterialCommunityIcons"
                                name="robot-happy-outline"
                                size={24}
                                color={COLORS.primary || '#007AFF'}
                                style={styles.modalTitleIcon}
                            />
                            <Text style={styles.modalTitle}>AI Assistant</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Icon iconSet="Ionicons" name="close-circle" size={30} color={COLORS.textSecondary || '#8E8E93'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        style={styles.contentScrollView} 
                        contentContainerStyle={styles.contentScrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {questionItem && (
                            <View style={styles.questionContextContainer}>
                                <Text style={styles.questionContextTitle}>Your Question:</Text>
                                <Text style={styles.questionContextText} numberOfLines={5} ellipsizeMode="tail">
                                    {questionPlainText}
                                </Text>
                            </View>
                        )}

                        {isLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size={Platform.OS === 'ios' ? "large" : 60} color={COLORS.primary || '#007AFF'} />
                                <Text style={styles.loadingText}>AI is thinking, please wait...</Text>
                            </View>
                        )}

                        {error && !isLoading && (
                            <View style={styles.errorContainer}>
                                <Icon name="alert-circle" iconSet="Ionicons" size={50} color={COLORS.error || '#D32F2F'} />
                                <Text style={styles.errorTitle}>Oops! An Error Occurred</Text>
                                <Text style={styles.errorText}>{error}</Text>
                                {onRegenerate && (
                                    <TouchableOpacity style={[styles.actionButtonBase, styles.errorRetryButton]} onPress={onRegenerate}>
                                        <Icon name="refresh-outline" iconSet="Ionicons" size={20} color={COLORS.error || '#D32F2F'} style={styles.actionButtonIcon} />
                                        <Text style={[styles.actionButtonText, {color: COLORS.error || '#D32F2F'}]}>Try Again</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {!isLoading && !error && aiResponse && (
                             <View style={styles.aiResponseContainer}>
                                <MarkdownDisplay style={markdownStyles}>
                                    {aiResponse}
                                </MarkdownDisplay>
                            </View>
                        )}
                         {!isLoading && !error && !aiResponse && (
                            <View style={styles.emptyResponseContainer}>
                                <Icon name="chatbubbles-outline" iconSet="Ionicons" size={48} color={COLORS.textDisabled || '#AEAEB2'} />
                                <Text style={styles.emptyResponseText}>AI response will appear here.</Text>
                            </View>
                        )}
                    </ScrollView>

                    {!isLoading && !error && aiResponse && (
                        <View style={styles.footerActions}>
                            <TouchableOpacity style={[styles.actionButtonBase, styles.secondaryActionButton]} onPress={handleCopyResponse}>
                                 <Icon name="copy-outline" iconSet="Ionicons" size={20} color={COLORS.primary || '#007AFF'} style={styles.actionButtonIcon} />
                                <Text style={[styles.actionButtonText, { color: COLORS.primary || '#007AFF' }]}>Copy</Text>
                            </TouchableOpacity>
                            {onRegenerate && (
                                <TouchableOpacity style={[styles.actionButtonBase, styles.primaryActionButton]} onPress={onRegenerate}>
                                    <Icon name="reload-circle-outline" iconSet="Ionicons" size={22} color={COLORS.white || '#FFFFFF'} style={styles.actionButtonIcon} />
                                    <Text style={[styles.actionButtonText, { color: COLORS.white || '#FFFFFF' }]}>Regenerate</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
});

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', 
        justifyContent: 'flex-end',
    },
    modalView: {
        backgroundColor: COLORS.surface || '#FFFFFF',
        borderTopLeftRadius: 24, 
        borderTopRightRadius: 24,
        height: Platform.OS === 'ios' ? '92%' : '90%', 
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.20,
        shadowRadius: 12,
        elevation: 30,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight || '#F0F0F0', 
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10, 
    },
    modalTitleIcon: {},
    modalTitle: {
        fontSize: 19, 
        fontWeight: '600',
        color: COLORS.text || '#1A1A1A',
    },
    modalCloseButton: {
        padding: 5, 
    },
    contentScrollView: {
        flex: 1,
    },
    contentScrollContainer: {
        paddingHorizontal: 20, 
        paddingTop: 15,
        paddingBottom: 40, 
    },
    questionContextContainer: {
        marginBottom: 20, 
        padding: 15,
        backgroundColor: COLORS.surfaceAlt || COLORS.background || '#F7F9FC', 
        borderRadius: 12, 
        borderWidth: 1,
        borderColor: COLORS.borderLight || '#E8ECF0',
    },
    questionContextTitle: {
        fontSize: 14,
        fontWeight: '600', 
        color: COLORS.textSecondary || '#4A5568', 
        marginBottom: 6,
    },
    questionContextText: {
        fontSize: 14.5,
        color: COLORS.text || '#2D3748',
        lineHeight: 21,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60, 
    },
    loadingText: {
        marginTop: 18,
        fontSize: 16.5,
        color: COLORS.textSecondary || '#718096',
        textAlign: 'center'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 25,
        marginVertical: 20, 
        backgroundColor: COLORS.errorBackground || '#FFF0F0', 
        borderRadius: 12,
    },
    errorTitle: {
        fontSize: 20, 
        fontWeight: 'bold',
        color: COLORS.error || '#D32F2F',
        marginTop: 15,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 15.5,
        color: COLORS.errorText || COLORS.textSecondary || '#502A2A',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 25,
    },
    aiResponseContainer: {
        paddingVertical: 10, 
    },
    emptyResponseContainer: {
        paddingVertical: 50,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
    },
    emptyResponseText: {
        fontSize: 16,
        color: COLORS.textDisabled || '#A0AEC0',
        textAlign: 'center',
        marginTop: 12,
    },
    footerActions: {
        paddingVertical: 12,
        paddingHorizontal: 18,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20, 
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight || '#F0F0F0',
        flexDirection: 'row',
        justifyContent: 'space-around', 
        alignItems: 'center',
        backgroundColor: COLORS.surface || '#FFFFFF', 
    },
    actionButtonBase: { 
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 25, 
        minWidth: 120, 
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    primaryActionButton: { 
        backgroundColor: COLORS.primary || '#007AFF',
        shadowColor: COLORS.primary || '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    secondaryActionButton: { 
        backgroundColor: COLORS.surface,
        borderWidth: 1.5,
        borderColor: COLORS.primary || '#007AFF',
    },
    errorRetryButton: { 
        borderColor: COLORS.error || '#D32F2F',
        borderWidth: 1.5,
        backgroundColor: 'transparent', 
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    actionButtonIcon: {
        marginRight: 8,
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});

export default AIChatModal;