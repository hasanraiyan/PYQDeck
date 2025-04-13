// src/screens/BranchSelectionScreen.js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { globalStyles, Colors } from '../styles/globalStyles';
import * as Animatable from 'react-native-animatable';

const BranchSelectionScreen = ({ navigation, route }) => {
  const { branches, allBranchesData } = route.params; // Get branches and allBranchesData passed from navigator

  const handlePress = (branch) => {
       navigation.navigate('SemesterSelection', {
            branchId: branch.id,
            branchName: branch.name, // Pass name for potential header title use
            allBranchesData: allBranchesData // Pass the full branches data to the next screen
       });
  };

  const renderBranch = ({ item, index }) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={400}
      delay={index * 100} // Staggered animation
      useNativeDriver
    >
      <TouchableOpacity
        style={[globalStyles.listItem, { borderRadius: 8, marginHorizontal: 12, marginVertical: 6 }]}
        onPress={() => handlePress(item)} // Pass the whole item
        activeOpacity={0.7} // Add feedback on press
      >
        <Text style={globalStyles.listItemText}>{item.name}</Text>
        <MaterialIcons name="chevron-right" size={24} color={Colors.primary} />
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={globalStyles.container}>
      {(!branches || branches.length === 0) ? (
           <View style={globalStyles.activityIndicatorContainer}>
             <Text style={globalStyles.textSecondary}>No branches found in data.</Text>
           </View>
         ) : (
             <FlatList
                data={branches}
                renderItem={renderBranch}
                keyExtractor={(item) => item.id}
            />
      )}
    </View>
  );
};

export default BranchSelectionScreen;