// src/components/FilterModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { globalStyles, Colors } from '../styles/globalStyles'; // Import updated styles/colors
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';

// Checkbox Component using Modal Colors
const Checkbox = React.memo(({ label, value, onValueChange, textStyle }) => (
    <Pressable
        onPress={() => onValueChange(!value)}
        style={({ pressed }) => [
            globalStyles.filterOption, // Use global style for layout
            styles.checkboxPressable, // Local style for press feedback
            { opacity: pressed ? 0.7 : 1 }
        ]}
        accessibilityLabel={`Filter by ${label}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: value }}
        android_ripple={{ color: Colors.accent + '20' }} // Ripple effect
    >
        <MaterialCommunityIcons
            name={value ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            // Use Accent color for checked state, secondary modal text for unchecked
            color={value ? Colors.accent : Colors.modalTextSecondary}
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
    const insets = useSafeAreaInsets(); // Get safe area insets

    // Sync local state if currentFilters prop changes externally
    useEffect(() => {
        setSelectedYears(new Set(currentFilters.years));
        setSelectedChapters(new Set(currentFilters.chapters));
    }, [currentFilters]);

    // Toggle handlers (remain the same)
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

    // Action handlers (remain the same logic)
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

    // Sort years descending, chapters ascending
    const sortedYears = useMemo(() => [...availableYears].sort((a, b) => b - a), [availableYears]);
    const sortedChapters = useMemo(() => [...availableChapters].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })), [availableChapters]);


    return (
        <Modal
            animationType="slide" // Standard slide-up animation
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose} // Handle Android back button
        >
            {/* Semi-transparent dark backdrop */}
            <Pressable style={styles.modalBackdrop} onPress={onClose} />

            {/* Modal content positioned at the bottom */}
            <View style={styles.modalContentWrapper} pointerEvents="box-none">
                {/* Actual modal content using global style */}
                <Animatable.View
                    animation="slideInUp" // Animate modal appearance
                    duration={400}
                    style={[globalStyles.modalContent, { paddingBottom: insets.bottom + 15 }]} // Adjust padding for safe area
                 >
                    {/* Modal Header */}
                    <View style={globalStyles.modalHeader}>
                        <Text style={globalStyles.modalTitle}>Filters</Text>
                        <Pressable onPress={onClose} hitSlop={15} style={({pressed}) => ({ opacity: pressed ? 0.5 : 1})}>
                            <MaterialCommunityIcons name="close" size={26} color={Colors.modalTextSecondary} />
                        </Pressable>
                    </View>

                    {/* Scrollable filter options */}
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                        {/* Year Filters */}
                        {sortedYears.length > 0 && (
                          <>
                              <Text style={styles.filterSectionTitle}>Filter by Year</Text>
                              {sortedYears.map((year, index) => (
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
                        {sortedChapters.length > 0 && (
                            <>
                                <Text style={[styles.filterSectionTitle, { marginTop: 20 }]}>Filter by Chapter</Text>
                                {sortedChapters.map((chapter, index) => (
                                    <Animatable.View key={`chapter-${chapter}`} animation="fadeInLeft" duration={300} delay={index * 50 + (sortedYears.length * 50)} useNativeDriver>
                                        <Checkbox
                                            // Clean up chapter name display
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

                    {/* Modal Footer Actions */}
                    <View style={styles.modalActions}>
                        {/* Reset Button */}
                        <Pressable
                           onPress={handleReset}
                           style={({ pressed }) => [
                               styles.actionButton, // Base layout
                               styles.resetButton, // Specific border/bg
                               { opacity: pressed ? 0.7 : 1 }
                           ]}
                           android_ripple={{ color: Colors.modalSecondaryButtonBorder + '50' }}
                         >
                            <Text style={styles.resetButtonText}>Reset All</Text>
                        </Pressable>
                        {/* Apply Button */}
                        <Pressable
                            onPress={handleApply}
                            style={({ pressed }) => [
                                globalStyles.button, // Use global button base
                                styles.applyButton, // Override background/layout adjustments
                                { opacity: pressed ? 0.7 : 1 }
                            ]}
                            android_ripple={{ color: Colors.surface + 'AA' }}
                         >
                            <Text style={globalStyles.buttonText}>Apply Filters</Text>
                        </Pressable>
                    </View>
                </Animatable.View>
            </View>
        </Modal>
    );
};

// --- Local Styles Specific to FilterModal Layout ---
const styles = StyleSheet.create({
   modalBackdrop: {
       flex: 1,
       backgroundColor: Colors.modalBackdrop, // Use defined backdrop color
   },
    modalContentWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // Prevent wrapper from blocking touches to backdrop
    },
    scrollView: {
      maxHeight: Platform.OS === 'ios' ? 350 : 300, // Slightly reduce max height
      flexGrow: 0, // Don't let it expand indefinitely
      marginBottom: 10, // Add space before action buttons
    },
    filterSectionTitle: {
        fontSize: 16, // Slightly smaller title
        fontWeight: '600',
        color: Colors.modalTextPrimary, // Use modal primary text
        marginBottom: 8,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: Colors.modalBorder, // Use modal border color
    },
     modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: Colors.modalBorder, // Use modal border color
    },
    actionButton: { // Base style for modal buttons
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5, // Slightly thicker border for reset button
    },
    resetButton: {
       borderColor: Colors.modalSecondaryButtonBorder, // Use defined border color
       backgroundColor: Colors.modalSurface, // White background
    },
   resetButtonText: {
       fontWeight: '500',
       color: Colors.modalSecondaryButtonText, // Use defined text color
       fontSize: 15,
   },
   applyButton: {
       flex: 1, // Allow Apply button to take more space
       marginLeft: 12,
       borderWidth: 0, // Apply button uses primary bg, no border needed
       backgroundColor: Colors.modalPrimaryButton, // Use defined primary button color
       paddingVertical: 11, // Match height slightly better
   },
   checkboxPressable: {
       paddingVertical: 2, // Reduce vertical padding inside the checkbox row itself
   },
   scrollSpacer: {
       height: 15, // Space at bottom of scroll
   },
});

export default FilterModal;