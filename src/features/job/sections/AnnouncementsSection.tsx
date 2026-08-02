import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, EmptyState, StatusBadge, Text, TextField } from '../../../components/ui';
import { addAnnouncement } from '../../../data/mockStore';
import { formatDate, personName } from '../../../data/selectors';
import { colors, radius, spacing } from '../../../theme';
import type { Job, JobAnnouncement, Person } from '../../../types/domain';

interface AnnouncementsSectionProps {
  job: Job;
  person: Person;
  announcements: JobAnnouncement[];
}

export function AnnouncementsSection({ job, person, announcements }: AnnouncementsSectionProps) {
  const isManager = person.role === 'manager';
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handlePost = () => {
    if (!title.trim() || !body.trim()) return;
    addAnnouncement(job.id, person.id, title, body, true);
    setTitle('');
    setBody('');
    setFormOpen(false);
  };

  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <View>
      {isManager ? (
        <View style={styles.actionRow}>
          <Text variant="footnote" color={colors.textTertiary}>
            {announcements.length} {announcements.length === 1 ? 'announcement' : 'announcements'}
          </Text>
          <Button
            label={formOpen ? 'Cancel' : 'Post Announcement'}
            variant={formOpen ? 'secondary' : 'primary'}
            size="md"
            fullWidth={false}
            onPress={() => setFormOpen((v) => !v)}
          />
        </View>
      ) : null}

      {formOpen ? (
        <View style={styles.form}>
          <TextField label="Title" placeholder="e.g. Site access change" value={title} onChangeText={setTitle} />
          <TextField
            label="Message"
            placeholder="Let the crew know what's changing..."
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={3}
            style={styles.textarea}
          />
          <Button label="Post to Job" onPress={handlePost} disabled={!title.trim() || !body.trim()} />
        </View>
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState icon="megaphone-outline" title="No announcements yet" />
      ) : (
        sorted.map((a) => (
          <View key={a.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="megaphone-outline" size={16} color={colors.accentStrong} />
              <Text variant="headline" style={styles.cardTitle} numberOfLines={2}>
                {a.title}
              </Text>
              {a.pinned ? <StatusBadge label="Pinned" tone="accent" /> : null}
            </View>
            <Text variant="body" color={colors.textSecondary} style={styles.body}>
              {a.body}
            </Text>
            <Text variant="caption1" color={colors.textTertiary} style={styles.meta}>
              {personName(a.authorId)} · {formatDate(a.createdAt)}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  form: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  textarea: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    flex: 1,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  body: {
    marginBottom: spacing.xs,
  },
  meta: {},
});
