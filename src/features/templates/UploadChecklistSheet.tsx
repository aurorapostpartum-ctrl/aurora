import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Text, TextField } from '../../components/ui';
import { createChecklistTemplate } from '../../data/mockStore';
import { colors, spacing } from '../../theme';
import { parseChecklistText } from './checklistTemplateMeta';

export interface UploadChecklistSheetProps {
  visible: boolean;
  onClose: () => void;
  actorId: string;
}

const PLACEHOLDER = 'FIXTURES\nFixtures installed\nFixtures tested\nLeaks checked\n\nDOCUMENTATION\nPhotos uploaded\nFinal documentation complete';

export function UploadChecklistSheet({ visible, onClose, actorId }: UploadChecklistSheetProps) {
  const [name, setName] = useState('');
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | undefined>();

  const parsed = parseChecklistText(raw);
  const itemCount = parsed.reduce((sum, s) => sum + s.items.length, 0);

  const reset = () => {
    setName('');
    setRaw('');
    setError(undefined);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleContinue = () => {
    if (!name.trim()) {
      setError('Enter a name for this checklist');
      return;
    }
    if (parsed.length === 0) {
      setError('Paste your checklist items first');
      return;
    }

    const template = createChecklistTemplate({
      name: name.trim(),
      trade: 'General',
      description: '',
      visibility: 'private',
      createdBy: actorId,
      sections: parsed.map((s) => ({
        name: s.name,
        items: s.items.map((i) => ({ text: i.text, required: false, requiresPhoto: false })),
      })),
    });

    reset();
    onClose();
    router.push(`/(app)/checklist-template-edit/${template.id}` as never);
  };

  return (
    <BottomSheet visible={visible} title="Upload Existing Checklist" onClose={handleClose} maxHeightPercent={88}>
      <View style={styles.body}>
        <Text variant="footnote" color={colors.textSecondary} style={styles.intro}>
          Paste the text of a checklist you already use — put each section title on its own line in ALL CAPS,
          then list its items below it. We’ll turn it into a template you can fine-tune before saving.
        </Text>

        <TextField
          label="Checklist Name"
          placeholder="e.g. Roofing Final Walkthrough"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (error) setError(undefined);
          }}
        />

        <TextField
          label="Paste Checklist"
          placeholder={PLACEHOLDER}
          value={raw}
          onChangeText={setRaw}
          multiline
          style={styles.pasteInput}
        />

        {raw.trim().length > 0 ? (
          <Text variant="footnote" color={colors.textTertiary} style={styles.preview}>
            {parsed.length} section{parsed.length === 1 ? '' : 's'} · {itemCount} item{itemCount === 1 ? '' : 's'}{' '}
            detected
          </Text>
        ) : null}

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
  pasteInput: {
    height: 180,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  preview: {
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    marginLeft: spacing.xxs,
  },
  error: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xxs,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
});
