// src/screens/SubjectSelectionScreen.js
import React, { useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons'; // Added FontAwesome5
import { globalStyles, Colors } from '../styles/globalStyles'; // Use updated styles/colors
import * as Animatable from 'react-native-animatable';

const SubjectSelectionScreen = ({ navigation, route }) => {
    const { branchId, semesterId, allBranchesData, semesterName } = route.params;

    // Find the selected semester data using useMemo for efficiency
    const selectedSemester = useMemo(() => {
        const branch = (allBranchesData || [])?.find(b => b.id === branchId);
        // Ensure semesters array exists before finding
        return branch?.semesters?.find(s => s.id === semesterId);
    }, [allBranchesData, branchId, semesterId]);

     // Header title is set globally by AppNavigator using semesterName

    // Handle navigation when a subject is pressed
    const handlePress = useCallback((subject) => {
         navigation.navigate('OrganizationSelection', {
             branchId: branchId,
             semesterId: semesterId,
             subjectId: subject.id,
             subjectName: subject.name, // Pass subject name for the next screen's header
             allBranchesData: allBranchesData // Pass the full data again
        });
    }, [navigation, branchId, semesterId, allBranchesData]); // Dependencies

    // Determine an icon based on subject name keywords
    const getSubjectIcon = (subjectName) => {
        const name = subjectName.toLowerCase();
        if (name.includes('data structure')) return 'sitemap';
        if (name.includes('object oriented') || name.includes('c++') || name.includes('java')) return 'code';
        if (name.includes('database') || name.includes('dbms')) return 'database';
        if (name.includes('operating system')) return 'windows'; // Or 'linux', 'apple' depending on context
        if (name.includes('network')) return 'network-wired';
        if (name.includes('digital logic') || name.includes('digital electron')) return 'microchip';
        if (name.includes('signal')) return 'wave-square';
        if (name.includes('communication')) return 'broadcast-tower';
        if (name.includes('control system')) return 'sliders-h';
        if (name.includes('math')) return 'calculator';
        return 'book'; // Default icon
    };


    // Render each subject item
    const renderSubject = useCallback(({ item, index }) => (
        <Animatable.View
          animation="fadeInUp"
          duration={350}
          delay={index * 70}
          useNativeDriver
        >
          <TouchableOpacity
            style={globalStyles.listItem} // Use consistent global list item style
            onPress={() => handlePress(item)}
            activeOpacity={0.75}
          >
            {/* Icon Container */}
            <View style={styles.iconContainer}>
              <FontAwesome5 name={getSubjectIcon(item.name)} size={20} color={Colors.accent} />
            </View>

            <View style={styles.textContainer}>
                <Text style={globalStyles.listItemText} numberOfLines={2}>{item.name}</Text>
                {item.code && (
                  <Text style={globalStyles.listItemSubtitle} numberOfLines={1}>
                      Code: {item.code}
                   </Text>
                )}
            </View>

            {/* Chevron Icon */}
            <MaterialIcons
                name="chevron-right"
                size={24}
                color={Colors.textSecondary} // Use secondary text color
            />
          </TouchableOpacity>
        </Animatable.View>
      ), [handlePress]); // Pass handler to dependency array

      // Display if semester data is somehow missing
       if (!selectedSemester) {
          return (
              <View style={globalStyles.emptyListContainer}>
                 <MaterialIcons name="error-outline" size={48} color={Colors.danger} style={globalStyles.emptyListIcon}/>
                 <Text style={globalStyles.emptyListText}>Semester data not found.</Text>
                 {/* Optional: Add a button to go back */}
              </View>
          );
       }

      return (
        <View style={globalStyles.container}>
            <FlatList
                // Sort subjects alphabetically by name before rendering
                data={(selectedSemester?.subjects || []).sort((a, b) => a.name.localeCompare(b.name))}
                renderItem={renderSubject}
                keyExtractor={(item) => item.id.toString()} // Ensure key is string
                // Add padding top to avoid content going under the header
                contentContainerStyle={[globalStyles.listContentContainer, { paddingTop: 15 }]}
                ListEmptyComponent={ // Consistent empty state display
                    <View style={globalStyles.emptyListContainer}>
                       <FontAwesome5 name="book-dead" size={48} color={Colors.textSecondary} style={globalStyles.emptyListIcon}/>
                       <Text style={globalStyles.emptyListText}>No subjects found for this semester.</Text>
                     </View>
                   }
                // Performance optimizations
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={11}
             />
        </View>
      );
    };

// Local styles for SubjectSelectionScreen
const styles = StyleSheet.create({
  iconContainer: { // Copied from BranchSelection for consistency
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent + '1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: { // Copied from BranchSelection for consistency
    flex: 1,
    justifyContent: 'center',
  },
});

export default SubjectSelectionScreen;