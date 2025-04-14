import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import Icon from './Icon';

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
        progress,
    }) => {
        const isItemDisabled = disabled || !hasData;
        const showProgress = progress != null && progress >= 0 && hasData;

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    isItemDisabled ? styles.cardDisabled : {},
                ]}
                onPress={onPress}
                disabled={isItemDisabled}
                activeOpacity={0.65}
            >
                <View style={styles.cardTopRow}>
                    {iconName && (
                        <View
                            style={[
                                styles.cardIconContainer,
                                isItemDisabled ? styles.cardIconContainerDisabled : {},
                            ]}
                        >
                            <Icon
                                iconSet={iconSet}
                                name={iconName}
                                size={20}
                                color={isItemDisabled ? COLORS.disabled : iconColor}
                            />
                        </View>
                    )}
                    <View style={[
                        styles.cardContent,
                        iconName ? { paddingLeft: 0 } : {}
                    ]}>
                        <Text
                            style={[
                                styles.cardTitle,
                                isItemDisabled ? styles.cardTextDisabled : {},
                                !subtitle ? { marginBottom: 0 } : {}
                            ]}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                        {subtitle && (
                            <Text
                                style={[
                                    styles.cardSubtitle,
                                    isItemDisabled ? styles.cardTextDisabled : {},
                                ]}
                                numberOfLines={1}
                            >
                                {subtitle}
                            </Text>
                        )}
                        
                        {/* Progress indicator removed from here */}
                    </View>
                    
                    {!isItemDisabled && (
                        <View style={styles.cardChevronContainer}>
                            <Ionicons
                                name="chevron-forward-outline"
                                size={22}
                                color={COLORS.textSecondary}
                            />
                        </View>
                    )}
                    {isItemDisabled && !hasData && (
                        <View style={styles.cardChevronContainer}>
                            <Text style={styles.noDataText}>No Data</Text>
                        </View>
                    )}
                </View>
                
                {/* Progress bar as bottom border */}
                {showProgress && (
                    <View style={styles.progressBorderContainer}>
                        <View 
                            style={[
                                styles.progressBorderIndicator,
                                { width: `${Math.max(0, Math.min(100, progress))}%` }
                            ]}
                        >
                            <Text style={styles.progressText}>{`${Math.round(progress)}%`}</Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    }
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        marginBottom: 10,
        overflow: 'hidden', // Changed to always hidden for the border progress
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2.0,
        elevation: 2,
        position: 'relative', // Added for absolute positioning of progress border
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardDisabled: {
        backgroundColor: COLORS.disabledBackground,
        opacity: 0.7,
        elevation: 0,
        shadowOpacity: 0,
    },
    cardIconContainer: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
    },
    cardIconContainerDisabled: {},
    cardContent: {
        flex: 1,
        paddingVertical: 12,
        paddingRight: 8,
        paddingLeft: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 3,
    },
    cardSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 5,
    },
    cardTextDisabled: {
        color: COLORS.disabled,
    },
    cardChevronContainer: {
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noDataText: {
        fontSize: 11,
        fontStyle: 'italic',
        color: COLORS.disabled,
        fontWeight: '500',
    },
    progressBorderContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: COLORS.progressBarBackground,
    },
    progressBorderIndicator: {
        height: '100%',
        backgroundColor: COLORS.secondary,
        position: 'relative',
    },
    progressText: {
        position: 'absolute',
        right: 4,
        bottom: 3,
        fontSize: 9,
        fontWeight: '600',
        color: COLORS.surface,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
});

export default ListItemCard;