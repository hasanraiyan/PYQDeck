// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BranchSelectionScreen from '../screens/BranchSelectionScreen';
import SemesterSelectionScreen from '../screens/SemesterSelectionScreen';
import SubjectSelectionScreen from '../screens/SubjectSelectionScreen';
import QuestionListScreen from '../screens/QuestionListScreen';

// Load data directly at the root
import fullData from '../data/data.json';
import { Colors } from '../styles/globalStyles';

const Stack = createNativeStackNavigator();

// Helper function to get data needed for screens, reduces prop drilling slightly
const getScreenProps = (route, screenName) => {
    const baseParams = { allBranchesData: fullData.branches };
    switch (screenName) {
        case 'BranchSelection':
            return { ...baseParams, branches: fullData.branches };
        case 'SemesterSelection':
            return { ...baseParams, branchId: route.params?.branchId };
        case 'SubjectSelection':
            return { ...baseParams, branchId: route.params?.branchId, semesterId: route.params?.semesterId };
        case 'QuestionList':
            return { ...baseParams, branchId: route.params?.branchId, semesterId: route.params?.semesterId, subjectId: route.params?.subjectId };
        default:
            return baseParams;
    }
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="BranchSelection"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.textLight,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false, // Keep header clean on iOS
          animation: 'slide_from_right', // Modern slide animation
          contentStyle: { backgroundColor: Colors.background },
          // Add a nice transition effect
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 300 } },
            close: { animation: 'timing', config: { duration: 300 } },
          },
        }}
      >
        <Stack.Screen
          name="BranchSelection"
          component={BranchSelectionScreen}
          options={{ title: 'Select Branch' }}
          initialParams={getScreenProps(null, 'BranchSelection')}
        />
        <Stack.Screen
          name="SemesterSelection"
          component={SemesterSelectionScreen}
          options={({ route }) => ({ title: route.params?.branchName || 'Select Semester' })} // Dynamic title example
        />
        <Stack.Screen
          name="SubjectSelection"
          component={SubjectSelectionScreen}
           options={({ route }) => ({ title: route.params?.semesterName || 'Select Subject' })} // Dynamic title example
        />
        <Stack.Screen
          name="QuestionList"
          component={QuestionListScreen}
           options={({ route }) => ({ title: route.params?.subjectName || 'Questions' })} // Dynamic title set in component anyway
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;