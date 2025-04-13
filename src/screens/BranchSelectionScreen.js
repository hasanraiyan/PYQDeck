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
  StatusBar,
  ImageBackground,
  Dimensions 
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Custom color theme - Modern and attractive colors
const Theme = {
  primary: '#3a0ca3',  // Deep purple
  secondary: '#4361ee', // Vibrant blue
  accent: '#f72585',   // Vibrant pink
  gradient1: '#4cc9f0', // Light blue
  gradient2: '#4361ee', // Medium blue
  gradient3: '#3a0ca3', // Deep purple
  cardBg: 'rgba(255, 255, 255, 0.15)', // Semi-transparent white
  textPrimary: '#ffffff', // White
  textSecondary: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
  shadow: '#1a1a2e', // Very dark blue
  warning: '#fca311', // Orange
};

const BranchSelectionScreen = ({ navigation, route }) => {
  const [branches, setBranches] = useState(route.params?.allBranchesData || []);
  const [isLoading, setIsLoading] = useState(!route.params?.allBranchesData);
  const [refreshing, setRefreshing] = useState(false);
  
  // Function to fetch branches
  const fetchBranches = useCallback(async () => {
    try {
      // Simulate API call with route params
      if (route.params?.allBranchesData) {
        setBranches(route.params.allBranchesData);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setIsLoading(false);
    }
  }, [route.params]);

  // Load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      
      if (!branches.length) {
        fetchBranches();
      }
      
      // Optional: dynamic header configuration
      navigation.setOptions({
        title: 'Select Branch',
        headerTransparent: true,
        headerTintColor: Theme.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      });
      
      return () => {
        // Cleanup if needed
      };
    }, [navigation, branches.length, fetchBranches])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBranches();
    setRefreshing(false);
  }, [fetchBranches]);

  // Handle branch selection with haptic feedback
  const handlePress = useCallback((branch) => {
    // You can add haptic feedback here if desired
    navigation.navigate('SemesterSelection', {
      branchId: branch.id,
      branchName: branch.name,
      allBranchesData: branches
    });
  }, [navigation, branches]);

  // Branch icon mapping
  const getBranchIcon = (branchName) => {
    const name = branchName.toLowerCase();
    if (name.includes('computer') || name.includes('it') || name.includes('software')) {
      return 'laptop-code';
    } else if (name.includes('electronic') || name.includes('communication')) {
      return 'microchip';
    } else if (name.includes('mechanical')) {
      return 'cogs';
    } else if (name.includes('civil')) {
      return 'building';
    } else if (name.includes('chemical')) {
      return 'flask';
    } else {
      return 'graduation-cap';
    }
  };

  // Render each branch item with animation
  const renderBranch = useCallback(({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={600}
      delay={index * 150}
      useNativeDriver
    >
      <TouchableOpacity
        style={styles.branchCard}
        onPress={() => handlePress(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[Theme.cardBg, 'rgba(255, 255, 255, 0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 
              name={getBranchIcon(item.name)} 
              size={24} 
              color={Theme.accent} 
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.branchName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.branchDescription} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
          
          <View style={styles.arrowContainer}>
            <MaterialIcons 
              name="chevron-right" 
              size={30} 
              color={Theme.accent} 
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  ), [handlePress]);

  // Loading state with animation
  if (isLoading) {
    return (
      <ImageBackground
        source={require('../../assets/icon.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[Theme.gradient3, Theme.gradient2, Theme.gradient1]}
          style={styles.gradientContainer}
        >
          <Animatable.View 
            animation="pulse" 
            easing="ease-out" 
            iterationCount="infinite"
            style={styles.loadingContainer}
          >
            <ActivityIndicator size="large" color={Theme.accent} />
            <Text style={styles.loadingText}>Loading branches...</Text>
          </Animatable.View>
        </LinearGradient>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/icon.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[Theme.gradient3, Theme.gradient2, Theme.gradient1]}
        style={styles.gradientContainer}
      >
        <Animatable.View 
          animation="fadeIn" 
          duration={800}
          style={styles.container}
        >
          <FlatList
            data={branches}
            renderItem={renderBranch}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={10}
            removeClippedSubviews={true}
            ListHeaderComponent={
              <Animatable.View animation="fadeInDown" duration={800} delay={300} useNativeDriver>
                <Text style={styles.headerText}>
                  Available Branches ({branches.length})
                </Text>
              </Animatable.View>
            }
            ListEmptyComponent={
              <Animatable.View 
                animation="fadeIn" 
                duration={800}
                style={styles.emptyContainer}
              >
                <FontAwesome5 
                  name="exclamation-circle" 
                  size={50} 
                  color={Theme.warning} 
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>No branches found</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={fetchBranches}
                >
                  <LinearGradient
                    colors={[Theme.accent, Theme.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.retryGradient}
                  >
                    <Text style={styles.retryText}>Try Again</Text>
                    <MaterialIcons name="refresh" size={18} color={Theme.textPrimary} />
                  </LinearGradient>
                </TouchableOpacity>
              </Animatable.View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Theme.accent]}
                tintColor={Theme.textPrimary}
                progressBackgroundColor="rgba(255,255,255,0.2)"
              />
            }
          />
        </Animatable.View>
      </LinearGradient>
    </ImageBackground>
  );
};

// Enhanced Styles
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: null,
    height: null,
  },
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  listContainer: {
    paddingTop: 100, // Account for transparent header
    paddingBottom: 30, 
    paddingHorizontal: 16
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.textPrimary,
    marginBottom: 20,
    marginLeft: 8,
  },
  branchCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5, // Android shadow
    shadowColor: Theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  branchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.textPrimary,
    marginBottom: 4,
  },
  branchDescription: {
    fontSize: 13,
    color: Theme.textSecondary,
  },
  arrowContainer: {
    padding: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.textPrimary,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.15,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.textPrimary,
    marginBottom: 20,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  retryGradient: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    color: Theme.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  }
});

export default BranchSelectionScreen;