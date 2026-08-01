import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Checkbox, Chip, Text, TextField } from '../../components/ui';
import { addDocument } from '../../data/mockStore';
import { CATEGORY_OPTIONS, FILE_TYPE_OPTIONS } from '../documents/documentMeta';
import { colors, spacing } from '../../theme';
import type { DocumentCategory, DocumentFileType } from '../../types/domain';

export interface UploadDocumentSheetProps {
  visible: boolean;
  onClose: () => void;
  jobId: string;
  uploadedBy: string;
  onUploaded?: (documentId: string) => void;
}

export function UploadDocumentSheet({ visible, onClose, jobId, uploadedBy, onUploaded }: UploadDocumentSheetProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('architectural');
  const [fileType, setFileType] = useState<DocumentFileType>('pdf');
  const [reviewRequired, setReviewRequired] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const reset = () => {
    setTitle('');
    setCategory('architectural');
    setFileType('pdf');
    setReviewRequired(true);
    setError(undefined);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Enter a document title');
      return;
    }

    const document = addDocument({
      jobId,
      title: title.trim(),
      category,
      fileType,
      uploadedBy,
      reviewRequired,
      pageCount: fileType === 'image' ? 1 : 6,
    });

    reset();
    onClose();
    onUploaded?.(document.id);
  };

  return (
    <BottomSheet visible={visible} title="Upload Document" onClose={handleClose}>
      <View style={styles.body}>
        <TextField
          label="Document Title"
          placeholder="e.g. Electrical Plan"
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            if (error) setError(undefined);
          }}
          error={error}
        />

        <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
          Category
        </Text>
        <View style={styles.chipRow}>
          {CATEGORY_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={category === option.value}
              onPress={() => setCategory(option.value)}
            />
          ))}
        </View>

        <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
          File Type
        </Text>
        <View style={styles.chipRow}>
          {FILE_TYPE_OPTIONS.map((option) => (
            <Chip key={option.value} label={option.label} selected={fileType === option.value} onPress={() => setFileType(option.value)} />
          ))}
        </View>

        <Checkbox
          checked={reviewRequired}
          onChange={setReviewRequired}
          label="Require the crew to review this document"
        />

        <Button label="Upload as Rev 1" onPress={handleSubmit} style={styles.submitButton} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingBottom: spacing.lg,
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
  submitButton: {
    marginTop: spacing.md,
  },
});
