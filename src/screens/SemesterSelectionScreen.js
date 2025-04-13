// src/screens/SemesterSelectionScreen.js
import React, { useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons'; // Added FontAwesome5
import { globalStyles, Colors } from '../styles/globalStyles'; // Use updated styles/colors
import * as Animatable from 'react-native-animatable';

const SemesterSelectionScreen = ({ navigation, route }) => {
  const { branchId, allBranchesData, branchName } = route.params;

  // Find the selected branch data using useMemo for efficiency
  const selectedBranch = useMemo(() => {
    // Added safety check for allBranchesData being potentially undefined/null
    return (allBranchesData || [])?.find(b => b.id === branchId);
  }, [allBranchesData, branchId]);

  // Header title is set globally by AppNavigator using branchName

  // Handle navigation when a semester is pressed
  const handlePress = useCallback((semester) => {
     navigation.navigate('SubjectSelection', {
         branchId: branchId,
         semesterId: semester.id,
         // Pass a user-friendly semester name for the next screen's header
         semesterName: `Semester ${semester.number}`,
         allBranchesData: allBranchesData // Pass full data along
     });
  }, [navigation, branchId, allBranchesData]); // Dependencies for useCallback

  // Render each semester item
  const renderSemester = useCallback(({ item, index }) => (
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
          {/* Use a relevant icon, e.g., numbered list or school */}
          <FontAwesome5 name="layer-group" size={18} color={Colors.accent} />
        </View>

        {/* Text Container */}
        <View style={styles.textContainer}>
          <Text style={globalStyles.listItemText}>Semester {item.number}</Text>
           {/* Optional: Display number of subjects */}
           {/* <Text style={globalStyles.listItemSubtitle}>{item.subjects?.length || 0} Subjects</Text> */}
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

  // Display if branch data is somehow missing
  if (!selectedBranch) {
      return (
          <View style={globalStyles.emptyListContainer}>
            <MaterialIcons name="error-outline" size={48} color={Colors.danger} style={globalStyles.emptyListIcon}/>
            <Text style={globalStyles.emptyListText}>Branch data not found.</Text>
            {/* Optionally add a button to go back */}
          </View>
      );
  }

  return (
    <View style={globalStyles.container}>
       <FlatList
          // Sort semesters numerically before rendering
          data={(selectedBranch?.semesters || []).sort((a, b) => a.number - b.number)}
          renderItem={renderSemester}
          keyExtractor={(item) => item.id.toString()} // Ensure key is string
          // Add padding top to avoid content going under the header
          contentContainerStyle={[globalStyles.listContentContainer, { paddingTop: 15 }]}
          ListEmptyComponent={ // Consistent empty state display
             <View style={globalStyles.emptyListContainer}>
                <MaterialIcons name="school" size={48} color={Colors.textSecondary} style={globalStyles.emptyListIcon}/>
                <Text style={globalStyles.emptyListText}>No semesters found for this branch.</Text>
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

// Local styles for SemesterSelectionScreen
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


export default SemesterSelectionScreen;