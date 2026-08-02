import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface PickedPhoto {
  uri: string;
  fileName?: string;
}

/** Opens the device photo library. Real capability on web and native — no simulation. */
export async function pickPhotoFromLibrary(): Promise<PickedPhoto | null> {
  try {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.length) return null;
    return { uri: result.assets[0].uri, fileName: result.assets[0].fileName ?? undefined };
  } catch {
    return null;
  }
}

/** Launches the device camera. Real capability — no simulation. Falls back gracefully if no camera is available. */
export async function capturePhotoFromCamera(): Promise<PickedPhoto | null> {
  try {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.length) return null;
    return { uri: result.assets[0].uri, fileName: result.assets[0].fileName ?? undefined };
  } catch {
    return null;
  }
}
