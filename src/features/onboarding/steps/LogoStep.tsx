import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button, Text } from '../../../components/ui';
import { colors, radius, spacing } from '../../../theme';
import type { StepProps } from './types';

export function LogoStep({ payload, updatePayload }: StepProps) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      updatePayload({ logoUri: result.assets[0].uri });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  return (
    <View>
      <Text variant="title2" style={styles.title}>
        Add your logo
      </Text>
      <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Shows up on invoices, reports, and your team's dashboard. You can skip this for now.
      </Text>

      <View style={styles.previewWrap}>
        <Pressable onPress={pickImage} style={styles.previewTouchable}>
          {payload.logoUri ? (
            <Image source={{ uri: payload.logoUri }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="image-outline" size={32} color={colors.textTertiary} />
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons
              name={payload.logoUri ? 'pencil' : 'add'}
              size={14}
              color={colors.textOnAccent}
            />
          </View>
        </Pressable>
      </View>

      <Button
        label={payload.logoUri ? 'Choose a different image' : 'Upload logo'}
        variant="secondary"
        onPress={pickImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xxs,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  previewWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  previewTouchable: {
    width: 112,
    height: 112,
  },
  preview: {
    width: 112,
    height: 112,
    borderRadius: radius.lg,
  },
  placeholder: {
    width: 112,
    height: 112,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
