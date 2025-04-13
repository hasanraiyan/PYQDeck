// src/screens/SemesterSelectionScreen.js
import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { globalStyles, Colors } from '../styles/globalStyles';
import * as Animatable from 'react-native-animatable';

const SemesterSelectionScreen = ({ navigation, route }) => {
  const { branchId, allBranchesData } = route.params; // Navigator now passes full data if needed

  // Find the selected branch using branchId
  const selectedBranch = useMemo(() => {
    return allBranchesData?.find(b => b.id === branchId);
  }, [allBranchesData, branchId]);

  // Set dynamic title when component mounts or branch changes
  React.useLayoutEffect(() => {
    if (selectedBranch) {
        navigation.setOptions({ title: selectedBranch.name || 'Select Semester' });
    }
  }, [navigation, selectedBranch]);


  const handlePress = (semester) => {
     navigation.navigate('SubjectSelection', {
         branchId: branchId,
         semesterId: semester.id,
         semesterName: `Semester ${semester.number}`, // Pass name
         allBranchesData: allBranchesData // Pass the full branches data to the next screen
     });
  };

  const renderSemester = ({ item, index }) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={400}
      delay={index * 100} // Staggered animation
      useNativeDriver
    >
      <TouchableOpacity
        style={[globalStyles.listItem, { borderRadius: 8, marginHorizontal: 12, marginVertical: 6 }]}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <Text style={globalStyles.listItemText}>Semester {item.number}</Text>
        <MaterialIcons name="chevron-right" size={24} color={Colors.primary} />
      </TouchableOpacity>
    </Animatable.View>
  );

  // Loading/Error State
  if (!selectedBranch) {
      return (
          <View style={globalStyles.activityIndicatorContainer}>
            <Text style={globalStyles.textSecondary}>Branch data not found.</Text>
          </View>
      );
  }

  return (
    <View style={globalStyles.container}>
       {(!selectedBranch.semesters || selectedBranch.semesters.length === 0) ? (
            <View style={globalStyles.emptyListContainer}>
               <Text style={globalStyles.emptyListText}>No semesters found for this branch.</Text>
             </View>
           ) : (
               <FlatList
                data={selectedBranch.semesters}
                renderItem={renderSemester}
                keyExtractor={(item) => item.id}
               />
        )}
    </View>
  );
};

export default SemesterSelectionScreen;