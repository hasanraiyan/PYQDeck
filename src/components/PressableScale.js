// src/components/PressableScale.js
import React, { useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

const PressableScale = ({ onPress, style, children, disabled, hapticType = 'light', scaleValue = 0.98 }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const animateIn = () => {
        if (disabled) return;
        Haptics.impactAsync(
            hapticType === 'medium' ? Haptics.ImpactFeedbackStyle.Medium :
                hapticType === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy :
                    Haptics.ImpactFeedbackStyle.Light
        );
        Animated.parallel([
            Animated.spring(scale, {
                toValue: scaleValue,
                useNativeDriver: true,
                tension: 400, // Increased tension for a snappier feel
                friction: 15, // Adjusted friction
            }),
            Animated.timing(opacity, {
                toValue: 0.85, // Slightly less dimming
                duration: 75,  // Quicker opacity change
                useNativeDriver: true,
            })
        ]).start();
    };

    const animateOut = () => {
        if (disabled) return;
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 400,
                friction: 12, // Adjusted friction
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 120, // Quicker return
                useNativeDriver: true,
            })
        ]).start();
    };

    return (
        <Animated.View style={[{ transform: [{ scale }], opacity }, disabled && { opacity: 0.5 }]}>
            <TouchableOpacity
                onPressIn={animateIn}
                onPressOut={animateOut}
                onPress={onPress}
                style={style}
                activeOpacity={1}
                disabled={disabled}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
};

export default PressableScale;