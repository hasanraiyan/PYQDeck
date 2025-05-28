import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal, Platform } from 'react-native';
import { COLORS } from '../constants';

const GlobalLoadingIndicator = ({
    visible = true,
    size = 'large', // 'small', 'large'
    color = COLORS.primary || '#4338ca', // Fallback color
    text,
    fullscreen = false, // Renders in a Modal overlay
    inline = false, // Renders for smaller, in-flow content
    style, // Style for the outermost View (or Modal's inner View for fullscreen)
    textStyle, // Style for the Text component
    containerStyle, // Style for the View directly wrapping ActivityIndicator and Text
    overlayBackgroundColor = COLORS.surfaceOverlay || 'rgba(255, 255, 255, 0.75)', // Background for fullscreen modal
}) => {
    if (!visible) {
        return null;
    }

    const content = (
        <View style={[
            styles.contentContainer,
            inline ? styles.inlineContentContainer : styles.columnContentContainer,
            containerStyle
        ]}>
            <ActivityIndicator size={size} color={color} />
            {text && (
                <Text style={[
                    styles.textBase,
                    inline ? styles.inlineText : styles.columnText,
                    { color: COLORS.textSecondary || '#6b7280' }, // Default text color with fallback
                    textStyle
                ]}>
                    {text}
                </Text>
            )}
        </View>
    );

    if (fullscreen) {
        return (
            <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={() => { /* Optional: handle close */ }}>
                <View style={[styles.fullscreenOverlay, { backgroundColor: overlayBackgroundColor }, style]}>
                    {content}
                </View>
            </Modal>
        );
    }

    return (
        <View style={[
            !inline && styles.centeredWrapper, 
            style
        ]}>
            {content}
        </View>
    );
};

const styles = StyleSheet.create({
    fullscreenOverlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centeredWrapper: { 
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20, 
    },
    contentContainer: {
        alignItems: 'center',
        padding: 10,
    },
    inlineContentContainer: {
        flexDirection: 'row',
    },
    columnContentContainer: {
        flexDirection: 'column',
    },
    textBase: { fontSize: 14 },
    inlineText: { marginLeft: 10, alignSelf: 'center' },
    columnText: { marginTop: 10, textAlign: 'center' },
});

export default GlobalLoadingIndicator;