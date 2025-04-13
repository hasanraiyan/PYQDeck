// src/navigation/AppNavigator.js
import React from 'react';
// Removed NavigationContainer import as it's in App.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BranchSelectionScreen from '../screens/BranchSelectionScreen';
import SemesterSelectionScreen from '../screens/SemesterSelectionScreen';
import SubjectSelectionScreen from '../screens/SubjectSelectionScreen';
import QuestionListScreen from '../screens/QuestionListScreen';

import fullData from '../data/data.json';
import { Colors } from '../styles/globalStyles'; // Use updated Colors

const Stack = createNativeStackNavigator();

// Helper function can remain the same if needed, but screens now primarily use route.params
// const getScreenProps = (route, screenName) => { ... };

const AppNavigator = () => {
  return (
      <Stack.Navigator
        initialRouteName="BranchSelection"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.transparent, // Make header background transparent
          },
          headerTintColor: Colors.textPrimary, // Light color for title and back button
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
          headerTransparent: true, // Crucial for the gradient background to show through
          headerShadowVisible: false, // Hide the default shadow/border under the header
          animation: 'slide_from_right',
          contentStyle: {
             backgroundColor: Colors.transparent, // Make screen content area transparent too
          },
        }}
      >
        <Stack.Screen
          name="BranchSelection"
          component={BranchSelectionScreen}
          // Pass initial data via initialParams if needed directly
           initialParams={{ allBranchesData: fullData.branches }}
           options={{ title: 'Select Branch' }}
        />
        <Stack.Screen
          name="SemesterSelection"
          component={SemesterSelectionScreen}
          options={({ route }) => ({ title: route.params?.branchName || 'Select Semester' })}
        />
        <Stack.Screen
          name="SubjectSelection"
          component={SubjectSelectionScreen}
           options={({ route }) => ({ title: route.params?.semesterName || 'Select Subject' })}
        />
        <Stack.Screen
          name="QuestionList"
          component={QuestionListScreen}
           options={({ route }) => ({ title: route.params?.subjectName || 'Questions' })}
        />
      </Stack.Navigator>
  );
};

export default AppNavigator;