import { useState, type Dispatch, type SetStateAction } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, Button, EmptyState, Text, TextField } from '../../../components/ui';
import { formatDate, getPerson } from '../../../data/selectors';
import { createId } from '../../../lib/id';
import { colors, radius, spacing } from '../../../theme';
import type { Job, JobNote, Person } from '../../../types/domain';

interface NotesSectionProps {
  job: Job;
  person: Person;
  notes: JobNote[];
  setNotes: Dispatch<SetStateAction<JobNote[]>>;
}

export function NotesSection({ job, person, notes, setNotes }: NotesSectionProps) {
  const [draft, setDraft] = useState('');

  const handleAdd = () => {
    if (!draft.trim()) return;
    const note: JobNote = {
      id: createId('note'),
      jobId: job.id,
      authorId: person.id,
      createdAt: new Date().toISOString(),
      body: draft.trim(),
    };
    setNotes((prev) => [note, ...prev]);
    setDraft('');
  };

  return (
    <View>
      <View style={styles.composer}>
        <TextField
          label="Add a note"
          placeholder="Share a site update with the team..."
          value={draft}
          onChangeText={setDraft}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <Button label="Post Note" size="md" fullWidth={false} onPress={handleAdd} disabled={!draft.trim()} />
      </View>

      {notes.length === 0 ? (
        <EmptyState icon="chatbubble-ellipses-outline" title="No notes yet" />
      ) : (
        notes.map((note) => {
          const author = getPerson(note.authorId);
          return (
            <View key={note.id} style={styles.card}>
              <View style={styles.headerRow}>
                {author ? <Avatar initials={author.initials} color={author.avatarColor} size={28} /> : null}
                <View style={styles.headerText}>
                  <Text variant="subhead">{author?.name ?? 'Unknown'}</Text>
                  <Text variant="caption1" color={colors.textTertiary}>
                    {formatDate(note.createdAt)}
                  </Text>
                </View>
              </View>
              <Text variant="body" color={colors.textSecondary} style={styles.body}>
                {note.body}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    marginBottom: spacing.md,
  },
  input: {
    minHeight: 70,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerText: {
    marginLeft: spacing.sm,
  },
  body: {
    marginLeft: 36,
  },
});
