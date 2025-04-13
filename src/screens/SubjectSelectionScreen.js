// src/screens/SubjectSelectionScreen.js
import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { globalStyles, Colors } from '../styles/globalStyles';
import * as Animatable from 'react-native-animatable';

const SubjectSelectionScreen = ({ navigation, route }) => {
    const { branchId, semesterId, allBranchesData } = route.params;

    // Find the selected semester data
    const selectedSemester = useMemo(() => {
        const branch = allBranchesData?.find(b => b.id === branchId);
        return branch?.semesters.find(s => s.id === semesterId);
    }, [allBranchesData, branchId, semesterId]);

     // Set dynamic title
    React.useLayoutEffect(() => {
        if (selectedSemester) {
            navigation.setOptions({ title: `Semester ${selectedSemester.number}` });
        }
    }, [navigation, selectedSemester]);


    const handlePress = (subject) => {
         navigation.navigate('QuestionList', {
             branchId: branchId,
             semesterId: semesterId,
             subjectId: subject.id,
             subjectName: subject.name, // Pass name for potential header use
             allBranchesData: allBranchesData // Pass the full branches data to the next screen
        });
    };

    const renderSubject = ({ item, index }) => (
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
            {/* Flex container for text */}
            <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={globalStyles.listItemText}>{item.name}</Text>
                {item.code && (
                  <Text style={globalStyles.textSecondary} numberOfLines={1}>
                      Code: {item.code}
                   </Text>
                )}
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </Animatable.View>
      );

      // Loading/Error State
       if (!selectedSemester) {
          return (
              <View style={globalStyles.activityIndicatorContainer}>
                <Text style={globalStyles.textSecondary}>Semester data not found.</Text>
              </View>
          );
       }

      return (
        <View style={globalStyles.container}>
             {(!selectedSemester.subjects || selectedSemester.subjects.length === 0) ? (
                    <View style={globalStyles.emptyListContainer}>
                       <Text style={globalStyles.emptyListText}>No subjects found for this semester.</Text>
                     </View>
                   ) : (
                    <FlatList
                        data={selectedSemester.subjects}
                        renderItem={renderSubject}
                        keyExtractor={(item) => item.id}
                    />
             )}
        </View>
      );
    };

export default SubjectSelectionScreen;