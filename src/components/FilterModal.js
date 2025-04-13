// src/components/FilterModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Import UPDATED globalStyles and Colors
import { globalStyles, Colors } from '../styles/globalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';

// Checkbox Component using Modal Colors
const Checkbox = React.memo(({ label, value, onValueChange, textStyle }) => (
    <Pressable
        onPress={() => onValueChange(!value)}
        style={({ pressed }) => [
            globalStyles.filterOption, // Use global style for layout
            { opacity: pressed ? 0.6 : 1 }
        ]}
        accessibilityLabel={`Filter by ${label}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: value }}
    >
        <MaterialCommunityIcons
            name={value ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            // Use Modal specific primary/secondary text colors
            color={value ? Colors.modalPrimaryButton : Colors.modalTextSecondary}
        />
        {(typeof label === 'string' || typeof label === 'number') && label !== '' ? (
             // Use textStyle from props OR default modal text style
            <Text style={[globalStyles.filterOptionText, textStyle]}>{label}</Text>
        ) : null}
    </Pressable>
));

const FilterModal = ({
    isVisible,
    onClose,
    availableYears = [],
    availableChapters = [],
    currentFilters = { years: [], chapters: [] },
    onApplyFilters
}) => {
    const [selectedYears, setSelectedYears] = useState(new Set(currentFilters.years));
    const [selectedChapters, setSelectedChapters] = useState(new Set(currentFilters.chapters));
    const insets = useSafeAreaInsets();

    // Sync local state if filters change from parent
    useEffect(() => {
        setSelectedYears(new Set(currentFilters.years));
        setSelectedChapters(new Set(currentFilters.chapters));
    }, [currentFilters]);

    // Toggle handlers
    const handleYearToggle = (year) => {
        setSelectedYears(prev => {
             const newSet = new Set(prev);
             if (newSet.has(year)) newSet.delete(year); else newSet.add(year);
             return newSet;
        });
    };
    const handleChapterToggle = (chapter) => {
        setSelectedChapters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chapter)) newSet.delete(chapter); else newSet.add(chapter);
            return newSet;
        });
    };

    // Action handlers
    const handleReset = () => {
        setSelectedYears(new Set());
        setSelectedChapters(new Set());
        if (onApplyFilters) onApplyFilters({ years: [], chapters: [] });
        onClose(); // Close modal after reset
    };
    const handleApply = () => {
      if (onApplyFilters) {
          onApplyFilters({
              years: Array.from(selectedYears),
              chapters: Array.from(selectedChapters),
          });
      }
      onClose(); // Close modal after applying filters
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose} // Handle Android back button
        >
            {/* Semi-transparent dark backdrop */}
            <Pressable style={styles.modalBackdrop} onPress={onClose} />

            {/* Position modal at the bottom */}
            <View style={styles.modalContentWrapper} pointerEvents="box-none">
                {/* Actual modal content with light background */}
                <View style={[globalStyles.modalContent, { paddingBottom: insets.bottom + 15 }]}>
                    {/* Modal Header */}
                    <View style={globalStyles.modalHeader}>
                        <Text style={globalStyles.modalTitle}>Filters</Text>
                        <Pressable onPress={onClose} hitSlop={10}>
                            <MaterialCommunityIcons name="close" size={26} color={Colors.modalTextSecondary} />
                        </Pressable>
                    </View>

                    {/* Scrollable filter options */}
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                        {/* Year Filters */}
                        {availableYears.length > 0 && (
                          <>
                              <Text style={[styles.filterSectionTitle, { color: Colors.modalPrimaryButton }]}>Filter by Year</Text>
                              {availableYears.map((year, index) => (
                                <Animatable.View key={`year-${year}`} animation="fadeInLeft" duration={300} delay={index * 50} useNativeDriver>
                                  <Checkbox
                                      label={String(year)}
                                      value={selectedYears.has(year)}
                                      onValueChange={() => handleYearToggle(year)}
                                  />
                                </Animatable.View>
                              ))}
                          </>
                        )}
                        {/* Chapter Filters */}
                        {availableChapters.length > 0 && (
                            <>
                                <Text style={[styles.filterSectionTitle, { color: Colors.modalPrimaryButton, marginTop: 20 }]}>Filter by Chapter</Text>
                                {availableChapters.map((chapter, index) => (
                                    <Animatable.View key={`chapter-${chapter}`} animation="fadeInLeft" duration={300} delay={index * 50 + (availableYears.length * 50)} useNativeDriver>
                                        <Checkbox
                                            label={chapter?.replace(/^Module\s*\d+:\s*/i, '') || chapter || 'Uncategorized'}
                                            value={selectedChapters.has(chapter)}
                                            onValueChange={() => handleChapterToggle(chapter)}
                                        />
                                    </Animatable.View>
                                ))}
                            </>
                        )}
                        {/* Spacer at the end of scroll content */}
                        <View style={styles.scrollSpacer} />
                    </ScrollView>

                    {/* Modal Footer */}
                    <View style={[styles.modalActions, { borderTopColor: Colors.modalBorder }]}>
                        <Pressable
                           onPress={handleReset}
                           style={({ pressed }) => [
                               styles.actionButton, styles.resetButton,
                               { backgroundColor: Colors.modalSurface, borderColor: Colors.modalSecondaryButtonBorder },
                               { opacity: pressed ? 0.7 : 1 }
                           ]}
                         >
                            <Text style={[styles.resetButtonText, { color: Colors.modalSecondaryButtonText }]}>Reset All</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleApply}
                            style={({ pressed }) => [
                                globalStyles.button, // Use global button base
                                { backgroundColor: Colors.modalPrimaryButton }, // Override background
                                styles.applyButton, // Local layout adjustments
                                { opacity: pressed ? 0.7 : 1 }
                            ]}
                         >
                            <Text style={globalStyles.buttonText}>Apply Filters</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// --- Local Styles Specific to FilterModal Layout ---
const styles = StyleSheet.create({
   modalBackdrop: {
       flex: 1,
       backgroundColor: 'rgba(0,0,0,0.5)',
   },
    modalContentWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    scrollView: {
      maxHeight: Platform.OS === 'ios' ? 400 : 350, // Limit scroll height
      flexGrow: 0, // Don't let it expand indefinitely
    },
    filterSectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 8,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: Colors.modalBorder,
    },
     modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
    },
    actionButton: { // Base style for modal buttons
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1, // Both buttons have border in this design
    },
     resetButton: {
       // Specific colors set inline using Colors.modal...
   },
   resetButtonText: {
       fontWeight: '500',
       // Specific color set inline using Colors.modal...
   },
   applyButton: {
       flex: 1, // Allow Apply button to take more space if needed
       marginLeft: 12,
       borderWidth: 0, // Apply button uses primary bg, no border needed
   },
    scrollSpacer: {
        height: 15, // Space at bottom of scroll
    },
});

export default FilterModal;