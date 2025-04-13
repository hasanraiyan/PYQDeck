// src/screens/BranchSelectionScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar // Keep for useFocusEffect
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles, Colors } from '../styles/globalStyles'; // Import global styles and colors

const BranchSelectionScreen = ({ navigation, route }) => {
  const { allBranchesData } = route.params; // Expect data to be passed via initialParams
  const [branches, setBranches] = useState(allBranchesData || []);
  // isLoading is less critical if data is passed via params, but keep for potential future async fetch
  const [isLoading, setIsLoading] = useState(!allBranchesData);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch branches (if needed in the future)
  const fetchBranches = useCallback(async () => {
    // Example: Simulate fetch or get from params again
    setIsLoading(true);
    try {
      // const data = await someApiCall(); // Replace with actual fetch if needed
      const data = route.params?.allBranchesData;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [route.params?.allBranchesData]);

  // Initial load check (in case params somehow fail)
  useEffect(() => {
    if (!branches.length && !isLoading) {
      fetchBranches();
    } else if (branches.length && isLoading) {
      setIsLoading(false); // Ensure loading is false if data is already present
    }
  }, [fetchBranches, branches.length, isLoading]);

  // Set status bar style on focus (optional, depends on desired effect)
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content'); // Match the light theme header
      // Header is configured globally in AppNavigator
      return () => {}; // Cleanup if needed
    }, [])
  );

  // Handle pull-to-refresh (optional, useful if data can change)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBranches(); // Refetch data
  }, [fetchBranches]);

  // Handle branch selection navigation
  const handlePress = useCallback((branch) => {
    navigation.navigate('SemesterSelection', {
      branchId: branch.id,
      branchName: branch.name,
      allBranchesData: route.params?.allBranchesData // Pass the original full data down
    });
  }, [navigation, route.params?.allBranchesData]);

  // Map branch names to relevant FontAwesome5 icons
  const getBranchIcon = (branchName) => {
    const name = branchName.toLowerCase();
    if (name.includes('computer') || name.includes('it') || name.includes('software')) return 'laptop-code';
    if (name.includes('electronic') || name.includes('communication')) return 'microchip';
    if (name.includes('mechanical')) return 'cogs';
    if (name.includes('electrical')) return 'bolt'; // Added electrical
    if (name.includes('civil')) return 'hard-hat'; // Changed icon
    if (name.includes('chemical')) return 'flask';
    return 'graduation-cap'; // Default icon
  };

  // Render each branch item using consistent styling
  const renderBranch = useCallback(({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={350} // Slightly faster animation
      delay={index * 70} // Shorter delay
      useNativeDriver // Improve animation performance
    >
      <TouchableOpacity
        style={globalStyles.listItem} // Use the global list item style
        onPress={() => handlePress(item)}
        activeOpacity={0.75} // Standard active opacity feedback
      >
        {/* Icon Container with background */}
        <View style={styles.iconContainer}>
          <FontAwesome5
            name={getBranchIcon(item.name)}
            size={20} // Standardized icon size
            color={Colors.accent} // Use accent color for icon
          />
        </View>

        {/* Text Container */}
        <View style={styles.textContainer}>
          <Text style={globalStyles.listItemText} numberOfLines={2}>{item.name}</Text>
          {/* Optional: Add subtitle if available */}
          {/* <Text style={globalStyles.listItemSubtitle}>Optional subtitle</Text> */}
        </View>

        {/* Chevron Icon */}
        <MaterialIcons
          name="chevron-right"
          size={24} // Standardized chevron size
          color={Colors.textSecondary} // Use secondary text color for chevron
        />
      </TouchableOpacity>
    </Animatable.View>
  ), [handlePress]); // Dependency on handlePress

  // Loading state display
  if (isLoading) {
    return (
      <View style={globalStyles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={globalStyles.loadingText}>Loading branches...</Text>
      </View>
    );
  }

  // Main content display
  return (
    <View style={globalStyles.container}>
        <FlatList
          data={branches}
          renderItem={renderBranch}
          keyExtractor={(item) => item.id.toString()}
          // Add padding top to avoid content going under the header
          contentContainerStyle={[globalStyles.listContentContainer, { paddingTop: 15 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={ // Consistent empty state display
            <Animatable.View animation="fadeIn" duration={500} style={globalStyles.emptyListContainer}>
              <FontAwesome5 name="exclamation-circle" size={48} color={Colors.textSecondary} style={globalStyles.emptyListIcon} />
              <Text style={globalStyles.emptyListText}>No branches found.</Text>
              {/* Optional: Add a retry button if fetching is possible */}
              {/* <TouchableOpacity style={[globalStyles.button, styles.retryButton]} onPress={fetchBranches}>
                 <Text style={globalStyles.buttonText}>Try Again</Text>
              </TouchableOpacity> */}
            </Animatable.View>
          }
          refreshControl={ // Optional pull-to-refresh control
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.accent]} // Spinner color for Android
              tintColor={Colors.accent} // Spinner color for iOS
            />
          }
          // Performance optimizations
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={11}
        />
    </View>
  );
};

// Local styles specific to this screen (Keep minimal, rely on global styles)
const styles = StyleSheet.create({
  iconContainer: { // Consistent styling for the icon background circle
    width: 40,
    height: 40,
    borderRadius: 20, // Make it circular
    backgroundColor: Colors.accent + '1A', // Very light accent background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15, // Spacing between icon and text
  },
  textContainer: {
    flex: 1, // Allow text to take remaining space and wrap if needed
    justifyContent: 'center', // Center text vertically if needed
  },
  // retryButton: { // Style for retry button if added
  //   marginTop: 20,
  //   backgroundColor: Colors.accent, // Use accent color
  //   paddingHorizontal: 30,
  // },
});

export default BranchSelectionScreen;