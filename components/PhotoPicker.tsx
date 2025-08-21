import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Avatar, IconButton, Text, Surface } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface PhotoPickerProps {
  currentPhoto?: string | null;
  onPhotoSelected: (photoUri: string) => void;
  size?: number;
  showLabel?: boolean;
  customerName?: string;
}

export default function PhotoPicker({
  currentPhoto,
  onPhotoSelected,
  size = 80,
  showLabel = true,
  customerName = 'Customer',
}: PhotoPickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to upload photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    if (!(await requestPermissions())) return;

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processAndSavePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickFromGallery = async () => {
    if (!(await requestPermissions())) return;

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processAndSavePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to pick photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processAndSavePhoto = async (uri: string) => {
    try {
      // Create a unique filename
      const timestamp = new Date().getTime();
      const filename = `customer_${timestamp}.jpg`;
      const destinationUri = `${FileSystem.documentDirectory}photos/${filename}`;

      // Ensure photos directory exists
      const photosDir = `${FileSystem.documentDirectory}photos`;
      const dirInfo = await FileSystem.getInfoAsync(photosDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
      }

      // Copy and compress the image
      await FileSystem.copyAsync({
        from: uri,
        to: destinationUri,
      });

      onPhotoSelected(destinationUri);
    } catch (error) {
      console.error('Error processing photo:', error);
      Alert.alert('Error', 'Failed to process photo. Please try again.');
    }
  };

  const showPhotoOptions = () => {
    Alert.alert('Select Photo', 'Choose how you want to add a photo for this customer', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removePhoto = () => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', onPress: () => onPhotoSelected('') },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={showPhotoOptions} disabled={isLoading}>
        <Surface style={[styles.photoContainer, { width: size, height: size }]} elevation={2}>
          {currentPhoto ? (
            <Avatar.Image size={size - 8} source={{ uri: currentPhoto }} style={styles.photo} />
          ) : (
            <Avatar.Text
              size={size - 8}
              label={customerName.charAt(0).toUpperCase()}
              style={styles.placeholderAvatar}
              labelStyle={styles.placeholderText}
            />
          )}

          {/* Camera icon overlay */}
          <View style={styles.cameraIconContainer}>
            <IconButton
              icon="camera"
              size={size * 0.2}
              iconColor="white"
              style={styles.cameraIcon}
            />
          </View>
        </Surface>
      </TouchableOpacity>

      {showLabel && (
        <Text style={styles.photoLabel}>
          {currentPhoto ? 'Tap to change photo' : 'Tap to add photo'}
        </Text>
      )}

      {currentPhoto && (
        <TouchableOpacity onPress={removePhoto} style={styles.removeButton}>
          <IconButton icon="delete" size={20} iconColor="#F44336" style={styles.removeIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  photoContainer: {
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photo: {
    borderRadius: 50,
  },
  placeholderAvatar: {
    backgroundColor: '#fe4c24',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fe4c24',
    borderRadius: 12,
    padding: 1,
  },
  cameraIcon: {
    margin: 0,
  },
  photoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
  },
  removeIcon: {
    margin: 0,
  },
});
