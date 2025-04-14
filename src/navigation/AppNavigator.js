// src/navigation/AppNavigator.js
import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants';

// Import Screens
import BranchListScreen from '../screens/BranchListScreen';
import SemesterListScreen from '../screens/SemesterListScreen';
import SubjectListScreen from '../screens/SubjectListScreen';
import OrganizationSelectionScreen from '../screens/OrganizationSelectionScreen';
import YearSelectionScreen from '../screens/YearSelectionScreen';
import ChapterSelectionScreen from '../screens/ChapterSelectionScreen';
import QuestionListScreen from '../screens/QuestionListScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Branches"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.surface,
            ...(Platform.OS === 'android' && { elevation: 2 }),
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
          headerBackTitleVisible: false,
          headerShadowVisible: Platform.OS === 'ios',
        }}
      >
        <Stack.Screen
          name="Branches"
          component={BranchListScreen}
          options={{ title: 'Select Branch' }}
        />
        <Stack.Screen
          name="Semesters"
          component={SemesterListScreen}
          // Title set dynamically
        />
        <Stack.Screen
          name="Subjects"
          component={SubjectListScreen}
          // Title set dynamically
        />
        <Stack.Screen
          name="OrganizationSelection"
          component={OrganizationSelectionScreen}
          // Title set dynamically
        />
        <Stack.Screen
          name="YearSelection"
          component={YearSelectionScreen}
          options={{ title: 'Select Year' }}
        />
        <Stack.Screen
          name="ChapterSelection"
          component={ChapterSelectionScreen}
          options={{ title: 'Select Chapter' }}
        />
        <Stack.Screen
          name="Questions"
          component={QuestionListScreen}
          // Title set dynamically
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;