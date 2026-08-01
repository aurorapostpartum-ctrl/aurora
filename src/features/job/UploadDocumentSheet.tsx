import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Chip, Text, TextField } from '../../components/ui';
import { createId } from '../../lib/id';
import { colors, spacing } from '../../theme';
import type { DocumentCategory, JobDocument } from '../../types/domain';

export interface UploadDocumentSheetProps {
  visible: boolean;
  onClose: () => void;
  jobId: string;
  uploadedBy: string;
  onUpload: (document: JobDocument) => void;
}

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: 'print', label: 'Print' },
  { value: 'submittal', label: 'Submittal' },
  { value: 'permit', label: 'Permit' },
  { value: 'contract', label: 'Contract' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' },
];

const FILE_TYPE_OPTIONS: { value: JobDocument['revisions'][number]['fileType']; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'dwg', label: 'DWG' },
  { value: 'image', label: 'Image' },
];

export function UploadDocumentSheet({ visible, onClose, jobId, uploadedBy, onUpload }: UploadDocumentSheetProps) {
  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('print');
  const [fileType, setFileType] = useState<JobDocument['revisions'][number]['fileType']>('pdf');
  const [error, setError] = useState<string | undefined>();

  const reset = () => {
    setTitle('');
    setDiscipline('');
    setCategory('print');
    setFileType('pdf');
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

    const now = new Date().toISOString();
    const document: JobDocument = {
      id: createId('doc'),
      jobId,
      title: title.trim(),
      category,
      discipline: discipline.trim() || 'General',
      requiresAcknowledgement: false,
      acknowledgedBy: [],
      revisions: [
        {
          id: createId('rev'),
          revisionLabel: 'Rev A',
          uploadedBy,
          uploadedAt: now,
          notes: 'Initial upload.',
          fileType,
          isCurrent: true,
        },
      ],
    };

    onUpload(document);
    reset();
    onClose();
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
        <TextField label="Discipline" placeholder="e.g. Electrical" value={discipline} onChangeText={setDiscipline} />

        <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
          Category
        </Text>
        <View style={styles.chipRow}>
          {CATEGORY_OPTIONS.map((option) => (
            <Chip key={option.value} label={option.label} selected={category === option.value} onPress={() => setCategory(option.value)} />
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

        <Button label="Upload as Rev A" onPress={handleSubmit} style={styles.submitButton} />
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
    marginTop: spacing.xs,
  },
});
