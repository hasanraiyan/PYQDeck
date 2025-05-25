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

const ContentDisplayModal = React.memo(({
  visible,
  onClose,
  htmlContent,
  title = "Content",
  titleIconName = "document-text-outline",
  titleIconSet = "Ionicons",
}) => {
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
                iconSet={titleIconSet}
                name={titleIconName}
                size={20}
                color={COLORS.text || '#000000'}
                style={styles.modalTitleIcon}
              />
              <Text style={styles.modalTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Icon iconSet="Ionicons" name="close" size={28} color={COLORS.textSecondary || '#8E8E93'} />
            </TouchableOpacity>
          </View>
            <View style={{flex: 1, margin: 10, marginTop:0}}>
            <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={[styles.modalWebView,{margin: 10}]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mixedContentMode="compatibility"
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.modalLoadingView}>
                <ActivityIndicator size="large" color={COLORS.primary || '#007AFF'} />
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('Modal WebView error:', nativeEvent);
              Alert.alert("Error", "Could not load content fully.");
              onClose();
            }}
          />
            </View>
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
    backgroundColor: COLORS.surface || '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 0, // Content padding is handled by WebView style or content
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
    color: COLORS.text || '#000000',
  },
  modalCloseButton: {
    padding: 8,
    marginLeft: 10,
  },
  modalWebView: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.surface || '#FFFFFF',
    margin: 10, // Added margin around webview content
  },
  modalLoadingView: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: (COLORS.surface || '#FFFFFF') + 'CC',
  },
});

export default ContentDisplayModal;