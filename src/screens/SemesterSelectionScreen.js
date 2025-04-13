// src/screens/SemesterSelectionScreen.js
import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { globalStyles, Colors } from '../styles/globalStyles'; // Use updated styles/colors
import * as Animatable from 'react-native-animatable';

const SemesterSelectionScreen = ({ navigation, route }) => {
  const { branchId, allBranchesData } = route.params;

  const selectedBranch = useMemo(() => {
    return (allBranchesData || [])?.find(b => b.id === branchId);
  }, [allBranchesData, branchId]);

  // Update header title dynamically
  React.useLayoutEffect(() => {
    if (selectedBranch) {
        navigation.setOptions({ title: selectedBranch.name || 'Select Semester' });
    } else {
        navigation.setOptions({ title: 'Branch Not Found' });
    }
  }, [navigation, selectedBranch]);

  const handlePress = (semester) => {
     navigation.navigate('SubjectSelection', {
         branchId: branchId,
         semesterId: semester.id,
         semesterName: `Semester ${semester.number}`,
         allBranchesData: allBranchesData // Pass data along
     });
  };

  const renderSemester = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={400}
      delay={index * 100}
      useNativeDriver
    >
      <TouchableOpacity
        style={globalStyles.listItem} // Use themed list item style
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <Text style={globalStyles.listItemText}>Semester {item.number}</Text>
        <MaterialIcons name="chevron-right" size={26} color={Colors.accent} />
      </TouchableOpacity>
    </Animatable.View>
  );

  // Loading/Error State if branch data is missing
  if (!selectedBranch) {
      return (
          <View style={globalStyles.activityIndicatorContainer}>
            <MaterialIcons name="error-outline" size={48} color={Colors.danger} style={{ marginBottom: 15 }}/>
            <Text style={globalStyles.textSecondary}>Branch data not found.</Text>
          </View>
      );
  }

  return (
    <View style={globalStyles.container}>
       <FlatList
          data={selectedBranch?.semesters || []}
          renderItem={renderSemester}
          keyExtractor={(item) => item.id}
          // Add padding for transparent header
          contentContainerStyle={{ paddingTop: 90, paddingBottom: 20, paddingHorizontal: 5 }} // Adjust paddingTop
          ListEmptyComponent={
             <View style={globalStyles.emptyListContainer}>
                <MaterialIcons name="school" size={48} color={Colors.textSecondary} style={{marginBottom: 15}}/>
                <Text style={globalStyles.emptyListText}>No semesters found for this branch.</Text>
              </View>
          }
        />
    </View>
  );
};

export default SemesterSelectionScreen;