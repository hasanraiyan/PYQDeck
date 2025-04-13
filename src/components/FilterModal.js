// src/components/FilterModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { globalStyles, Colors } from '../styles/globalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // For better bottom padding
import * as Animatable from 'react-native-animatable'; // Import for animations

// --- Local Checkbox Component ---
const Checkbox = React.memo(({ label, value, onValueChange, textStyle }) => (
    <Pressable
        onPress={() => onValueChange(!value)}
        style={({ pressed }) => [ // Add pressed style feedback
            globalStyles.filterOption,
            { opacity: pressed ? 0.6 : 1 }
        ]}
        accessibilityLabel={`Filter by ${label}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: value }}
    >
        <MaterialCommunityIcons
            name={value ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={value ? Colors.primary : Colors.textSecondary}
        />
        {/* Defensively render label */}
        {(typeof label === 'string' || typeof label === 'number') && label !== '' ? (
            <Text style={[globalStyles.filterOptionText, textStyle]}>{label}</Text>
        ) : null}
    </Pressable>
));
// --- End Checkbox Component ---


const FilterModal = ({
    isVisible,
    onClose,
    availableYears = [], // Provide defaults
    availableChapters = [], // Provide defaults
    currentFilters = { years: [], chapters: [] }, // Provide defaults
    onApplyFilters
}) => {

    const [selectedYears, setSelectedYears] = useState(new Set(currentFilters.years));
    const [selectedChapters, setSelectedChapters] = useState(new Set(currentFilters.chapters));
    const insets = useSafeAreaInsets(); // Hook to get safe area dimensions

    // Effect to sync local state if the prop `currentFilters` changes from parent
    useEffect(() => {
        setSelectedYears(new Set(currentFilters.years));
        setSelectedChapters(new Set(currentFilters.chapters));
    }, [currentFilters]); // Depend on the prop

    // --- Toggle Handlers ---
    const handleYearToggle = (year) => {
        setSelectedYears(prev => {
             const newSet = new Set(prev);
             if (newSet.has(year)) newSet.delete(year);
             else newSet.add(year);
             return newSet;
        });
    };

    const handleChapterToggle = (chapter) => {
        setSelectedChapters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chapter)) newSet.delete(chapter);
            else newSet.add(chapter);
            return newSet;
        });
    };

    // --- Action Handlers ---
    const handleReset = () => {
        setSelectedYears(new Set());
        setSelectedChapters(new Set());
        // Apply reset immediately and close
        if (onApplyFilters) {
           onApplyFilters({ years: [], chapters: [] });
        }
        onClose(); // Close after reset
    };

    const handleApply = () => {
      if (onApplyFilters) {
          onApplyFilters({
              years: Array.from(selectedYears),
              chapters: Array.from(selectedChapters),
          });
      }
       // onClose(); // Keep modal open after applying, let user close manually or uncomment to close
    };


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose} // Android back button handler
        >
            {/* Pressable backdrop to close modal on tap outside */}
            <Pressable style={styles.modalBackdrop} onPress={onClose} />

            {/* Wrapper to position content at the bottom */}
            <View style={styles.modalContentWrapper} pointerEvents="box-none">
                {/* The actual styled content container */}
                <View style={[globalStyles.modalContent, { paddingBottom: insets.bottom + 15 }]}>
                    {/* Modal Header */}
                    <View style={globalStyles.modalHeader}>
                        <Text style={globalStyles.modalTitle}>Filters</Text>
                        <Pressable onPress={onClose} hitSlop={10}>
                            <MaterialCommunityIcons name="close" size={26} color={Colors.textSecondary} />
                        </Pressable>
                    </View>

                    {/* Scrollable Filter Options */}
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                        {/* Year Filters Section */}
                        {availableYears.length > 0 && (
                          <>
                              <Text style={styles.filterSectionTitle}>Filter by Year</Text>
                              {availableYears.map((year, index) => (
                                <Animatable.View 
                                  key={`year-${year}`}
                                  animation="fadeInLeft"
                                  duration={300}
                                  delay={index * 50}
                                  useNativeDriver
                                >
                                  <Checkbox
                                      label={String(year)}
                                      value={selectedYears.has(year)}
                                      onValueChange={() => handleYearToggle(year)}
                                  />
                                </Animatable.View>
                              ))}
                          </>
                        )}

                        {/* Chapter Filters Section */}
                        {availableChapters.length > 0 && (
                            <>
                                <Text style={styles.filterSectionTitle}>Filter by Chapter</Text>
                                {availableChapters.map((chapter, index) => (
                                    <Animatable.View 
                                        key={`chapter-${chapter}`}
                                        animation="fadeInLeft"
                                        duration={300}
                                        delay={index * 50}
                                        useNativeDriver
                                    >
                                        <Checkbox
                                            key={`checkbox-${chapter}`}
                                            // Provide a default label if cleaning fails
                                            label={chapter?.replace(/^Module\s*\d+:\s*/i, '') || chapter || 'Uncategorized'}
                                            value={selectedChapters.has(chapter)}
                                            onValueChange={() => handleChapterToggle(chapter)}
                                            textStyle={styles.chapterLabel} // Specific style if needed
                                        />
                                    </Animatable.View>
                                ))}
                            </>
                        )}

                        {/* Spacer at the end of scroll content */}
                        <View style={styles.scrollSpacer} />
                    </ScrollView>

                    {/* Modal Footer with Action Buttons */}
                    <View style={[styles.modalActions, { marginBottom: Platform.OS === 'ios' ? 0 : 5 }]}>
                        <Pressable
                           onPress={handleReset}
                           style={({ pressed }) => [
                               styles.actionButton,
                               styles.resetButton,
                               { opacity: pressed ? 0.7 : 1 }
                           ]}
                         >
                            <Text style={[globalStyles.buttonText, styles.resetButtonText]}>Reset All</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleApply}
                            style={({ pressed }) => [
                                globalStyles.button,
                                styles.applyButton,
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

// --- Local Styles for FilterModal ---
const styles = StyleSheet.create({
   modalBackdrop: {
       flex: 1,
       backgroundColor: 'rgba(0,0,0,0.4)', // Semi-transparent backdrop
   },
    modalContentWrapper: {
        position: 'absolute', // Position it over the backdrop
        bottom: 0,
        left: 0,
        right: 0,
    },
    scrollView: {
      flexGrow: 0, // Prevent ScrollView from taking full modal height if content is short
    },
    filterSectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.primary, // Use primary color for section titles
        marginTop: 15,
        marginBottom: 8,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    chapterLabel: {
        fontSize: 15, // Make chapter labels slightly smaller if desired
    },
     modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15, // Space above buttons
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    actionButton: { // Base style for both buttons
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
     resetButton: {
       backgroundColor: Colors.surface, // White background for Reset
       borderWidth: 1,
       borderColor: Colors.secondary // Use secondary color for border
   },
   resetButtonText: {
       color: Colors.secondary, // Match border color
       fontWeight: '500',
   },
   applyButton: {
       flex: 1, // Allow Apply button to take more space
       marginLeft: 12, // Space between buttons
   },
    scrollSpacer: {
        height: 10, // Add a little space at the bottom of the scroll view
    },
});
// --- End Local Styles ---

export default FilterModal;