import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface PickedPhoto {
  uri: string;
  fileName?: string;
}

// On web, expo-image-picker's default `uri` is a `blob:` object URL, which
// is revoked when the page unloads — so a photo captured before a refresh
// would render as broken afterward, even though the record itself
// persisted fine. Requesting base64 and building a `data:` URI keeps the
// image self-contained inside the persisted JSON instead.
function resolveUri(asset: ImagePicker.ImagePickerAsset): string {
  if (Platform.OS === 'web' && asset.base64) {
    return `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;
  }
  return asset.uri;
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
      base64: Platform.OS === 'web',
    });
    if (result.canceled || !result.assets?.length) return null;
    const asset = result.assets[0];
    return { uri: resolveUri(asset), fileName: asset.fileName ?? undefined };
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
      base64: Platform.OS === 'web',
    });
    if (result.canceled || !result.assets?.length) return null;
    const asset = result.assets[0];
    return { uri: resolveUri(asset), fileName: asset.fileName ?? undefined };
  } catch {
    return null;
  }
}
