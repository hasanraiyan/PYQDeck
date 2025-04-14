import React, { useState } from 'react';
import { View, Image, Modal, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Text, Platform } from 'react-native';
import Icon from './Icon';
import { COLORS } from '../constants';

const screenWidth = Dimensions.get('window').width;
const maxImageWidth = screenWidth - 2 * 15 - 20;

const FullScreenImageModal = ({ visible, imageUri, alt, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalContainer} onPress={onClose} activeOpacity={1}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.fullScreenImage} 
            resizeMode="contain"
            accessibilityLabel={alt || 'Full Screen Image'}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon iconSet="Ionicons" name="close" size={30} color={COLORS.surface} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const CustomImageRenderer = (props) => {
  // Extract properties, excluding key from being spread
  const { src, alt, style: customStyle } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const imageStyle = {
    width: maxImageWidth,
    minHeight: 150,
    resizeMode: 'contain',
    marginVertical: 10,
    alignSelf: 'center',
    backgroundColor: COLORS.disabledBackground,
  };

  const handleImagePress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={imageStyle}>
      {isLoading && (
        <View style={[imageStyle, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
      {hasError ? (
        <View style={[imageStyle, { justifyContent: 'center', alignItems: 'center' }]}>
          <Icon
            iconSet="Ionicons"
            name="image-outline"
            size={40}
            color={COLORS.error}
          />
          <Text style={{ color: COLORS.error, marginTop: 8 }}>Failed to load image</Text>
        </View>
      ) : (
        <TouchableOpacity onPress={handleImagePress} activeOpacity={0.8}>
          <Image
            source={{ uri: src }}
            style={[imageStyle, customStyle, { opacity: isLoading ? 0 : 1 }]}
            accessibilityLabel={alt || 'Question Image'}
            onLoadEnd={() => setTimeout(() => setIsLoading(false), 100)}
            onError={(error) => {
              console.warn(`Failed to load image: ${src}`, error.nativeEvent.error);
              setHasError(true);
              setIsLoading(false);
            }}
          />
        </TouchableOpacity>
      )}
      <FullScreenImageModal 
        visible={isModalVisible} 
        imageUri={src} 
        alt={alt}
        onClose={handleCloseModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 5,
  },
});

export default CustomImageRenderer;
