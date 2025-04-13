// src/navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens
import BranchSelectionScreen from '../screens/BranchSelectionScreen';
import SemesterSelectionScreen from '../screens/SemesterSelectionScreen';
import SubjectSelectionScreen from '../screens/SubjectSelectionScreen';
import OrganizationSelectionScreen from '../screens/OrganizationSelectionScreen';
import YearListScreen from '../screens/YearListScreen';
import ChapterListScreen from '../screens/ChapterListScreen';
import QuestionListScreen from '../screens/QuestionListScreen';

// Import Data and Styles
import fullData from '../data/data.json';
import { Colors, globalStyles } from '../styles/globalStyles'; // Use updated Colors and potentially global styles if needed

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
      <Stack.Navigator
        initialRouteName="BranchSelection"
        // Define consistent screen options for the entire navigator
        screenOptions={{
          // Header Styling
          headerStyle: {
            backgroundColor: Colors.surface, // White surface for header background
          },
          headerTintColor: Colors.textPrimary, // Dark color for back button and title
          headerTitleStyle: {
            fontWeight: '600', // Slightly less bold than 'bold'
            fontSize: 18,
            color: Colors.textPrimary, // Explicitly set title color
          },
          headerBackTitleVisible: false, // Hide "Back" text on iOS
          headerShadowVisible: true, // Show a subtle shadow/border below the header for definition
          headerTitleAlign: 'center', // Center align header titles for consistency

          // Screen Transitions & Background
          animation: 'slide_from_right', // Standard transition animation
          contentStyle: {
             backgroundColor: Colors.background, // Main app background color for screen content area below header
          },
        }}
      >
        {/* Screen Definitions */}
        <Stack.Screen
          name="BranchSelection"
          component={BranchSelectionScreen}
          // Pass initial data via initialParams to avoid waiting for fetch simulation
           initialParams={{ allBranchesData: fullData.branches }}
           options={{ title: 'Select Branch' }} // Static title
        />
        <Stack.Screen
          name="SemesterSelection"
          component={SemesterSelectionScreen}
          // Dynamic title based on the selected branch name passed in params
          options={({ route }) => ({ title: route.params?.branchName || 'Select Semester' })}
        />
        <Stack.Screen
          name="SubjectSelection"
          component={SubjectSelectionScreen}
          // Dynamic title based on the selected semester name passed in params
           options={({ route }) => ({ title: route.params?.semesterName || 'Select Subject' })}
        />
        <Stack.Screen
          name="OrganizationSelection"
          component={OrganizationSelectionScreen}
          // Dynamic title based on the selected subject name passed in params
          options={({ route }) => ({ title: route.params?.subjectName || 'View Options' })}
        />
        <Stack.Screen
          name="YearListScreen"
          component={YearListScreen}
          // Dynamic title including subject name
          options={({ route }) => ({ title: `${route.params?.subjectName || 'Subject'} - Years` })}
        />
        <Stack.Screen
          name="ChapterListScreen"
          component={ChapterListScreen}
          // Dynamic title including subject name
          options={({ route }) => ({ title: `${route.params?.subjectName || 'Subject'} - Chapters` })}
        />
        <Stack.Screen
          name="QuestionList"
          component={QuestionListScreen}
          // Dynamic title based on the selected subject name passed in params
          // Or use a preset title from route.params if provided
           options={({ route }) => ({ title: route.params?.headerTitle || route.params?.subjectName || 'Questions' })}
        />
      </Stack.Navigator>
  );
};

export default AppNavigator;