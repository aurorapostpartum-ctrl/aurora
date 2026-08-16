import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import { Avatar, BottomSheet, StatusBadge, Text } from '../../components/ui';
import { formatDate, formatTime, getPerson } from '../../data/selectors';
import { colors, radius, spacing } from '../../theme';
import type { Job, JobDocument } from '../../types/domain';
import { acknowledgmentFor, currentRevision, revisionLabel } from './documentMeta';

export interface AcknowledgmentStatusSheetProps {
  visible: boolean;
  onClose: () => void;
  document: JobDocument;
  job: Job;
}

export function AcknowledgmentStatusSheet({ visible, onClose, document, job }: AcknowledgmentStatusSheetProps) {
  const current = currentRevision(document);
  const roster = job.employeeIds
    .map((personId) => ({ person: getPerson(personId), ack: acknowledgmentFor(document, personId) }))
    .filter((r): r is { person: NonNullable<typeof r.person>; ack: typeof r.ack } => Boolean(r.person))
    .sort((a, b) => {
      if (Boolean(a.ack) === Boolean(b.ack)) return a.person.name.localeCompare(b.person.name);
      return a.ack ? 1 : -1;
    });

  const acknowledgedCount = roster.filter((r) => r.ack).length;

  return (
    <BottomSheet visible={visible} title="Acknowledgment Status" onClose={onClose} maxHeightPercent={80}>
      <Text variant="footnote" color={colors.textSecondary} style={styles.docTitle} numberOfLines={1}>
        {document.title} — {revisionLabel(current.revisionNumber)}
      </Text>
      <Text variant="caption1" color={colors.textTertiary} style={styles.summary}>
        {acknowledgedCount} of {roster.length} acknowledged
      </Text>

      {roster.length === 0 ? (
        <Text variant="subhead" color={colors.textTertiary} style={styles.empty}>
          No employees assigned to this job yet.
        </Text>
      ) : (
        <View style={styles.list}>
          {roster.map(({ person, ack }) => (
            <View key={person.id} style={styles.row}>
              <Avatar initials={person.initials} color={person.avatarColor} size={32} />
              <View style={styles.rowBody}>
                <Text variant="subhead">{person.name}</Text>
                {ack ? (
                  <Text variant="caption1" color={colors.textTertiary}>
                    {formatDate(ack.acknowledgedAt)} at {formatTime(ack.acknowledgedAt)}
                  </Text>
                ) : (
                  <Text variant="caption1" color={colors.textTertiary}>
                    Hasn't acknowledged yet
                  </Text>
                )}
              </View>
              {ack ? (
                <StatusBadge label="Acknowledged" tone="success" />
              ) : (
                <View style={styles.pendingBadge}>
                  <Ionicons name="time-outline" size={12} color={colors.warning} />
                  <Text variant="caption1" color={colors.warning} style={styles.pendingLabel}>
                    Pending
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  docTitle: {
    marginBottom: 2,
  },
  summary: {
    marginBottom: spacing.md,
  },
  empty: {
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
  list: {
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.xs,
  },
  rowBody: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.warningMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(221,165,43,0.35)',
  },
  pendingLabel: {
    marginLeft: 3,
  },
});
