import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, Text } from '../../components/ui';
import { capturePhotoFromCamera, pickPhotoFromLibrary } from '../../lib/photoPicker';
import { colors, radius, spacing } from '../../theme';

export interface PhotoSourceSheetProps {
  visible: boolean;
  onClose: () => void;
  onPicked: (uri: string) => void;
  title?: string;
}

export function PhotoSourceSheet({ visible, onClose, onPicked, title = 'Add Photo' }: PhotoSourceSheetProps) {
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const handleClose = () => {
    setError(undefined);
    onClose();
  };

  const handleCamera = async () => {
    setError(undefined);
    setBusy(true);
    const result = await capturePhotoFromCamera();
    setBusy(false);
    if (result) {
      onPicked(result.uri);
      handleClose();
    } else {
      setError('Camera unavailable, or permission was denied.');
    }
  };

  const handleLibrary = async () => {
    setError(undefined);
    setBusy(true);
    const result = await pickPhotoFromLibrary();
    setBusy(false);
    if (result) {
      onPicked(result.uri);
      handleClose();
    } else {
      setError('No photo selected, or permission was denied.');
    }
  };

  return (
    <BottomSheet visible={visible} title={title} onClose={handleClose}>
      <View style={styles.body}>
        <Pressable onPress={handleCamera} disabled={busy} style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="camera-outline" size={18} color={colors.accentStrong} />
          </View>
          <Text variant="subhead" style={styles.rowLabel}>
            Take Photo
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </Pressable>
        <Pressable onPress={handleLibrary} disabled={busy} style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name="images-outline" size={18} color={colors.accentStrong} />
          </View>
          <Text variant="subhead" style={styles.rowLabel}>
            Choose from Library
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </Pressable>
        {error ? (
          <Text variant="footnote" color={colors.danger} style={styles.error}>
            {error}
          </Text>
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  error: {
    marginTop: spacing.sm,
    marginLeft: spacing.xxs,
  },
});
