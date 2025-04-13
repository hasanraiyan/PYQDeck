// src/screens/SubjectSelectionScreen.js
import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { globalStyles, Colors } from '../styles/globalStyles'; // Use updated styles/colors
import * as Animatable from 'react-native-animatable';

const SubjectSelectionScreen = ({ navigation, route }) => {
    const { branchId, semesterId, allBranchesData, semesterName } = route.params;

    // Find the selected semester data
    const selectedSemester = useMemo(() => {
        const branch = (allBranchesData || [])?.find(b => b.id === branchId);
        return branch?.semesters.find(s => s.id === semesterId);
    }, [allBranchesData, branchId, semesterId]);

     // Set dynamic title using semesterName passed from previous screen
    React.useLayoutEffect(() => {
        navigation.setOptions({ title: semesterName || 'Select Subject' });
    }, [navigation, semesterName]);


    const handlePress = (subject) => {
         navigation.navigate('OrganizationSelection', {
             branchId: branchId,
             semesterId: semesterId,
             subjectId: subject.id,
             subjectName: subject.name, // Pass name for header
             allBranchesData: allBranchesData // Pass the full data again
        });
    };

    // Render subject item using globalStyles.listItem
    const renderSubject = ({ item, index }) => (
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
            {/* Flex container for text */}
            <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={globalStyles.listItemText}>{item.name}</Text>
                {/* Display subject code using secondary text style */}
                {item.code && (
                  <Text style={[globalStyles.textSecondary, { marginTop: 2 }]} numberOfLines={1}>
                      Code: {item.code}
                   </Text>
                )}
            </View>
            <MaterialIcons
                name="chevron-right"
                size={26}
                color={Colors.textSecondary} // Use secondary text color for chevron
            />
          </TouchableOpacity>
        </Animatable.View>
      );

      // Loading/Error State if semester data is missing
       if (!selectedSemester) {
          return (
              <View style={globalStyles.activityIndicatorContainer}>
                 <MaterialIcons name="error-outline" size={48} color={Colors.danger} style={{ marginBottom: 15 }}/>
                 <Text style={globalStyles.textSecondary}>Semester data not found.</Text>
                 {/* Optionally add a button to go back */}
              </View>
          );
       }

      return (
        <View style={globalStyles.container}>
            <FlatList
                data={selectedSemester?.subjects || []}
                renderItem={renderSubject}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[globalStyles.contentContainer, { paddingTop: 15 }]} // Add padding below header
                ListEmptyComponent={
                    <View style={globalStyles.emptyListContainer}>
                       <MaterialIcons name="book" size={48} color={Colors.textSecondary} style={{marginBottom: 15}}/>
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

export default SubjectSelectionScreen;