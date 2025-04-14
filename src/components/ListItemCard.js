
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
                    showProgress ? styles.cardWithProgress : {},
                ]}
                onPress={onPress}
                disabled={isItemDisabled}
                activeOpacity={0.65}
            >
                { }
                <View style={styles.cardTopRow}>
                    { }
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
                    { }
                    <View style={styles.cardContent}>
                        { }
                        <Text
                            style={[
                                styles.cardTitle,
                                isItemDisabled ? styles.cardTextDisabled : {},
                            ]}
                            numberOfLines={2}
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
                    </View>
                    { }
                    {!isItemDisabled && (
                        <View style={styles.cardChevronContainer}>
                            <Ionicons
                                name="chevron-forward-outline"
                                size={22}
                                color={COLORS.textSecondary}
                            />
                        </View>
                    )}
                    {isItemDisabled &&
                        !hasData && (
                            <View style={styles.cardChevronContainer}>
                                <Text style={styles.noDataText}>No Data</Text>
                            </View>
                        )}
                </View>

                { }
                {showProgress && (
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBarIndicator,
                                { width: `${Math.max(0, Math.min(100, progress))}%` },
                            ]}
                        />
                        <Text style={styles.progressText}>{`${Math.round(progress)}% Done`}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    }
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        marginBottom: 12,
        overflow: Platform.OS === 'ios' ? 'visible' : 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2.0,
        elevation: 2,
    },
    cardWithProgress: {
        paddingBottom: 5,
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
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
        width: 55,
    },
    cardIconContainerDisabled: {},
    cardContent: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
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
    },
    cardTextDisabled: {
        color: COLORS.disabled,
    },
    cardChevronContainer: {
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noDataText: {
        fontSize: 11,
        fontStyle: 'italic',
        color: COLORS.disabled,
        fontWeight: '500',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: COLORS.progressBarBackground,
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 5,
        borderRadius: 4,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBarIndicator: {
        height: '100%',
        backgroundColor: COLORS.secondary,
        borderRadius: 4,
    },
    progressText: {
        position: 'absolute',
        left: 6,
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.surface,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
});

export default ListItemCard;