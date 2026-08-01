import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button, EmptyState, StatusBadge, Text } from '../../../components/ui';
import { formatDate, personName } from '../../../data/selectors';
import { colors, radius, spacing } from '../../../theme';
import type { JobDocument, Person } from '../../../types/domain';

interface DocumentsSectionProps {
  documents: JobDocument[];
  setDocuments: Dispatch<SetStateAction<JobDocument[]>>;
  person: Person;
}

const CATEGORY_LABEL: Record<JobDocument['category'], string> = {
  print: 'Print',
  submittal: 'Submittal',
  permit: 'Permit',
  contract: 'Contract',
  report: 'Report',
  other: 'Other',
};

const FILE_ICON: Record<JobDocument['revisions'][number]['fileType'], keyof typeof Ionicons.glyphMap> = {
  pdf: 'document-text-outline',
  dwg: 'construct-outline',
  image: 'image-outline',
};

export function DocumentsSection({ documents, setDocuments, person }: DocumentsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (documents.length === 0) {
    return <EmptyState icon="document-text-outline" title="No documents yet" />;
  }

  const handleAcknowledge = (docId: string) => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, acknowledgedBy: [...new Set([...d.acknowledgedBy, person.id])] } : d
      )
    );
  };

  return (
    <View>
      {documents.map((doc) => {
        const current = doc.revisions.find((r) => r.isCurrent) ?? doc.revisions[0];
        const expanded = expandedId === doc.id;
        const needsAck = doc.requiresAcknowledgement && !doc.acknowledgedBy.includes(person.id);

        return (
          <View key={doc.id} style={styles.card}>
            <Pressable
              style={styles.headerRow}
              onPress={() => setExpandedId(expanded ? null : doc.id)}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={FILE_ICON[current.fileType]} size={18} color={colors.accentStrong} />
              </View>
              <View style={styles.headerText}>
                <Text variant="headline" numberOfLines={1}>
                  {doc.title}
                </Text>
                <Text variant="footnote" color={colors.textSecondary}>
                  {doc.discipline} · {CATEGORY_LABEL[doc.category]} · {current.revisionLabel}
                </Text>
              </View>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.textTertiary}
              />
            </Pressable>

            <View style={styles.badgeRow}>
              <StatusBadge label={`${doc.revisions.length} revision${doc.revisions.length > 1 ? 's' : ''}`} tone="neutral" />
              {doc.requiresAcknowledgement ? (
                <StatusBadge
                  label={needsAck ? 'Acknowledgement required' : 'Acknowledged'}
                  tone={needsAck ? 'warning' : 'success'}
                />
              ) : null}
            </View>

            {expanded ? (
              <View style={styles.revisionList}>
                {doc.revisions.map((rev) => (
                  <View key={rev.id} style={styles.revisionRow}>
                    <View
                      style={[
                        styles.revisionDot,
                        { backgroundColor: rev.isCurrent ? colors.accent : colors.textTertiary },
                      ]}
                    />
                    <View style={styles.revisionText}>
                      <Text variant="subhead" color={rev.isCurrent ? colors.textPrimary : colors.textSecondary}>
                        {rev.revisionLabel} {rev.isCurrent ? '· Current' : ''}
                      </Text>
                      <Text variant="footnote" color={colors.textTertiary}>
                        {personName(rev.uploadedBy)} · {formatDate(rev.uploadedAt)}
                      </Text>
                      <Text variant="footnote" color={colors.textSecondary} style={styles.revisionNotes}>
                        {rev.notes}
                      </Text>
                    </View>
                  </View>
                ))}

                {needsAck ? (
                  <Button
                    label="Acknowledge Current Revision"
                    size="md"
                    fullWidth={false}
                    onPress={() => handleAcknowledge(doc.id)}
                    style={styles.ackButton}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginLeft: 44,
  },
  revisionList: {
    marginTop: spacing.md,
    marginLeft: 44,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
  },
  revisionRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  revisionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  revisionText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  revisionNotes: {
    marginTop: 2,
  },
  ackButton: {
    marginTop: spacing.xs,
  },
});
