import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Chip, Text, TextField } from '../../components/ui';
import { addDocumentRevision } from '../../data/mockStore';
import { colors, spacing } from '../../theme';
import type { DocumentFileType, JobDocument } from '../../types/domain';
import { FILE_TYPE_OPTIONS, revisionLabel } from './documentMeta';

export interface UploadRevisionSheetProps {
  visible: boolean;
  onClose: () => void;
  document: JobDocument;
  uploadedBy: string;
  onUploaded?: () => void;
}

export function UploadRevisionSheet({ visible, onClose, document, uploadedBy, onUploaded }: UploadRevisionSheetProps) {
  const current = document.revisions.find((r) => r.isCurrent) ?? document.revisions[0];
  const nextNumber = Math.max(...document.revisions.map((r) => r.revisionNumber)) + 1;

  const [notes, setNotes] = useState('');
  const [fileType, setFileType] = useState<DocumentFileType>(current.fileType);

  const reset = () => {
    setNotes('');
    setFileType(current.fileType);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    addDocumentRevision({
      documentId: document.id,
      uploadedBy,
      notes: notes.trim(),
      fileType,
      pageCount: current.pageCount,
    });
    reset();
    onClose();
    onUploaded?.();
  };

  return (
    <BottomSheet visible={visible} title={`Upload ${revisionLabel(nextNumber)}`} onClose={handleClose}>
      <View style={styles.body}>
        <Text variant="footnote" color={colors.textSecondary} style={styles.intro}>
          {document.title} is currently on {revisionLabel(current.revisionNumber)}. Uploading a new revision
          replaces it as the current version{document.reviewRequired ? ' and clears everyone’s review status' : ''}.
        </Text>

        <TextField
          label="What changed"
          placeholder="e.g. Updated panel schedule for floors 4–6"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
          File Type
        </Text>
        <View style={styles.chipRow}>
          {FILE_TYPE_OPTIONS.map((option) => (
            <Chip key={option.value} label={option.label} selected={fileType === option.value} onPress={() => setFileType(option.value)} />
          ))}
        </View>

        <Button label={`Upload ${revisionLabel(nextNumber)}`} onPress={handleSubmit} style={styles.submitButton} />
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
  submitButton: {
    marginTop: spacing.xs,
  },
});
