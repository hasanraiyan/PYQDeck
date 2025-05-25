import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from './Icon'; // Assuming Icon component path
import { COLORS } from '../constants'; // Assuming constants path

const SearchWebViewModal = React.memo(({
  visible,
  onClose,
  searchQuery,
}) => {
  const searchUrl = searchQuery
    ? `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&aod=0` // Added &aod=0 to suggest light theme to Google
    : '';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Icon
                iconSet="FontAwesome"
                name="google"
                size={18}
                color={COLORS.text || '#000000'}
                style={styles.modalTitleIcon}
              />
              <Text style={styles.modalTitle}>Google Search</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Icon iconSet="Ionicons" name="close" size={28} color={COLORS.textSecondary || '#8E8E93'} />
            </TouchableOpacity>
          </View>
          {searchQuery ? ( // Check searchQuery here before rendering WebView
            <WebView
              originWhitelist={['https://*', 'http://*']}
              source={{ uri: searchUrl }}
              style={styles.modalWebView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              setSupportMultipleWindows={false}
              // --- Theme control props ---
              forceDarkOff={true} // For Android: Disables force dark mode
              preferredColorScheme="light" // For iOS (13+): Suggests light theme
              // --- End Theme control props ---
              renderLoading={() => (
                <View style={styles.modalLoadingView}>
                  <ActivityIndicator size="large" color={COLORS.primary || '#007AFF'} />
                </View>
              )}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('Search WebView error:', nativeEvent);
                Alert.alert(
                  "Search Error",
                  "Could not load Google search results in the app. This might be due to Google's security policies or network issues. You can try searching in your browser.",
                  [{ text: "OK", onPress: onClose }]
                );
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('Search WebView HTTP error:', nativeEvent.statusCode, nativeEvent.url);
                // You might want to check if the error is critical enough to close the modal
                // For example, a 403 might mean Google blocked the request.
                if (nativeEvent.statusCode === 403 || nativeEvent.statusCode === 400) {
                     Alert.alert(
                        "Search Issue",
                        "There was an issue loading search results. Google might be restricting access from within the app for this search.",
                        [{ text: "OK", onPress: onClose }]
                    );
                } else if (nativeEvent.url && !nativeEvent.url.startsWith("https://www.google.com")) {
                    // Potentially navigated away from Google search.
                    // This can happen if Google tries to open an app link or another domain.
                    // Decide if you want to block this or allow it.
                    // For now, we just log it.
                }
              }}
            />
          ) : (
            <View style={[styles.modalLoadingView, { justifyContent: 'center' }]}>
              <Text style={{ color: COLORS.textSecondary || '#8E8E93' }}>Preparing search...</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: COLORS.surface || '#FFFFFF', // Ensures modal background is light
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 0,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    maxHeight: '95%',
    minHeight: '60%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight || '#E0E0E0',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  modalTitleIcon: {
    // marginRight: 10, // Replaced by gap
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text || '#000000', // Ensures title text is dark
  },
  modalCloseButton: {
    padding: 8,
    marginLeft: 10,
  },
  modalWebView: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.surface || '#FFFFFF', // Ensures WebView container background is light
  },
  modalLoadingView: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: (COLORS.surface || '#FFFFFF') + 'CC', // Light loading overlay
  },
});

export default SearchWebViewModal;