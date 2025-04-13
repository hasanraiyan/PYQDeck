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
  StatusBar // Keep StatusBar import if needed for focus effects
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles, Colors } from '../styles/globalStyles'; // Import global styles and colors

// Get screen dimensions (might still be useful for responsive layouts if needed)
// import { Dimensions } from 'react-native';
// const { width, height } = Dimensions.get('window');

const BranchSelectionScreen = ({ navigation, route }) => {
  const [branches, setBranches] = useState(route.params?.allBranchesData || []);
  const [isLoading, setIsLoading] = useState(!route.params?.allBranchesData);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch branches (remains the same logic)
  const fetchBranches = useCallback(async () => {
    // In a real app, this would be an API call
    setIsLoading(true); // Show loader during fetch simulation
    try {
      // Simulate API call delay
      // await new Promise(resolve => setTimeout(resolve, 500));
      const data = route.params?.allBranchesData; // Replace with actual fetch if needed
      if (data) {
        setBranches(data);
      } else {
        // Handle case where data is not passed correctly
        console.warn("Branch data not found in route params.");
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]); // Set empty on error
    } finally {
      setIsLoading(false);
      setRefreshing(false); // Ensure refreshing is stopped
    }
  }, [route.params?.allBranchesData]); // Depend on the data prop

  // Initial fetch if data wasn't passed directly or is empty
  useEffect(() => {
    if (!branches.length && !isLoading) {
      fetchBranches();
    }
  }, [fetchBranches, branches.length, isLoading]);


  // Set status bar style and header on focus
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content'); // Dark content for light background

      // Header is now configured globally in AppNavigator, but can override here if needed
      // navigation.setOptions({ title: 'Select Branch' });

      return () => {
        // Cleanup if needed
      };
    }, [navigation])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBranches();
    // setRefreshing(false); // Already handled in fetchBranches finally block
  }, [fetchBranches]);

  // Handle branch selection
  const handlePress = useCallback((branch) => {
    navigation.navigate('SemesterSelection', {
      branchId: branch.id,
      branchName: branch.name,
      allBranchesData: route.params?.allBranchesData // Pass the original full data
    });
  }, [navigation, route.params?.allBranchesData]);

  // Branch icon mapping (keep using FontAwesome5 or switch to MaterialCommunityIcons etc.)
  const getBranchIcon = (branchName) => {
    const name = branchName.toLowerCase();
    if (name.includes('computer') || name.includes('it') || name.includes('software')) return 'laptop-code';
    if (name.includes('electronic') || name.includes('communication')) return 'microchip';
    if (name.includes('mechanical')) return 'cogs';
    if (name.includes('civil')) return 'building';
    if (name.includes('chemical')) return 'flask';
    return 'graduation-cap'; // Default icon
  };

  // Render each branch item using globalStyles.listItem
  const renderBranch = useCallback(({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={400} // Faster animation
      delay={index * 80} // Shorter delay
      useNativeDriver
    >
      <TouchableOpacity
        style={globalStyles.listItem} // Use the global list item style
        onPress={() => handlePress(item)}
        activeOpacity={0.7} // Standard active opacity
      >
        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <FontAwesome5
            name={getBranchIcon(item.name)}
            size={22} // Slightly smaller icon
            color={Colors.accent} // Use accent color for icon
          />
        </View>

        {/* Text Container */}
        <View style={styles.textContainer}>
          <Text style={globalStyles.listItemText}>{item.name}</Text>
          {/* Optional: Add description if available */}
          {/* {item.description && (
            <Text style={[globalStyles.textSecondary, { fontSize: 12 }]} numberOfLines={1}>
              {item.description}
            </Text>
          )} */}
        </View>

        {/* Arrow Icon */}
        <MaterialIcons
          name="chevron-right"
          size={26}
          color={Colors.textSecondary} // Use secondary text color for chevron
        />
      </TouchableOpacity>
    </Animatable.View>
  ), [handlePress]); // Dependency on handlePress

  // Loading state
  if (isLoading) {
    return (
      <View style={globalStyles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={[globalStyles.textSecondary, { marginTop: 10 }]}>Loading branches...</Text>
      </View>
    );
  }

  // Main content
  return (
    <View style={globalStyles.container}>
        <FlatList
          data={branches}
          renderItem={renderBranch}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[globalStyles.contentContainer, styles.listContainer]} // Combine global and local styles
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Animatable.View
              animation="fadeIn"
              duration={500}
              style={globalStyles.emptyListContainer}
            >
              <FontAwesome5
                name="exclamation-circle"
                size={48}
                color={Colors.warning}
                style={{ marginBottom: 15 }}
              />
              <Text style={globalStyles.emptyListText}>No branches found.</Text>
              <TouchableOpacity
                style={[globalStyles.button, styles.retryButton]} // Use global button style
                onPress={fetchBranches}
              >
                <Text style={globalStyles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </Animatable.View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.accent]} // Spinner color
              tintColor={Colors.accent} // iOS spinner color
            />
          }
          // Performance optimizations (optional but good practice)
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={11}
        />
    </View>
  );
};

// Local styles specific to this screen (keep minimal)
const styles = StyleSheet.create({
  listContainer: {
    paddingTop: 15, // Add padding below the solid header
  },
  iconContainer: {
    width: 40, // Smaller icon background
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent + '1A', // Very light accent background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15, // Spacing between icon and text
  },
  textContainer: {
    flex: 1, // Allow text to take remaining space
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.accent, // Use accent color for retry button
  },
  // Remove styles related to gradient, background image, old theme
});

export default BranchSelectionScreen;