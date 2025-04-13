// src/navigation/AppNavigator.js
import React from 'react';
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BranchSelectionScreen from '../screens/BranchSelectionScreen';
import SemesterSelectionScreen from '../screens/SemesterSelectionScreen';
import SubjectSelectionScreen from '../screens/SubjectSelectionScreen';
import OrganizationSelectionScreen from '../screens/OrganizationSelectionScreen';
import YearListScreen from '../screens/YearListScreen';
import ChapterListScreen from '../screens/ChapterListScreen';
import QuestionListScreen from '../screens/QuestionListScreen';

import fullData from '../data/data.json';
import { Colors } from '../styles/globalStyles'; // Use updated Colors

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
      <Stack.Navigator
        initialRouteName="BranchSelection"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.surface, // Use white surface for header background
          },
          headerTintColor: Colors.textPrimary, // Dark color for title and back button
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
            color: Colors.textPrimary, // Ensure title color is explicitly set
          },
          headerBackTitleVisible: false,
          // headerTransparent: false, // Default is false, explicitly remove/set false
          headerShadowVisible: true, // Show a subtle shadow/border below the header
          animation: 'slide_from_right',
          contentStyle: {
             backgroundColor: Colors.background, // Main app background color for screen content area
          },
        }}
      >
        <Stack.Screen
          name="BranchSelection"
          component={BranchSelectionScreen}
          // Pass initial data via initialParams
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
          name="OrganizationSelection"
          component={OrganizationSelectionScreen}
          options={({ route }) => ({ title: route.params?.subjectName || 'View Options' })}
        />
        <Stack.Screen
          name="YearListScreen"
          component={YearListScreen}
          options={({ route }) => ({ title: `${route.params?.subjectName} - Years` || 'Years' })}
        />
        <Stack.Screen
          name="ChapterListScreen"
          component={ChapterListScreen}
          options={({ route }) => ({ title: `${route.params?.subjectName} - Chapters` || 'Chapters' })}
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