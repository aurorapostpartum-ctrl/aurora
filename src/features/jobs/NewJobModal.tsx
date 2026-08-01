import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Modal, Text, TextField } from '../../components/ui';
import { createJob } from '../../data/mockStore';
import { useAuth } from '../../providers/AuthProvider';
import { colors, spacing } from '../../theme';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface NewJobModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NewJobModal({ visible, onClose }: NewJobModalProps) {
  const { person } = useAuth();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [client, setClient] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string; address?: string; targetDate?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setAddress('');
    setClient('');
    setTargetDate('');
    setDescription('');
    setErrors({});
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!person) return;

    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = 'Enter a job name';
    if (!address.trim()) nextErrors.address = 'Enter a job address';
    if (targetDate.trim() && !DATE_RE.test(targetDate.trim())) {
      nextErrors.targetDate = 'Use YYYY-MM-DD';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const fallbackTarget = new Date();
    fallbackTarget.setDate(fallbackTarget.getDate() + 90);

    const job = createJob({
      name,
      address,
      client,
      description,
      targetCompletionDate: targetDate.trim() || fallbackTarget.toISOString(),
      managerId: person.id,
    });
    setSubmitting(false);
    reset();
    onClose();
    router.push(`/(app)/job/${job.id}`);
  };

  return (
    <Modal visible={visible} title="New Job" onClose={handleClose} maxWidth={520}>
      <Text variant="subhead" color={colors.textSecondary} style={styles.intro}>
        Creates a new permanent Job Folder for this job. You can assign employees and upload
        documents once it&rsquo;s created.
      </Text>

      <TextField
        label="Job Name"
        placeholder="e.g. Riverside Medical Center"
        value={name}
        onChangeText={(t) => {
          setName(t);
          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
        }}
        error={errors.name}
        returnKeyType="next"
      />

      <TextField
        label="Address"
        placeholder="Street, city, state, zip"
        value={address}
        onChangeText={(t) => {
          setAddress(t);
          if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
        }}
        error={errors.address}
        returnKeyType="next"
      />

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <TextField label="Client" placeholder="Client name" value={client} onChangeText={setClient} returnKeyType="next" />
        </View>
        <View style={styles.rowItem}>
          <TextField
            label="Target Completion"
            placeholder="YYYY-MM-DD"
            value={targetDate}
            onChangeText={(t) => {
              setTargetDate(t);
              if (errors.targetDate) setErrors((prev) => ({ ...prev, targetDate: undefined }));
            }}
            error={errors.targetDate}
            returnKeyType="next"
          />
        </View>
      </View>

      <TextField
        label="Description"
        placeholder="Scope of work..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={styles.textarea}
      />

      <View style={styles.actions}>
        <Button label="Cancel" variant="secondary" fullWidth={false} onPress={handleClose} style={styles.cancelButton} />
        <Button label="Create Job Folder" fullWidth={false} loading={submitting} onPress={handleSubmit} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowItem: {
    flex: 1,
  },
  textarea: {
    minHeight: 70,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  cancelButton: {
    marginRight: spacing.sm,
  },
});
