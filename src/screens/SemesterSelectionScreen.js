// src/screens/SemesterSelectionScreen.js
import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { globalStyles, Colors } from '../styles/globalStyles'; // Use updated styles/colors
import * as Animatable from 'react-native-animatable';

const SemesterSelectionScreen = ({ navigation, route }) => {
  const { branchId, allBranchesData, branchName } = route.params;

  // Find the selected branch data
  const selectedBranch = useMemo(() => {
    // Added safety check for allBranchesData being potentially undefined/null
    return (allBranchesData || [])?.find(b => b.id === branchId);
  }, [allBranchesData, branchId]);

  // Update header title dynamically using branchName passed from previous screen
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: branchName || 'Select Semester' });
  }, [navigation, branchName]);

  const handlePress = (semester) => {
     navigation.navigate('SubjectSelection', {
         branchId: branchId,
         semesterId: semester.id,
         semesterName: `Semester ${semester.number}`, // Pass name for header
         allBranchesData: allBranchesData // Pass full data along
     });
  };

  // Render semester item using globalStyles.listItem
  const renderSemester = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={400}
      delay={index * 80}
      useNativeDriver
    >
      <TouchableOpacity
        style={globalStyles.listItem} // Use themed list item style
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <Text style={globalStyles.listItemText}>Semester {item.number}</Text>
        <MaterialIcons
            name="chevron-right"
            size={26}
            color={Colors.textSecondary} // Use secondary text color for chevron
        />
      </TouchableOpacity>
    </Animatable.View>
  );

  // Loading/Error State if branch data is missing (should be less likely if navigation is correct)
  if (!selectedBranch) {
      return (
          <View style={globalStyles.activityIndicatorContainer}>
            <MaterialIcons name="error-outline" size={48} color={Colors.danger} style={{ marginBottom: 15 }}/>
            <Text style={globalStyles.textSecondary}>Branch data not found.</Text>
            {/* Optionally add a button to go back */}
          </View>
      );
  }

  return (
    <View style={globalStyles.container}>
       <FlatList
          data={selectedBranch?.semesters || []}
          renderItem={renderSemester}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[globalStyles.contentContainer, { paddingTop: 15 }]} // Add padding below header
          ListEmptyComponent={
             <View style={globalStyles.emptyListContainer}>
                <MaterialIcons name="school" size={48} color={Colors.textSecondary} style={{marginBottom: 15}}/>
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

export default SemesterSelectionScreen;