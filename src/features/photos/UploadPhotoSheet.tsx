import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Text, TextField } from '../../components/ui';
import { addPhoto } from '../../data/mockStore';
import { capturePhotoFromCamera, pickPhotoFromLibrary } from '../../lib/photoPicker';
import { colors, radius, spacing } from '../../theme';

export interface UploadPhotoSheetProps {
  visible: boolean;
  onClose: () => void;
  jobId: string;
  uploadedBy: string;
}

export function UploadPhotoSheet({ visible, onClose, jobId, uploadedBy }: UploadPhotoSheetProps) {
  const [uri, setUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setUri(null);
    setCaption('');
    setError(undefined);
    setBusy(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCamera = async () => {
    setError(undefined);
    setBusy(true);
    const result = await capturePhotoFromCamera();
    setBusy(false);
    if (result) setUri(result.uri);
    else setError('Camera unavailable, or permission was denied.');
  };

  const handleLibrary = async () => {
    setError(undefined);
    setBusy(true);
    const result = await pickPhotoFromLibrary();
    setBusy(false);
    if (result) setUri(result.uri);
    else setError('No photo selected, or permission was denied.');
  };

  const handleSave = () => {
    if (!uri) {
      setError('Take or choose a photo first');
      return;
    }
    addPhoto({
      jobId,
      caption: caption.trim() || 'Site photo',
      uploadedBy,
      category: 'general',
      uri,
    });
    handleClose();
  };

  return (
    <BottomSheet visible={visible} title="Upload Photo" onClose={handleClose} maxHeightPercent={88}>
      <View style={styles.body}>
        {uri ? (
          <>
            <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
            <Pressable onPress={() => setUri(null)} style={styles.retakeLink}>
              <Ionicons name="refresh-outline" size={14} color={colors.accentStrong} />
              <Text variant="footnote" color={colors.accentStrong} style={styles.retakeLabel}>
                Choose a different photo
              </Text>
            </Pressable>

            <TextField
              label="Caption"
              placeholder="e.g. Building A podium slab pour"
              value={caption}
              onChangeText={setCaption}
              style={styles.captionInput}
            />

            <Button label="Save Photo" onPress={handleSave} loading={busy} style={styles.submitButton} />
          </>
        ) : (
          <>
            <Text variant="footnote" color={colors.textSecondary} style={styles.intro}>
              Capture a new site photo or choose one from your library.
            </Text>
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
          </>
        )}

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
  intro: {
    marginBottom: spacing.md,
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
  preview: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  retakeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    padding: spacing.xxs,
  },
  retakeLabel: {
    marginLeft: spacing.xxs,
  },
  captionInput: {
    marginBottom: 0,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  error: {
    marginTop: spacing.sm,
    marginLeft: spacing.xxs,
  },
});
