import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'pyqdeck_onboarding_completed';
const SELECTED_BRANCH_KEY = 'pyqdeck_selected_branch';
const SELECTED_SEMESTER_KEY = 'pyqdeck_selected_semester';

export const saveOnboardingSelections = async (branchId, semId) => {
  try {
    await AsyncStorage.multiSet([
      [ONBOARDING_COMPLETED_KEY, 'true'],
      [SELECTED_BRANCH_KEY, branchId],
      [SELECTED_SEMESTER_KEY, semId],
    ]);
    return true;
  } catch (e) {
    console.error('Error saving onboarding selections:', e);
    return false;
  }
};

export const getOnboardingSelections = async () => {
  try {
    const selections = await AsyncStorage.multiGet([
      SELECTED_BRANCH_KEY,
      SELECTED_SEMESTER_KEY,
    ]);
    const [branchId, semId] = selections.map(([_, value]) => value);
    return { branchId, semId };
  } catch (e) {
    console.error('Error getting onboarding selections:', e);
    return { branchId: null, semId: null };
  }
};

export const isOnboardingCompleted = async () => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  } catch (e) {
    console.error('Error checking onboarding status:', e);
    return false;
  }
};

export const clearOnboardingData = async () => {
  try {
    await AsyncStorage.multiRemove([
      ONBOARDING_COMPLETED_KEY,
      SELECTED_BRANCH_KEY,
      SELECTED_SEMESTER_KEY,
    ]);
    return true;
  } catch (e) {
    console.error('Error clearing onboarding data:', e);
    return false;
  }
};