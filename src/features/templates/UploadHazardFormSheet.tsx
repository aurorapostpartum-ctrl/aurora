import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Chip, Text, TextField } from '../../components/ui';
import { createHazardTemplate } from '../../data/mockStore';
import { colors, radius, spacing } from '../../theme';
import type { HazardSourceFileType } from '../../types/domain';
import { SOURCE_FILE_ACCEPT, SOURCE_FILE_TYPE_OPTIONS } from './hazardTemplateMeta';

export interface UploadHazardFormSheetProps {
  visible: boolean;
  onClose: () => void;
  actorId: string;
}

// A real (not simulated) file picker on web — no extra native dependency required.
// We only read the file's name/size/type; binary content can't be parsed into a
// template automatically, so the upload seeds a draft the user finishes in the builder.
function pickWebFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.position = 'fixed';
    input.style.top = '-1000px';
    input.style.left = '-1000px';
    input.onchange = () => {
      resolve(input.files && input.files.length > 0 ? input.files[0] : null);
      input.remove();
    };
    document.body.appendChild(input);
    input.click();
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadHazardFormSheet({ visible, onClose, actorId }: UploadHazardFormSheetProps) {
  const [name, setName] = useState('');
  const [fileType, setFileType] = useState<HazardSourceFileType>('pdf');
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [error, setError] = useState<string | undefined>();

  const reset = () => {
    setName('');
    setFileType('pdf');
    setFile(null);
    setError(undefined);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleChooseFile = async () => {
    if (Platform.OS !== 'web') {
      setError('File upload is available in the web app for now — build the template by hand instead.');
      return;
    }
    const picked = await pickWebFile(SOURCE_FILE_ACCEPT[fileType]);
    if (picked) {
      setFile({ name: picked.name, size: picked.size });
      if (!name.trim()) setName(picked.name.replace(/\.[^.]+$/, ''));
      setError(undefined);
    }
  };

  const handleContinue = () => {
    if (!name.trim()) {
      setError('Enter a name for this assessment');
      return;
    }
    if (!file) {
      setError('Choose a file to upload');
      return;
    }

    const template = createHazardTemplate({
      name: name.trim(),
      trade: 'General',
      description: `Uploaded from ${file.name}.`,
      visibility: 'private',
      createdBy: actorId,
      requiresSignature: true,
      sourceFileName: file.name,
      sourceFileType: fileType,
      sections: [],
    });

    reset();
    onClose();
    router.push(`/(app)/hazard-template-edit/${template.id}` as never);
  };

  const selectedTypeLabel = SOURCE_FILE_TYPE_OPTIONS.find((o) => o.value === fileType)?.label;

  return (
    <BottomSheet visible={visible} title="Upload Existing Hazard Assessment" onClose={handleClose} maxHeightPercent={88}>
      <View style={styles.body}>
        <Text variant="footnote" color={colors.textSecondary} style={styles.intro}>
          Upload a hazard assessment form you already use — a PDF, Word document, Excel spreadsheet, or a photo
          of a paper form. We’ll create a digital template from it that you finish building in the editor.
        </Text>

        <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
          File Type
        </Text>
        <View style={styles.chipRow}>
          {SOURCE_FILE_TYPE_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={fileType === option.value}
              onPress={() => {
                setFileType(option.value);
                setFile(null);
              }}
            />
          ))}
        </View>

        <Pressable onPress={handleChooseFile} style={styles.filePicker}>
          <Ionicons
            name={file ? 'checkmark-circle' : 'cloud-upload-outline'}
            size={22}
            color={file ? colors.success : colors.accentStrong}
          />
          <View style={styles.filePickerText}>
            <Text variant="subhead" color={colors.textPrimary} numberOfLines={1}>
              {file ? file.name : 'Choose File'}
            </Text>
            <Text variant="caption1" color={colors.textTertiary}>
              {file ? formatFileSize(file.size) : selectedTypeLabel}
            </Text>
          </View>
          {file ? (
            <Pressable onPress={() => setFile(null)} hitSlop={8} accessibilityLabel="Remove file">
              <Ionicons name="close" size={16} color={colors.textTertiary} />
            </Pressable>
          ) : null}
        </Pressable>

        <TextField
          label="Assessment Name"
          placeholder="e.g. Roofing Fall Protection JHA"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (error) setError(undefined);
          }}
        />

        {error ? (
          <Text variant="footnote" color={colors.danger} style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Button label="Continue to Builder" onPress={handleContinue} style={styles.submitButton} />
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
  fieldLabel: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  filePickerText: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  error: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xxs,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
});
